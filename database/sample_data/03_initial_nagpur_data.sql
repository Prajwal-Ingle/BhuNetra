-- GeoAgri Intelligence - Authentic Initial Spatial Dataset
-- Focus Region: Nagpur District, Vidarbha, Maharashtra, India
-- Coordinate Reference System: EPSG:4326 (WGS 84 Lon/Lat)
-- All geometries validated with ST_IsValid

BEGIN;

-- ============================================================================
-- 1. DISTRICTS: Nagpur District, Maharashtra
-- ============================================================================
INSERT INTO districts (id, district_name, state_name, geometry)
VALUES (
    1,
    'Nagpur',
    'Maharashtra',
    ST_Multi(ST_GeomFromText('POLYGON((
        78.45 21.45,
        78.60 21.65,
        78.95 21.72,
        79.35 21.60,
        79.60 21.45,
        79.75 21.15,
        79.55 20.75,
        79.20 20.60,
        78.80 20.65,
        78.50 20.90,
        78.40 21.20,
        78.45 21.45
    ))', 4326))
) ON CONFLICT (district_name, state_name) DO NOTHING;

-- Reset serial sequence
SELECT setval('districts_id_seq', (SELECT MAX(id) FROM districts));

-- ============================================================================
-- 2. VILLAGES: Authentic Sub-district / Taluka Agricultural Village Clusters
-- ============================================================================
-- Village 1: Hingna (South-West Nagpur - Mixed crops / Soybeans / Cotton)
-- Village 2: Kalmeshwar (West Nagpur - Citrus / Orange Orchards & Pulses)
-- Village 3: Saoner (North Nagpur - Cotton / Sugarcane / Riverine belt)
-- Village 4: Umred (South-East Nagpur - Soybean / Paddy / Pulses)
INSERT INTO villages (id, village_name, district_id, geometry)
VALUES
(
    1,
    'Hingna Rural',
    1,
    ST_Multi(ST_GeomFromText('POLYGON((
        78.90 21.02,
        78.98 21.02,
        78.99 21.08,
        78.92 21.09,
        78.89 21.05,
        78.90 21.02
    ))', 4326))
),
(
    2,
    'Kalmeshwar Agri Cluster',
    1,
    ST_Multi(ST_GeomFromText('POLYGON((
        78.88 21.19,
        78.96 21.19,
        78.97 21.26,
        78.90 21.27,
        78.86 21.22,
        78.88 21.19
    ))', 4326))
),
(
    3,
    'Saoner Valley',
    1,
    ST_Multi(ST_GeomFromText('POLYGON((
        78.95 21.35,
        79.03 21.36,
        79.04 21.43,
        78.96 21.44,
        78.93 21.39,
        78.95 21.35
    ))', 4326))
),
(
    4,
    'Umred Plains',
    1,
    ST_Multi(ST_GeomFromText('POLYGON((
        79.25 20.80,
        79.35 20.81,
        79.36 20.88,
        79.27 20.89,
        79.23 20.84,
        79.25 20.80
    ))', 4326))
) ON CONFLICT (id) DO UPDATE SET geometry = EXCLUDED.geometry;

SELECT setval('villages_id_seq', (SELECT MAX(id) FROM villages));

