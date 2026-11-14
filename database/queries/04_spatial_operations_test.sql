-- GeoAgri Intelligence - Spatial SQL Operations Verification Suite
-- Validates that PostGIS spatial functions operate with geographic (EPSG:4326)
-- and projected (EPSG:32644 - UTM Zone 44N) data.

\echo '========================================================================'
\echo 'TEST 1: ST_IsValid & ST_MakeValid (Geometry Validity Check)'
\echo '========================================================================'
SELECT 
    'Districts' AS layer,
    COUNT(*) AS total_features,
    COUNT(*) FILTER (WHERE ST_IsValid(geometry)) AS valid_geometries,
    COUNT(*) FILTER (WHERE NOT ST_IsValid(geometry)) AS invalid_geometries
FROM districts
UNION ALL
SELECT 
    'Agricultural Fields',
    COUNT(*),
    COUNT(*) FILTER (WHERE ST_IsValid(geometry)),
    COUNT(*) FILTER (WHERE NOT ST_IsValid(geometry))
FROM agricultural_fields
UNION ALL
SELECT 
    'Water Sources',
    COUNT(*),
    COUNT(*) FILTER (WHERE ST_IsValid(geometry)),
    COUNT(*) FILTER (WHERE NOT ST_IsValid(geometry))
FROM water_sources;

-- Demonstrate ST_MakeValid repairing a self-intersecting polygon (bowtie)
SELECT 
    ST_IsValid(invalid_geom) AS before_repair_is_valid,
    ST_IsValid(ST_MakeValid(invalid_geom)) AS after_repair_is_valid,
    ST_GeometryType(ST_MakeValid(invalid_geom)) AS repaired_geometry_type
FROM (
    SELECT ST_GeomFromText('POLYGON((0 0, 0 2, 2 0, 2 2, 0 0))', 4326) AS invalid_geom
) AS test_case;

\echo '========================================================================'
\echo 'TEST 2: ST_Transform & ST_Area (Projected Area vs Geodesic Hectares)'
\echo '========================================================================'
SELECT 
    af.id,
    af.field_name,
    v.village_name,
    af.area_hectares AS recorded_ha,
    -- Calculate precise area by transforming WGS84 to UTM Zone 44N (meters)
    ROUND((ST_Area(ST_Transform(af.geometry, 32644)) / 10000.0)::numeric, 2) AS utm_calculated_ha,
    -- Calculate area using PostGIS native geography type
    ROUND((ST_Area(af.geometry::geography) / 10000.0)::numeric, 2) AS geodesic_calculated_ha
FROM agricultural_fields af
JOIN villages v ON af.village_id = v.id
ORDER BY af.id;

\echo '========================================================================'
\echo 'TEST 3: ST_Contains & ST_Within (Spatial Hierarchy Validation)'
\echo '========================================================================'
-- Test if all agricultural fields are ST_Within their parent village, and if district ST_Contains villages
SELECT 
    d.district_name,
    v.village_name,
    COUNT(af.id) AS field_count,
    BOOL_AND(ST_Within(af.geometry, v.geometry)) AS all_fields_within_village,
    BOOL_AND(ST_Contains(d.geometry, v.geometry)) AS district_contains_village
FROM districts d
JOIN villages v ON v.district_id = d.id
LEFT JOIN agricultural_fields af ON af.village_id = v.id
GROUP BY d.district_name, v.village_name;

\echo '========================================================================'
\echo 'TEST 4: ST_Distance & ST_Transform (Meters to Nearest Water Source)'
\echo '========================================================================'
SELECT 
    af.field_name,
    ws.source_name,
    ws.source_type,
    ROUND(ST_Distance(
        ST_Transform(af.geometry, 32644),
        ST_Transform(ws.geometry, 32644)
    )::numeric, 1) AS distance_meters
FROM agricultural_fields af
CROSS JOIN LATERAL (
    SELECT source_name, source_type, geometry
    FROM water_sources
    ORDER BY ST_Distance(
        ST_Transform(af.geometry, 32644),
        ST_Transform(geometry, 32644)
    ) ASC
    LIMIT 1
) ws
ORDER BY af.id;

\echo '========================================================================'
\echo 'TEST 5: ST_Buffer & ST_DWithin (1,500m Water Proximity Buffer Analysis)'
\echo '========================================================================'
-- Find fields that fall within 2,500 meters of any water source using ST_DWithin
SELECT 
    af.field_name,
    ws.source_name,
    ws.source_type,
    ROUND((ST_Distance(af.geometry::geography, ws.geometry::geography))::numeric, 1) AS distance_meters
FROM agricultural_fields af
JOIN water_sources ws ON ST_DWithin(af.geometry::geography, ws.geometry::geography, 2500)
ORDER BY distance_meters ASC;

\echo '========================================================================'
\echo 'TEST 6: ST_Intersects & ST_Intersection (Risk Zone Overlap Calculation)'
\echo '========================================================================'
-- Delineate exact area of crop parcels intersecting agricultural drought risk zones
SELECT 
    af.field_name,
    rz.risk_type,
    rz.risk_level,
    ROUND((ST_Area(ST_Transform(af.geometry, 32644)) / 10000.0)::numeric, 2) AS total_field_ha,
    ROUND((ST_Area(ST_Transform(ST_Intersection(af.geometry, rz.geometry), 32644)) / 10000.0)::numeric, 2) AS affected_area_ha,
    ROUND(
        (ST_Area(ST_Transform(ST_Intersection(af.geometry, rz.geometry), 32644)) / 
         ST_Area(ST_Transform(af.geometry, 32644)) * 100.0)::numeric, 1
    ) AS percent_risk_exposure
FROM agricultural_fields af
JOIN risk_zones rz ON ST_Intersects(af.geometry, rz.geometry);

\echo '========================================================================'
\echo 'TEST 7: ST_Union (Contiguous Village Aggregation into Taluka Clusters)'
\echo '========================================================================'
SELECT 
    d.district_name,
    COUNT(v.id) AS village_count,
    ST_GeometryType(ST_Union(v.geometry)) AS aggregated_geometry_type,
    ROUND((ST_Area(ST_Transform(ST_Union(v.geometry), 32644)) / 1000000.0)::numeric, 2) AS total_clustered_sq_km
FROM districts d
JOIN villages v ON v.district_id = d.id
GROUP BY d.district_name;

\echo '========================================================================'
\echo 'TEST 8: Integrated Agri-GIS Analytical Summary'
\echo '========================================================================'
SELECT 
    v.village_name,
    COUNT(DISTINCT af.id) AS total_fields,
    ROUND(SUM(af.area_hectares)::numeric, 2) AS total_crop_ha,
    ROUND(AVG(vi.ndvi)::numeric, 3) AS avg_field_ndvi,
    ROUND(AVG(vi.ndwi)::numeric, 3) AS avg_field_ndwi,
    ROUND(AVG(sd.ph)::numeric, 2) AS avg_soil_ph,
    ROUND(AVG(sd.nitrogen)::numeric, 1) AS avg_soil_nitrogen_kgha
FROM villages v
LEFT JOIN agricultural_fields af ON af.village_id = v.id
LEFT JOIN vegetation_indices vi ON vi.field_id = af.id AND vi.observation_id = 1
LEFT JOIN LATERAL (
    SELECT ph, nitrogen
    FROM soil_data sd
    ORDER BY ST_Distance(af.geometry::geography, sd.geometry::geography) ASC
    LIMIT 1
) sd ON true
GROUP BY v.village_name
ORDER BY v.village_name;
