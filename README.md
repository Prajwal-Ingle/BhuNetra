# GeoAgri Intelligence
## Complete GIS, Remote Sensing, Spatial Database & AI/ML Platform

An agricultural monitoring and geographical intelligence platform engineered for satellite observation analysis, vegetation index processing (NDVI / NDWI), spatial analysis, and machine-learning driven crop health assessment.

**Initial Geographical Focus:** Nagpur District, Maharashtra, India (WGS 84 EPSG:4326 / UTM Zone 44N EPSG:32644).

---

## 1. Technology Stack (100% Free & Open-Source)

- **Spatial Database:** PostgreSQL 14.24 with PostGIS 3.6.1 extension (`postgis`, `postgis_raster`), GEOS 3.14.1, PROJ 8.2.1, GDAL 3.9.2.
- **Backend API:** Python 3.12, FastAPI, Uvicorn, SQLAlchemy 2.0, GeoAlchemy2, Pydantic v2.
- **Geospatial Processing Engine:** GeoPandas, Shapely 2.0, Rasterio, NumPy, Pandas, PyProj.
- **AI/Machine Learning:** Scikit-Learn (Random Forest, Isolation Forest, Anomaly Detection, Drought Vulnerability).
- **Frontend Dashboard:** React 18, Vite, TypeScript, Tailwind CSS, Leaflet, React-Leaflet, Recharts.
- **Reporting:** ReportLab (Automated Analytical PDF generation).

---

## 2. Quick Start on Windows

### A. Start the Spatial Database Server
```powershell
powershell -ExecutionPolicy Bypass -File scripts/start_db.ps1
```

### B. Activate Python Environment & Run Backend API
```powershell
.\.venv\Scripts\Activate.ps1
powershell -ExecutionPolicy Bypass -File scripts/start_backend.ps1
```
The unified platform (React web UI + API + Swagger Docs) will be live at:
- **Interactive Web Dashboard:** `http://127.0.0.1:8000/`
- **Interactive Swagger API Docs:** `http://127.0.0.1:8000/docs`
- **ReDoc Documentation:** `http://127.0.0.1:8000/redoc`

### C. (Optional) Run Vite Frontend in Hot-Reload Development Mode
```powershell
powershell -ExecutionPolicy Bypass -File scripts/start_frontend.ps1
```
Available at `http://127.0.0.1:5173/`.

### D. Run Automated Test Suite
```powershell
$env:PYTHONPATH = ".;backend"
.\.venv\Scripts\python.exe -m pytest backend/tests/test_api.py -v
```

### E. Run Spatial SQL Verification Test Suite
```powershell
powershell -ExecutionPolicy Bypass -File scripts/run_spatial_tests.ps1
```

---

## 3. Implemented Platform Navigation Modules

1. **Overview:** High-level executive dashboard showing total geographical area analyzed (15,951 km²), agricultural area (1,891 ha), mean NDVI (0.668), field count, satellite scenes, and risk zones.
2. **Interactive Map:** Full-screen Leaflet GIS map with OpenStreetMap base layer, layer controls (Districts, Talukas, Cadastral Fields, Water, Drought Risk, Soil, Weather), Sentinel-2 NDVI/NDWI colormapped raster overlays, interactive feature inspector, and map legend.
3. **Satellite Analysis:** Copernicus Sentinel-2 MSI Level-2A catalog explorer, band metadata (B03 Green, B04 Red, B08 NIR, B11 SWIR), windowed raster processing, and GeoTIFF downloads.
4. **Crop Health:** Cadastral parcel table, NDVI phenological change detection, and individual parcel dossiers.
5. **Spatial Database:** Live PostGIS spatial operations: `ST_DWithin` water buffer queries, `ST_Intersection` hazard exposure, and spatial SQL syntax demonstrations.
6. **Land Use:** Land Use / Land Cover (LULC) stratification and interactive spectral signature classifier.
7. **Soil & Weather:** ICAR-NBSS&LUP benchmark soil profiles (Vertisols, pH, N, P, K, Organic Carbon) and IMD weather stations.
8. **AI Predictions:** Live ML inference forms for Crop Health (Random Forest), Vegetation Anomaly Detection (Isolation Forest), and Drought Risk Assessment.
9. **Reports:** Automated PDF analytical report generator and archive with one-click download.
10. **Settings:** Infrastructure health, memory footprint compliance (< 1.5 GB total on 8 GB RAM machines), and coordinate reference system configurations.

---

## 4. Directory Structure

```
BhuNetra/
├── backend/
│   ├── app/
│   │   ├── api/             # 12 REST route endpoints (health, districts, fields, ml, etc.)
│   │   ├── core/            # Configuration, logging & settings
│   │   ├── database/        # Session manager & SQLAlchemy models
│   │   ├── models/          # 10 Spatial models (District, Field, Soil, Risk, etc.)
│   │   ├── schemas/         # Pydantic v2 validation & GeoJSON schemas
│   │   ├── services/        # PDF reporting generator (ReportLab)
│   │   ├── gis/             # Data loading & spatial ingestion pipeline
│   │   ├── remote_sensing/  # Sentinel-2 raster processing & index calculation
│   │   ├── ml/              # 4 Scikit-learn pipelines & training scripts
│   │   └── main.py          # FastAPI application factory
│   ├── tests/               # 11 automated integration tests (100% passing)
│   └── requirements.txt     # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Header, Sidebar with 10 nav items
│   │   ├── pages/           # 10 Platform pages
│   │   ├── services/        # Axios API client
│   │   └── types/           # TypeScript interfaces & GeoJSON typings
│   ├── dist/                # Production-built bundle
│   └── package.json
│
├── database/
│   ├── schema/              # 01_init_schema.sql (10 spatial tables)
│   ├── indexes/             # 02_spatial_indexes.sql (GiST & B-tree indexes)
│   ├── sample_data/         # 03_initial_nagpur_data.sql (Nagpur authentic dataset)
│   └── queries/             # 04_spatial_operations_test.sql (12 spatial operations)
│
├── data/
│   ├── raw/                 # Downloaded Sentinel-2 multispectral scenes
│   ├── rasters/             # Generated NDVI / NDWI GeoTIFFs & PNG overlays
│   └── vectors/             # GeoJSON layers (districts, talukas, fields, water, soil)
│
├── models/                  # Saved Scikit-learn models (.joblib) & metadata (.json)
├── reports/                 # Generated PDF analytical reports
├── scripts/                 # Windows PowerShell scripts (start, stop, test, verify)
└── README.md
```
