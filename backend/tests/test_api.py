"""
GeoAgri Intelligence - Backend API & Spatial Database Integration Tests
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert "3." in data["postgis_version"]

def test_districts_list():
    response = client.get("/api/districts/")
    assert response.status_code == 200
    districts = response.json()
    assert len(districts) >= 1
    nagpur = next((d for d in districts if d["district_name"] == "Nagpur"), None)
    assert nagpur is not None
    assert nagpur["area_sq_km"] > 0

def test_villages_geojson():
    response = client.get("/api/villages/geojson")
    assert response.status_code == 200
    fc = response.json()
    assert fc["type"] == "FeatureCollection"
    assert len(fc["features"]) >= 4

def test_fields_paginated():
    response = client.get("/api/fields/?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 8
    assert len(data["items"]) <= 10

def test_spatial_buffer_analysis():
    response = client.get("/api/spatial/buffer-analysis?buffer_meters=2500")
    assert response.status_code == 200
    data = response.json()
    assert "matching_fields_count" in data
    assert data["matching_fields_count"] > 0

def test_spatial_risk_intersections():
    response = client.get("/api/spatial/risk-intersections")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "percent_risk_exposure" in data[0]

def test_analysis_overview():
    response = client.get("/api/analysis/overview")
    assert response.status_code == 200
    data = response.json()
    assert data["total_area_analyzed_sq_km"] > 0
    assert data["analyzed_fields_count"] > 0
    assert data["average_ndvi"] > 0

def test_ml_crop_health_prediction():
    payload = {
        "ndvi": 0.72,
        "ndwi": 0.25,
        "ndvi_change": 0.02,
        "soil_ph": 7.8,
        "soil_nitrogen": 210.0,
        "organic_carbon": 0.65,
        "temperature": 29.5,
        "rainfall": 30.0
    }
    response = client.post("/api/ml/predict-crop-health", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "label" in data
    assert data["confidence_score"] > 0.5

def test_ml_anomaly_detection():
    payload = {
        "current_ndvi": 0.28,
        "previous_ndvi": 0.65,
        "current_ndwi": -0.15
    }
    response = client.post("/api/ml/detect-anomalies", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_anomaly"] is True

def test_ml_drought_risk():
    payload = {
        "vci": 18.0,
        "tci": 15.0,
        "rainfall_ratio": 0.25,
        "soil_moisture_est": 0.15
    }
    response = client.post("/api/ml/drought-risk", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "risk_level" in data

def test_pdf_report_generation():
    response = client.post("/api/reports/generate-pdf?region_name=Nagpur%20District")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "filename" in data
