"""
GeoAgri Intelligence - Land Use / Land Cover (LULC) Classification Engine
Classifies pixels or field parcels into agricultural and environmental classes using
Sentinel-2 multispectral signatures and Random Forest.
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

logger = logging.getLogger("LandUseML")

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "models")
os.makedirs(MODELS_DIR, exist_ok=True)
LULC_MODEL_PATH = os.path.join(MODELS_DIR, "land_use_rf_v1.joblib")
LULC_META_PATH = os.path.join(MODELS_DIR, "land_use_meta.json")

LULC_CLASSES = {
    0: "Cropland (Intensive / Irrigated)",
    1: "Cropland (Rainfed Kharif)",
    2: "Orchard / Plantation (Citrus)",
    3: "Water Body (Lake / River / Dam)",
    4: "Built-up / Fallow / Bare Soil"
}

FEATURE_COLS = ["b03_green", "b04_red", "b08_nir", "b11_swir", "ndvi", "ndwi"]

def generate_lulc_training_data(n_per_class: int = 150, random_state: int = 42) -> pd.DataFrame:
    np.random.seed(random_state)

    # 0: Irrigated Cropland: High NIR (4200), Mod Red (800), Green (1100), SWIR (1600), NDVI (~0.68)
    b03_0 = np.random.normal(1100, 100, n_per_class)
    b04_0 = np.random.normal(800, 80, n_per_class)
    b08_0 = np.random.normal(4200, 300, n_per_class)
    b11_0 = np.random.normal(1600, 150, n_per_class)
    y_0 = np.zeros(n_per_class, dtype=int)

    # 1: Rainfed Cropland: Mod NIR (2800), Mod Red (1200), Green (1250), SWIR (2200), NDVI (~0.40)
    b03_1 = np.random.normal(1250, 120, n_per_class)
    b04_1 = np.random.normal(1200, 110, n_per_class)
    b08_1 = np.random.normal(2800, 250, n_per_class)
    b11_1 = np.random.normal(2200, 180, n_per_class)
    y_1 = np.ones(n_per_class, dtype=int)

    # 2: Citrus Orchard: Very High NIR (5300), Low Red (600), Green (1050), SWIR (1350), NDVI (~0.78)
    b03_2 = np.random.normal(1050, 90, n_per_class)
    b04_2 = np.random.normal(600, 70, n_per_class)
    b08_2 = np.random.normal(5300, 350, n_per_class)
    b11_2 = np.random.normal(1350, 120, n_per_class)
    y_2 = np.full(n_per_class, 2)

    # 3: Water Body: Very Low NIR (250), Low Red (380), Moderate Green (850), Very Low SWIR (150), NDVI (< 0)
    b03_3 = np.random.normal(850, 80, n_per_class)
    b04_3 = np.random.normal(380, 50, n_per_class)
    b08_3 = np.random.normal(250, 40, n_per_class)
    b11_3 = np.random.normal(150, 30, n_per_class)
    y_3 = np.full(n_per_class, 3)

    # 4: Built-up / Bare: High Red (1800), High SWIR (2800), Moderate NIR (2000), Low NDVI (0.05 - 0.20)
    b03_4 = np.random.normal(1500, 140, n_per_class)
    b04_4 = np.random.normal(1800, 150, n_per_class)
    b08_4 = np.random.normal(2000, 180, n_per_class)
    b11_4 = np.random.normal(2800, 200, n_per_class)
    y_4 = np.full(n_per_class, 4)

    b03 = np.concatenate([b03_0, b03_1, b03_2, b03_3, b03_4])
    b04 = np.concatenate([b04_0, b04_1, b04_2, b04_3, b04_4])
    b08 = np.concatenate([b08_0, b08_1, b08_2, b08_3, b08_4])
    b11 = np.concatenate([b11_0, b11_1, b11_2, b11_3, b11_4])
    labels = np.concatenate([y_0, y_1, y_2, y_3, y_4])

    ndvi = (b08 - b04) / (b08 + b04 + 1e-6)
    ndwi = (b03 - b08) / (b03 + b08 + 1e-6)

    return pd.DataFrame({
        "b03_green": b03,
        "b04_red": b04,
        "b08_nir": b08,
        "b11_swir": b11,
        "ndvi": ndvi,
        "ndwi": ndwi,
        "lulc_class": labels
    }).sample(frac=1.0, random_state=random_state).reset_index(drop=True)

class LandUseClassifier:
    def __init__(self):
        self.model = None

    def train(self) -> dict:
        df = generate_lulc_training_data()
        X = df[FEATURE_COLS]
        y = df["lulc_class"]

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)
        self.model = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
        self.model.fit(X_train, y_train)

        y_pred = self.model.predict(X_test)
        acc = float(accuracy_score(y_test, y_pred))
        report = classification_report(y_test, y_pred, target_names=[LULC_CLASSES[i] for i in range(5)], output_dict=True)

        meta = {
            "model_version": "v1.0.0",
            "accuracy": round(acc, 4),
            "report": report,
            "feature_importance": {col: round(float(imp), 4) for col, imp in zip(FEATURE_COLS, self.model.feature_importances_)}
        }
        joblib.dump(self.model, LULC_MODEL_PATH)
        with open(LULC_META_PATH, "w") as f:
            json.dump(meta, f, indent=2)
        logger.info(f"LULC model saved to {LULC_MODEL_PATH} (Accuracy: {acc:.4f})")
        return meta

    def load(self):
        if not os.path.exists(LULC_MODEL_PATH):
            self.train()
        self.model = joblib.load(LULC_MODEL_PATH)

    def classify_pixel(self, b03: float, b04: float, b08: float, b11: float) -> dict:
        if self.model is None:
            self.load()
        ndvi = (b08 - b04) / (b08 + b04 + 1e-6)
        ndwi = (b03 - b08) / (b03 + b08 + 1e-6)
        vec = np.array([[b03, b04, b08, b11, ndvi, ndwi]])

        pred = int(self.model.predict(vec)[0])
        probs = self.model.predict_proba(vec)[0]

        return {
            "class_id": pred,
            "classification_type": LULC_CLASSES[pred],
            "confidence_score": round(float(probs[pred]), 4),
            "ndvi": round(float(ndvi), 4),
            "ndwi": round(float(ndwi), 4)
        }

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    classifier = LandUseClassifier()
    classifier.train()
    print("Orchard test:", classifier.classify_pixel(1050, 600, 5300, 1350))
    print("Water test:", classifier.classify_pixel(850, 380, 250, 150))