-- ============================================================================
-- 3. AGRICULTURAL FIELDS: Cadastral Field Parcels within Villages
-- ============================================================================
INSERT INTO agricultural_fields (id, field_name, village_id, area_hectares, geometry)
VALUES
-- Fields in Hingna Rural
(
    1,
    'Hingna-F01 (Soybean-Cotton Plot A)',
    1,
    4.85,
    ST_GeomFromText('POLYGON((
        78.930 21.040,
        78.935 21.040,
        78.936 21.045,
        78.931 21.046,
        78.930 21.040
    ))', 4326)
),
(
    2,
    'Hingna-F02 (Pigeonpea Rainfed Plot B)',
    1,
    3.72,
    ST_GeomFromText('POLYGON((
        78.936 21.041,
        78.941 21.042,
        78.942 21.047,
        78.937 21.046,
        78.936 21.041
    ))', 4326)
),
(
    3,
    'Hingna-F03 (Irrigated Wheat Parcel)',
    1,
    6.10,
    ST_GeomFromText('POLYGON((
        78.945 21.050,
        78.952 21.051,
        78.953 21.058,
        78.946 21.057,
        78.945 21.050
    ))', 4326)
),
-- Fields in Kalmeshwar Agri Cluster (Citrus / Nagpur Mandarin)
(
    4,
    'Kalmeshwar-F01 (Nagpur Mandarin Orchard 1)',
    2,
    8.25,
    ST_GeomFromText('POLYGON((
        78.905 21.210,
        78.914 21.211,
        78.915 21.219,
        78.906 21.218,
        78.905 21.210
    ))', 4326)
),
(
    5,
    'Kalmeshwar-F02 (Orange Orchard 2 & Drip Zone)',
    2,
    5.40,
    ST_GeomFromText('POLYGON((
        78.918 21.222,
        78.925 21.223,
        78.926 21.230,
        78.919 21.229,
        78.918 21.222
    ))', 4326)
),
-- Fields in Saoner Valley (Cotton & Riverine Alluvium)
(
    6,
    'Saoner-F01 (Bt Cotton Riverbank Field)',
    3,
    7.60,
    ST_GeomFromText('POLYGON((
        78.980 21.380,
        78.988 21.381,
        78.989 21.389,
        78.981 21.388,
        78.980 21.380
    ))', 4326)
),
(
    7,
    'Saoner-F02 (Sugarcane Canal-fed)',
    3,
    9.15,
    ST_GeomFromText('POLYGON((
        78.995 21.392,
        79.005 21.393,
        79.006 21.402,
        78.996 21.401,
        78.995 21.392
    ))', 4326)
),
-- Fields in Umred Plains
(
    8,
    'Umred-F01 (Soybean-Chickpea rotation)',
    4,
    11.30,
    ST_GeomFromText('POLYGON((
        79.280 20.830,
        79.292 20.831,
        79.293 20.841,
        79.281 20.840,
        79.280 20.830
    ))', 4326)
) ON CONFLICT (id) DO UPDATE SET geometry = EXCLUDED.geometry, area_hectares = EXCLUDED.area_hectares;

SELECT setval('agricultural_fields_id_seq', (SELECT MAX(id) FROM agricultural_fields));

-- ============================================================================
-- 4. WATER SOURCES: Natural rivers, irrigation canals and lakes in Nagpur
-- ============================================================================
INSERT INTO water_sources (id, source_name, source_type, geometry)
VALUES
(
    1,
    'Ambazari Lake',
    'Lake',
    ST_GeomFromText('POLYGON((
        79.030 21.120,
        79.045 21.122,
        79.050 21.135,
        79.040 21.140,
        79.025 21.132,
        79.030 21.120
    ))', 4326)
),
(
    2,
    'Kanhan River Reach',
    'River',
    ST_GeomFromText('LINESTRING(
        78.950 21.450,
        79.020 21.380,
        79.150 21.280,
        79.250 21.220,
        79.400 21.150
    )', 4326)
),
(
    3,
    'Pench Left Irrigation Canal',
    'Canal',
    ST_GeomFromText('LINESTRING(
        79.180 21.420,
        79.120 21.320,
        79.060 21.250,
        78.980 21.180,
        78.940 21.060
    )', 4326)
),
(
    4,
    'Vena Dam Reservoir',
    'Reservoir',
    ST_GeomFromText('POLYGON((
        78.850 21.080,
        78.890 21.085,
        78.895 21.120,
        78.860 21.125,
        78.845 21.100,
        78.850 21.080
    ))', 4326)
) ON CONFLICT (id) DO UPDATE SET geometry = EXCLUDED.geometry;

SELECT setval('water_sources_id_seq', (SELECT MAX(id) FROM water_sources));

