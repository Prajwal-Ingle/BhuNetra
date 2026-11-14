"""
GeoAgri Intelligence - Soil Data API Routes
"""

import json
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database.session import get_db

router = APIRouter(prefix="/soil", tags=["Soil Fertility"])

@router.get("/")
def list_soil_data(db: Session = Depends(get_db)):
    """Returns all soil sampling laboratory records with nutrient profiles."""
    query = text("""
        SELECT 
            id,
            location,
            soil_type,
            ph,
            nitrogen,
            phosphorus,
            potassium,
            organic_carbon,
            sampled_date
        FROM soil_data
        ORDER BY id;
    """)
    rows = db.execute(query).fetchall()
    return [
        {
            "id": r.id,
            "location": r.location,
            "soil_type": r.soil_type,
            "ph": float(r.ph) if r.ph is not None else None,
            "nitrogen_kgha": float(r.nitrogen) if r.nitrogen is not None else None,
            "phosphorus_kgha": float(r.phosphorus) if r.phosphorus is not None else None,
            "potassium_kgha": float(r.potassium) if r.potassium is not None else None,
            "organic_carbon_pct": float(r.organic_carbon) if r.organic_carbon is not None else None,
            "sampled_date": str(r.sampled_date) if r.sampled_date else None
        }
        for r in rows
    ]

@router.get("/geojson")
def get_soil_geojson(db: Session = Depends(get_db)):
    """Returns soil test sample locations as a GeoJSON FeatureCollection."""
    query = text("""
        SELECT 
            id,
            location,
            soil_type,
            ph,
            nitrogen,
            phosphorus,
            potassium,
            organic_carbon,
            sampled_date,
            ST_AsGeoJSON(geometry) AS geojson
        FROM soil_data;
    """)
    rows = db.execute(query).fetchall()
    features = []
    for r in rows:
        features.append({
            "type": "Feature",
            "id": r.id,
            "properties": {
                "id": r.id,
                "location": r.location,
                "soil_type": r.soil_type,
                "ph": float(r.ph) if r.ph is not None else None,
                "nitrogen_kgha": float(r.nitrogen) if r.nitrogen is not None else None,
                "phosphorus_kgha": float(r.phosphorus) if r.phosphorus is not None else None,
                "potassium_kgha": float(r.potassium) if r.potassium is not None else None,
                "organic_carbon_pct": float(r.organic_carbon) if r.organic_carbon is not None else None,
                "sampled_date": str(r.sampled_date) if r.sampled_date else None
            },
            "geometry": json.loads(r.geojson)
        })
    return {"type": "FeatureCollection", "features": features}

@router.get("/stats")
def get_soil_stats(db: Session = Depends(get_db)):
    """Returns mean, min, and max nutrient statistics across the district."""
    query = text("""
        SELECT 
            ROUND(AVG(ph)::numeric, 2) AS avg_ph,
            ROUND(MIN(ph)::numeric, 2) AS min_ph,
            ROUND(MAX(ph)::numeric, 2) AS max_ph,
            ROUND(AVG(nitrogen)::numeric, 1) AS avg_nitrogen,
            ROUND(AVG(phosphorus)::numeric, 1) AS avg_phosphorus,
            ROUND(AVG(potassium)::numeric, 1) AS avg_potassium,
            ROUND(AVG(organic_carbon)::numeric, 2) AS avg_oc
        FROM soil_data;
    """)
    r = db.execute(query).fetchone()
    return {
        "ph": {"mean": float(r.avg_ph), "min": float(r.min_ph), "max": float(r.max_ph)},
        "nitrogen_kgha": {"mean": float(r.avg_nitrogen)},
        "phosphorus_kgha": {"mean": float(r.avg_phosphorus)},
        "potassium_kgha": {"mean": float(r.avg_potassium)},
        "organic_carbon_pct": {"mean": float(r.avg_oc)}
    }
