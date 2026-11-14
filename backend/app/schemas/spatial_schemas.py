"""
GeoAgri Intelligence - Pydantic Request & Response Schemas
Provides strict validation, pagination, GeoJSON serialization, and analytical schemas.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union
from datetime import date, datetime

# Generic GeoJSON feature schemas
class GeoJSONGeometry(BaseModel):
    type: str
    coordinates: Any

class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    id: Optional[Union[int, str]] = None
    properties: Dict[str, Any]
    geometry: GeoJSONGeometry

class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]

# Pagination Schema
class PaginatedResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[Any]

# District Schemas
class DistrictBase(BaseModel):
    district_name: str
    state_name: str

class DistrictOut(DistrictBase):
    id: int
    area_sq_km: Optional[float] = None
    class Config:
        from_attributes = True

# Village Schemas
class VillageBase(BaseModel):
    village_name: str
    district_id: int

class VillageOut(VillageBase):
    id: int
    total_fields: Optional[int] = None
    total_crop_ha: Optional[float] = None
    avg_ndvi: Optional[float] = None
    class Config:
        from_attributes = True

# Field Schemas
class FieldBase(BaseModel):
    field_name: str
    village_id: int
    area_hectares: float

class FieldOut(FieldBase):
    id: int
    latest_ndvi: Optional[float] = None
    latest_ndwi: Optional[float] = None
    health_status: Optional[str] = None
    nearest_water_distance_m: Optional[float] = None
    class Config:
        from_attributes = True

# Soil Schemas
class SoilDataOut(BaseModel):
    id: int
    location: Optional[str] = None
    soil_type: str
    ph: Optional[float] = None
    nitrogen: Optional[float] = None
    phosphorus: Optional[float] = None
    potassium: Optional[float] = None
    organic_carbon: Optional[float] = None
    sampled_date: Optional[date] = None
    class Config:
        from_attributes = True

# Weather Schemas
class WeatherDataOut(BaseModel):
    id: int
    observation_date: date
    temperature: Optional[float] = None
    rainfall: Optional[float] = None
    humidity: Optional[float] = None
    class Config:
        from_attributes = True

# Satellite Observation Schemas
class SatelliteObservationOut(BaseModel):
    id: int
    observation_date: date
    satellite_name: str
    cloud_percentage: Optional[float] = None
    acquisition_metadata: Optional[Dict[str, Any]] = None
    class Config:
        from_attributes = True

# Vegetation Index Schemas
class VegetationIndexOut(BaseModel):
    id: int
    field_id: int
    observation_id: int
    ndvi: Optional[float] = None
    ndwi: Optional[float] = None
    analysis_date: datetime
    class Config:
        from_attributes = True

# Water Source Schemas
class WaterSourceOut(BaseModel):
    id: int
    source_name: str
    source_type: str
    class Config:
        from_attributes = True

# Risk Zone Schemas
class RiskZoneOut(BaseModel):
    id: int
    risk_type: str
    risk_level: str
    confidence_score: Optional[float] = None
    analysis_date: date
    class Config:
        from_attributes = True

# Land Use Schemas
class LandUseOut(BaseModel):
    id: int
    classification_type: str
    confidence_score: Optional[float] = None
    analysis_date: date
    area_hectares: Optional[float] = None
    class Config:
        from_attributes = True

# Overview Dashboard Stats Schema
class OverviewStats(BaseModel):
    total_area_analyzed_sq_km: float
    total_agricultural_area_ha: float
    average_ndvi: float
    analyzed_fields_count: int
    satellite_observations_count: int
    active_risk_zones_count: int
    latest_analysis_date: str

# ML Prediction Inputs
class CropHealthInferenceInput(BaseModel):
    ndvi: float = Field(..., ge=-1.0, le=1.0)
    ndwi: float = Field(..., ge=-1.0, le=1.0)
    ndvi_change: float = Field(default=0.0)
    soil_ph: float = Field(default=7.8, ge=0.0, le=14.0)
    soil_nitrogen: float = Field(default=190.0, ge=0.0)
    organic_carbon: float = Field(default=0.60, ge=0.0)
    temperature: float = Field(default=30.0)
    rainfall: float = Field(default=15.0, ge=0.0)

class DroughtRiskInferenceInput(BaseModel):
    vci: float = Field(..., ge=0.0, le=100.0)
    tci: float = Field(..., ge=0.0, le=100.0)
    rainfall_ratio: float = Field(..., ge=0.0)
    soil_moisture_est: float = Field(..., ge=0.0, le=1.0)

class AnomalyInferenceInput(BaseModel):
    current_ndvi: float = Field(..., ge=-1.0, le=1.0)
    previous_ndvi: float = Field(..., ge=-1.0, le=1.0)
    current_ndwi: float = Field(..., ge=-1.0, le=1.0)

class LandUseInferenceInput(BaseModel):
    b03_green: float = Field(..., ge=0.0)
    b04_red: float = Field(..., ge=0.0)
    b08_nir: float = Field(..., ge=0.0)
    b11_swir: float = Field(..., ge=0.0)
