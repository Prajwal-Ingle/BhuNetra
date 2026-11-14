"""
GeoAgri Intelligence - Spatial Database Operations API Routes
Executes live PostGIS spatial functions (ST_DWithin, ST_Buffer, ST_Distance, ST_Intersection, ST_Area).
"""

import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database.session import get_db

router = APIRouter(prefix="/spatial", tags=["Spatial Queries & GIS Analysis"])

@router.get("/buffer-analysis")
def water_buffer_analysis(
    buffer_meters: float = Query(2000.0, ge=100.0, le=10000.0, description="Buffer radius in meters around water bodies"),
    db: Session = Depends(get_db)
):
    """
    Executes ST_DWithin to find all agricultural fields lying within a specified
    meter buffer of natural or artificial water sources using PostGIS geography.
    """
    query = text("""
        SELECT 
            af.id AS field_id,
            af.field_name,
            v.village_name,
            af.area_hectares,
            ws.id AS water_source_id,
            ws.source_name,
            ws.source_type,
            ROUND((ST_Distance(af.geometry::geography, ws.geometry::geography))::numeric, 1) AS distance_meters
        FROM agricultural_fields af
        JOIN villages v ON af.village_id = v.id
        JOIN water_sources ws ON ST_DWithin(af.geometry::geography, ws.geometry::geography, :buffer_m)
        ORDER BY distance_meters ASC;
    """)
    rows = db.execute(query, {"buffer_m": buffer_meters}).fetchall()

    return {
        "buffer_radius_meters": buffer_meters,
        "matching_fields_count": len(rows),
        "results": [
            {
                "field_id": r.field_id,
                "field_name": r.field_name,
                "village_name": r.village_name,
                "area_hectares": float(r.area_hectares),
                "water_source_id": r.water_source_id,
                "water_source_name": r.source_name,
                "water_source_type": r.source_type,
                "distance_meters": float(r.distance_meters)
            }
            for r in rows
        ]
    }

@router.get("/risk-intersections")
def risk_zone_intersection_analysis(db: Session = Depends(get_db)):
    """
    Executes ST_Intersects and ST_Intersection to calculate exact spatial overlap area (hectares)
    and risk exposure percentage for each crop parcel intersecting active hazard zones.
    """
    query = text("""
        SELECT 
            af.id AS field_id,
            af.field_name,
            v.village_name,
            rz.risk_type,
            rz.risk_level,
            rz.confidence_score,
            ROUND((ST_Area(ST_Transform(af.geometry, 32644)) / 10000.0)::numeric, 2) AS total_field_ha,
            ROUND((ST_Area(ST_Transform(ST_Intersection(af.geometry, rz.geometry), 32644)) / 10000.0)::numeric, 2) AS affected_area_ha,
            ROUND(
                (ST_Area(ST_Transform(ST_Intersection(af.geometry, rz.geometry), 32644)) / 
                 ST_Area(ST_Transform(af.geometry, 32644)) * 100.0)::numeric, 1
            ) AS percent_risk_exposure,
            ST_AsGeoJSON(ST_Intersection(af.geometry, rz.geometry)) AS intersection_geojson
        FROM agricultural_fields af
        JOIN villages v ON af.village_id = v.id
        JOIN risk_zones rz ON ST_Intersects(af.geometry, rz.geometry);
    """)
    rows = db.execute(query).fetchall()

    return [
        {
            "field_id": r.field_id,
            "field_name": r.field_name,
            "village_name": r.village_name,
            "risk_type": r.risk_type,
            "risk_level": r.risk_level,
            "confidence_score": float(r.confidence_score) if r.confidence_score else None,
            "total_field_ha": float(r.total_field_ha),
            "affected_area_ha": float(r.affected_area_ha),
            "percent_risk_exposure": float(r.percent_risk_exposure),
            "intersection_geometry": json.loads(r.intersection_geojson) if r.intersection_geojson else None
        }
        for r in rows
    ]

@router.get("/all-layers")
def get_all_vector_layers(db: Session = Depends(get_db)):
    """
    Returns an integrated multi-layer spatial payload containing all GeoJSON FeatureCollections
    (Districts, Talukas, Fields, Water, Soil, Weather, Risk Zones) for map rendering.
    """
    def fetch_geojson(query_str):
        rows = db.execute(text(query_str)).fetchall()
        features = []
        for r in rows:
            props = {k: v for k, v in r._mapping.items() if k != "geojson"}
            # Convert non-serializable numbers
            for pk, pv in props.items():
                if hasattr(pv, '__float__'):
                    props[pk] = float(pv)
                elif hasattr(pv, 'isoformat'):
                    props[pk] = str(pv)
            features.append({
                "type": "Feature",
                "id": props.get("id"),
                "properties": props,
                "geometry": json.loads(r.geojson)
            })
        return {"type": "FeatureCollection", "features": features}

    districts = fetch_geojson("SELECT id, district_name, state_name, ST_AsGeoJSON(geometry) AS geojson FROM districts;")
    villages = fetch_geojson("SELECT id, village_name, district_id, ST_AsGeoJSON(geometry) AS geojson FROM villages;")
    fields = fetch_geojson("""
        SELECT af.id, af.field_name, af.village_id, af.area_hectares,
               (SELECT ndvi FROM vegetation_indices WHERE field_id = af.id ORDER BY analysis_date DESC LIMIT 1) AS latest_ndvi,
               ST_AsGeoJSON(af.geometry) AS geojson
        FROM agricultural_fields af;
    """)
    water = fetch_geojson("SELECT id, source_name, source_type, ST_AsGeoJSON(geometry) AS geojson FROM water_sources;")
    soil = fetch_geojson("SELECT id, location, soil_type, ph, nitrogen, phosphorus, potassium, organic_carbon, ST_AsGeoJSON(geometry) AS geojson FROM soil_data;")
    weather = fetch_geojson("SELECT id, observation_date, temperature, rainfall, humidity, ST_AsGeoJSON(geometry) AS geojson FROM weather_data;")
    risk = fetch_geojson("SELECT id, risk_type, risk_level, confidence_score, ST_AsGeoJSON(geometry) AS geojson FROM risk_zones;")
    land_use = fetch_geojson("SELECT id, classification_type, confidence_score, ST_AsGeoJSON(geometry) AS geojson FROM land_use_classification;")

    return {
        "districts": districts,
        "villages": villages,
        "fields": fields,
        "water_sources": water,
        "soil_stations": soil,
        "weather_stations": weather,
        "risk_zones": risk,
        "land_use": land_use
    }
