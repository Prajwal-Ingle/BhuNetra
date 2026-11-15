"""
GeoAgri Intelligence - FastAPI Application Main Entry Point
Production-quality Geospatial Information System, Remote Sensing,
Spatial Database & AI/ML Platform.
"""

import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.core.config import settings
from backend.app.api import (
    health,
    districts,
    villages,
    fields,
    satellite,
    vegetation,
    spatial,
    soil,
    weather,
    analysis,
    ml,
    reports
)

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
logger = logging.getLogger("GeoAgriApp")

app = FastAPI(
    title="BhuNetra Platform API",
    description="BhuNetra - Agricultural monitoring, Sentinel-2 remote sensing analysis (NDVI/NDWI), and AI/ML crop analytics for Central India (Nagpur).",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file mounts for raster overlays and exported layers
os.makedirs(settings.RASTERS_DIR, exist_ok=True)
os.makedirs(settings.REPORTS_DIR, exist_ok=True)

app.mount("/static/rasters", StaticFiles(directory=settings.RASTERS_DIR), name="rasters")
app.mount("/static/reports", StaticFiles(directory=settings.REPORTS_DIR), name="reports")

# Register all 12 API route modules under /api
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(districts.router, prefix=settings.API_V1_STR)
app.include_router(villages.router, prefix=settings.API_V1_STR)
app.include_router(fields.router, prefix=settings.API_V1_STR)
app.include_router(satellite.router, prefix=settings.API_V1_STR)
app.include_router(vegetation.router, prefix=settings.API_V1_STR)
app.include_router(spatial.router, prefix=settings.API_V1_STR)
app.include_router(soil.router, prefix=settings.API_V1_STR)
app.include_router(weather.router, prefix=settings.API_V1_STR)
app.include_router(analysis.router, prefix=settings.API_V1_STR)
app.include_router(ml.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)

# Serve built frontend if dist exists
dist_dir = os.path.join(settings.BASE_DIR, "frontend", "dist")
if os.path.exists(dist_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_dir, "assets")), name="assets")
    
    @app.get("/favicon.svg")
    def serve_favicon():
        from fastapi.responses import FileResponse
        return FileResponse(os.path.join(dist_dir, "favicon.svg"), media_type="image/svg+xml")

    @app.get("/favicon.png")
    def serve_favicon_png():
        from fastapi.responses import FileResponse
        return FileResponse(os.path.join(dist_dir, "favicon.png"), media_type="image/png")

    @app.get("/favicon.ico")
    def serve_favicon_ico():
        from fastapi.responses import FileResponse
        ico_path = os.path.join(dist_dir, "favicon.ico")
        if os.path.exists(ico_path):
            return FileResponse(ico_path, media_type="image/x-icon")
        return FileResponse(os.path.join(dist_dir, "favicon.svg"), media_type="image/svg+xml")

    @app.get("/logo.png")
    def serve_logo_png():
        from fastapi.responses import FileResponse
        return FileResponse(os.path.join(dist_dir, "logo.png"), media_type="image/png")

    @app.get("/")
    def serve_frontend_root():
        from fastapi.responses import FileResponse
        return FileResponse(os.path.join(dist_dir, "index.html"))

    @app.get("/{full_path:path}")
    def serve_frontend_spa(full_path: str):
        from fastapi.responses import FileResponse
        file_path = os.path.join(dist_dir, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_dir, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "platform": "GeoAgri Intelligence",
            "description": "Production Geospatial Remote Sensing & Agriculture AI Platform",
            "version": settings.VERSION,
            "docs": "/docs",
            "focus_region": "Nagpur District, Maharashtra, India"
        }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port, reload=True)