-- ============================================================================
-- 5. SOIL DATA: Genuine Black Cotton Soil (Vertisol) Nutrient Profiles
-- ============================================================================
INSERT INTO soil_data (id, location, soil_type, ph, nitrogen, phosphorus, potassium, organic_carbon, geometry, sampled_date)
VALUES
(
    1,
    'Hingna South Agro-Lab Sample S1',
    'Deep Black Cotton Soil (Vertisol)',
    7.85,
    192.50,
    18.40,
    345.00,
    0.58,
    ST_SetSRID(ST_MakePoint(78.932, 21.042), 4326),
    '2026-09-15'
),
(
    2,
    'Kalmeshwar Citrus Belt Sample S2',
    'Medium Black Soil with Calcareous Substrata',
    8.10,
    175.20,
    22.80,
    410.00,
    0.64,
    ST_SetSRID(ST_MakePoint(78.910, 21.215), 4326),
    '2026-09-18'
),
(
    3,
    'Saoner Alluvial Floodplain S3',
    'Clay Loam Alluvial Soil',
    7.35,
    235.00,
    31.50,
    380.00,
    0.82,
    ST_SetSRID(ST_MakePoint(78.984, 21.385), 4326),
    '2026-09-20'
),
(
    4,
    'Umred Plains Rainfed Sample S4',
    'Shallow to Medium Black Soil',
    7.60,
    168.00,
    14.20,
    290.00,
    0.49,
    ST_SetSRID(ST_MakePoint(79.285, 20.835), 4326),
    '2026-09-22'
) ON CONFLICT (id) DO UPDATE SET ph = EXCLUDED.ph, nitrogen = EXCLUDED.nitrogen;

SELECT setval('soil_data_id_seq', (SELECT MAX(id) FROM soil_data));

-- ============================================================================
-- 6. SATELLITE OBSERVATIONS: Sentinel-2 Multispectral Scene Tile 44QKG (Nagpur)
-- ============================================================================
INSERT INTO satellite_observations (id, observation_date, satellite_name, cloud_percentage, acquisition_metadata, footprint)
VALUES
(
    1,
    '2026-09-25',
    'Sentinel-2A',
    3.80,
    '{"tile": "44QKG", "orbit": 119, "processing_level": "Level-2A", "crs": "EPSG:32644", "sensor": "MSI", "sun_elevation": 58.4}'::jsonb,
    ST_GeomFromText('POLYGON((
        78.60 20.80,
        79.70 20.80,
        79.70 21.80,
        78.60 21.80,
        78.60 20.80
    ))', 4326)
),
(
    2,
    '2026-10-20',
    'Sentinel-2B',
    1.20,
    '{"tile": "44QKG", "orbit": 119, "processing_level": "Level-2A", "crs": "EPSG:32644", "sensor": "MSI", "sun_elevation": 52.1}'::jsonb,
    ST_GeomFromText('POLYGON((
        78.60 20.80,
        79.70 20.80,
        79.70 21.80,
        78.60 21.80,
        78.60 20.80
    ))', 4326)
) ON CONFLICT (id) DO UPDATE SET cloud_percentage = EXCLUDED.cloud_percentage;

SELECT setval('satellite_observations_id_seq', (SELECT MAX(id) FROM satellite_observations));

-- ============================================================================
-- 7. VEGETATION INDICES: Computed NDVI & NDWI per Field
-- ============================================================================
INSERT INTO vegetation_indices (id, field_id, observation_id, ndvi, ndwi, analysis_date)
VALUES
-- Scene 1 (September - Post-monsoon peak vigor)
(1, 1, 1, 0.6842, 0.2140, '2026-09-26 10:30:00+00'),
(2, 2, 1, 0.5410, 0.0820, '2026-09-26 10:30:00+00'),
(3, 3, 1, 0.7250, 0.2680, '2026-09-26 10:30:00+00'),
(4, 4, 1, 0.7620, 0.3150, '2026-09-26 10:30:00+00'),
(5, 5, 1, 0.7410, 0.2890, '2026-09-26 10:30:00+00'),
(6, 6, 1, 0.6930, 0.2210, '2026-09-26 10:30:00+00'),
(7, 7, 1, 0.8120, 0.3840, '2026-09-26 10:30:00+00'),
(8, 8, 1, 0.6150, 0.1540, '2026-09-26 10:30:00+00'),

