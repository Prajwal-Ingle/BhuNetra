"""
GeoAgri Intelligence - Vegetation Indices API Routes
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database.session import get_db

router = APIRouter(prefix="/vegetation", tags=["Vegetation Analysis"])

@router.get("/summary")
def get_vegetation_summary(db: Session = Depends(get_db)):
    """Returns district-wide vegetation index distribution, mean NDVI, and water index."""
    query = text("""
        SELECT 
            COUNT(vi.id) AS total_records,
            ROUND(AVG(vi.ndvi)::numeric, 4) AS mean_ndvi,
            ROUND(MIN(vi.ndvi)::numeric, 4) AS min_ndvi,
            ROUND(MAX(vi.ndvi)::numeric, 4) AS max_ndvi,
            ROUND(AVG(vi.ndwi)::numeric, 4) AS mean_ndwi,
            COUNT(*) FILTER (WHERE vi.ndvi >= 0.70) AS dense_healthy_count,
            COUNT(*) FILTER (WHERE vi.ndvi >= 0.50 AND vi.ndvi < 0.70) AS moderate_count,
            COUNT(*) FILTER (WHERE vi.ndvi >= 0.30 AND vi.ndvi < 0.50) AS stressed_count,
            COUNT(*) FILTER (WHERE vi.ndvi < 0.30) AS critical_bare_count
        FROM vegetation_indices vi;
    """)
    r = db.execute(query).fetchone()
    return {
        "total_records": r.total_records,
        "mean_ndvi": float(r.mean_ndvi) if r.mean_ndvi else 0.0,
        "min_ndvi": float(r.min_ndvi) if r.min_ndvi else 0.0,
        "max_ndvi": float(r.max_ndvi) if r.max_ndvi else 0.0,
        "mean_ndwi": float(r.mean_ndwi) if r.mean_ndwi else 0.0,
        "distribution": {
            "dense_healthy": r.dense_healthy_count,
            "moderate_healthy": r.moderate_count,
            "stressed_deficit": r.stressed_count,
            "critical_bare": r.critical_bare_count
        }
    }

@router.get("/trends")
def get_vegetation_trends(db: Session = Depends(get_db)):
    """Returns temporal NDVI / NDWI progression across observation dates."""
    query = text("""
        SELECT 
            so.observation_date,
            so.satellite_name,
            ROUND(AVG(vi.ndvi)::numeric, 3) AS avg_ndvi,
            ROUND(AVG(vi.ndwi)::numeric, 3) AS avg_ndwi,
            COUNT(vi.id) AS sample_fields
        FROM vegetation_indices vi
        JOIN satellite_observations so ON vi.observation_id = so.id
        GROUP BY so.observation_date, so.satellite_name
        ORDER BY so.observation_date ASC;
    """)
    rows = db.execute(query).fetchall()
    return [
        {
            "observation_date": str(r.observation_date),
            "satellite_name": r.satellite_name,
            "avg_ndvi": float(r.avg_ndvi) if r.avg_ndvi else None,
            "avg_ndwi": float(r.avg_ndwi) if r.avg_ndwi else None,
            "sample_fields": r.sample_fields
        }
        for r in rows
    ]
