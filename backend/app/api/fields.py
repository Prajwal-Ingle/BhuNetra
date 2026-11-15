"""
GeoAgri Intelligence - Agricultural Fields API Routes
"""

import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database.session import get_db

router = APIRouter(prefix="/fields", tags=["Agricultural Fields"])

@router.get("/")
def list_fields(
    village_id: int = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Returns paginated list of agricultural fields with latest NDVI, NDWI, and nearest water source."""
    offset = (page - 1) * page_size
    base_sql = """
        FROM agricultural_fields af
        JOIN villages v ON af.village_id = v.id
        LEFT JOIN LATERAL (
            SELECT ndvi, ndwi, analysis_date
            FROM vegetation_indices vi
            WHERE vi.field_id = af.id
            ORDER BY analysis_date DESC
            LIMIT 1
        ) lvi ON true
        LEFT JOIN LATERAL (
            SELECT source_name, source_type,
                   ROUND(ST_Distance(ST_Transform(af.geometry, 32644), ST_Transform(ws.geometry, 32644))::numeric, 1) AS dist_m
            FROM water_sources ws
            ORDER BY ST_Distance(ST_Transform(af.geometry, 32644), ST_Transform(ws.geometry, 32644)) ASC
            LIMIT 1
        ) nws ON true
    """
    where_clause = " WHERE af.village_id = :vid" if village_id else ""
    
    # Count total
    total_sql = f"SELECT COUNT(*) {base_sql} {where_clause}"
    params = {"vid": village_id} if village_id else {}
    total = db.execute(text(total_sql), params).scalar()

    # Data query
    data_sql = f"""
        SELECT 
            af.id,
            af.field_name,
            af.village_id,
            v.village_name,
            af.area_hectares,
            lvi.ndvi AS latest_ndvi,
            lvi.ndwi AS latest_ndwi,
            lvi.analysis_date,
            nws.source_name AS nearest_water_source,
            nws.source_type AS nearest_water_type,
            nws.dist_m AS nearest_water_distance_m
        {base_sql} {where_clause}
        ORDER BY af.id
        LIMIT :limit OFFSET :offset;
    """
    query_params = {**params, "limit": page_size, "offset": offset}
    rows = db.execute(text(data_sql), query_params).fetchall()

    items = []
    for r in rows:
        # Determine condition status based on latest NDVI
        ndvi = float(r.latest_ndvi) if r.latest_ndvi is not None else None
        if ndvi is not None:
            if ndvi >= 0.70:
                health = "Optimal / Highly Vigorous"
            elif ndvi >= 0.50:
                health = "Healthy / Moderate"
            elif ndvi >= 0.30:
                health = "Sub-optimal / Stressed"
            else:
                health = "Severe Deficit / Bare"
        else:
            health = "Pending Observation"

        items.append({
            "id": r.id,
            "field_name": r.field_name,
            "village_id": r.village_id,
            "village_name": r.village_name,
            "area_hectares": float(r.area_hectares),
            "latest_ndvi": ndvi,
            "latest_ndwi": float(r.latest_ndwi) if r.latest_ndwi is not None else None,
            "latest_analysis_date": str(r.analysis_date) if r.analysis_date else None,
            "health_status": health,
            "nearest_water_source": r.nearest_water_source,
            "nearest_water_type": r.nearest_water_type,
            "nearest_water_distance_m": float(r.nearest_water_distance_m) if r.nearest_water_distance_m is not None else None
        })

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": items
    }

@router.get("/geojson")
def get_fields_geojson(village_id: int = Query(None), db: Session = Depends(get_db)):
    """Returns all agricultural cadastral parcel polygons as GeoJSON FeatureCollection."""
    sql = """
        SELECT 
            af.id,
            af.field_name,
            af.village_id,
            v.village_name,
            af.area_hectares,
            lvi.ndvi AS latest_ndvi,
            lvi.ndwi AS latest_ndwi,
            ST_AsGeoJSON(af.geometry) AS geojson
        FROM agricultural_fields af
        JOIN villages v ON af.village_id = v.id
        LEFT JOIN LATERAL (
            SELECT ndvi, ndwi
            FROM vegetation_indices vi
            WHERE vi.field_id = af.id
            ORDER BY analysis_date DESC
            LIMIT 1
        ) lvi ON true
    """
    params = {}
    if village_id:
        sql += " WHERE af.village_id = :vid"
        params["vid"] = village_id
    sql += " ORDER BY af.id;"

    rows = db.execute(text(sql), params).fetchall()
    features = []
    for r in rows:
        features.append({
            "type": "Feature",
            "id": r.id,
            "properties": {
                "id": r.id,
                "field_name": r.field_name,
                "village_id": r.village_id,
                "village_name": r.village_name,
                "area_hectares": float(r.area_hectares),
                "latest_ndvi": float(r.latest_ndvi) if r.latest_ndvi is not None else None,
                "latest_ndwi": float(r.latest_ndwi) if r.latest_ndwi is not None else None
            },
            "geometry": json.loads(r.geojson)
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }

@router.get("/{field_id}")
def get_field_detail(field_id: int, db: Session = Depends(get_db)):
    """Returns detailed information, historical vegetation indices, and soil properties for a single field."""
    query = text("""
        SELECT 
            af.id,
            af.field_name,
            af.village_id,
            v.village_name,
            d.district_name,
            af.area_hectares,
            ST_AsGeoJSON(af.geometry) AS geojson,
            nws.source_name AS nearest_water_source,
            nws.source_type AS nearest_water_type,
            nws.dist_m AS nearest_water_distance_m,
            sd.soil_type,
            sd.ph AS soil_ph,
            sd.nitrogen AS soil_nitrogen,
            sd.organic_carbon AS soil_organic_carbon
        FROM agricultural_fields af
        JOIN villages v ON af.village_id = v.id
        JOIN districts d ON v.district_id = d.id
        LEFT JOIN LATERAL (
            SELECT source_name, source_type,
                   ROUND(ST_Distance(ST_Transform(af.geometry, 32644), ST_Transform(ws.geometry, 32644))::numeric, 1) AS dist_m
            FROM water_sources ws
            ORDER BY ST_Distance(ST_Transform(af.geometry, 32644), ST_Transform(ws.geometry, 32644)) ASC
            LIMIT 1
        ) nws ON true
        LEFT JOIN LATERAL (
            SELECT soil_type, ph, nitrogen, organic_carbon
            FROM soil_data sd
            ORDER BY ST_Distance(af.geometry::geography, sd.geometry::geography) ASC
            LIMIT 1
        ) sd ON true
        WHERE af.id = :fid;
    """)
    r = db.execute(query, {"fid": field_id}).fetchone()
    if not r:
        raise HTTPException(status_code=404, detail="Field not found")

    # Fetch time-series vegetation indices
    vi_query = text("""
        SELECT 
            vi.id,
            vi.observation_id,
            so.observation_date,
            so.satellite_name,
            vi.ndvi,
            vi.ndwi,
            vi.analysis_date
        FROM vegetation_indices vi
        JOIN satellite_observations so ON vi.observation_id = so.id
        WHERE vi.field_id = :fid
        ORDER BY so.observation_date ASC;
    """)
    vi_rows = db.execute(vi_query, {"fid": field_id}).fetchall()

    history = [
        {
            "observation_id": vr.observation_id,
            "date": str(vr.observation_date),
            "satellite": vr.satellite_name,
            "ndvi": float(vr.ndvi) if vr.ndvi is not None else None,
            "ndwi": float(vr.ndwi) if vr.ndwi is not None else None
        }
        for vr in vi_rows
    ]

    return {
        "id": r.id,
        "field_name": r.field_name,
        "village_id": r.village_id,
        "village_name": r.village_name,
        "district_name": r.district_name,
        "area_hectares": float(r.area_hectares),
        "geometry": json.loads(r.geojson),
        "nearest_water_source": r.nearest_water_source,
        "nearest_water_type": r.nearest_water_type,
        "nearest_water_distance_m": float(r.nearest_water_distance_m) if r.nearest_water_distance_m is not None else None,
        "nearest_water": {
            "source_name": r.nearest_water_source,
            "source_type": r.nearest_water_type,
            "distance_meters": float(r.nearest_water_distance_m) if r.nearest_water_distance_m is not None else None
        },
        "soil_profile": {
            "soil_type": r.soil_type,
            "ph": float(r.soil_ph) if r.soil_ph is not None else None,
            "nitrogen_kgha": float(r.soil_nitrogen) if r.soil_nitrogen is not None else None,
            "organic_carbon_pct": float(r.soil_organic_carbon) if r.soil_organic_carbon is not None else None
        },
        "vegetation_history": history,
        "observations": history
    }
