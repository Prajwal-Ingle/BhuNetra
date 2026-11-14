"""
GeoAgri Intelligence - Drought Risk Machine Learning Pipeline
Integrates satellite Vegetation Condition Index (VCI), Temperature Condition Index (TCI),
and rainfall anomalies to classify regional agricultural drought risk.
"""

import os
import json
import logging
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

logger = logging.getLogger("DroughtRiskML")

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "models")
os.makedirs(MODELS_DIR, exist_ok=True)
DROUGHT_MODEL_PATH = os.path.join(MODELS_DIR, "drought_risk_v1.joblib")
DROUGHT_META_PATH = os.path.join(MODELS_DIR, "drought_meta.json")

RISK_LEVELS = {
    0: "Low / No Drought Risk",
    1: "Mild Agricultural Drought",
    2: "Moderate Agricultural Drought",
    3: "Severe Agricultural Drought"
}

FEATURE_COLS = [
    "vci",              # Vegetation Condition Index: 0 to 100
    "tci",              # Temperature Condition Index: 0 to 100
    "rainfall_ratio",   # Actual Rainfall / Normal Rainfall (e.g. 0.3 = 70% deficit)
    "soil_moisture_est" # Estimated soil moisture fraction (0.0 to 1.0)
]

def generate_drought_data(n_samples: int = 500, random_state: int = 42) -> pd.DataFrame:
    np.random.seed(random_state)
    n = n_samples // 4

    # Class 0: Low / No Risk
    vci_0 = np.random.uniform(60, 95, n)
    tci_0 = np.random.uniform(55, 90, n)
    rain_0 = np.random.uniform(0.9, 1.4, n)
    sm_0 = np.random.uniform(0.55, 0.90, n)
    y_0 = np.zeros(n, dtype=int)

    # Class 1: Mild
    vci_1 = np.random.uniform(40, 65, n)
    tci_1 = np.random.uniform(40, 60, n)
    rain_1 = np.random.uniform(0.70, 0.95, n)
    sm_1 = np.random.uniform(0.40, 0.60, n)
    y_1 = np.ones(n, dtype=int)

    # Class 2: Moderate
    vci_2 = np.random.uniform(25, 45, n)
    tci_2 = np.random.uniform(25, 45, n)
    rain_2 = np.random.uniform(0.45, 0.72, n)
    sm_2 = np.random.uniform(0.25, 0.45, n)
    y_2 = np.full(n, 2)

    # Class 3: Severe
    vci_3 = np.random.uniform(5, 28, n)
    tci_3 = np.random.uniform(5, 30, n)
    rain_3 = np.random.uniform(0.10, 0.48, n)
    sm_3 = np.random.uniform(0.08, 0.28, n)
    y_3 = np.full(n, 3)

    return pd.DataFrame({
        "vci": np.concatenate([vci_0, vci_1, vci_2, vci_3]),
        "tci": np.concatenate([tci_0, tci_1, tci_2, tci_3]),
        "rainfall_ratio": np.concatenate([rain_0, rain_1, rain_2, rain_3]),
        "soil_moisture_est": np.concatenate([sm_0, sm_1, sm_2, sm_3]),
        "drought_class": np.concatenate([y_0, y_1, y_2, y_3])
    }).sample(frac=1.0, random_state=random_state).reset_index(drop=True)

class DroughtRiskClassifier:
    def __init__(self):
        self.model = None

    def train(self) -> dict:
        df = generate_drought_data()
        X = df[FEATURE_COLS]
        y = df["drought_class"]

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)
        self.model = RandomForestClassifier(n_estimators=80, max_depth=6, random_state=42)
        self.model.fit(X_train, y_train)

        y_pred = self.model.predict(X_test)
        acc = float(accuracy_score(y_test, y_pred))
        report = classification_report(y_test, y_pred, target_names=[RISK_LEVELS[i] for i in range(4)], output_dict=True)

        meta = {
            "model_version": "v1.0.0",
            "accuracy": round(acc, 4),
            "report": report,
            "feature_importance": {col: round(float(imp), 4) for col, imp in zip(FEATURE_COLS, self.model.feature_importances_)}
        }
        joblib.dump(self.model, DROUGHT_MODEL_PATH)
        with open(DROUGHT_META_PATH, "w") as f:
            json.dump(meta, f, indent=2)
        logger.info(f"Drought model saved to {DROUGHT_MODEL_PATH} (Accuracy: {acc:.4f})")
        return meta

    def load(self):
        if not os.path.exists(DROUGHT_MODEL_PATH):
            self.train()
        self.model = joblib.load(DROUGHT_MODEL_PATH)

    def evaluate_risk(self, vci: float, tci: float, rainfall_ratio: float, soil_moisture_est: float) -> dict:
        if self.model is None:
            self.load()
        vec = np.array([[vci, tci, rainfall_ratio, soil_moisture_est]])
        pred = int(self.model.predict(vec)[0])
        probs = self.model.predict_proba(vec)[0]

        return {
            "risk_code": pred,
            "risk_level": RISK_LEVELS[pred],
            "confidence_score": round(float(probs[pred]), 4),
            "probabilities": {RISK_LEVELS[i]: round(float(p), 4) for i, p in enumerate(probs)}
        }

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    clf = DroughtRiskClassifier()
    clf.train()
    print("Normal monsoon:", clf.evaluate_risk(75.0, 70.0, 1.1, 0.70))
    print("Drought scenario:", clf.evaluate_risk(22.0, 18.0, 0.35, 0.18))
