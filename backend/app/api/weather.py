"""
GeoAgri Intelligence - Weather & Agrometeorology API Routes
"""

import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database.session import get_db

router = APIRouter(prefix="/weather", tags=["Weather & Agrometeorology"])

@router.get("/")
def list_weather_data(db: Session = Depends(get_db)):
    """Returns meteorological observations from all agro-stations."""
    query = text("""
        SELECT 
            id,
            observation_date,
            temperature,
            rainfall,
            humidity
        FROM weather_data
        ORDER BY observation_date DESC;
    """)
    rows = db.execute(query).fetchall()
    return [
        {
            "id": r.id,
            "observation_date": str(r.observation_date),
            "temperature_c": float(r.temperature) if r.temperature is not None else None,
            "rainfall_mm": float(r.rainfall) if r.rainfall is not None else None,
            "humidity_pct": float(r.humidity) if r.humidity is not None else None
        }
        for r in rows
    ]

@router.get("/geojson")
def get_weather_geojson(db: Session = Depends(get_db)):
    """Returns weather station locations with live atmospheric readings as GeoJSON."""
    query = text("""
        SELECT 
            id,
            observation_date,
            temperature,
            rainfall,
            humidity,
            ST_AsGeoJSON(geometry) AS geojson
        FROM weather_data;
    """)
    rows = db.execute(query).fetchall()
    features = []
    for r in rows:
        features.append({
            "type": "Feature",
            "id": r.id,
            "properties": {
                "id": r.id,
                "observation_date": str(r.observation_date),
                "temperature_c": float(r.temperature) if r.temperature is not None else None,
                "rainfall_mm": float(r.rainfall) if r.rainfall is not None else None,
                "humidity_pct": float(r.humidity) if r.humidity is not None else None
            },
            "geometry": json.loads(r.geojson)
        })
    return {"type": "FeatureCollection", "features": features}

@router.get("/latest")
def get_latest_district_weather(db: Session = Depends(get_db)):
    """Returns average meteorological condition across the district."""
    query = text("""
        SELECT 
            MAX(observation_date) AS latest_date,
            ROUND(AVG(temperature)::numeric, 1) AS avg_temp,
            ROUND(AVG(rainfall)::numeric, 1) AS avg_rain,
            ROUND(AVG(humidity)::numeric, 1) AS avg_humidity,
            COUNT(id) AS station_count
        FROM weather_data;
    """)
    r = db.execute(query).fetchone()
    return {
        "latest_observation_date": str(r.latest_date) if r.latest_date else None,
        "avg_temperature_c": float(r.avg_temp) if r.avg_temp else None,
        "avg_rainfall_mm": float(r.avg_rain) if r.avg_rain else None,
        "avg_humidity_pct": float(r.avg_humidity) if r.avg_humidity else None,
        "active_stations": r.station_count
    }
