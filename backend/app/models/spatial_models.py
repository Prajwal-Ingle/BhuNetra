"""
GeoAgri Intelligence - SQLAlchemy & GeoAlchemy2 Database Models
Maps the 10 core relational and spatial tables with geometry columns.
"""

from sqlalchemy import Column, Integer, String, Numeric, Date, DateTime, ForeignKey, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from backend.app.database.session import Base

class District(Base):
    __tablename__ = "districts"

    id = Column(Integer, primary_key=True, index=True)
    district_name = Column(String(100), nullable=False)
    state_name = Column(String(100), nullable=False)
    geometry = Column(Geometry(geometry_type="MULTIPOLYGON", srid=4326), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))

    villages = relationship("Village", back_populates="district", cascade="all, delete-orphan")

class Village(Base):
    __tablename__ = "villages"

    id = Column(Integer, primary_key=True, index=True)
    village_name = Column(String(150), nullable=False)
    district_id = Column(Integer, ForeignKey("districts.id", ondelete="CASCADE"), nullable=False)
    geometry = Column(Geometry(geometry_type="MULTIPOLYGON", srid=4326), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))

    district = relationship("District", back_populates="villages")
    fields = relationship("AgriculturalField", back_populates="village", cascade="all, delete-orphan")

class AgriculturalField(Base):
    __tablename__ = "agricultural_fields"

    id = Column(Integer, primary_key=True, index=True)
    field_name = Column(String(150), nullable=False)
    village_id = Column(Integer, ForeignKey("villages.id", ondelete="CASCADE"), nullable=False)
    area_hectares = Column(Numeric(10, 2), nullable=False)
    geometry = Column(Geometry(geometry_type="POLYGON", srid=4326), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))

    village = relationship("Village", back_populates="fields")
    vegetation_indices = relationship("VegetationIndex", back_populates="field", cascade="all, delete-orphan")

class SoilData(Base):
    __tablename__ = "soil_data"

    id = Column(Integer, primary_key=True, index=True)
    location = Column(String(200))
    soil_type = Column(String(100), nullable=False)
    ph = Column(Numeric(4, 2))
    nitrogen = Column(Numeric(8, 2))
    phosphorus = Column(Numeric(8, 2))
    potassium = Column(Numeric(8, 2))
    organic_carbon = Column(Numeric(5, 2))
    geometry = Column(Geometry(geometry_type="POINT", srid=4326), nullable=False)
    sampled_date = Column(Date, server_default=text("CURRENT_DATE"))

class SatelliteObservation(Base):
    __tablename__ = "satellite_observations"

    id = Column(Integer, primary_key=True, index=True)
    observation_date = Column(Date, nullable=False)
    satellite_name = Column(String(100), nullable=False)
    cloud_percentage = Column(Numeric(5, 2))
    acquisition_metadata = Column(JSONB, server_default=text("'{}'::jsonb"))
    footprint = Column(Geometry(geometry_type="POLYGON", srid=4326), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))

    vegetation_indices = relationship("VegetationIndex", back_populates="observation", cascade="all, delete-orphan")

class VegetationIndex(Base):
    __tablename__ = "vegetation_indices"

    id = Column(Integer, primary_key=True, index=True)
    field_id = Column(Integer, ForeignKey("agricultural_fields.id", ondelete="CASCADE"), nullable=False)
    observation_id = Column(Integer, ForeignKey("satellite_observations.id", ondelete="CASCADE"), nullable=False)
    ndvi = Column(Numeric(5, 4))
    ndwi = Column(Numeric(5, 4))
    analysis_date = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))

    field = relationship("AgriculturalField", back_populates="vegetation_indices")
    observation = relationship("SatelliteObservation", back_populates="vegetation_indices")

class WeatherData(Base):
    __tablename__ = "weather_data"

    id = Column(Integer, primary_key=True, index=True)
    observation_date = Column(Date, nullable=False)
    temperature = Column(Numeric(5, 2))
    rainfall = Column(Numeric(6, 2))
    humidity = Column(Numeric(5, 2))
    geometry = Column(Geometry(geometry_type="POINT", srid=4326), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))

class WaterSource(Base):
    __tablename__ = "water_sources"

    id = Column(Integer, primary_key=True, index=True)
    source_name = Column(String(150), nullable=False)
    source_type = Column(String(80), nullable=False)
    geometry = Column(Geometry(geometry_type="GEOMETRY", srid=4326), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))

class RiskZone(Base):
    __tablename__ = "risk_zones"

    id = Column(Integer, primary_key=True, index=True)
    risk_type = Column(String(100), nullable=False)
    risk_level = Column(String(50), nullable=False)
    confidence_score = Column(Numeric(5, 4))
    analysis_date = Column(Date, nullable=False)
    geometry = Column(Geometry(geometry_type="MULTIPOLYGON", srid=4326), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))

class LandUseClassification(Base):
    __tablename__ = "land_use_classification"

    id = Column(Integer, primary_key=True, index=True)
    classification_type = Column(String(100), nullable=False)
    confidence_score = Column(Numeric(5, 4))
    analysis_date = Column(Date, nullable=False)
    geometry = Column(Geometry(geometry_type="MULTIPOLYGON", srid=4326), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))
