import React, { useState, useEffect } from 'react';
import { 
  Satellite, 
  Layers, 
  Sun, 
  Cloud, 
  Eye, 
  TrendingUp, 
  ArrowUpRight, 
  Sparkles, 
  Sliders, 
  Info,
  CheckCircle2,
  Calendar,
  Compass,
  Zap,
  Activity,
  Droplets,
  ExternalLink
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { getSatelliteObservations, getSatelliteCatalog, getRasterLayers } from '../services/api';
import { RasterLayer, SatelliteObservation } from '../types';

export const SatellitePage: React.FC = () => {
  const [observations, setObservations] = useState<SatelliteObservation[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [layers, setLayers] = useState<RasterLayer[]>([]);
  const [loading, setLoading] = useState(true);

  // Active interactive band selection
  const [selectedBand, setSelectedBand] = useState<string>('B8');
  // Active formula index selection
  const [selectedIndex, setSelectedIndex] = useState<'ndvi' | 'ndwi' | 'savi' | 'evi'>('ndvi');
  // Visual scene color mode (True Color vs False Color Infrared)
  const [colorMode, setColorMode] = useState<'true' | 'cir'>('cir');
  // Selected parcel for live formula simulator
  const [simParcel, setSimParcel] = useState<'citrus' | 'paddy' | 'rainfed'>('citrus');

  useEffect(() => {
    async function loadData() {
      try {
        const [obs, cat, lyr] = await Promise.all([
          getSatelliteObservations(),
          getSatelliteCatalog(),
          getRasterLayers()
        ]);
        setObservations(obs);
        setCatalog(cat);
        setLayers(lyr);
      } catch (err) {
        console.error("Error loading satellite data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Multi-spectral Sentinel-2 bands metadata
  const bandsData: Record<string, {
    name: string;
    wavelength: string;
    resolution: string;
    glow: string;
    borderColor: string;
    badgeColor: string;
    description: string;
    agriculturalUse: string;
  }> = {
    'B2': {
      name: 'Blue',
      wavelength: '490 nm',
      resolution: '10m GSD',
      glow: 'shadow-sm',
      borderColor: 'border-sky-500/50',
      badgeColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
      description: 'Atmospheric aerosol scattering and surface water body delineation.',
      agriculturalUse: 'Deep water detection, atmospheric correction, and soil reflection baseline.'
    },
    'B3': {
      name: 'Green',
      wavelength: '560 nm',
      resolution: '10m GSD',
      glow: 'shadow-sm',
      borderColor: 'border-emerald-500/50',
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      description: 'Peak photosynthetic reflectance zone of green leaves.',
      agriculturalUse: 'Key component for NDWI water index and canopy reflectance assessment.'
    },
    'B4': {
      name: 'Red',
      wavelength: '665 nm',
      resolution: '10m GSD',
      glow: 'shadow-sm',
      borderColor: 'border-rose-500/50',
      badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      description: 'Maximum chlorophyll-a and chlorophyll-b photon absorption spectrum.',
      agriculturalUse: 'Inverse vegetation signal: healthy crops absorb red photons heavily.'
    },
    'B5': {
      name: 'Red Edge 1',
      wavelength: '705 nm',
      resolution: '20m GSD',
      glow: 'shadow-sm',
      borderColor: 'border-amber-500/50',
      badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      description: 'Steep transition zone between red absorption and near-infrared reflectance.',
      agriculturalUse: 'Sensitive diagnostic for crop nitrogen deficiency and leaf senescence.'
    },
    'B8': {
      name: 'Near Infrared (NIR)',
      wavelength: '842 nm',
      resolution: '10m GSD',
      glow: 'shadow-sm',
      borderColor: 'border-brand-iris/60',
      badgeColor: 'bg-[#f04f78]/15 text-[#f04f78]-glow border-brand-iris/30',
      description: 'Intense scattering by spongey mesophyll cell structures in healthy plant leaves.',
      agriculturalUse: 'Primary numerator for NDVI biomass vigor and leaf area index (LAI).'
    },
    'B11': {
      name: 'SWIR-1',
      wavelength: '1610 nm',
      resolution: '20m GSD',
      glow: 'shadow-sm',
      borderColor: 'border-amber-500/50',
      badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      description: 'High sensitivity to plant canopy moisture and soil water content.',
      agriculturalUse: 'NDWI drought stress detection and moisture deficit mapping in rainfed tracts.'
    },
    'B12': {
      name: 'SWIR-2',
      wavelength: '2190 nm',
      resolution: '20m GSD',
      glow: 'shadow-sm',
      borderColor: 'border-rose-500/50',
      badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      description: 'Atmospheric penetration through dry aerosols and mineral spectral absorption.',
      agriculturalUse: 'Delineates Vertisol clay minerals and severe soil desiccation.'
    }
  };

  // Live Formula Simulator Values based on parcel selection
  const parcelMetrics = {
    citrus: {
      label: 'Katol Citrus Orchard (Mandarin Orange)',
      b2: 0.04, b3: 0.08, b4: 0.06, b8: 0.48, b11: 0.18,
      ndvi: 0.777,
      ndwi: -0.363,
      savi: 0.612,
      evi: 0.684,
      status: 'Dense Photosynthetic Biomass',
      statusColor: 'text-brand-green'
    },
    paddy: {
      label: 'Saoner Irrigated Paddy / Sugarcane',
      b2: 0.06, b3: 0.11, b4: 0.08, b8: 0.42, b11: 0.24,
      ndvi: 0.680,
      ndwi: -0.214,
      savi: 0.533,
      evi: 0.589,
      status: 'Optimal Moisture & Vigor',
      statusColor: 'text-brand-cyan'
    },
    rainfed: {
      label: 'Kuhi Rainfed Pulses (Moisture Watch)',
      b2: 0.09, b3: 0.14, b4: 0.15, b8: 0.28, b11: 0.32,
      ndvi: 0.302,
      ndwi: -0.052,
      savi: 0.241,
      evi: 0.264,
      status: 'Moderate Canopy / Soil Deficit Watch',
      statusColor: 'text-brand-amber'
    }
  };

  // Multi-temporal trend curve data
  const temporalTrend = [
    { date: 'Aug 15', ndvi: 0.32, ndwi: -0.10, rain: 45 },
    { date: 'Aug 30', ndvi: 0.48, ndwi: 0.05, rain: 62 },
    { date: 'Sep 15', ndvi: 0.59, ndwi: 0.18, rain: 38 },
    { date: 'Sep 30', ndvi: 0.72, ndwi: 0.24, rain: 15 },
    { date: 'Oct 15', ndvi: 0.74, ndwi: 0.21, rain: 0 },
    { date: 'Oct 30', ndvi: 0.68, ndwi: 0.14, rain: 2 }
  ];

  const currentParcel = parcelMetrics[simParcel];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1520px] mx-auto select-none font-sans text-[#111827]">
      
      {/* 1. HERO HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#f04f78]" />
            <span className="text-xs font-mono font-semibold tracking-wider text-[#f04f78] uppercase">
              Copernicus Sentinel-2 MSI Studio
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight mt-1">
            Multi-Spectral Remote Sensing &amp; Indices
          </h1>
          <p className="text-xs text-[#6b7280] mt-0.5">
            Level-2A Bottom-Of-Atmosphere (BOA) surface reflectance processing, multi-spectral band synthesis &amp; canopy vigor diagnostics.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white border border-[#e2dfd7] px-3.5 py-1.5 rounded-2xl text-xs text-[#4b5563]">
            <Satellite className="w-3.5 h-3.5 text-[#101322]" />
            <span>Tile: 44QND &bull; Nagpur</span>
          </div>

          <div className="bg-[#faf9f6] border border-[#e2dfd7] rounded-full p-1 flex items-center text-xs">
            <button
              onClick={() => setColorMode('cir')}
              className={`px-3 py-1 rounded-full font-medium transition ${
                colorMode === 'cir' 
                  ? 'bg-[#f04f78] text-white shadow-sm font-semibold' 
                  : 'text-[#6b7280] hover:text-white'
              }`}
            >
              Color Infrared (CIR)
            </button>
            <button
              onClick={() => setColorMode('true')}
              className={`px-3 py-1 rounded-full font-medium transition ${
                colorMode === 'true' 
                  ? 'bg-white text-black font-semibold' 
                  : 'text-[#6b7280] hover:text-white'
              }`}
            >
              True Color (RGB)
            </button>
          </div>
        </div>
      </div>

      {/* 2. TOP METRIC CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Observations */}
        <div className="bg-white border border-[#e2dfd7] rounded-3xl p-5 hover:border-[#e2dfd7]-light transition shadow-sm">
          <div className="flex items-center justify-between text-[#6b7280]">
            <span className="text-xs font-medium flex items-center space-x-2">
              <Satellite className="w-4 h-4 text-[#101322]" />
              <span>Sentinel-2 Scenes</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#101322]/15 text-[#101322] border border-brand-purple/30">
              BOA Level-2A
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold text-[#111827] font-mono tracking-tight">18</span>
              <span className="text-xs text-[#6b7280] ml-1">passes</span>
            </div>
            <span className="text-[11px] font-semibold text-brand-green flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% Validated</span>
            </span>
          </div>
          <div className="text-[11px] text-[#6b7280] mt-1">Copernicus SciHub &amp; CDSE Archive</div>
        </div>

        {/* Card 2: Cloud Cover */}
        <div className="bg-white border border-[#e2dfd7] rounded-3xl p-5 hover:border-[#e2dfd7]-light transition shadow-sm">
          <div className="flex items-center justify-between text-[#6b7280]">
            <span className="text-xs font-medium flex items-center space-x-2">
              <Sun className="w-4 h-4 text-brand-amber" />
              <span>Mean Cloud Coverage</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold text-[#111827] font-mono tracking-tight">4.2</span>
              <span className="text-xs text-[#6b7280] ml-1 font-normal">%</span>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-green/15 text-brand-green">
              Clear Optical Window
            </span>
          </div>
          <div className="text-[11px] text-[#6b7280] mt-1">S2 SCL Mask Applied (No Cloud Noise)</div>
        </div>

        {/* Card 3: Multi-spectral Bands */}
        <div className="bg-white border border-[#e2dfd7] rounded-3xl p-5 hover:border-[#e2dfd7]-light transition shadow-sm">
          <div className="flex items-center justify-between text-[#6b7280]">
            <span className="text-xs font-medium flex items-center space-x-2">
              <Layers className="w-4 h-4 text-brand-cyan" />
              <span>Spectral Resolution</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30">
              13 Bands
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold text-[#111827] font-mono tracking-tight">10</span>
              <span className="text-xs text-[#6b7280] ml-1 font-normal">m GSD</span>
            </div>
            <span className="text-[11px] font-semibold text-[#4b5563]">
              VNIR &bull; SWIR
            </span>
          </div>
          <div className="text-[11px] text-[#6b7280] mt-1">Multi-Spectral Imager (MSI) Sensor</div>
        </div>

        {/* Card 4: Mean Canopy NDVI */}
        <div className="bg-white border border-[#e2dfd7] rounded-3xl p-5 hover:border-[#e2dfd7]-light transition shadow-sm">
          <div className="flex items-center justify-between text-[#6b7280]">
            <span className="text-xs font-medium flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-brand-green" />
              <span>Regional Canopy Vigor</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-green/15 text-brand-green border border-brand-green/30">
              NDVI
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold text-brand-green font-mono tracking-tight">0.668</span>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-green/15 text-brand-green">
              &uarr; Healthy Vigor
            </span>
          </div>
          <div className="text-[11px] text-[#6b7280] mt-1">Optimal Photosynthetic Activity</div>
        </div>

      </div>

      {/* 3. INTERACTIVE MULTI-SPECTRAL BAND EXPLORER */}
      <div className="bg-white border border-[#e2dfd7] rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[#111827] flex items-center space-x-2">
              <Zap className="w-4 h-4 text-[#101322]" />
              <span>Sentinel-2 Multi-Spectral Band Radiance Explorer</span>
            </h2>
            <span className="text-xs text-[#6b7280]">
              Click any spectral band to inspect its physical wavelength, spatial resolution, and agricultural diagnostics.
            </span>
          </div>
          <span className="text-[11px] text-[#6b7280] font-mono">
            Active Band: <strong className="text-[#101322]">{selectedBand}</strong>
          </span>
        </div>

        {/* Band Pills Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {Object.entries(bandsData).map(([bandId, data]) => {
            const isSelected = selectedBand === bandId;
            return (
              <button
                key={bandId}
                onClick={() => setSelectedBand(bandId)}
                className={`p-3 rounded-2xl border transition-all text-left relative overflow-hidden ${
                  isSelected
                    ? `bg-[#faf9f6] ${data.borderColor} ${data.glow} scale-[1.02]`
                    : 'bg-[#faf9f6]/60 border-[#e2dfd7] hover:border-[#e2dfd7]-light hover:bg-[#faf9f6]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-[#111827]">{bandId}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full border ${data.badgeColor}`}>
                    {data.resolution}
                  </span>
                </div>
                <div className="text-xs font-medium text-[#4b5563] mt-1 truncate">{data.name}</div>
                <div className="text-[11px] font-mono text-[#6b7280] mt-0.5">{data.wavelength}</div>
              </button>
            );
          })}
        </div>

        {/* Selected Band Deep Diagnostic Card */}
        {selectedBand && bandsData[selectedBand] && (
          <div className="bg-[#faf9f6] border border-[#e2dfd7] rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fadeIn">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-[#111827]">
                  Band {selectedBand}: {bandsData[selectedBand].name} ({bandsData[selectedBand].wavelength})
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${bandsData[selectedBand].badgeColor}`}>
                  {bandsData[selectedBand].resolution}
                </span>
              </div>
              <p className="text-xs text-[#4b5563]">
                {bandsData[selectedBand].description}
              </p>
              <div className="text-xs text-[#101322] font-medium pt-1">
                <strong>Agricultural Application:</strong> {bandsData[selectedBand].agriculturalUse}
              </div>
            </div>

            {/* Quick Band Radiance Stat Pill */}
            <div className="bg-white border border-[#e2dfd7] rounded-xl p-3 text-right shrink-0">
              <div className="text-[10px] text-[#6b7280] font-mono">Reflectance Dynamic Range</div>
              <div className="text-sm font-bold font-mono text-[#111827] mt-0.5">0.0 – 10,000 DN (L2A)</div>
              <div className="text-[10px] text-brand-green font-medium">12-bit Radiometric Resolution</div>
            </div>
          </div>
        )}
      </div>

      {/* 4. INTERACTIVE FORMULA STUDIO & PARCEL SIMULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Interactive Formula Playground (7 Columns) */}
        <div className="lg:col-span-7 bg-white border border-[#e2dfd7] rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#111827] flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-[#101322]" />
                  <span>Vegetation &amp; Water Index Formula Studio</span>
                </h2>
                <span className="text-xs text-[#6b7280]">Mathematical synthesis of remote sensing band reflectance</span>
              </div>

              {/* Index Switcher Pills */}
              <div className="bg-[#faf9f6] border border-[#e2dfd7] rounded-full p-1 flex text-xs">
                {(['ndvi', 'ndwi', 'savi', 'evi'] as const).map((idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedIndex(idx)}
                    className={`px-2.5 py-1 rounded-full uppercase font-mono font-semibold transition ${
                      selectedIndex === idx
                        ? 'bg-[#101322] text-white shadow-glow-purple'
                        : 'text-[#6b7280] hover:text-white'
                    }`}
                  >
                    {idx}
                  </button>
                ))}
              </div>
            </div>

            {/* Formula Equation Banner */}
            <div className="my-4 bg-[#faf9f6] border border-[#e2dfd7] rounded-2xl p-4 font-mono text-center relative overflow-hidden">
              <div className="text-xs text-[#6b7280] mb-1">Mathematical Definition:</div>
              {selectedIndex === 'ndvi' && (
                <div className="text-lg md:text-xl font-bold text-[#111827] flex items-center justify-center space-x-2">
                  <span className="text-[#101322]">NDVI</span>
                  <span>=</span>
                  <div className="inline-flex flex-col text-sm md:text-base border-b border-slate-600 pb-0.5">
                    <span>(B8 - B4)</span>
                  </div>
                  <span>/</span>
                  <div className="inline-flex flex-col text-sm md:text-base">
                    <span>(B8 + B4)</span>
                  </div>
                  <span className="text-xs text-[#6b7280] font-sans ml-3">NIR vs Red Absorption</span>
                </div>
              )}
              {selectedIndex === 'ndwi' && (
                <div className="text-lg md:text-xl font-bold text-[#111827] flex items-center justify-center space-x-2">
                  <span className="text-brand-cyan">NDWI</span>
                  <span>=</span>
                  <div className="inline-flex flex-col text-sm md:text-base border-b border-slate-600 pb-0.5">
                    <span>(B3 - B8)</span>
                  </div>
                  <span>/</span>
                  <div className="inline-flex flex-col text-sm md:text-base">
                    <span>(B3 + B8)</span>
                  </div>
                  <span className="text-xs text-[#6b7280] font-sans ml-3">Gao Water Index</span>
                </div>
              )}
              {selectedIndex === 'savi' && (
                <div className="text-lg md:text-xl font-bold text-[#111827] flex items-center justify-center space-x-2">
                  <span className="text-brand-amber">SAVI</span>
                  <span>=</span>
                  <span>[ (B8 - B4) / (B8 + B4 + 0.5) ] &times; 1.5</span>
                  <span className="text-xs text-[#6b7280] font-sans ml-3">Soil Correction (L=0.5)</span>
                </div>
              )}
              {selectedIndex === 'evi' && (
                <div className="text-lg md:text-xl font-bold text-[#111827] flex items-center justify-center space-x-2">
                  <span className="text-brand-green">EVI</span>
                  <span>=</span>
                  <span>2.5 &times; [ (B8 - B4) / (B8 + 6&times;B4 - 7.5&times;B2 + 1) ]</span>
                  <span className="text-xs text-[#6b7280] font-sans ml-3">Atmospheric De-noising</span>
                </div>
              )}
            </div>

            {/* Scientific Color Ramp Gradient */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] text-[#6b7280] font-mono">
                <span>-1.0 (Water / Barren)</span>
                <span>0.0 (Soil / Fallow)</span>
                <span>+0.5 (Moderate Vigor)</span>
                <span>+1.0 (Dense Canopy)</span>
              </div>
              <div className="h-3 w-full rounded-full bg-gradient-to-r from-blue-600 via-amber-600 via-yellow-400 to-emerald-500 shadow-inner" />
            </div>
          </div>

          {/* Explanation Box */}
          <div className="text-xs text-[#4b5563] leading-relaxed bg-[#faf9f6] p-3.5 rounded-2xl border border-[#e2dfd7]">
            <strong className="text-white">Remote Sensing Principle:</strong>{' '}
            Healthy vegetation leaves reflect 40–50% of incoming NIR energy (Band 8, 842nm) through mesophyll light refraction, while absorbing 80–90% of red light (Band 4, 665nm) for chlorophyll photosynthesis. Contrast between these bands isolates biological vigor from soil and atmosphere.
          </div>
        </div>

        {/* Right: Live Parcel Metric Simulator (5 Columns) */}
        <div className="lg:col-span-5 bg-white border border-[#e2dfd7] rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#111827]">Nagpur Parcel Vigor Simulator</h3>
              <span className="text-[10px] font-mono text-[#101322] bg-[#101322]/10 px-2 py-0.5 rounded-full border border-brand-purple/30">
                Ground-Truth Field Cadastre
              </span>
            </div>
            <span className="text-xs text-[#6b7280]">Select parcel to inspect live computed multi-spectral indices</span>

            {/* Parcel Selector Buttons */}
            <div className="grid grid-cols-3 gap-2 my-3">
              {[
                { id: 'citrus', label: 'Katol Citrus', type: 'Orchard' },
                { id: 'paddy', label: 'Saoner Paddy', type: 'Canal' },
                { id: 'rainfed', label: 'Kuhi Pulses', type: 'Rainfed' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSimParcel(p.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    simParcel === p.id
                      ? 'bg-[#f04f78]/15 border-brand-iris text-white shadow-sm font-semibold'
                      : 'bg-[#faf9f6] border-[#e2dfd7] text-[#6b7280] hover:text-white hover:bg-[#faf9f6]/80'
                  }`}
                >
                  <div className="text-xs font-semibold truncate">{p.label}</div>
                  <div className="text-[10px] text-[#6b7280] font-mono">{p.type}</div>
                </button>
              ))}
            </div>

            {/* Computed Values Card */}
            <div className="bg-[#faf9f6] border border-[#e2dfd7] rounded-2xl p-4 space-y-3">
              <div className="text-xs text-[#4b5563] font-medium truncate">
                {currentParcel.label}
              </div>

              {/* Grid of Calculated Indices */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-2.5 rounded-xl border border-[#e2dfd7]">
                  <div className="text-[10px] text-[#6b7280] font-mono">Normalized NDVI</div>
                  <div className="text-xl font-extrabold text-brand-green font-mono mt-0.5">
                    {currentParcel.ndvi.toFixed(3)}
                  </div>
                  <div className="text-[10px] text-[#6b7280]">Canopy Chlorophyll</div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-[#e2dfd7]">
                  <div className="text-[10px] text-[#6b7280] font-mono">Moisture NDWI</div>
                  <div className="text-xl font-extrabold text-brand-cyan font-mono mt-0.5">
                    {currentParcel.ndwi.toFixed(3)}
                  </div>
                  <div className="text-[10px] text-[#6b7280]">Canopy Water Content</div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-[#e2dfd7]">
                  <div className="text-[10px] text-[#6b7280] font-mono">Soil SAVI (L=0.5)</div>
                  <div className="text-xl font-extrabold text-brand-amber font-mono mt-0.5">
                    {currentParcel.savi.toFixed(3)}
                  </div>
                  <div className="text-[10px] text-[#6b7280]">Black Soil Adjusted</div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-[#e2dfd7]">
                  <div className="text-[10px] text-[#6b7280] font-mono">Enhanced EVI</div>
                  <div className="text-xl font-extrabold text-[#101322] font-mono mt-0.5">
                    {currentParcel.evi.toFixed(3)}
                  </div>
                  <div className="text-[10px] text-[#6b7280]">Aerosol Corrected</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#4b5563] pt-2 border-t border-[#e2dfd7] flex items-center justify-between">
            <span>Status Assessment:</span>
            <span className={`font-semibold ${currentParcel.statusColor}`}>
              {currentParcel.status}
            </span>
          </div>
        </div>

      </div>

      {/* 5. MULTI-TEMPORAL VEGETATION VIGOR CURVE */}
      <div className="bg-white border border-[#e2dfd7] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-[#111827]">Multi-Temporal Sentinel-2 Trajectory</h2>
            <span className="text-xs text-[#6b7280]">Correlating NDVI canopy vigor with NDWI moisture across 2026 Kharif-Rabi transition</span>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <span className="flex items-center space-x-1.5 text-[#101322]">
              <span className="w-3 h-1 rounded-full bg-[#101322]" />
              <span>NDVI Vigor</span>
            </span>
            <span className="flex items-center space-x-1.5 text-brand-cyan">
              <span className="w-3 h-1 rounded-full bg-brand-cyan" />
              <span>NDWI Moisture</span>
            </span>
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={temporalTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="purpleArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7059f6" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#7059f6" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="cyanArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#4b5563" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} />
              <YAxis domain={[-0.2, 1.0]} stroke="#4b5563" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#161722', 
                  borderColor: '#2b2e44', 
                  borderRadius: '12px', 
                  fontSize: '11px',
                  color: '#ffffff'
                }} 
              />
              <Area type="monotone" dataKey="ndvi" name="NDVI Vigor" stroke="#7059f6" strokeWidth={2.5} fill="url(#purpleArea)" />
              <Area type="monotone" dataKey="ndwi" name="NDWI Moisture" stroke="#38bdf8" strokeWidth={2} fill="url(#cyanArea)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 6. SENTINEL-2 SCENES CATALOG */}
      <div className="bg-white border border-[#e2dfd7] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#111827]">Sentinel-2 Scene Catalog (Tile 44QND)</h2>
            <span className="text-xs text-[#6b7280]">Archived cloud-screened Level-2A granules ready for spatial analysis</span>
          </div>
          <span className="text-xs text-[#6b7280] font-mono">{catalog.length} Available Observations</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {catalog.map((scene, idx) => (
            <div 
              key={idx} 
              className="bg-[#faf9f6] border border-[#e2dfd7] rounded-2xl p-5 hover:border-brand-purple/50 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-1.5 text-xs font-bold text-white">
                    <Satellite className="w-4 h-4 text-[#101322]" />
                    <span>{scene.satellite}</span>
                    <span className="text-[#6b7280] font-normal">&bull; Tile {scene.tile}</span>
                  </span>
                  <span className="text-[10px] bg-white text-[#101322] font-mono px-2 py-0.5 rounded-full border border-[#e2dfd7]">
                    {scene.acquisition_date}
                  </span>
                </div>

                <div className="text-[11px] text-[#6b7280] font-mono truncate mt-2 pb-2 border-b border-[#e2dfd7]">
                  {scene.scene_id}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Cloud Coverage</span>
                    <span className="font-mono font-bold text-[#1f2937]">{scene.cloud_percentage}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Sun Zenith</span>
                    <span className="font-mono font-bold text-[#1f2937]">{scene.sun_zenith}&deg;</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Season</span>
                    <span className="font-semibold text-brand-amber">{scene.season}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Processing</span>
                    <span className="font-semibold text-brand-green">BOA Level-2A</span>
                  </div>
                </div>
              </div>

              {/* Scene Action Button */}
              <div className="pt-2 border-t border-[#e2dfd7] flex items-center justify-between text-xs">
                <span className="text-[10px] text-[#6b7280] font-mono">EPSG:32644 (UTM 44N)</span>
                <button 
                  onClick={() => alert(`Scene ${scene.scene_id} queued for full raster clipping.`)}
                  className="text-[#101322] hover:text-white font-semibold flex items-center space-x-1 text-xs transition"
                >
                  <span>Inspect Bands</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
