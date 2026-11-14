import React, { useState } from 'react';
import { Layers, CheckCircle2, Cpu, BarChart2 } from 'lucide-react';
import { classifyLandUse } from '../services/api';

export const LandUsePage: React.FC = () => {
  const [b03, setB03] = useState(1050);
  const [b04, setB04] = useState(600);
  const [b08, setB08] = useState(5300);
  const [b11, setB11] = useState(1350);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleClassify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await classifyLandUse({
        b03_green: Number(b03),
        b04_red: Number(b04),
        b08_nir: Number(b08),
        b11_swir: Number(b11)
      });
      setPrediction(res);
    } catch (err) {
      console.error("LULC classification error:", err);
    } finally {
      setLoading(false);
    }
  };

  const setPreset = (green: number, red: number, nir: number, swir: number) => {
    setB03(green);
    setB04(red);
    setB08(nir);
    setB11(swir);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-[#111827] tracking-tight">Land Use &amp; Land Cover (LULC) Classification</h1>
        <p className="text-xs text-[#6b7280] mt-0.5">
          Multispectral signature classification using Random Forest trained on Sentinel-2 bottom-of-atmosphere surface reflectance.
        </p>
      </div>

      {/* LULC Category Breakdown Strip */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {[
          { name: 'Irrigated Cropland', desc: 'Canal & well-fed sugarcane / paddy', color: 'bg-agri-500', ndvi: '0.65 - 0.75' },
          { name: 'Rainfed Kharif Crops', desc: 'Soybean, cotton, pigeonpea', color: 'bg-amber-500', ndvi: '0.40 - 0.55' },
          { name: 'Citrus Orchards', desc: 'Nagpur mandarin orange groves', color: 'bg-emerald-400', ndvi: '0.70 - 0.85' },
          { name: 'Surface Water', desc: 'Lakes, rivers, reservoirs, dams', color: 'bg-hydro-400', ndvi: '< 0.0' },
          { name: 'Built-up / Fallow Soil', desc: 'Urban clusters & post-harvest fallow', color: 'bg-slate-400', ndvi: '0.05 - 0.20' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white border border-[#e2dfd7] rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${item.color}`}></span>
              <span className="font-medium text-xs text-[#111827] truncate">{item.name}</span>
            </div>
            <p className="text-[11px] text-[#6b7280] leading-tight">{item.desc}</p>
            <div className="text-[10px] font-mono text-[#6b7280] pt-1.5 border-t border-[#e2dfd7]">
              NDVI: <span className="text-[#4b5563] font-medium">{item.ndvi}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Multispectral Classifier Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-[#e2dfd7] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#111827]">
                Spectral Signature Classifier
              </h2>
              <span className="text-[11px] text-[#6b7280]">Input Sentinel-2 BOA reflectance values to classify land cover</span>
            </div>

            <div className="flex items-center space-x-1.5 text-xs">
              <span className="text-[#6b7280] text-[10px]">Presets:</span>
              <button 
                type="button" 
                onClick={() => setPreset(1050, 600, 5300, 1350)} 
                className="bg-[#faf9f6] hover:bg-[#edece8] text-[#111827] px-2 py-1 rounded text-[10px] font-medium border border-[#e2dfd7]"
              >
                Orchard
              </button>
              <button 
                type="button" 
                onClick={() => setPreset(1100, 800, 4200, 1600)} 
                className="bg-[#faf9f6] hover:bg-[#edece8] text-[#111827] px-2 py-1 rounded text-[10px] font-medium border border-[#e2dfd7]"
              >
                Crops
              </button>
              <button 
                type="button" 
                onClick={() => setPreset(850, 380, 250, 150)} 
                className="bg-[#faf9f6] hover:bg-[#edece8] text-[#111827] px-2 py-1 rounded text-[10px] font-medium border border-[#e2dfd7]"
              >
                Water
              </button>
            </div>
          </div>

          <form onSubmit={handleClassify} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] text-[#6b7280] block mb-1">Band 3 Green (DN)</label>
                <input
                  type="number"
                  value={b03}
                  onChange={(e) => setB03(Number(e.target.value))}
                  className="w-full bg-[#edece8] border border-[#e2dfd7] rounded-md p-2 text-xs font-mono text-[#111827] focus:outline-none focus:border-agri-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#6b7280] block mb-1">Band 4 Red (DN)</label>
                <input
                  type="number"
                  value={b04}
                  onChange={(e) => setB04(Number(e.target.value))}
                  className="w-full bg-[#edece8] border border-[#e2dfd7] rounded-md p-2 text-xs font-mono text-[#111827] focus:outline-none focus:border-agri-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#6b7280] block mb-1">Band 8 NIR (DN)</label>
                <input
                  type="number"
                  value={b08}
                  onChange={(e) => setB08(Number(e.target.value))}
                  className="w-full bg-[#edece8] border border-[#e2dfd7] rounded-md p-2 text-xs font-mono text-[#111827] focus:outline-none focus:border-agri-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#6b7280] block mb-1">Band 11 SWIR (DN)</label>
                <input
                  type="number"
                  value={b11}
                  onChange={(e) => setB11(Number(e.target.value))}
                  className="w-full bg-[#edece8] border border-[#e2dfd7] rounded-md p-2 text-xs font-mono text-[#111827] focus:outline-none focus:border-agri-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#101322] hover:bg-[#1a1e33] text-white text-xs px-4 py-2 rounded-md font-medium transition flex items-center space-x-2"
            >
              {loading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>Run Random Forest Inference</span>
            </button>
          </form>
        </div>

        {/* Classification Output Result Card */}
        <div className="bg-white border border-[#e2dfd7] rounded-2xl p-5 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#111827]">
            Inference Classification
          </h2>

          {prediction ? (
            <div className="space-y-3 text-xs">
              <div className="bg-[#edece8] p-3.5 rounded-md border border-[#e2dfd7] space-y-2">
                <div className="text-[11px] text-[#6b7280]">Predicted Class:</div>
                <div className="text-base font-semibold text-agri-400 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-agri-500" />
                  <span>{prediction.predicted_class}</span>
                </div>
                <div className="flex justify-between text-[#4b5563] font-mono text-[11px] pt-1 border-t border-[#e2dfd7]">
                  <span className="text-[#6b7280]">Confidence Score:</span>
                  <span className="font-semibold text-[#111827]">{(prediction.confidence_score * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-[#4b5563] font-mono text-[11px]">
                  <span className="text-[#6b7280]">Synthesized NDVI:</span>
                  <span className="font-semibold text-agri-400">{prediction.ndvi.toFixed(3)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-[#6b7280] bg-[#edece8]/40 rounded-md border border-[#e2dfd7]">
              Click &quot;Run Random Forest Inference&quot; to evaluate spectral reflectance.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
