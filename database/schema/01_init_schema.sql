-- GeoAgri Intelligence - Spatial Database Initialization Schema
-- Target: PostgreSQL 14+ with PostGIS 3.6+
-- Primary SRID: 4326 (WGS 84 geographic coordinates)
-- Projected calculations: SRID 32644 (WGS 84 / UTM zone 44N - Central India / Nagpur)

-- Enable PostGIS extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_raster;

-- Clean drop for idempotence during setup (drop dependent tables first)
DROP TABLE IF EXISTS vegetation_indices CASCADE;
DROP TABLE IF EXISTS land_use_classification CASCADE;
DROP TABLE IF EXISTS risk_zones CASCADE;
DROP TABLE IF EXISTS water_sources CASCADE;
DROP TABLE IF EXISTS weather_data CASCADE;
DROP TABLE IF EXISTS satellite_observations CASCADE;
DROP TABLE IF EXISTS soil_data CASCADE;
DROP TABLE IF EXISTS agricultural_fields CASCADE;
DROP TABLE IF EXISTS villages CASCADE;
DROP TABLE IF EXISTS districts CASCADE;

-- 1. Districts table
CREATE TABLE districts (
    id SERIAL PRIMARY KEY,
    district_name VARCHAR(100) NOT NULL,
    state_name VARCHAR(100) NOT NULL,
    geometry GEOMETRY(MultiPolygon, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_district_state UNIQUE (district_name, state_name),
    CONSTRAINT chk_districts_geom_valid CHECK (ST_IsValid(geometry))
);

COMMENT ON TABLE districts IS 'Administrative district boundaries with WGS84 multi-polygon geometries.';

-- 2. Villages table
CREATE TABLE villages (
    id SERIAL PRIMARY KEY,
    village_name VARCHAR(150) NOT NULL,
    district_id INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    geometry GEOMETRY(MultiPolygon, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_villages_geom_valid CHECK (ST_IsValid(geometry))
);

COMMENT ON TABLE villages IS 'Village administrative boundaries linked to parent district.';

-- 3. Agricultural Fields table
CREATE TABLE agricultural_fields (
    id SERIAL PRIMARY KEY,
    field_name VARCHAR(150) NOT NULL,
    village_id INTEGER NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
    area_hectares NUMERIC(10, 2) NOT NULL CHECK (area_hectares > 0),
    geometry GEOMETRY(Polygon, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_fields_geom_valid CHECK (ST_IsValid(geometry))
);

COMMENT ON TABLE agricultural_fields IS 'Individual cadastral/agricultural field parcels with calculated hectares.';

-- 4. Soil Data table
CREATE TABLE soil_data (
    id SERIAL PRIMARY KEY,
    location VARCHAR(200),
    soil_type VARCHAR(100) NOT NULL,
    ph NUMERIC(4, 2) CHECK (ph >= 0.0 AND ph <= 14.0),
    nitrogen NUMERIC(8, 2) CHECK (nitrogen >= 0),            -- kg/ha
    phosphorus NUMERIC(8, 2) CHECK (phosphorus >= 0),        -- kg/ha
    potassium NUMERIC(8, 2) CHECK (potassium >= 0),          -- kg/ha
    organic_carbon NUMERIC(5, 2) CHECK (organic_carbon >= 0), -- %
    geometry GEOMETRY(Point, 4326) NOT NULL,
    sampled_date DATE DEFAULT CURRENT_DATE,
    CONSTRAINT chk_soil_geom_valid CHECK (ST_IsValid(geometry))
);

COMMENT ON TABLE soil_data IS 'Soil testing laboratory measurements and nutrient profiles at spatial sample points.';

-- 5. Satellite Observations table
CREATE TABLE satellite_observations (
    id SERIAL PRIMARY KEY,
    observation_date DATE NOT NULL,
    satellite_name VARCHAR(100) NOT NULL,                    -- e.g. Sentinel-2A, Sentinel-2B
    cloud_percentage NUMERIC(5, 2) CHECK (cloud_percentage >= 0.0 AND cloud_percentage <= 100.0),
    acquisition_metadata JSONB DEFAULT '{}'::jsonb,
    footprint GEOMETRY(Polygon, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_sat_footprint_valid CHECK (ST_IsValid(footprint))
);

COMMENT ON TABLE satellite_observations IS 'Catalog of satellite scene footprints and acquisition metadata.';

-- 6. Vegetation Indices table
CREATE TABLE vegetation_indices (
    id SERIAL PRIMARY KEY,
    field_id INTEGER NOT NULL REFERENCES agricultural_fields(id) ON DELETE CASCADE,
    observation_id INTEGER NOT NULL REFERENCES satellite_observations(id) ON DELETE CASCADE,
    ndvi NUMERIC(5, 4) CHECK (ndvi >= -1.0 AND ndvi <= 1.0),
    ndwi NUMERIC(5, 4) CHECK (ndwi >= -1.0 AND ndwi <= 1.0),
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_field_observation UNIQUE (field_id, observation_id)
);

COMMENT ON TABLE vegetation_indices IS 'Time-series remote sensing vegetation and water indices per agricultural field.';

-- 7. Weather Data table
CREATE TABLE weather_data (
    id SERIAL PRIMARY KEY,
    observation_date DATE NOT NULL,
    temperature NUMERIC(5, 2),                              -- Celsius
    rainfall NUMERIC(6, 2) CHECK (rainfall >= 0.0),          -- mm
    humidity NUMERIC(5, 2) CHECK (humidity >= 0.0 AND humidity <= 100.0), -- %
    geometry GEOMETRY(Point, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_weather_geom_valid CHECK (ST_IsValid(geometry))
);

COMMENT ON TABLE weather_data IS 'Daily meteorological observations from agro-meteorological stations.';

-- 8. Water Sources table
CREATE TABLE water_sources (
    id SERIAL PRIMARY KEY,
    source_name VARCHAR(150) NOT NULL,
    source_type VARCHAR(80) NOT NULL,                       -- River, Lake, Reservoir, Canal, Farm Pond, Well
    geometry GEOMETRY(Geometry, 4326) NOT NULL,             -- Supports Point, LineString, Polygon
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_water_geom_valid CHECK (ST_IsValid(geometry))
);

COMMENT ON TABLE water_sources IS 'Natural and artificial surface water bodies, canals and rivers.';

-- 9. Risk Zones table
CREATE TABLE risk_zones (
    id SERIAL PRIMARY KEY,
    risk_type VARCHAR(100) NOT NULL,                        -- Drought, Moisture Deficit, Pest Outbreak, Flood
    risk_level VARCHAR(50) NOT NULL,                        -- Low, Moderate, High, Severe
    confidence_score NUMERIC(5, 4) CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    analysis_date DATE NOT NULL,
    geometry GEOMETRY(MultiPolygon, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_risk_geom_valid CHECK (ST_IsValid(geometry))
);

COMMENT ON TABLE risk_zones IS 'Delineated spatial risk zones derived from multi-criteria GIS & ML analysis.';

-- 10. Land Use Classification table
CREATE TABLE land_use_classification (
    id SERIAL PRIMARY KEY,
    classification_type VARCHAR(100) NOT NULL,              -- Cropland, Fallow, Forest, Water Body, Built-up
    confidence_score NUMERIC(5, 4) CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    analysis_date DATE NOT NULL,
    geometry GEOMETRY(MultiPolygon, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_landuse_geom_valid CHECK (ST_IsValid(geometry))
);

COMMENT ON TABLE land_use_classification IS 'Land Use / Land Cover (LULC) spatial classification zones.';
