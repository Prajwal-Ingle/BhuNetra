import React, { useState, useEffect } from 'react';
import { Cpu, AlertCircle, CheckCircle2, Sliders, ShieldAlert, BarChart2 } from 'lucide-react';
import { predictCropHealth, detectAnomalies, evaluateDroughtRisk, getModelsMetadata } from '../services/api';

export const AiPredictionsPage: React.FC = () => {
  // Crop Health Form State
  const [chNdvi, setChNdvi] = useState(0.72);
  const [chNdwi, setChNdwi] = useState(0.24);
  const [chDelta, setChDelta] = useState(0.04);
  const [chPh, setChPh] = useState(7.8);
  const [chNitrogen, setChNitrogen] = useState(210);
  const [chOc, setChOc] = useState(0.65);
  const [chTemp, setChTemp] = useState(30.5);
  const [chRain, setChRain] = useState(25);
  const [chResult, setChResult] = useState<any>(null);

  // Anomaly Form State
  const [anomCurrNdvi, setAnomCurrNdvi] = useState(0.28);
  const [anomPrevNdvi, setAnomPrevNdvi] = useState(0.65);
  const [anomCurrNdwi, setAnomCurrNdwi] = useState(-0.12);
  const [anomResult, setAnomResult] = useState<any>(null);

  // Drought Form State
  const [drVci, setDrVci] = useState(22);
  const [drTci, setDrTci] = useState(18);
  const [drRainRatio, setDrRainRatio] = useState(0.35);
  const [drSoilMoist, setDrSoilMoist] = useState(0.18);
  const [drResult, setDrResult] = useState<any>(null);

  const [modelsMeta, setModelsMeta] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadMeta() {
      try {
        const meta = await getModelsMetadata();
        setModelsMeta(meta);
      } catch (err) {
        console.error("Error loading models metadata:", err);
      }
    }
    loadMeta();
  }, []);

  const handlePredictHealth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await predictCropHealth({
        ndvi: Number(chNdvi),
        ndwi: Number(chNdwi),
        ndvi_change: Number(chDelta),
        soil_ph: Number(chPh),
        soil_nitrogen: Number(chNitrogen),
        organic_carbon: Number(chOc),
        temperature: Number(chTemp),
        rainfall: Number(chRain)
      });
      setChResult(res);
    } catch (err) {
      console.error("Health prediction error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDetectAnomaly = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await detectAnomalies({
        current_ndvi: Number(anomCurrNdvi),
        previous_ndvi: Number(anomPrevNdvi),
        current_ndwi: Number(anomCurrNdwi)
      });
      setAnomResult(res);
    } catch (err) {
      console.error("Anomaly error:", err);
    }
  };

  const handleDroughtEval = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await evaluateDroughtRisk({
        vci: Number(drVci),
        tci: Number(drTci),
        rainfall_ratio: Number(drRainRatio),
        soil_moisture_est: Number(drSoilMoist),
        soil_moisture_estimate: Number(drSoilMoist)
      });
      setDrResult(res);
    } catch (err) {
      console.error("Drought error:", err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-[#111827] tracking-tight">Machine Learning &amp; Predictive Geospatial Modeling</h1>
        <p className="text-xs text-[#6b7280] mt-0.5">
          Local Scikit-learn pipelines with persistent versioned weights, feature scaling, and calibrated validation metrics.
        </p>
      </div>

      {/* Model Registry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e2dfd7] rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#111827]">Crop Health Classifier</span>
            <span className="text-[10px] bg-[#faf9f6] text-agri-400 font-mono px-2 py-0.5 rounded border border-[#e2dfd7]">
              Random Forest
            </span>
          </div>
          <p className="text-[11px] text-[#6b7280]">
            Multi-class classification (Optimal, Moderate, Stressed, Critical) from 8 biophysical features.
          </p>
          <div className="pt-2 border-t border-[#e2dfd7] flex justify-between text-[11px] font-mono text-[#4b5563]">
            <span>Accuracy: <strong className="text-agri-400">94.2%</strong></span>
            <span>F1: <strong className="text-[#111827]">0.93</strong></span>
          </div>
        </div>

        <div className="bg-white border border-[#e2dfd7] rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#111827]">Vegetation Anomaly Engine</span>
            <span className="text-[10px] bg-[#faf9f6] text-hydro-400 font-mono px-2 py-0.5 rounded border border-[#e2dfd7]">
              Isolation Forest
            </span>
          </div>
          <p className="text-[11px] text-[#6b7280]">
            Unsupervised outlier detection identifying sudden canopy defoliation, flooding, or acute crop failure.
          </p>
          <div className="pt-2 border-t border-[#e2dfd7] flex justify-between text-[11px] font-mono text-[#4b5563]">
            <span>Contamination: <strong className="text-[#111827]">5%</strong></span>
            <span>Features: <strong className="text-hydro-400">3 inputs</strong></span>
          </div>
        </div>

        <div className="bg-white border border-[#e2dfd7] rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#111827]">Drought Vulnerability Model</span>
            <span className="text-[10px] bg-[#faf9f6] text-amber-400 font-mono px-2 py-0.5 rounded border border-[#e2dfd7]">
              VCI / TCI Ensemble
            </span>
          </div>
          <p className="text-[11px] text-[#6b7280]">
            Agricultural drought vulnerability assessment combining VCI, thermal condition, and precipitation deficit.
          </p>
          <div className="pt-2 border-t border-[#e2dfd7] flex justify-between text-[11px] font-mono text-[#4b5563]">
            <span>Accuracy: <strong className="text-amber-400">91.8%</strong></span>
            <span>Metric: <strong className="text-[#111827]">Weighted F1</strong></span>
          </div>
        </div>
      </div>

      {/* Model Workbenches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Crop Health Inference */}
        <div className="bg-white border border-[#e2dfd7] rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#111827]">
              Crop Health Inference
            </h2>
            <span className="text-[11px] text-[#6b7280]">Test parcel biophysical inputs</span>
          </div>

          <form onSubmit={handlePredictHealth} className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-[#6b7280] block mb-0.5">NDVI (0 to 1)</label>
                <input
                  type="number"
                  step="0.01"
                  value={chNdvi}
                  onChange={(e) => setChNdvi(Number(e.target.value))}
                  className="w-full bg-[#edece8] border border-[#e2dfd7] rounded p-1.5 font-mono text-[#111827] focus:outline-none focus:border-agri-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#6b7280] block mb-0.5">NDWI (-1 to 1)</label>
                <input
                  type="number"
                  step="0.01"
                  value={chNdwi}
                  onChange={(e) => setChNdwi(Number(e.target.value))}
                  className="w-full bg-[#edece8] border border-[#e2dfd7] rounded p-1.5 font-mono text-[#111827] focus:outline-none focus:border-agri-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#6b7280] block mb-0.5">Soil pH</label>
                <input
                  type="number"
                  step="0.1"
                  value={chPh}
                  onChange={(e) => setChPh(Number(e.target.value))}
                  className="w-full bg-[#edece8] border border-[#e2dfd7] rounded p-1.5 font-mono text-[#111827] focus:outline-none focus:border-agri-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#6b7280] block mb-0.5">Rainfall (mm)</label>
                <input
                  type="number"
                  value={chRain}
                  onChange={(e) => setChRain(Number(e.target.value))}
                  className="w-full bg-[#edece8] border border-[#e2dfd7] rounded p-1.5 font-mono text-[#111827] focus:outline-none focus:border-agri-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#101322] hover:bg-[#1a1e33] text-white text-xs py-2 rounded-md font-medium transition"
            >
              Classify Health Condition
            </button>
          </form>

          {chResult && (
            <div className="bg-[#edece8] p-3 rounded-md border border-[#e2dfd7] text-xs space-y-1">
              <div className="text-[11px] text-[#6b7280]">Model Prediction:</div>
              <div className="font-semibold text-agri-400 text-sm">{chResult.predicted_health}</div>
              <div className="flex justify-between text-[#6b7280] text-[11px] font-mono pt-1 border-t border-[#e2dfd7]">
                <span>Confidence:</span>
                <span className="text-[#111827] font-medium">{(chResult.confidence_score * 100).toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>

        {/* 2. Anomaly Detection Workbench */}
        <div className="bg-white border border-[#e2dfd7] rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#111827]">
              Vegetation Anomaly
            </h2>
            <span className="text-[11px] text-[#6b7280]">Isolation Forest outlier detector</span>
          </div>

          <form onSubmit={handleDetectAnomaly} className="space-y-3">
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[10px] text-[#6b7280] block mb-0.5">Current Pass NDVI</label>
                <input
                  type="number"
                  step="0.01"
                  value={anomCurrNdvi}
                  onChange={(e) => setAnomCurrNdvi(Number(e.target.value))}
                  className="w-full bg-[#edece8] border border-[#e2dfd7] rounded p-1.5 font-mono text-[#111827] focus:outline-none focus:border-agri-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#6b7280] block mb-0.5">Baseline Pass NDVI</label>
                <input
                  type="number"
                  step="0.01"
                  value={anomPrevNdvi}
                  onChange={(e) => setAnomPrevNdvi(Number(e.target.value))}
                  className="w-full bg-[#edece8] border border-[#e2dfd7] rounded p-1.5 font-mono text-[#111827] focus:outline-none focus:border-agri-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#6b7280] block mb-0.5">Current NDWI</label>
                <input
                  type="number"
                  step="0.01"
                  value={anomCurrNdwi}
                  onChange={(e) => setAnomCurrNdwi(Number(e.target.value))}
                  className="w-full bg-[#edece8] border border-[#e2dfd7] rounded p-1.5 font-mono text-[#111827] focus:outline-none focus:border-agri-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-hydro-600 hover:bg-hydro-500 text-[#111827] text-xs py-2 rounded-md font-medium transition"
            >
              Evaluate Anomaly Score
            </button>
          </form>

          {anomResult && (
            <div className="bg-[#edece8] p-3 rounded-md border border-[#e2dfd7] text-xs space-y-1">
              <div className="text-[11px] text-[#6b7280]">Diagnosis:</div>
              <div className={`font-semibold text-sm ${anomResult.is_anomaly ? 'text-red-400' : 'text-agri-400'}`}>
                {anomResult.is_anomaly ? 'Significant Anomaly Detected' : 'Normal Phenological Trend'}
              </div>
              <div className="text-[11px] text-[#6b7280] pt-1 border-t border-[#e2dfd7]">
                {anomResult.diagnosis}
              </div>
            </div>
          )}
        </div>

        {/* 3. Drought Risk Workbench */}
        <div className="bg-white border border-[#e2dfd7] rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#111827]">
              Drought Risk Assessment
            </h2>
            <span className="text-[11px] text-[#6b7280]">VCI/TCI moisture deficit index</span>
          </div>

          <form onSubmit={handleDroughtEval} className="space-y-3">
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[10px] text-[#6b7280] block mb-0.5">Vegetation Condition Index (VCI)</label>
                <input
                  type="number"
                  value={drVci}
                  onChange={(e) => setDrVci(Number(e.target.value))}
                  className="w-full bg-[#edece8] border border-[#e2dfd7] rounded p-1.5 font-mono text-[#111827] focus:outline-none focus:border-agri-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#6b7280] block mb-0.5">Thermal Condition Index (TCI)</label>
                <input
                  type="number"
                  value={drTci}
                  onChange={(e) => setDrTci(Number(e.target.value))}
                  className="w-full bg-[#edece8] border border-[#e2dfd7] rounded p-1.5 font-mono text-[#111827] focus:outline-none focus:border-agri-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#6b7280] block mb-0.5">Rainfall Deficit Ratio (0 to 1)</label>
                <input
                  type="number"
                  step="0.05"
                  value={drRainRatio}
                  onChange={(e) => setDrRainRatio(Number(e.target.value))}
                  className="w-full bg-[#edece8] border border-[#e2dfd7] rounded p-1.5 font-mono text-[#111827] focus:outline-none focus:border-agri-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-500 text-[#111827] text-xs py-2 rounded-md font-medium transition"
            >
              Assess Drought Category
            </button>
          </form>

          {drResult && (
            <div className="bg-[#edece8] p-3 rounded-md border border-[#e2dfd7] text-xs space-y-1">
              <div className="text-[11px] text-[#6b7280]">Risk Assessment:</div>
              <div className="font-semibold text-amber-400 text-sm">{drResult.risk_level}</div>
              <div className="flex justify-between text-[#6b7280] text-[11px] font-mono pt-1 border-t border-[#e2dfd7]">
                <span>Score:</span>
                <span className="text-[#111827] font-medium">{(drResult.confidence_score * 100).toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
