import React, { useState, useEffect } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  GeoJSON, 
  ImageOverlay, 
  CircleMarker
} from 'react-leaflet';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  X,
  MapPin,
  Droplets,
  Sprout,
  Activity
} from 'lucide-react';
import { getAllSpatialLayers, getRasterLayers } from '../services/api';
import { RasterLayer } from '../types';

export const InteractiveMapPage: React.FC = () => {
  const [layersData, setLayersData] = useState<any>(null);
  const [rasterLayers, setRasterLayers] = useState<RasterLayer[]>([]);
  const [selectedRaster, setSelectedRaster] = useState<string>("none");
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Layer Visibility Toggles
  const [showDistricts, setShowDistricts] = useState(true);
  const [showVillages, setShowVillages] = useState(true);
  const [showFields, setShowFields] = useState(true);
  const [showWater, setShowWater] = useState(true);
  const [showRisk, setShowRisk] = useState(true);
  const [showSoil, setShowSoil] = useState(false);
  const [showWeather, setShowWeather] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [layers, rasters] = await Promise.all([
          getAllSpatialLayers(),
          getRasterLayers()
        ]);
        setLayersData(layers);
        setRasterLayers(rasters);
      } catch (err) {
        console.error("Error loading map layers:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Center on Nagpur, Maharashtra
  const center: [number, number] = [21.1458, 79.0882];

  // Styling functions for GeoJSON layers
  const districtStyle = () => ({
    color: '#0284c7',
    weight: 2,
    opacity: 0.85,
    fillColor: '#0284c7',
    fillOpacity: 0.03,
    dashArray: '3, 4'
  });

  const villageStyle = () => ({
    color: '#6366f1',
    weight: 1.2,
    opacity: 0.7,
    fillColor: '#6366f1',
    fillOpacity: 0.04
  });

  const fieldStyle = (feature: any) => {
    const ndvi = feature?.properties?.latest_ndvi;
    let fill = '#10b981';
    if (ndvi !== null && ndvi !== undefined) {
      if (ndvi >= 0.70) fill = '#059669';
      else if (ndvi >= 0.50) fill = '#10b981';
      else if (ndvi >= 0.35) fill = '#f59e0b';
      else fill = '#ef4444';
    }
    return {
      color: '#047857',
      weight: 1,
      opacity: 0.9,
      fillColor: fill,
      fillOpacity: 0.65
    };
  };

  const waterStyle = () => ({
    color: '#38bdf8',
    weight: 2.2,
    opacity: 0.95,
    fillColor: '#0284c7',
    fillOpacity: 0.4
  });

  const riskStyle = () => ({
    color: '#f59e0b',
    weight: 1.5,
    opacity: 0.85,
    fillColor: '#f59e0b',
    fillOpacity: 0.15,
    dashArray: '4, 4'
  });

  const onEachFeature = (feature: any, layer: any, type: string) => {
    layer.on({
      click: () => {
        setSelectedFeature({ type, properties: feature.properties });
      }
    });
  };

  const activeRaster = rasterLayers.find(r => `${r.layer_type}-${r.date}` === selectedRaster);

  if (loading) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center bg-[#edece8]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-7 h-7 border-2 border-agri-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#6b7280] font-mono">Loading geospatial layers &amp; raster tiles...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] relative overflow-hidden bg-[#edece8]">
      {/* Map Viewport Area */}
      <div className="flex-1 relative h-full">
        <MapContainer 
          center={center} 
          zoom={10} 
          className="h-full w-full"
          zoomControl={true}
        >
          {/* Free OpenStreetMap Base Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {/* Raster Overlay Layer */}
          {activeRaster && (
            <ImageOverlay
              url={activeRaster.overlay_url}
              bounds={activeRaster.bounds}
              opacity={0.8}
            />
          )}

          {/* PostGIS Vector Layers */}
          {layersData && showDistricts && layersData.districts && (
            <GeoJSON 
              data={layersData.districts} 
              style={districtStyle}
              onEachFeature={(feat, layer) => onEachFeature(feat, layer, 'district')} 
            />
          )}

          {layersData && showVillages && layersData.villages && (
            <GeoJSON 
              data={layersData.villages} 
              style={villageStyle}
              onEachFeature={(feat, layer) => onEachFeature(feat, layer, 'village')} 
            />
          )}

          {layersData && showWater && layersData.water_sources && (
            <GeoJSON 
              data={layersData.water_sources} 
              style={waterStyle}
              onEachFeature={(feat, layer) => onEachFeature(feat, layer, 'water')} 
            />
          )}

          {layersData && showRisk && layersData.risk_zones && (
            <GeoJSON 
              data={layersData.risk_zones} 
              style={riskStyle}
              onEachFeature={(feat, layer) => onEachFeature(feat, layer, 'risk')} 
            />
          )}

          {layersData && showFields && layersData.fields && (
            <GeoJSON 
              data={layersData.fields} 
              style={fieldStyle}
              onEachFeature={(feat, layer) => onEachFeature(feat, layer, 'field')} 
            />
          )}

          {/* Soil Testing Points */}
          {layersData && showSoil && layersData.soil_stations?.features?.map((st: any) => (
            <CircleMarker
              key={`soil-${st.id}`}
              center={[st.geometry.coordinates[1], st.geometry.coordinates[0]]}
              radius={5}
              pathOptions={{ color: '#d97706', fillColor: '#f59e0b', fillOpacity: 0.9 }}
              eventHandlers={{ click: () => setSelectedFeature({ type: 'soil', properties: st.properties }) }}
            />
          ))}

          {/* Weather Station Points */}
          {layersData && showWeather && layersData.weather_stations?.features?.map((wt: any) => (
            <CircleMarker
              key={`weather-${wt.id}`}
              center={[wt.geometry.coordinates[1], wt.geometry.coordinates[0]]}
              radius={6}
              pathOptions={{ color: '#0284c7', fillColor: '#38bdf8', fillOpacity: 0.9 }}
              eventHandlers={{ click: () => setSelectedFeature({ type: 'weather', properties: wt.properties }) }}
            />
          ))}
        </MapContainer>

        {/* Scientific Map Legend (Bottom-Left) */}
        <div className="absolute bottom-5 left-5 z-[1000] bg-white border border-[#e2dfd7] rounded-2xl p-3 shadow-md text-xs space-y-2 pointer-events-auto max-w-[240px]">
          <div className="font-semibold text-[#111827] text-[11px] uppercase tracking-wider flex items-center justify-between">
            <span>Map Legend</span>
            <span className="text-[10px] text-[#6b7280] font-mono">EPSG:4326</span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-2.5 rounded bg-agri-500 opacity-90 border border-agri-400"></span>
              <span className="text-[#4b5563]">Optimal Vigor (NDVI &gt; 0.50)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-2.5 rounded bg-amber-500 opacity-90 border border-amber-400"></span>
              <span className="text-[#4b5563]">Moderate (0.35 - 0.50)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-2.5 rounded bg-red-500 opacity-90 border border-red-400"></span>
              <span className="text-[#4b5563]">Stressed / Bare (&lt; 0.35)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-1 bg-hydro-400 rounded"></span>
              <span className="text-[#4b5563]">Rivers &amp; Canals</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-2.5 rounded border border-dashed border-amber-400 bg-amber-500/20"></span>
              <span className="text-[#4b5563]">Drought Vulnerability Zone</span>
            </div>
          </div>
        </div>
      </div>

      {/* Layer Control & Feature Inspector Drawer (Right Side) */}
      <div className="w-80 bg-[#edece8] border-l border-[#e2dfd7] flex flex-col z-[1000] overflow-y-auto">
        {/* Layer Controls Section */}
        <div className="p-4 border-b border-[#e2dfd7] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#111827] flex items-center space-x-2">
              <Layers className="w-3.5 h-3.5 text-agri-400" />
              <span>GIS Layer Controls</span>
            </h2>
            <span className="text-[10px] text-[#6b7280] font-mono">Cadastre</span>
          </div>

          {/* Raster Overlay Selector */}
          <div className="space-y-1">
            <label className="text-[11px] text-[#6b7280] font-medium">Satellite Raster Layer</label>
            <select
              value={selectedRaster}
              onChange={(e) => setSelectedRaster(e.target.value)}
              className="w-full bg-white border border-[#e2dfd7] rounded-md text-xs p-2 text-[#111827] focus:outline-none focus:border-agri-500"
            >
              <option value="none">None (Vector Layers Only)</option>
              {rasterLayers.map((r, i) => (
                <option key={i} value={`${r.layer_type}-${r.date}`}>
                  Sentinel-2 {r.layer_type} ({r.date})
                </option>
              ))}
            </select>
          </div>

          {/* Vector Toggle Buttons */}
          <div className="space-y-1 pt-1">
            {[
              { label: 'Agricultural Fields', state: showFields, set: setShowFields, color: 'bg-agri-500' },
              { label: 'Water Sources & Canals', state: showWater, set: setShowWater, color: 'bg-hydro-400' },
              { label: 'Taluka Boundaries', state: showVillages, set: setShowVillages, color: 'bg-indigo-400' },
              { label: 'Nagpur District Boundary', state: showDistricts, set: setShowDistricts, color: 'bg-blue-400' },
              { label: 'Drought Risk Zones', state: showRisk, set: setShowRisk, color: 'bg-amber-400' },
              { label: 'Soil Testing Stations', state: showSoil, set: setShowSoil, color: 'bg-amber-500' },
              { label: 'Weather Stations', state: showWeather, set: setShowWeather, color: 'bg-sky-400' }
            ].map((t, idx) => (
              <button
                key={idx}
                onClick={() => t.set(!t.state)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition ${
                  t.state ? 'bg-white text-[#111827] hover:bg-[#faf9f6]' : 'bg-[#edece8] text-slate-500 hover:bg-white'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${t.state ? t.color : 'bg-slate-700'}`}></span>
                  <span className={t.state ? 'font-medium' : 'line-through text-slate-500'}>{t.label}</span>
                </span>
                {t.state ? <Eye className="w-3.5 h-3.5 text-[#6b7280]" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Inspector Section */}
        <div className="p-4 flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#111827]">Feature Inspector</h2>
            {selectedFeature && (
              <button 
                onClick={() => setSelectedFeature(null)}
                className="text-[#6b7280] hover:text-[#111827]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {!selectedFeature ? (
            <div className="p-4 text-center text-xs text-[#6b7280] bg-white/60 rounded-md border border-[#e2dfd7]">
              Click any vector parcel, river, boundary, or station to inspect spatial attributes.
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="bg-white p-3 rounded-md border border-[#e2dfd7] space-y-2">
                <div className="flex items-center justify-between border-b border-[#e2dfd7] pb-1.5">
                  <span className="font-semibold text-[#111827]">
                    {selectedFeature.properties.field_name || 
                     selectedFeature.properties.village_name || 
                     selectedFeature.properties.district_name || 
                     selectedFeature.properties.source_name || 
                     selectedFeature.properties.station_name || 
                     'Selected Feature'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-earth-750 text-[#4b5563] font-mono uppercase">
                    {selectedFeature.type}
                  </span>
                </div>

                {selectedFeature.properties.area_hectares && (
                  <div className="flex justify-between text-[#4b5563]">
                    <span className="text-[#6b7280]">Area (UTM 44N):</span>
                    <span className="font-mono font-medium">{selectedFeature.properties.area_hectares} ha</span>
                  </div>
                )}

                {selectedFeature.properties.latest_ndvi !== undefined && (
                  <div className="flex justify-between text-[#4b5563]">
                    <span className="text-[#6b7280]">NDVI Vigor:</span>
                    <span className="font-mono font-medium text-agri-400">
                      {selectedFeature.properties.latest_ndvi ? selectedFeature.properties.latest_ndvi.toFixed(3) : 'Pending'}
                    </span>
                  </div>
                )}

                {selectedFeature.properties.nearest_water_distance_m != null && (
                  <div className="flex justify-between text-[#4b5563]">
                    <span className="text-[#6b7280]">Nearest Water:</span>
                    <span className="font-mono font-medium text-hydro-400">
                      {Number(selectedFeature.properties.nearest_water_distance_m).toFixed(0)} m
                    </span>
                  </div>
                )}

                {selectedFeature.properties.ph && (
                  <div className="flex justify-between text-[#4b5563]">
                    <span className="text-[#6b7280]">Soil pH:</span>
                    <span className="font-mono font-medium text-amber-400">{selectedFeature.properties.ph}</span>
                  </div>
                )}

                {selectedFeature.properties.temp_c && (
                  <div className="flex justify-between text-[#4b5563]">
                    <span className="text-[#6b7280]">Temperature:</span>
                    <span className="font-mono font-medium text-[#111827]">{selectedFeature.properties.temp_c} &deg;C</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
