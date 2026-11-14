"""
GeoAgri Intelligence - Talukas / Villages API Routes
"""

import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database.session import get_db

router = APIRouter(prefix="/villages", tags=["Villages & Talukas"])

@router.get("/")
def list_villages(district_id: int = Query(None), db: Session = Depends(get_db)):
    """Returns talukas/villages with aggregated crop metrics and area."""
    sql = """
        SELECT 
            v.id,
            v.village_name,
            v.district_id,
            d.district_name,
            ROUND((ST_Area(ST_Transform(v.geometry, 32644)) / 1000000.0)::numeric, 2) AS area_sq_km,
            COUNT(DISTINCT af.id) AS field_count,
            COALESCE(ROUND(SUM(af.area_hectares)::numeric, 2), 0.0) AS agricultural_hectares,
            ROUND(AVG(vi.ndvi)::numeric, 3) AS avg_ndvi
        FROM villages v
        JOIN districts d ON v.district_id = d.id
        LEFT JOIN agricultural_fields af ON af.village_id = v.id
        LEFT JOIN vegetation_indices vi ON vi.field_id = af.id
    """
    params = {}
    if district_id:
        sql += " WHERE v.district_id = :did"
        params["did"] = district_id
    sql += " GROUP BY v.id, v.village_name, v.district_id, d.district_name, v.geometry ORDER BY v.village_name;"

    rows = db.execute(text(sql), params).fetchall()
    return [
        {
            "id": r.id,
            "village_name": r.village_name,
            "district_id": r.district_id,
            "district_name": r.district_name,
            "area_sq_km": float(r.area_sq_km) if r.area_sq_km else None,
            "field_count": r.field_count,
            "agricultural_hectares": float(r.agricultural_hectares),
            "avg_ndvi": float(r.avg_ndvi) if r.avg_ndvi else None
        }
        for r in rows
    ]

@router.get("/geojson")
def get_villages_geojson(district_id: int = Query(None), db: Session = Depends(get_db)):
    """Returns village/taluka polygon boundaries as a GeoJSON FeatureCollection."""
    sql = """
        SELECT 
            v.id,
            v.village_name,
            v.district_id,
            d.district_name,
            ROUND((ST_Area(ST_Transform(v.geometry, 32644)) / 1000000.0)::numeric, 2) AS area_sq_km,
            COUNT(DISTINCT af.id) AS field_count,
            COALESCE(ROUND(SUM(af.area_hectares)::numeric, 2), 0.0) AS agricultural_hectares,
            ROUND(AVG(vi.ndvi)::numeric, 3) AS avg_ndvi,
            ST_AsGeoJSON(v.geometry) AS geojson
        FROM villages v
        JOIN districts d ON v.district_id = d.id
        LEFT JOIN agricultural_fields af ON af.village_id = v.id
        LEFT JOIN vegetation_indices vi ON vi.field_id = af.id
    """
    params = {}
    if district_id:
        sql += " WHERE v.district_id = :did"
        params["did"] = district_id
    sql += " GROUP BY v.id, v.village_name, v.district_id, d.district_name, v.geometry ORDER BY v.village_name;"

    rows = db.execute(text(sql), params).fetchall()
    features = []
    for r in rows:
        features.append({
            "type": "Feature",
            "id": r.id,
            "properties": {
                "id": r.id,
                "village_name": r.village_name,
                "district_id": r.district_id,
                "district_name": r.district_name,
                "area_sq_km": float(r.area_sq_km) if r.area_sq_km else None,
                "field_count": r.field_count,
                "agricultural_hectares": float(r.agricultural_hectares),
                "avg_ndvi": float(r.avg_ndvi) if r.avg_ndvi else None
            },
            "geometry": json.loads(r.geojson)
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }

@router.get("/{village_id}/summary")
def get_village_summary(village_id: int, db: Session = Depends(get_db)):
    """Returns spatial statistics, crops, soil profile, and water distance for a village."""
    query = text("""
        SELECT 
            v.id,
            v.village_name,
            d.district_name,
            ROUND((ST_Area(ST_Transform(v.geometry, 32644)) / 1000000.0)::numeric, 2) AS area_sq_km,
            COUNT(DISTINCT af.id) AS total_fields,
            COALESCE(ROUND(SUM(af.area_hectares)::numeric, 2), 0.0) AS total_crop_ha,
            ROUND(AVG(vi.ndvi)::numeric, 3) AS avg_ndvi,
            ROUND(AVG(vi.ndwi)::numeric, 3) AS avg_ndwi
        FROM villages v
        JOIN districts d ON v.district_id = d.id
        LEFT JOIN agricultural_fields af ON af.village_id = v.id
        LEFT JOIN vegetation_indices vi ON vi.field_id = af.id
        WHERE v.id = :vid
        GROUP BY v.id, v.village_name, d.district_name, v.geometry;
    """)
    r = db.execute(query, {"vid": village_id}).fetchone()
    if not r:
        raise HTTPException(status_code=404, detail="Village / Taluka not found")

    return {
        "id": r.id,
        "village_name": r.village_name,
        "district_name": r.district_name,
        "area_sq_km": float(r.area_sq_km) if r.area_sq_km else None,
        "total_fields": r.total_fields,
        "total_crop_ha": float(r.total_crop_ha),
        "avg_ndvi": float(r.avg_ndvi) if r.avg_ndvi else None,
        "avg_ndwi": float(r.avg_ndwi) if r.avg_ndwi else None
    }
