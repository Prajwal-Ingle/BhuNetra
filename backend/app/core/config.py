"""
GeoAgri Intelligence - Application Configuration Settings
"""

import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "BhuNetra Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres.ljsxodylzbexsjuiwgqf:7620199327%25Api@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres")
    
    # CORS Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    # Storage Paths
    BASE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    RASTERS_DIR: str = os.path.join(DATA_DIR, "rasters")
    VECTORS_DIR: str = os.path.join(DATA_DIR, "vectors")
    REPORTS_DIR: str = os.path.join(BASE_DIR, "reports")
    MODELS_DIR: str = os.path.join(BASE_DIR, "models")

    model_config = {"case_sensitive": True}

settings = Settings()
