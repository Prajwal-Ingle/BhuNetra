-- GeoAgri Intelligence - Spatial & Relational Index Definitions
-- Target: PostgreSQL 14+ with PostGIS 3.6+

-- ============================================================================
-- 1. GiST SPATIAL INDEXES (Bounding Box R-Tree indexing for 2D geometry)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_districts_geom
    ON districts USING GIST (geometry);

CREATE INDEX IF NOT EXISTS idx_villages_geom
    ON villages USING GIST (geometry);

CREATE INDEX IF NOT EXISTS idx_fields_geom
    ON agricultural_fields USING GIST (geometry);

CREATE INDEX IF NOT EXISTS idx_soil_geom
    ON soil_data USING GIST (geometry);

CREATE INDEX IF NOT EXISTS idx_satellite_obs_footprint
    ON satellite_observations USING GIST (footprint);

CREATE INDEX IF NOT EXISTS idx_weather_geom
    ON weather_data USING GIST (geometry);

CREATE INDEX IF NOT EXISTS idx_water_sources_geom
    ON water_sources USING GIST (geometry);

CREATE INDEX IF NOT EXISTS idx_risk_zones_geom
    ON risk_zones USING GIST (geometry);

CREATE INDEX IF NOT EXISTS idx_land_use_geom
    ON land_use_classification USING GIST (geometry);

-- ============================================================================
-- 2. B-TREE RELATIONAL INDEXES (Foreign Keys, Date Filters, Types)
-- ============================================================================

-- Foreign Keys
CREATE INDEX IF NOT EXISTS idx_villages_district_id
    ON villages (district_id);

CREATE INDEX IF NOT EXISTS idx_fields_village_id
    ON agricultural_fields (village_id);

CREATE INDEX IF NOT EXISTS idx_veg_indices_field_id
    ON vegetation_indices (field_id);

CREATE INDEX IF NOT EXISTS idx_veg_indices_obs_id
    ON vegetation_indices (observation_id);

-- Date and Time Series Indexes
CREATE INDEX IF NOT EXISTS idx_satellite_obs_date
    ON satellite_observations (observation_date DESC);

CREATE INDEX IF NOT EXISTS idx_weather_obs_date
    ON weather_data (observation_date DESC);

CREATE INDEX IF NOT EXISTS idx_veg_indices_date
    ON vegetation_indices (analysis_date DESC);

CREATE INDEX IF NOT EXISTS idx_risk_zones_date
    ON risk_zones (analysis_date DESC);

CREATE INDEX IF NOT EXISTS idx_land_use_date
    ON land_use_classification (analysis_date DESC);

-- Attribute Classification & Filtering
CREATE INDEX IF NOT EXISTS idx_districts_name
    ON districts (district_name);

CREATE INDEX IF NOT EXISTS idx_villages_name
    ON villages (village_name);

CREATE INDEX IF NOT EXISTS idx_soil_type
    ON soil_data (soil_type);

CREATE INDEX IF NOT EXISTS idx_water_type
    ON water_sources (source_type);

CREATE INDEX IF NOT EXISTS idx_risk_type_level
    ON risk_zones (risk_type, risk_level);

CREATE INDEX IF NOT EXISTS idx_land_use_type
    ON land_use_classification (classification_type);
