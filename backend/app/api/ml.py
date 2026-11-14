"""
GeoAgri Intelligence - Machine Learning Inference & Evaluation API Routes
"""

import os
import json
from fastapi import APIRouter, HTTPException
from backend.app.schemas.spatial_schemas import (
    CropHealthInferenceInput,
    DroughtRiskInferenceInput,
    AnomalyInferenceInput,
    LandUseInferenceInput
)
from backend.app.ml.crop_health import CropHealthModel
from backend.app.ml.anomaly_detection import VegetationAnomalyDetector
from backend.app.ml.drought_risk import DroughtRiskClassifier
from backend.app.ml.land_use_classifier import LandUseClassifier
from backend.app.core.config import settings

router = APIRouter(prefix="/ml", tags=["AI & Machine Learning"])

# Singleton instances of models
crop_health_model = CropHealthModel()
anomaly_detector = VegetationAnomalyDetector()
drought_classifier = DroughtRiskClassifier()
land_use_classifier = LandUseClassifier()

@router.post("/predict-crop-health")
def predict_crop_health(payload: CropHealthInferenceInput):
    """
    Evaluates crop health status using Random Forest classifier.
    Features: NDVI, NDWI, NDVI delta, soil pH, nitrogen, organic carbon, temp, rainfall.
    """
    try:
        return crop_health_model.predict(payload.model_dump())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML inference error: {str(e)}")

@router.post("/detect-anomalies")
def detect_vegetation_anomaly(payload: AnomalyInferenceInput):
    """
    Detects abnormal rapid drop in vegetation health using Isolation Forest
    and trajectory delta analysis.
    """
    try:
        return anomaly_detector.detect_anomaly(
            current_ndvi=payload.current_ndvi,
            previous_ndvi=payload.previous_ndvi,
            current_ndwi=payload.current_ndwi
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly detection error: {str(e)}")

@router.post("/drought-risk")
def evaluate_drought_risk(payload: DroughtRiskInferenceInput):
    """
    Predicts agricultural drought vulnerability level (Low, Mild, Moderate, Severe)
    using VCI, TCI, rainfall deficit ratio, and soil moisture.
    """
    try:
        return drought_classifier.evaluate_risk(
            vci=payload.vci,
            tci=payload.tci,
            rainfall_ratio=payload.rainfall_ratio,
            soil_moisture_est=payload.soil_moisture_est
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Drought assessment error: {str(e)}")

@router.post("/classify-landuse")
def classify_land_use(payload: LandUseInferenceInput):
    """
    Classifies land cover pixel from Sentinel-2 multispectral reflectance signatures
    (Green, Red, NIR, SWIR).
    """
    try:
        return land_use_classifier.classify_pixel(
            b03=payload.b03_green,
            b04=payload.b04_red,
            b08=payload.b08_nir,
            b11=payload.b11_swir
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LULC classification error: {str(e)}")

@router.get("/models-metadata")
def get_all_models_metadata():
    """
    Returns authentic training and evaluation metrics, confusion matrices,
    and feature importance rankings for all local models.
    """
    meta_files = {
        "crop_health": os.path.join(settings.MODELS_DIR, "crop_health_meta.json"),
        "anomaly_detection": os.path.join(settings.MODELS_DIR, "anomaly_meta.json"),
        "drought_risk": os.path.join(settings.MODELS_DIR, "drought_meta.json"),
        "land_use_classification": os.path.join(settings.MODELS_DIR, "land_use_meta.json")
    }

    result = {}
    for name, path in meta_files.items():
        if os.path.exists(path):
            with open(path, "r") as f:
                result[name] = json.load(f)
        else:
            result[name] = {"status": "untrained"}
    return result
