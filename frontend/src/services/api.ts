import axios from 'axios';
import { OverviewData, District, Village, FieldItem, RasterLayer, RiskIntersection, BufferResult } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

export const getHealth = async () => (await api.get('/health/')).data;
export const getOverview = async (): Promise<OverviewData> => (await api.get('/analysis/overview')).data;
export const getHistoricalComparison = async () => (await api.get('/analysis/historical-comparison')).data;
export const getHotspots = async () => (await api.get('/analysis/hotspots')).data;

export const getDistricts = async (): Promise<District[]> => (await api.get('/districts/')).data;
export const getDistrictsGeoJSON = async () => (await api.get('/districts/geojson')).data;

export const getVillages = async (districtId?: number): Promise<Village[]> => 
  (await api.get('/villages/', { params: { district_id: districtId } })).data;
export const getVillagesGeoJSON = async (districtId?: number) => 
  (await api.get('/villages/geojson', { params: { district_id: districtId } })).data;

export const getFields = async (page = 1, pageSize = 25, villageId?: number) => 
  (await api.get('/fields/', { params: { page, page_size: pageSize, village_id: villageId } })).data;
export const getFieldsGeoJSON = async (villageId?: number) => 
  (await api.get('/fields/geojson', { params: { village_id: villageId } })).data;
export const getFieldDetail = async (fieldId: number) => (await api.get(`/fields/${fieldId}`)).data;

export const getAllSpatialLayers = async () => (await api.get('/spatial/all-layers')).data;
export const getBufferAnalysis = async (bufferMeters = 2000): Promise<{ buffer_radius_meters: number; matching_fields_count: number; results: BufferResult[] }> => 
  (await api.get('/spatial/buffer-analysis', { params: { buffer_meters: bufferMeters } })).data;
export const getRiskIntersections = async (): Promise<RiskIntersection[]> => (await api.get('/spatial/risk-intersections')).data;

export const getSatelliteObservations = async () => (await api.get('/satellite/observations')).data;
export const getSatelliteCatalog = async () => (await api.get('/satellite/catalog')).data;
export const getRasterLayers = async (): Promise<RasterLayer[]> => (await api.get('/satellite/layers')).data;

export const getVegetationSummary = async () => (await api.get('/vegetation/summary')).data;
export const getVegetationTrends = async () => (await api.get('/vegetation/trends')).data;

export const getSoilData = async () => (await api.get('/soil/')).data;
export const getSoilStats = async () => (await api.get('/soil/stats')).data;

export const getWeatherData = async () => (await api.get('/weather/')).data;
export const getLatestWeather = async () => (await api.get('/weather/latest')).data;

export const predictCropHealth = async (payload: any) => (await api.post('/ml/predict-crop-health', payload)).data;
export const detectAnomalies = async (payload: any) => (await api.post('/ml/detect-anomalies', payload)).data;
export const evaluateDroughtRisk = async (payload: any) => (await api.post('/ml/drought-risk', payload)).data;
export const classifyLandUse = async (payload: any) => (await api.post('/ml/classify-landuse', payload)).data;
export const getModelsMetadata = async () => (await api.get('/ml/models-metadata')).data;

export const generatePdfReport = async (regionName: string) => 
  (await api.post('/reports/generate-pdf', null, { params: { region_name: regionName } })).data;
export const listPdfReports = async () => (await api.get('/reports/list')).data;

export default api;
