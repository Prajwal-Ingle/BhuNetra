"""
GeoAgri Intelligence - Districts API Routes
"""

import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database.session import get_db

router = APIRouter(prefix="/districts", tags=["Districts"])

@router.get("/")
def list_districts(db: Session = Depends(get_db)):
    """Returns all monitored districts with calculated geographical area in sq km."""
    query = text("""
        SELECT 
            id,
            district_name,
            state_name,
            ROUND((ST_Area(ST_Transform(geometry, 32644)) / 1000000.0)::numeric, 2) AS area_sq_km,
            (SELECT COUNT(*) FROM villages WHERE district_id = d.id) AS village_count
        FROM districts d
        ORDER BY district_name;
    """)
    rows = db.execute(query).fetchall()
    return [
        {
            "id": r.id,
            "district_name": r.district_name,
            "state_name": r.state_name,
            "area_sq_km": float(r.area_sq_km) if r.area_sq_km else None,
            "village_count": r.village_count
        }
        for r in rows
    ]

@router.get("/geojson")
def get_districts_geojson(district_id: int = Query(None), db: Session = Depends(get_db)):
    """Returns district boundaries as standard RFC 7946 GeoJSON FeatureCollection."""
    sql = """
        SELECT 
            id,
            district_name,
            state_name,
            ROUND((ST_Area(ST_Transform(geometry, 32644)) / 1000000.0)::numeric, 2) AS area_sq_km,
            ST_AsGeoJSON(geometry) AS geojson
        FROM districts
    """
    params = {}
    if district_id:
        sql += " WHERE id = :did"
        params["did"] = district_id

    rows = db.execute(text(sql), params).fetchall()
    features = []
    for r in rows:
        features.append({
            "type": "Feature",
            "id": r.id,
            "properties": {
                "id": r.id,
                "district_name": r.district_name,
                "state_name": r.state_name,
                "area_sq_km": float(r.area_sq_km) if r.area_sq_km else None
            },
            "geometry": json.loads(r.geojson)
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }

@router.get("/{district_id}/summary")
def get_district_summary(district_id: int, db: Session = Depends(get_db)):
    """Returns spatial aggregates, total agricultural area, average NDVI, and risk summary for a district."""
    query = text("""
        SELECT 
            d.id,
            d.district_name,
            d.state_name,
            ROUND((ST_Area(ST_Transform(d.geometry, 32644)) / 1000000.0)::numeric, 2) AS total_district_sq_km,
            COUNT(DISTINCT v.id) AS talukas_count,
            COUNT(DISTINCT af.id) AS total_fields,
            COALESCE(ROUND(SUM(af.area_hectares)::numeric, 2), 0.0) AS total_agricultural_hectares,
            COALESCE(ROUND(AVG(vi.ndvi)::numeric, 3), 0.0) AS avg_crop_ndvi,
            COALESCE(ROUND(AVG(vi.ndwi)::numeric, 3), 0.0) AS avg_crop_ndwi
        FROM districts d
        LEFT JOIN villages v ON v.district_id = d.id
        LEFT JOIN agricultural_fields af ON af.village_id = v.id
        LEFT JOIN vegetation_indices vi ON vi.field_id = af.id
        WHERE d.id = :did
        GROUP BY d.id, d.district_name, d.state_name, d.geometry;
    """)
    r = db.execute(query, {"did": district_id}).fetchone()
    if not r:
        raise HTTPException(status_code=404, detail="District not found")

    return {
        "district_id": r.id,
        "district_name": r.district_name,
        "state_name": r.state_name,
        "total_district_sq_km": float(r.total_district_sq_km),
        "talukas_count": r.talukas_count,
        "total_fields": r.total_fields,
        "total_agricultural_hectares": float(r.total_agricultural_hectares),
        "avg_crop_ndvi": float(r.avg_crop_ndvi),
        "avg_crop_ndwi": float(r.avg_crop_ndwi)
    }
