export interface OverviewData {
  total_area_analyzed_sq_km: number;
  total_agricultural_area_ha: number;
  average_ndvi: number;
  analyzed_fields_count: number;
  satellite_observations_count: number;
  potential_risk_zones: number;
  latest_analysis_date: string;
}

export interface District {
  id: number;
  district_name: string;
  state_name: string;
  area_sq_km: number;
  village_count: number;
}

export interface Village {
  id: number;
  village_name: string;
  district_id: number;
  district_name: string;
  area_sq_km: number;
  field_count: number;
  agricultural_hectares: number;
  avg_ndvi?: number;
}

export interface FieldItem {
  id: number;
  field_name: string;
  village_id: number;
  village_name: string;
  area_hectares: number;
  latest_ndvi?: number;
  latest_ndwi?: number;
  latest_analysis_date?: string;
  health_status: string;
  nearest_water_source?: string;
  nearest_water_type?: string;
  nearest_water_distance_m?: number;
}

export interface SoilStation {
  id: number;
  location: string;
  soil_type: string;
  ph: number;
  nitrogen_kgha: number;
  phosphorus_kgha: number;
  potassium_kgha: number;
  organic_carbon_pct: number;
  sampled_date: string;
}

export interface WeatherStation {
  id: number;
  observation_date: string;
  temperature_c: number;
  rainfall_mm: number;
  humidity_pct: number;
}

export interface SatelliteObservation {
  id: number;
  observation_date: string;
  satellite_name: string;
  cloud_percentage: number;
  metadata: any;
  footprint: any;
}

export interface RasterLayer {
  layer_type: "NDVI" | "NDWI";
  scene_id: string;
  date: string;
  overlay_url: string;
  geotiff_url: string;
  bounds: [[number, number], [number, number]];
}

export interface RiskIntersection {
  field_id: number;
  field_name: string;
  village_name: string;
  risk_type: string;
  risk_level: string;
  confidence_score: number;
  total_field_ha: number;
  affected_area_ha: number;
  percent_risk_exposure: number;
}

export interface BufferResult {
  field_id: number;
  field_name: string;
  village_name: string;
  area_hectares: number;
  water_source_id: number;
  water_source_name: string;
  water_source_type: string;
  distance_meters: number;
}
