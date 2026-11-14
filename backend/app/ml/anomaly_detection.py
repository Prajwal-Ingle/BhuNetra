"""
GeoAgri Intelligence - Vegetation Anomaly Detection Pipeline
Detects abnormal deviations in vegetation condition (sudden decline, pest infestation, localized flooding)
using Scikit-Learn IsolationForest and seasonal Z-score deviation analysis.
"""

import os
import json
import logging
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any
from sklearn.ensemble import IsolationForest

logger = logging.getLogger("AnomalyDetectionML")

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "models")
os.makedirs(MODELS_DIR, exist_ok=True)
ANOMALY_MODEL_PATH = os.path.join(MODELS_DIR, "anomaly_detector_v1.joblib")
ANOMALY_META_PATH = os.path.join(MODELS_DIR, "anomaly_meta.json")

class VegetationAnomalyDetector:
    """Unsupervised Anomaly Detector using Isolation Forest."""

    def __init__(self, contamination: float = 0.08):
        self.contamination = contamination
        self.model = None

    def train_baseline(self, n_samples: int = 500, random_state: int = 42) -> dict:
        """Trains baseline Isolation Forest on expected seasonal vegetation fluctuations."""
        np.random.seed(random_state)

        # Normal seasonal trajectory:
        # Expected NDVI: 0.45 - 0.82
        # Normal 1-month delta: -0.15 to +0.10
        # Normal NDWI: 0.05 to 0.35
        normal_ndvi = np.random.normal(0.62, 0.12, int(n_samples * 0.92))
        normal_delta = np.random.normal(0.0, 0.06, int(n_samples * 0.92))
        normal_ndwi = np.random.normal(0.20, 0.08, int(n_samples * 0.92))

        # Synthetic anomalies: sudden crash in NDVI (pest, hail, severe moisture collapse)
        anom_count = n_samples - len(normal_ndvi)
        anom_ndvi = np.random.uniform(0.10, 0.35, anom_count)
        anom_delta = np.random.uniform(-0.45, -0.22, anom_count)
        anom_ndwi = np.random.uniform(-0.30, -0.05, anom_count)

        X = np.column_stack([
            np.concatenate([normal_ndvi, anom_ndvi]),
            np.concatenate([normal_delta, anom_delta]),
            np.concatenate([normal_ndwi, anom_ndwi])
        ])

        self.model = IsolationForest(
            contamination=self.contamination,
            random_state=42,
            n_estimators=100
        )
        self.model.fit(X)

        # Baseline statistics
        meta = {
            "model_version": "v1.0.0",
            "algorithm": "IsolationForest(contamination=0.08, n_estimators=100)",
            "features": ["current_ndvi", "ndvi_delta", "current_ndwi"],
            "training_samples": n_samples,
            "baseline_mean_ndvi": round(float(np.mean(normal_ndvi)), 3),
            "baseline_std_ndvi": round(float(np.std(normal_ndvi)), 3)
        }

        joblib.dump(self.model, ANOMALY_MODEL_PATH)
        with open(ANOMALY_META_PATH, "w") as f:
            json.dump(meta, f, indent=2)

        logger.info(f"Anomaly detection baseline saved to {ANOMALY_MODEL_PATH}")
        return meta

    def load_model(self):
        if not os.path.exists(ANOMALY_MODEL_PATH):
            self.train_baseline()
        self.model = joblib.load(ANOMALY_MODEL_PATH)

    def detect_anomaly(self, current_ndvi: float, previous_ndvi: float, current_ndwi: float) -> Dict[str, Any]:
        """Inference: assesses if a field exhibits abnormal condition."""
        if self.model is None:
            self.load_model()

        delta = current_ndvi - previous_ndvi
        vec = np.array([[current_ndvi, delta, current_ndwi]])

        pred = self.model.predict(vec)[0] # -1 for anomaly, 1 for normal
        decision_score = float(self.model.decision_function(vec)[0]) # Lower is more anomalous

        is_anomaly = bool(pred == -1)

        # Severity classification
        if is_anomaly:
            if delta < -0.30 or decision_score < -0.15:
                severity = "Critical Anomaly (Severe Vegetation Collapse)"
            elif delta < -0.18:
                severity = "Moderate Anomaly (Noticeable Deficit / Stress)"
            else:
                severity = "Mild Anomaly (Atypical Variation)"
        else:
            severity = "Normal Trajectory"

        return {
            "is_anomaly": is_anomaly,
            "severity": severity,
            "decision_score": round(decision_score, 4),
            "ndvi_delta": round(delta, 4),
            "current_ndvi": round(current_ndvi, 4),
            "current_ndwi": round(current_ndwi, 4)
        }

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    detector = VegetationAnomalyDetector()
    detector.train_baseline()
    # Test normal vs anomaly
    print("Normal test:", detector.detect_anomaly(current_ndvi=0.68, previous_ndvi=0.65, current_ndwi=0.22))
    print("Anomaly test:", detector.detect_anomaly(current_ndvi=0.28, previous_ndvi=0.65, current_ndwi=-0.12))