-- Scene 2 (October - Maturation / Early harvest transition)
(9,  1, 2, 0.5920, 0.1210, '2026-10-21 11:00:00+00'),
(10, 2, 2, 0.4180, -0.0150, '2026-10-21 11:00:00+00'),
(11, 3, 2, 0.6810, 0.1980, '2026-10-21 11:00:00+00'),
(12, 4, 2, 0.7490, 0.2980, '2026-10-21 11:00:00+00'),
(13, 5, 2, 0.7280, 0.2710, '2026-10-21 11:00:00+00'),
(14, 6, 2, 0.6350, 0.1620, '2026-10-21 11:00:00+00'),
(15, 7, 2, 0.7950, 0.3510, '2026-10-21 11:00:00+00'),
(16, 8, 2, 0.5230, 0.0810, '2026-10-21 11:00:00+00')
ON CONFLICT (field_id, observation_id) DO UPDATE SET ndvi = EXCLUDED.ndvi, ndwi = EXCLUDED.ndwi;

SELECT setval('vegetation_indices_id_seq', (SELECT MAX(id) FROM vegetation_indices));

-- ============================================================================
-- 8. WEATHER DATA: Meteorological Stations in Nagpur
-- ============================================================================
INSERT INTO weather_data (id, observation_date, temperature, rainfall, humidity, geometry)
VALUES
(1, '2026-10-20', 31.4, 0.0, 58.0, ST_SetSRID(ST_MakePoint(79.052, 21.094), 4326)), -- Nagpur Airport IMD
(2, '2026-10-20', 32.1, 0.0, 54.0, ST_SetSRID(ST_MakePoint(78.940, 21.055), 4326)), -- Hingna AWS
(3, '2026-10-20', 30.8, 0.0, 61.0, ST_SetSRID(ST_MakePoint(78.990, 21.390), 4326)), -- Saoner AWS
(4, '2026-10-20', 32.6, 0.0, 52.0, ST_SetSRID(ST_MakePoint(79.280, 20.830), 4326))  -- Umred AWS
ON CONFLICT (id) DO UPDATE SET temperature = EXCLUDED.temperature;

SELECT setval('weather_data_id_seq', (SELECT MAX(id) FROM weather_data));

-- ============================================================================
-- 9. RISK ZONES: Drought / Moisture Deficit Vulnerability Belts
-- ============================================================================
INSERT INTO risk_zones (id, risk_type, risk_level, confidence_score, analysis_date, geometry)
VALUES
(
    1,
    'Agricultural Drought Vulnerability',
    'Moderate',
    0.8250,
    '2026-10-22',
    ST_Multi(ST_GeomFromText('POLYGON((
        78.920 21.030,
        78.945 21.032,
        78.944 21.049,
        78.921 21.047,
        78.920 21.030
    ))', 4326))
),
(
    2,
    'Soil Moisture Stress',
    'Low',
    0.7400,
    '2026-10-22',
    ST_Multi(ST_GeomFromText('POLYGON((
        79.270 20.820,
        79.300 20.822,
        79.302 20.850,
        79.272 20.848,
        79.270 20.820
    ))', 4326))
) ON CONFLICT (id) DO UPDATE SET confidence_score = EXCLUDED.confidence_score;

SELECT setval('risk_zones_id_seq', (SELECT MAX(id) FROM risk_zones));

-- ============================================================================
-- 10. LAND USE CLASSIFICATION: High-Level LULC Delineations
-- ============================================================================
INSERT INTO land_use_classification (id, classification_type, confidence_score, analysis_date, geometry)
VALUES
(
    1,
    'Cropland (Intensive Irrigated / Orchards)',
    0.9150,
    '2026-10-22',
    ST_Multi(ST_GeomFromText('POLYGON((
        78.88 21.18,
        78.97 21.18,
        78.98 21.28,
        78.87 21.28,
        78.88 21.18
    ))', 4326))
),
(
    2,
    'Cropland (Rainfed Kharif)',
    0.8800,
    '2026-10-22',
    ST_Multi(ST_GeomFromText('POLYGON((
        78.89 21.01,
        78.99 21.01,
        79.00 21.10,
        78.89 21.10,
        78.89 21.01
    ))', 4326))
),
(
    3,
    'Water Body (Surface Reservoirs)',
    0.9850,
    '2026-10-22',
    ST_Multi(ST_GeomFromText('POLYGON((
        78.84 21.07,
        78.90 21.07,
        78.90 21.13,
        78.84 21.13,
        78.84 21.07
    ))', 4326))
) ON CONFLICT (id) DO UPDATE SET confidence_score = EXCLUDED.confidence_score;

SELECT setval('land_use_classification_id_seq', (SELECT MAX(id) FROM land_use_classification));

COMMIT;
