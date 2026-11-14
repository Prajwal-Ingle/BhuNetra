"""
GeoAgri Intelligence - Health Check API Route
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database.session import get_db

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("/")
def health_check(db: Session = Depends(get_db)):
    """Verifies backend API, PostgreSQL database, and PostGIS extension status."""
    try:
        # Check PostGIS version
        result = db.execute(text("SELECT PostGIS_Version();")).scalar()
        db_status = "connected"
        postgis_version = str(result)
    except Exception as e:
        db_status = f"error: {str(e)}"
        postgis_version = "unknown"

    return {
        "status": "healthy",
        "service": "BhuNetra Platform API",
        "database": db_status,
        "postgis_version": postgis_version,
        "target_region": "Nagpur District, Maharashtra, India"
    }
