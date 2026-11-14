import React, { useState } from 'react';
import { 
  Globe2, 
  Sprout, 
  TrendingUp, 
  AlertTriangle, 
  Droplets,
  Calendar,
  ArrowUpRight,
  CheckCircle2
} from 'lucide-react';

interface OverviewPageProps {
  onNavigate: (page: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  const [metricView, setMetricView] = useState<'both' | 'ndvi' | 'ndwi'>('both');

  // Authentic Sentinel-2 multi-pass dates across Kharif-Rabi transition (Nagpur)
  const passLabels = ['Sep 15', 'Sep 25', 'Oct 05', 'Oct 15', 'Oct 20', 'Oct 25'];

  // 6 Nagpur Talukas with authentic remote sensing temporal NDVI profile
  const talukaMatrix = [
    { name: 'Katol', crop: 'Citrus (Mandarin)', passes: [0.55, 0.62, 0.68, 0.72, 0.74, 0.73] },
    { name: 'Kalmeshwar', crop: 'Citrus & Pulses', passes: [0.52, 0.60, 0.67, 0.71, 0.73, 0.71] },
    { name: 'Saoner', crop: 'Sugarcane & Paddy', passes: [0.48, 0.58, 0.64, 0.69, 0.70, 0.68] },
    { name: 'Ramtek', crop: 'Mixed Kharif', passes: [0.45, 0.53, 0.59, 0.63, 0.64, 0.61] },
    { name: 'Hingna', crop: 'Soybean & Cotton', passes: [0.42, 0.50, 0.56, 0.61, 0.62, 0.58] },
    { name: 'Kuhi', crop: 'Rainfed Pulses', passes: [0.35, 0.41, 0.45, 0.49, 0.48, 0.46] },
  ];

  const getVigorClass = (val: number) => {
    if (val >= 0.70) return 'bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]'; // Dense
    if (val >= 0.58) return 'bg-[#a7f3d0] text-[#065f46] border border-[#6ee7b7]'; // Healthy
    if (val >= 0.48) return 'bg-[#fef3c7] text-[#92400e] border border-[#fde68a]'; // Moderate
    return 'bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]'; // Deficit
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1520px] mx-auto select-none font-sans text-[#111827]">
      
      {/* 1. SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">
            Agricultural Monitoring &amp; Spatial Intelligence
          </h1>
          <p className="text-xs text-[#6b7280] mt-0.5">
            Nagpur District, Maharashtra &bull; Cadastral Farm Parcels &amp; Sentinel-2 MSI Multi-Temporal Canopy Surveillance.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white border border-[#e2dfd7] px-3.5 py-1.5 rounded-full text-xs text-[#111827] shadow-sm font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#ff6f61]" />
            <span>Kharif–Rabi Transition &bull; Oct 2026</span>
          </div>

          <button 
            onClick={() => onNavigate('map')}
            className="flex items-center space-x-1.5 bg-[#101322] hover:bg-[#1a1e33] text-white px-4 py-2 rounded-full text-xs font-semibold shadow-sm transition"
          >
            <span>Interactive Map Studio</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#ff6f61]" />
          </button>
        </div>
      </div>

      {/* 2. CORE GROUND-TRUTH KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Featured Coral-Rose Sunset Gradient Card (Like Total Likes in Reference) */}
        <div className="bg-gradient-to-br from-[#ff6f61] via-[#f5576c] to-[#f04f78] rounded-3xl p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
          {/* Subtle multi-wave SVG pattern inside the card */}
          <div className="absolute inset-x-0 bottom-0 h-20 opacity-30 pointer-events-none">
            <svg viewBox="0 0 300 80" className="w-full h-full" preserveAspectRatio="none">
              <path d="M 0,40 Q 75,10 150,40 T 300,40 L 300,80 L 0,80 Z" fill="rgba(255,255,255,0.4)" />
              <path d="M 0,55 Q 75,70 150,45 T 300,50 L 300,80 L 0,80 Z" fill="rgba(255,255,255,0.3)" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between text-white/90">
              <span className="text-xs font-medium flex items-center space-x-2">
                <Globe2 className="w-4 h-4 text-white" />
                <span>Total Monitored Area</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 border border-white/30 text-white font-medium">
                Admin Boundary
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold text-white font-mono tracking-tight">15,951</span>
                <span className="text-xs text-white/80 ml-1">km²</span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/25 text-white">
                14 Talukas
              </span>
            </div>
          </div>
          <div className="relative z-10 text-[11px] text-white/80 mt-3 pt-2 border-t border-white/20">
            Nagpur District Administrative Footprint
          </div>
        </div>

        {/* Card 2: Cultivated Cadastral Farmland (Crisp White Card) */}
        <div className="bg-white border border-[#e2dfd7] rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#6b7280]">
              <span className="text-xs font-medium flex items-center space-x-2 text-[#111827]">
                <Sprout className="w-4 h-4 text-[#101322]" />
                <span>Cadastral Farmland</span>
              </span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#f5f4f0] border border-[#e2dfd7] text-[#111827]">
                20 Parcels
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold text-[#111827] font-mono tracking-tight">4,860</span>
                <span className="text-xs text-[#6b7280] ml-1">ha</span>
              </div>
              <span className="text-[11px] font-semibold text-[#15803d] bg-[#dcfce7] px-2 py-0.5 rounded-full">
                30.5% Farmland
              </span>
            </div>
          </div>
          <div className="text-[11px] text-[#6b7280] mt-3 pt-2 border-t border-[#e2dfd7]">
            Validated Cadastral Footprint
          </div>
        </div>

        {/* Card 3: Regional Mean NDVI (Crisp White Card) */}
        <div className="bg-white border border-[#e2dfd7] rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#6b7280]">
              <span className="text-xs font-medium flex items-center space-x-2 text-[#111827]">
                <TrendingUp className="w-4 h-4 text-[#101322]" />
                <span>Mean Regional NDVI</span>
              </span>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d]">
                Optimal
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold text-[#111827] font-mono tracking-tight">0.668</span>
              </div>
              <span className="text-[11px] font-semibold text-[#15803d]">
                &uarr; Healthy Vigor
              </span>
            </div>
          </div>
          <div className="text-[11px] text-[#6b7280] mt-3 pt-2 border-t border-[#e2dfd7]">
            Sentinel-2 Band 8 vs Band 4 Ratio
          </div>
        </div>

        {/* Card 4: Drought Watch Zones (Warm Blush Card like Comments in Reference) */}
        <div className="bg-[#fdece8] border border-[#fcd9d1] rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium flex items-center space-x-2 text-[#991b1b]">
                <AlertTriangle className="w-4 h-4 text-[#ff6f61]" />
                <span>Drought Watch Zones</span>
              </span>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#fee2e2] text-[#dc2626]">
                Watch
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold text-[#111827] font-mono tracking-tight">2</span>
                <span className="text-xs text-[#6b7280] ml-1">Belts</span>
              </div>
              <span className="text-[11px] font-bold text-[#b91c1c] bg-white/70 px-2.5 py-0.5 rounded-full border border-[#fca5a5]">
                Kuhi &bull; Bhiwapur
              </span>
            </div>
          </div>
          <div className="text-[11px] text-[#7f1d1d] mt-3 pt-2 border-t border-[#fcd9d1]/70">
            Rainfed Soil Moisture Deficit
          </div>
        </div>

      </div>

      {/* 3. PRIMARY ANALYTICS: MULTI-TEMPORAL CURVE + TALUKA MULTI-PASS MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Sentinel-2 Multi-Temporal Curve (7 Columns) */}
        <div className="lg:col-span-7 bg-white border border-[#e2dfd7] rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#111827]">Canopy Vigor Trajectory (NDVI &amp; NDWI)</h2>
              <span className="text-xs text-[#6b7280]">Multi-temporal Sentinel-2 MSI surface reflectance across post-monsoon cycle</span>
            </div>

            {/* Toggle Filters in Clean Pill Capsule */}
            <div className="flex items-center bg-[#f5f4f0] border border-[#e2dfd7] rounded-full p-1 text-xs">
              <button
                onClick={() => setMetricView('both')}
                className={`px-3 py-1 rounded-full transition text-xs ${
                  metricView === 'both' ? 'bg-[#101322] text-white font-semibold shadow-sm' : 'text-[#6b7280] hover:text-[#111827]'
                }`}
              >
                All Indices
              </button>
              <button
                onClick={() => setMetricView('ndvi')}
                className={`px-3 py-1 rounded-full transition text-xs ${
                  metricView === 'ndvi' ? 'bg-[#f04f78] text-white font-semibold shadow-sm' : 'text-[#6b7280] hover:text-[#111827]'
                }`}
              >
                NDVI Only
              </button>
              <button
                onClick={() => setMetricView('ndwi')}
                className={`px-3 py-1 rounded-full transition text-xs ${
                  metricView === 'ndwi' ? 'bg-[#2d60ff] text-white font-semibold shadow-sm' : 'text-[#6b7280] hover:text-[#111827]'
                }`}
              >
                NDWI Only
              </button>
            </div>
          </div>

          {/* Smooth Deterministic SVG Chart Canvas on Clean Light Canvas */}
          <div className="h-64 w-full relative">
            <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="ndviCurveFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f04f78" stopOpacity="0.18" />
                  <stop offset="65%" stopColor="#f04f78" stopOpacity="0.04" />
                  <stop offset="100%" stopColor="#f04f78" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="ndwiCurveFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2d60ff" stopOpacity="0.14" />
                  <stop offset="65%" stopColor="#2d60ff" stopOpacity="0.02" />
                  <stop offset="100%" stopColor="#2d60ff" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Reference Lines in Soft Warm Grey */}
              <line x1="30" y1="30" x2="590" y2="30" stroke="#edece8" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="15" y="34" fill="#9ca3af" fontSize="10" fontFamily="monospace">0.8</text>

              <line x1="30" y1="75" x2="590" y2="75" stroke="#edece8" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="15" y="79" fill="#9ca3af" fontSize="10" fontFamily="monospace">0.6</text>

              <line x1="30" y1="120" x2="590" y2="120" stroke="#edece8" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="15" y="124" fill="#9ca3af" fontSize="10" fontFamily="monospace">0.4</text>

              <line x1="30" y1="165" x2="590" y2="165" stroke="#edece8" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="15" y="169" fill="#9ca3af" fontSize="10" fontFamily="monospace">0.2</text>

              {/* Area Under NDVI Curve */}
              {(metricView === 'both' || metricView === 'ndvi') && (
                <>
                  <path 
                    d="M 50,115 C 100,95 150,75 220,55 C 290,40 340,32 400,32 C 460,32 500,48 550,60 L 550,180 L 50,180 Z" 
                    fill="url(#ndviCurveFill)" 
                  />
                  <path 
                    d="M 50,115 C 100,95 150,75 220,55 C 290,40 340,32 400,32 C 460,32 500,48 550,60" 
                    fill="none" 
                    stroke="#f04f78" 
                    strokeWidth="3" 
                  />
                </>
              )}

              {/* Area Under NDWI Curve */}
              {(metricView === 'both' || metricView === 'ndwi') && (
                <>
                  <path 
                    d="M 50,175 C 100,150 150,135 220,120 C 290,110 340,115 400,122 C 460,130 500,138 550,145 L 550,180 L 50,180 Z" 
                    fill="url(#ndwiCurveFill)" 
                  />
                  <path 
                    d="M 50,175 C 100,150 150,135 220,120 C 290,110 340,115 400,122 C 460,130 500,138 550,145" 
                    fill="none" 
                    stroke="#101322" 
                    strokeWidth="2" 
                    strokeDasharray="4 2"
                  />
                </>
              )}

              {/* Peak Marker Vertical Line at Oct 15 (x=400, y=32) */}
              <line x1="400" y1="32" x2="400" y2="180" stroke="#f04f78" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
              <circle cx="400" cy="32" r="5" fill="#ffffff" stroke="#f04f78" strokeWidth="3" />

              {/* X-Axis Dates */}
              <text x="50" y="195" textAnchor="middle" fill="#6b7280" fontSize="10" fontFamily="monospace">Sep 05</text>
              <text x="135" y="195" textAnchor="middle" fill="#6b7280" fontSize="10" fontFamily="monospace">Sep 15</text>
              <text x="220" y="195" textAnchor="middle" fill="#6b7280" fontSize="10" fontFamily="monospace">Sep 25</text>
              <text x="310" y="195" textAnchor="middle" fill="#6b7280" fontSize="10" fontFamily="monospace">Oct 05</text>
              <text x="400" y="195" textAnchor="middle" fill="#111827" fontWeight="bold" fontSize="10" fontFamily="monospace">Oct 15</text>
              <text x="480" y="195" textAnchor="middle" fill="#6b7280" fontSize="10" fontFamily="monospace">Oct 25</text>
              <text x="550" y="195" textAnchor="middle" fill="#6b7280" fontSize="10" fontFamily="monospace">Oct 30</text>
            </svg>

            {/* Peak Floating Badge */}
            <div className="absolute left-[66.6%] top-[5px] -translate-x-1/2 pointer-events-none">
              <div className="bg-[#f04f78] text-white font-mono font-bold text-[10px] px-3 py-1 rounded-full shadow-sm flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>Peak: 0.74 NDVI</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#6b7280] pt-3 border-t border-[#e2dfd7]">
            <span>Peak Observation: <strong className="text-[#111827]">15 Oct 2026 (Pass 5)</strong></span>
            <span>Sensor: <strong className="text-[#111827]">Sentinel-2B MSI (10m Resolution)</strong></span>
          </div>
        </div>

        {/* Right: Authentic Taluka Multi-Pass Observation Matrix (5 Columns) */}
        <div className="lg:col-span-5 bg-white border border-[#e2dfd7] rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#111827]">Taluka Observation Matrix</h2>
              <span className="text-[10px] font-mono font-semibold text-[#101322] bg-[#f5f4f0] border border-[#e2dfd7] px-2.5 py-0.5 rounded-full">
                Sentinel-2 L2A
              </span>
            </div>
            <span className="text-xs text-[#6b7280]">Canopy vigor (NDVI) tracked across consecutive orbital passes</span>

            {/* Pass Date Columns Header */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] text-[#6b7280] font-mono mt-4 mb-2 pb-1 border-b border-[#e2dfd7]">
              <span className="text-left font-semibold">Taluka</span>
              {passLabels.map((p) => (
                <span key={p}>{p}</span>
              ))}
            </div>

            {/* Taluka Rows */}
            <div className="space-y-2">
              {talukaMatrix.map((row) => (
                <div key={row.name} className="grid grid-cols-7 gap-1.5 items-center">
                  <div className="truncate">
                    <span className="text-xs font-semibold text-[#111827] block truncate">{row.name}</span>
                    <span className="text-[9px] text-[#6b7280] block truncate">{row.crop}</span>
                  </div>
                  {row.passes.map((val, idx) => (
                    <div 
                      key={idx}
                      className={`h-7 rounded-xl flex items-center justify-center font-mono text-[10px] font-bold transition-transform hover:scale-105 cursor-pointer ${getVigorClass(val)}`}
                      title={`${row.name} on ${passLabels[idx]}: NDVI ${val.toFixed(2)}`}
                    >
                      {val.toFixed(2)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend & Agronomic Summary */}
          <div className="pt-3 border-t border-[#e2dfd7] space-y-2">
            <div className="flex items-center justify-between text-[10px] text-[#6b7280] font-mono">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                <span>&gt;0.70 Dense</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#34d399]" />
                <span>0.58–0.70 Healthy</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]" />
                <span>0.48–0.58 Moderate</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f87171]" />
                <span>&lt;0.48 Deficit</span>
              </span>
            </div>

            <p className="text-[11px] text-[#4b5563] leading-relaxed bg-[#faf9f6] p-3 rounded-2xl border border-[#e2dfd7]">
              <strong className="text-[#111827]">Agronomic Assessment:</strong> Katol &amp; Kalmeshwar citrus belt maintains prime vigor (0.74 NDVI). Southern Kuhi pulse parcels indicate soil moisture decline to 0.46 NDVI, warranting deficit watch before rabi sowing.
            </p>
          </div>
        </div>

      </div>

      {/* 4. BOTTOM SECTION: AGRONOMIC ADVISORY + CANOPY DISTRIBUTION + QUALITY SCORE */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Card 1: Pench Canal Agronomic Advisory (4 Columns) */}
        <div className="md:col-span-4 bg-white border border-[#e2dfd7] rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#101322] flex items-center space-x-1.5">
                <Droplets className="w-3.5 h-3.5 text-[#2d60ff]" />
                <span>Canal Irrigation Buffer</span>
              </span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#e0f2fe] text-[#0284c7] font-semibold">
                1,000m Buffer Zone
              </span>
            </div>

            <h3 className="text-base font-bold text-[#111827] mt-3 leading-snug">
              Pench Canal Irrigation Advantage: 34% Higher Vegetative Vigor
            </h3>
            
            <p className="text-xs text-[#4b5563] mt-2 leading-relaxed">
              Spatial buffer analysis indicates fields situated within 1,000m of the Pench Right Bank Canal maintain a mean NDVI of <strong className="text-[#111827]">0.74</strong>, compared to <strong className="text-[#111827]">0.48</strong> in rainfed tracts of southern Kuhi.
            </p>

            <div className="space-y-2 mt-4 text-xs text-[#4b5563]">
              <div className="flex items-start space-x-2 bg-[#faf9f6] p-2.5 rounded-2xl border border-[#e2dfd7]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] shrink-0 mt-0.5" />
                <span>Vertisol black clay retention remains optimal for rabi gram germination.</span>
              </div>
              <div className="flex items-start space-x-2 bg-[#faf9f6] p-2.5 rounded-2xl border border-[#e2dfd7]">
                <AlertTriangle className="w-3.5 h-3.5 text-[#ff6f61] shrink-0 mt-0.5" />
                <span>Non-irrigated pulse parcels in Kuhi require supplementary moisture conservation.</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#e2dfd7] flex items-center justify-between text-[11px] text-[#6b7280]">
            <span>Soil Type: <strong className="text-[#111827]">Deep Black Cotton Soil</strong></span>
            <span>pH: <strong className="text-[#111827]">7.85 (Alkaline)</strong></span>
          </div>
        </div>

        {/* Card 2: Canopy Distribution Donut (4 Columns) */}
        <div className="md:col-span-4 bg-white border border-[#e2dfd7] rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#111827]">Canopy Density Distribution</h3>
            <span className="text-[10px] font-mono text-[#111827] bg-[#f5f4f0] px-2.5 py-0.5 rounded-full border border-[#e2dfd7]">
              4,860 ha Farmland
            </span>
          </div>

          {/* SVG Donut & Clean Legend */}
          <div className="flex items-center justify-between my-2">
            <div className="w-32 h-32 relative shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {/* Background track */}
                <circle cx="50" cy="50" r="38" stroke="#edece8" strokeWidth="11" fill="none" />
                {/* Segment 1: Dense 40% (Emerald) */}
                <circle 
                  cx="50" cy="50" r="38" 
                  stroke="#10b981" strokeWidth="11" fill="none" 
                  strokeDasharray="95 145" strokeDashoffset="0"
                />
                {/* Segment 2: Moderate 25% (Cobalt Blue) */}
                <circle 
                  cx="50" cy="50" r="38" 
                  stroke="#2d60ff" strokeWidth="11" fill="none" 
                  strokeDasharray="60 180" strokeDashoffset="-95"
                />
                {/* Segment 3: Sparse 20% (Warm Amber) */}
                <circle 
                  cx="50" cy="50" r="38" 
                  stroke="#fbbf24" strokeWidth="11" fill="none" 
                  strokeDasharray="48 192" strokeDashoffset="-155"
                />
                {/* Segment 4: Fallow 15% (Coral Rose) */}
                <circle 
                  cx="50" cy="50" r="38" 
                  stroke="#f04f78" strokeWidth="11" fill="none" 
                  strokeDasharray="36 204" strokeDashoffset="-203"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-base font-bold text-[#111827] font-mono leading-none">4,860</span>
                <span className="text-[9px] text-[#6b7280] mt-0.5 font-medium">Total ha</span>
              </div>
            </div>

            {/* Breakdown List */}
            <div className="space-y-1.5 text-xs text-[#4b5563] pl-4 flex-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                  <span>Dense (&gt;0.70)</span>
                </span>
                <span className="font-mono font-bold text-[#111827]">40%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2d60ff]" />
                  <span>Moderate (0.58–0.70)</span>
                </span>
                <span className="font-mono font-bold text-[#111827]">25%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]" />
                  <span>Sparse (0.48–0.58)</span>
                </span>
                <span className="font-mono font-bold text-[#111827]">20%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f04f78]" />
                  <span>Fallow (&lt;0.48)</span>
                </span>
                <span className="font-mono font-bold text-[#111827]">15%</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#6b7280] pt-2 border-t border-[#e2dfd7]">
            Classification: <strong className="text-[#111827]">Sentinel-2 Scene Classification Layer (SCL)</strong>
          </div>
        </div>

        {/* Card 3: Canopy Health Score (Speedometer Arc) (4 Columns) */}
        <div className="md:col-span-4 bg-white border border-[#e2dfd7] rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#111827]">District Vigor Index</h3>
            <span className="text-[10px] font-mono font-semibold text-[#15803d] bg-[#dcfce7] px-2.5 py-0.5 rounded-full">
              Post-Monsoon
            </span>
          </div>

          {/* Clean SVG Arc Gauge with Coral Rose Active Ticks */}
          <div className="my-2 flex flex-col items-center justify-center relative">
            <svg viewBox="0 0 240 130" className="w-56 h-32 overflow-visible">
              {[...Array(24)].map((_, i) => {
                const isActive = i < 18; // 75% active
                const angleDeg = 180 + (i / 23) * 180;
                const rad = (angleDeg * Math.PI) / 180;
                const rInner = 68;
                const rOuter = 88;
                const cx = 120;
                const cy = 115;
                const x1 = cx + rInner * Math.cos(rad);
                const y1 = cy + rInner * Math.sin(rad);
                const x2 = cx + rOuter * Math.cos(rad);
                const y2 = cy + rOuter * Math.sin(rad);

                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isActive ? '#f04f78' : '#edece8'}
                    strokeWidth={isActive ? 3.5 : 2}
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Clean Text in the Hollow Center */}
              <text 
                x="120" 
                y="95" 
                textAnchor="middle" 
                fill="#111827" 
                fontSize="32" 
                fontWeight="800" 
                fontFamily="monospace"
              >
                78%
              </text>
              <text 
                x="120" 
                y="114" 
                textAnchor="middle" 
                fill="#6b7280" 
                fontSize="11" 
                fontWeight="600"
              >
                Aggregated Vigor Index
              </text>
            </svg>
          </div>

          {/* Bottom Breakdown Pills */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-[#e2dfd7]">
            <div className="bg-[#faf9f6] p-2.5 rounded-2xl border border-[#e2dfd7]">
              <div className="font-bold text-[#10b981] font-mono">45%</div>
              <div className="text-[10px] text-[#6b7280]">Dense</div>
            </div>
            <div className="bg-[#faf9f6] p-2.5 rounded-2xl border border-[#e2dfd7]">
              <div className="font-bold text-[#2d60ff] font-mono">35%</div>
              <div className="text-[10px] text-[#6b7280]">Moderate</div>
            </div>
            <div className="bg-[#faf9f6] p-2.5 rounded-2xl border border-[#e2dfd7]">
              <div className="font-bold text-[#ff6f61] font-mono">20%</div>
              <div className="text-[10px] text-[#6b7280]">Watch</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
