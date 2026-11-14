"""
GeoAgri Intelligence - Geospatial Analysis & Summary API Routes
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database.session import get_db

router = APIRouter(prefix="/analysis", tags=["Geospatial Analysis"])

@router.get("/overview")
def get_dashboard_overview(db: Session = Depends(get_db)):
    """
    Returns high-level platform summary indicators matching the dashboard overview requirements:
    - Total geographical area analyzed (sq km)
    - Agricultural area (ha)
    - Average NDVI
    - Number of analyzed fields
    - Number of satellite observations
    - Potential risk zones
    - Latest analysis date
    """
    query = text("""
        SELECT 
            -- Total geographical area analyzed (Nagpur district boundary in sq km)
            COALESCE((
                SELECT ROUND((ST_Area(ST_Transform(geometry, 32644)) / 1000000.0)::numeric, 1)
                FROM districts
                WHERE district_name = 'Nagpur'
                LIMIT 1
            ), 9892.0) AS total_district_area_sq_km,

            -- Total agricultural field area in hectares
            COALESCE((
                SELECT ROUND(SUM(area_hectares)::numeric, 1)
                FROM agricultural_fields
            ), 0.0) AS total_agri_area_ha,

            -- Average NDVI across latest observations
            COALESCE((
                SELECT ROUND(AVG(ndvi)::numeric, 3)
                FROM vegetation_indices
            ), 0.0) AS avg_ndvi,

            -- Number of analyzed fields
            (SELECT COUNT(*) FROM agricultural_fields) AS field_count,

            -- Number of satellite observations
            (SELECT COUNT(*) FROM satellite_observations) AS satellite_obs_count,

            -- Number of active risk zones
            (SELECT COUNT(*) FROM risk_zones) AS risk_zone_count,

            -- Latest analysis date
            COALESCE((
                SELECT MAX(observation_date)::text
                FROM satellite_observations
            ), '2026-10-20') AS latest_date;
    """)
    r = db.execute(query).fetchone()

    return {
        "total_area_analyzed_sq_km": float(r.total_district_area_sq_km),
        "total_agricultural_area_ha": float(r.total_agri_area_ha),
        "average_ndvi": float(r.avg_ndvi),
        "analyzed_fields_count": int(r.field_count),
        "satellite_observations_count": int(r.satellite_obs_count),
        "potential_risk_zones": int(r.risk_zone_count),
        "latest_analysis_date": str(r.latest_date)
    }

@router.get("/historical-comparison")
def compare_historical_vegetation(db: Session = Depends(get_db)):
    """
    Compares vegetation and water conditions between observation dates
    (e.g. Post-Monsoon peak vs Late Kharif harvest transition).
    """
    query = text("""
        SELECT 
            af.id AS field_id,
            af.field_name,
            v.village_name,
            MAX(CASE WHEN so.observation_date = '2026-09-25' THEN vi.ndvi END) AS sep_ndvi,
            MAX(CASE WHEN so.observation_date = '2026-10-20' THEN vi.ndvi END) AS oct_ndvi,
            MAX(CASE WHEN so.observation_date = '2026-09-25' THEN vi.ndwi END) AS sep_ndwi,
            MAX(CASE WHEN so.observation_date = '2026-10-20' THEN vi.ndwi END) AS oct_ndwi
        FROM agricultural_fields af
        JOIN villages v ON af.village_id = v.id
        JOIN vegetation_indices vi ON vi.field_id = af.id
        JOIN satellite_observations so ON vi.observation_id = so.id
        GROUP BY af.id, af.field_name, v.village_name
        ORDER BY af.id;
    """)
    rows = db.execute(query).fetchall()

    results = []
    for r in rows:
        sep = float(r.sep_ndvi) if r.sep_ndvi is not None else None
        octo = float(r.oct_ndvi) if r.oct_ndvi is not None else None
        delta = round(octo - sep, 3) if (sep is not None and octo is not None) else None
        results.append({
            "field_id": r.field_id,
            "field_name": r.field_name,
            "village_name": r.village_name,
            "sep_ndvi": sep,
            "oct_ndvi": octo,
            "ndvi_change": delta,
            "trend": "Vigor Maintained" if (delta and delta >= -0.05) else "Normal Senescence / Harvest" if (delta and delta >= -0.20) else "Rapid Decline / Stress"
        })

    return results

@router.get("/hotspots")
def get_agricultural_hotspots(db: Session = Depends(get_db)):
    """Identifies high-performing horticultural zones vs stress vulnerability zones."""
    query = text("""
        SELECT 
            v.village_name,
            COUNT(af.id) AS field_count,
            ROUND(AVG(vi.ndvi)::numeric, 3) AS avg_ndvi,
            ROUND(AVG(sd.ph)::numeric, 2) AS avg_soil_ph,
            CASE 
                WHEN AVG(vi.ndvi) >= 0.70 THEN 'High Productivity Evergreen / Orchard Hotspot'
                WHEN AVG(vi.ndvi) >= 0.55 THEN 'Moderate Agricultural Production'
                ELSE 'Moisture Deficit / Low Vegetation Vulnerability Hotspot'
            END AS hotspot_category
        FROM villages v
        JOIN agricultural_fields af ON af.village_id = v.id
        LEFT JOIN vegetation_indices vi ON vi.field_id = af.id
        LEFT JOIN LATERAL (
            SELECT ph FROM soil_data ORDER BY ST_Distance(af.geometry::geography, geometry::geography) LIMIT 1
        ) sd ON true
        GROUP BY v.village_name
        ORDER BY avg_ndvi DESC;
    """)
    rows = db.execute(query).fetchall()
    return [
        {
            "village_name": r.village_name,
            "field_count": r.field_count,
            "avg_ndvi": float(r.avg_ndvi) if r.avg_ndvi else 0.0,
            "avg_soil_ph": float(r.avg_soil_ph) if r.avg_soil_ph else None,
            "category": r.hotspot_category
        }
        for r in rows
    ]
