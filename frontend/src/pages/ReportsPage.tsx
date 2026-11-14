import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  Sprout, 
  AlertTriangle, 
  Layers, 
  Globe2, 
  Clock, 
  ShieldCheck, 
  ArrowUpRight,
  Printer,
  ChevronRight,
  Database,
  Calendar,
  Eye
} from 'lucide-react';
import { generatePdfReport, listPdfReports } from '../services/api';

export const ReportsPage: React.FC = () => {
  const [regionName, setRegionName] = useState('Nagpur District');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('master');
  const [reports, setReports] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modular options toggled for inclusion
  const [includeCadastral, setIncludeCadastral] = useState(true);
  const [includeSatellite, setIncludeSatellite] = useState(true);
  const [includeBuffer, setIncludeBuffer] = useState(true);
  const [includeSoil, setIncludeSoil] = useState(true);
  const [includeRisk, setIncludeRisk] = useState(true);

  const loadReports = async () => {
    try {
      const list = await listPdfReports();
      setReports(list);
    } catch (err) {
      console.error("Error loading reports list:", err);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const templates = [
    {
      id: 'master',
      title: 'Nagpur Master Agricultural Dossier',
      subtitle: 'Complete 14-taluka spatial evaluation with landcover & soil chemistry',
      icon: Globe2,
      accent: 'border-brand-purple text-[#ff6f61] shadow-sm',
      badge: 'Full District',
      regionDefault: 'Nagpur District, Maharashtra'
    },
    {
      id: 'citrus',
      title: 'Katol Citrus Belt Vigor Audit',
      subtitle: 'Mandarin orange canopy health, LAI vigor & Pench canal water buffer',
      icon: Sprout,
      accent: 'border-brand-green text-brand-green shadow-glow-green',
      badge: 'Orchards',
      regionDefault: 'Katol & Kalmeshwar Citrus Belt'
    },
    {
      id: 'drought',
      title: 'Kuhi Drought Vulnerability Brief',
      subtitle: 'Rainfed pulse tract soil moisture deficit & drought risk classifications',
      icon: AlertTriangle,
      accent: 'border-brand-amber text-brand-amber shadow-[0_0_15px_rgba(245,158,11,0.3)]',
      badge: 'Risk Watch',
      regionDefault: 'Kuhi & Bhiwapur Rainfed Belts'
    },
    {
      id: 'soil',
      title: 'Vertisol Black Soil Fertility Profile',
      subtitle: 'Ground-truth NPK nutrients, soil reaction pH 7.8 & clay moisture capacity',
      icon: Layers,
      accent: 'border-brand-cyan text-brand-cyan shadow-[0_0_15px_rgba(56,189,248,0.3)]',
      badge: 'Pedology',
      regionDefault: 'Nagpur Vertisol Soil Zone'
    }
  ];

  const handleSelectTemplate = (tpl: typeof templates[0]) => {
    setSelectedTemplate(tpl.id);
    setRegionName(tpl.regionDefault);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setSuccessMsg(null);
    try {
      const res = await generatePdfReport(regionName);
      setSuccessMsg(`Report generated successfully: ${res.filename}`);
      await loadReports();
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1520px] mx-auto select-none font-sans text-[#111827]">
      
      {/* 1. HERO HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#101322] animate-pulse shadow-sm" />
            <span className="text-xs font-mono font-semibold tracking-wider text-[#ff6f61] uppercase">
              Publication-Grade Spatial Dossiers
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight mt-1">
            Automated Geospatial Intelligence Reports
          </h1>
          <p className="text-xs text-[#6b7280] mt-0.5">
            Compile publication-ready ReportLab PDF dossiers synthesizing cadastral field measurements, Sentinel-2 vegetation indices, and machine learning risk evaluations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white border border-[#e2dfd7] px-3.5 py-1.5 rounded-2xl text-xs text-[#4b5563]">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
            <span>Official Geospatial Release</span>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center space-x-1.5 bg-[#101322] hover:bg-[#101322]-dark text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{generating ? 'Compiling PDF...' : 'Quick Compile PDF'}</span>
          </button>
        </div>
      </div>

      {/* 2. PRE-CONFIGURED TEMPLATE CARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#111827]">Select Analytical Dossier Template</h2>
          <span className="text-xs text-[#6b7280] font-mono">4 Specialized Blueprints</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((tpl) => {
            const Icon = tpl.icon;
            const isSelected = selectedTemplate === tpl.id;
            return (
              <div
                key={tpl.id}
                onClick={() => handleSelectTemplate(tpl)}
                className={`p-5 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? `bg-white ${tpl.accent} scale-[1.02]`
                    : 'bg-white border-[#e2dfd7] hover:border-[#e2dfd7]-light hover:bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-2xl bg-[#faf9f6] border border-[#e2dfd7] flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#4b5563]">
                      {tpl.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-[#111827] mt-3 leading-snug">{tpl.title}</h3>
                  <p className="text-xs text-[#6b7280] mt-1 leading-relaxed">{tpl.subtitle}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-[#e2dfd7] flex items-center justify-between text-xs font-medium">
                  <span className={isSelected ? 'text-white' : 'text-[#6b7280]'}>
                    {isSelected ? 'Active Selection' : 'Click to Select'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. DOSSIER CUSTOMIZER + LIVE DOCUMENT PREVIEW MOCKUP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Configuration & Generation Form (7 Columns) */}
        <div className="lg:col-span-7 bg-white border border-[#e2dfd7] rounded-3xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#111827]">Dossier Parameters &amp; Inclusions</h2>
                <span className="text-xs text-[#6b7280]">Configure spatial layers and database analytical modules</span>
              </div>
              <span className="text-xs text-[#ff6f61] font-mono bg-[#ff6f61]/10 px-2 py-0.5 rounded-full border border-[#ff6f61]/30">
                A4 Executive
              </span>
            </div>

            {/* Region Target Input */}
            <div className="mt-4 space-y-1.5">
              <label className="text-xs font-semibold text-[#4b5563] flex items-center space-x-1.5">
                <Globe2 className="w-3.5 h-3.5 text-[#ff6f61]" />
                <span>Geographical Focus / Target Region</span>
              </label>
              <input
                type="text"
                value={regionName}
                onChange={(e) => setRegionName(e.target.value)}
                placeholder="e.g. Nagpur District, Maharashtra"
                className="w-full bg-[#faf9f6] border border-[#e2dfd7] rounded-2xl px-4 py-2.5 text-xs text-[#1f2937] focus:outline-none focus:border-brand-purple transition font-mono"
              />
            </div>

            {/* Inclusions Checkbox Grid */}
            <div className="mt-5 space-y-2">
              <span className="text-xs font-semibold text-[#4b5563] block">
                Spatial &amp; Remote Sensing Modules to Include:
              </span>

              <div className="space-y-2">
                {[
                  { state: includeCadastral, setter: setIncludeCadastral, label: 'Cadastral Agricultural Farmland Geometry & Areas', desc: 'Boundary mapping, 4,860 ha cadastral footprints' },
                  { state: includeSatellite, setter: setIncludeSatellite, label: 'Sentinel-2 MSI Multi-Temporal Canopy Indices', desc: 'NDVI vegetation vigor, NDWI moisture, BOA surface reflectance' },
                  { state: includeBuffer, setter: setIncludeBuffer, label: 'Water Source Proximity & Riparian Buffer Analysis', desc: '500m / 1000m buffer zones around Pench canal & reservoirs' },
                  { state: includeSoil, setter: setIncludeSoil, label: 'Vertisol Deep Black Soil Chemical Profile', desc: 'pH 7.85, Nitrogen (192.5 kg/ha), Phosphorus & Organic Carbon' },
                  { state: includeRisk, setter: setIncludeRisk, label: 'Machine Learning Drought & Yield Anomaly Prediction', desc: 'Random Forest risk classification & confidence score' },
                ].map((item, idx) => (
                  <label
                    key={idx}
                    className="flex items-start space-x-3 p-3 rounded-2xl bg-[#faf9f6] border border-[#e2dfd7] cursor-pointer hover:border-[#e2dfd7]-light transition"
                  >
                    <input
                      type="checkbox"
                      checked={item.state}
                      onChange={(e) => item.setter(e.target.checked)}
                      className="mt-0.5 rounded border-[#e2dfd7] bg-white text-[#ff6f61] focus:ring-0"
                    />
                    <div className="text-xs">
                      <div className="font-semibold text-[#1f2937]">{item.label}</div>
                      <div className="text-[11px] text-[#6b7280] font-mono mt-0.5">{item.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="pt-4 border-t border-[#e2dfd7] space-y-3">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-[#101322] hover:bg-[#101322]-dark text-white font-semibold text-xs py-3.5 rounded-full transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              <span>{generating ? 'Compiling Official PDF Dossier...' : 'Generate & Compile Official PDF Dossier'}</span>
            </button>

            {successMsg && (
              <div className="bg-brand-green/10 border border-brand-green/30 text-brand-green p-3 rounded-2xl text-xs flex items-center space-x-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-mono">{successMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Document Preview Mockup (5 Columns) */}
        <div className="lg:col-span-5 bg-white border border-[#e2dfd7] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#111827]">Live PDF Dossier Blueprint</h3>
              <span className="text-[10px] text-[#6b7280] font-mono">Format: A4 Print-Ready</span>
            </div>
            <span className="text-xs text-[#6b7280]">Exact layout of the compiled ReportLab document</span>

            {/* Document Paper Mockup */}
            <div className="my-4 bg-[#faf9f6] border border-[#e2dfd7] rounded-2xl p-5 space-y-4 shadow-inner relative overflow-hidden">
              
              {/* Document Header */}
              <div className="border-b border-[#e2dfd7] pb-3 flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-mono text-[#ff6f61] uppercase tracking-widest font-bold">
                    GOVERNMENT OF MAHARASHTRA &bull; BHUNETRA
                  </div>
                  <div className="text-sm font-extrabold text-white mt-1">
                    {regionName}
                  </div>
                  <div className="text-[10px] text-[#6b7280] mt-0.5">
                    Agricultural &amp; Remote Sensing Intelligence Dossier
                  </div>
                </div>
                <span className="w-8 h-8 rounded-full bg-[#101322]/20 border border-brand-purple/40 flex items-center justify-center text-[#ff6f61] font-mono text-xs font-bold">
                  BN
                </span>
              </div>

              {/* Document Metadata Strip */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-white p-2.5 rounded-xl border border-[#e2dfd7] text-[#4b5563]">
                <div>
                  <span className="text-slate-500 block">Projection:</span>
                  <span>EPSG:4326 (WGS84)</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Satellite Sensor:</span>
                  <span>Sentinel-2 MSI Level-2A</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Spatial System:</span>
                  <span>Cadastral Spatial Coordinates</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Date Generated:</span>
                  <span>October 2026</span>
                </div>
              </div>

              {/* Sample Document Section Snippets */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-[#e2dfd7]">
                  <div className="flex justify-between font-semibold text-[#1f2937] text-[11px]">
                    <span>1. Monitored Farmland Footprint</span>
                    <span className="text-brand-green font-mono">4,860 ha</span>
                  </div>
                  <p className="text-[10px] text-[#6b7280] mt-0.5">
                    Cadastral parcels validated across 14 talukas with 100% boundary integrity.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-[#e2dfd7]">
                  <div className="flex justify-between font-semibold text-[#1f2937] text-[11px]">
                    <span>2. Mean Canopy Vigor (NDVI)</span>
                    <span className="text-brand-green font-mono">0.668</span>
                  </div>
                  <p className="text-[10px] text-[#6b7280] mt-0.5">
                    Optimal chlorophyll absorption observed across Katol &amp; Saoner irrigated belts.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-[#e2dfd7]">
                  <div className="flex justify-between font-semibold text-[#1f2937] text-[11px]">
                    <span>3. Vertisol Soil Chemistry</span>
                    <span className="text-brand-cyan font-mono">pH 7.85</span>
                  </div>
                  <p className="text-[10px] text-[#6b7280] mt-0.5">
                    High clay fraction with strong cation-exchange capacity and moisture retention.
                  </p>
                </div>
              </div>

              {/* Seal / Footer Block */}
              <div className="pt-2 border-t border-[#e2dfd7] flex items-center justify-between text-[10px] text-[#6b7280] font-mono">
                <span>Certified Cadastral Metrics</span>
                <span className="text-brand-green font-semibold">Ready for Distribution</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#6b7280] text-center">
            Standard PDF includes color charts, cadastral tables, and GIS spatial maps.
          </div>
        </div>

      </div>

      {/* 4. ARCHIVED PDF DOSSIERS LIBRARY */}
      <div className="bg-white border border-[#e2dfd7] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#111827]">Archived Analytical PDF Dossiers</h2>
            <span className="text-xs text-[#6b7280]">Directly download previously compiled dossiers</span>
          </div>
          <span className="text-xs text-[#6b7280] font-mono">{reports.length} Compiled Files</span>
        </div>

        {reports.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6b7280] bg-[#faf9f6] rounded-2xl border border-[#e2dfd7]">
            No compiled dossiers found. Click &quot;Generate &amp; Compile Official PDF Dossier&quot; above to create your first report.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf9f6] text-[#6b7280] text-[11px] border-b border-[#e2dfd7]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Document Filename</th>
                  <th className="py-3 px-4 font-semibold">File Size</th>
                  <th className="py-3 px-4 font-semibold">Compilation Timestamp</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border font-mono">
                {reports.map((rpt, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition">
                    <td className="py-3 px-4 text-white font-semibold flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-[#ff6f61] shrink-0" />
                      <span>{rpt.filename}</span>
                    </td>
                    <td className="py-3 px-4 text-[#4b5563]">
                      {(rpt.size_bytes / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3 px-4 text-[#6b7280] font-sans text-[11px]">
                      {new Date(rpt.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={rpt.download_url}
                        download
                        className="inline-flex items-center space-x-1.5 bg-[#faf9f6] hover:bg-[#101322] hover:text-white text-[#4b5563] px-3 py-1.5 rounded-xl border border-[#e2dfd7] text-xs transition font-sans font-medium"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
