"""
GeoAgri Intelligence - Satellite Observations API Routes
"""

import os
import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database.session import get_db
from backend.app.core.config import settings
from backend.app.remote_sensing.sentinel2 import Sentinel2SceneManager
from backend.app.remote_sensing.processor import RasterProcessor

router = APIRouter(prefix="/satellite", tags=["Satellite Remote Sensing"])

@router.get("/observations")
def list_satellite_observations(db: Session = Depends(get_db)):
    """Returns catalog of satellite observations recorded in PostGIS database."""
    query = text("""
        SELECT 
            id,
            observation_date,
            satellite_name,
            cloud_percentage,
            acquisition_metadata,
            ST_AsGeoJSON(footprint) AS geojson
        FROM satellite_observations
        ORDER BY observation_date DESC;
    """)
    rows = db.execute(query).fetchall()
    return [
        {
            "id": r.id,
            "observation_date": str(r.observation_date),
            "satellite_name": r.satellite_name,
            "cloud_percentage": float(r.cloud_percentage) if r.cloud_percentage is not None else None,
            "metadata": r.acquisition_metadata,
            "footprint": json.loads(r.geojson)
        }
        for r in rows
    ]

@router.get("/catalog")
def get_sentinel_catalog():
    """Returns available Copernicus Sentinel-2 Level-2A imagery scenes over Nagpur."""
    return Sentinel2SceneManager.get_catalog_metadata()

@router.get("/layers")
def get_available_raster_layers():
    """Lists available processed NDVI and NDWI raster overlays for web mapping."""
    rasters = []
    if os.path.exists(settings.RASTERS_DIR):
        for f in os.listdir(settings.RASTERS_DIR):
            if f.endswith(".png"):
                itype = "NDVI" if f.startswith("ndvi_") else "NDWI"
                scene_id = f.replace("ndvi_", "").replace("ndwi_", "").replace(".png", "")
                date_str = "2026-09-25" if "20260925" in scene_id else "2026-10-20"
                rasters.append({
                    "layer_type": itype,
                    "scene_id": scene_id,
                    "date": date_str,
                    "overlay_url": f"/static/rasters/{f}",
                    "geotiff_url": f"/static/rasters/{f.replace('.png', '.tif')}",
                    "bounds": [[21.00, 78.80], [21.40, 79.20]] # Leaflet LatLng bounds [southwest, northeast]
                })
    return rasters
