import React, { useState, useEffect } from 'react';
import { Database, Search, ShieldAlert, Droplets, CheckCircle, ArrowRight, Code, Play } from 'lucide-react';
import { getBufferAnalysis, getRiskIntersections } from '../services/api';
import { BufferResult, RiskIntersection } from '../types';

export const SpatialDatabasePage: React.FC = () => {
  const [bufferMeters, setBufferMeters] = useState(2500);
  const [bufferData, setBufferData] = useState<{ buffer_radius_meters: number; matching_fields_count: number; results: BufferResult[] } | null>(null);
  const [riskData, setRiskData] = useState<RiskIntersection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'buffer' | 'risk' | 'sql'>('buffer');

  const runBufferQuery = async (radius: number) => {
    setLoading(true);
    try {
      const res = await getBufferAnalysis(radius);
      setBufferData(res);
    } catch (err) {
      console.error("Buffer query error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadInitial() {
      try {
        const [buf, rsk] = await Promise.all([
          getBufferAnalysis(2500),
          getRiskIntersections()
        ]);
        setBufferData(buf);
        setRiskData(rsk);
      } catch (err) {
        console.error("Spatial queries load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">PostgreSQL / PostGIS Spatial Database Engine</h1>
        <p className="text-xs text-slate-400 mt-1">
          Relational and topological spatial SQL analysis powered by PostGIS 3.6, GEOS 3.14, and PROJ 8.2 with GiST R-Tree indexing.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('buffer')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === 'buffer' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Droplets className="w-3.5 h-3.5" />
          <span>Water Proximity Buffer (ST_DWithin)</span>
        </button>
        <button
          onClick={() => setActiveTab('risk')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === 'risk' ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Hazard Intersections (ST_Intersection)</span>
        </button>
        <button
          onClick={() => setActiveTab('sql')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === 'sql' ? 'bg-purple-950 text-purple-400 border border-purple-800' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Spatial SQL Verification Suite</span>
        </button>
      </div>

      {/* TAB 1: Water Proximity Buffer */}
      {activeTab === 'buffer' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-slate-100">Surface Irrigation Buffer Radius</h3>
              <p className="text-[11px] text-slate-400">
                Executes GiST-accelerated <code>ST_DWithin(af.geometry::geography, ws.geometry::geography, :radius)</code> in meters.
              </p>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <input
                type="range"
                min="500"
                max="8000"
                step="500"
                value={bufferMeters}
                onChange={(e) => setBufferMeters(Number(e.target.value))}
                className="w-48 accent-cyan-500"
              />
              <span className="font-mono text-cyan-400 font-bold text-xs w-20">{bufferMeters.toLocaleString()} m</span>
              <button
                onClick={() => runBufferQuery(bufferMeters)}
                className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition"
              >
                <Play className="w-3 h-3" />
                <span>Execute Query</span>
              </button>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-3.5 border-b border-slate-800 flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-200">
                Matching Cadastral Plots: {bufferData?.matching_fields_count || 0} fields
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Distance calculated on WGS 84 ellipsoid</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Field Name</th>
                    <th className="py-2.5 px-3">Village</th>
                    <th className="py-2.5 px-3">Field Area</th>
                    <th className="py-2.5 px-3">Water Source</th>
                    <th className="py-2.5 px-3">Source Type</th>
                    <th className="py-2.5 px-3 font-mono text-right">Distance to Water</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {bufferData?.results?.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-4 font-medium text-slate-100">{r.field_name}</td>
                      <td className="py-2.5 px-3">{r.village_name}</td>
                      <td className="py-2.5 px-3 font-mono">{r.area_hectares} ha</td>
                      <td className="py-2.5 px-3 text-cyan-300 font-medium">{r.water_source_name}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                          {r.water_source_type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-cyan-400 font-bold text-right">
                        {r.distance_meters.toLocaleString()} m
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Risk Zone Intersections */}
      {activeTab === 'risk' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <h3 className="text-xs font-semibold text-slate-100">Topological Overlap & Risk Exposure Analysis</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Executes <code>ST_Intersection(af.geometry, rz.geometry)</code> and calculates true area exposure in UTM Zone 44N metric hectares.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Field Identifier</th>
                  <th className="py-2.5 px-3">Village</th>
                  <th className="py-2.5 px-3">Hazard Classification</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3 font-mono">Total Area</th>
                  <th className="py-2.5 px-3 font-mono">Affected Area</th>
                  <th className="py-2.5 px-3 font-mono text-right">Exposure %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {riskData.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-medium text-slate-100">{r.field_name}</td>
                    <td className="py-2.5 px-3">{r.village_name}</td>
                    <td className="py-2.5 px-3 text-amber-300">{r.risk_type}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        r.risk_level === 'Severe' ? 'bg-red-950 text-red-400 border border-red-800' :
                        r.risk_level === 'Moderate' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-blue-950 text-blue-400 border border-blue-800'
                      }`}>
                        {r.risk_level}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono">{r.total_field_ha} ha</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-amber-400">{r.affected_area_ha} ha</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-right text-red-400">{r.percent_risk_exposure}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Live SQL Operations Suite */}
      {activeTab === 'sql' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="text-xs font-semibold text-emerald-400 font-mono flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>1. ST_Area & ST_Transform (UTM Zone 44N)</span>
              </div>
              <pre className="bg-slate-950 p-3 rounded-lg text-[10px] font-mono text-slate-300 overflow-x-auto border border-slate-800">
{`SELECT 
    field_name,
    area_hectares AS recorded_ha,
    ROUND((ST_Area(ST_Transform(geometry, 32644)) / 10000.0)::numeric, 2) AS utm_ha,
    ROUND((ST_Area(geometry::geography) / 10000.0)::numeric, 2) AS geodesic_ha
FROM agricultural_fields;`}
              </pre>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="text-xs font-semibold text-cyan-400 font-mono flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>2. ST_DWithin & ST_Distance (Proximity Join)</span>
              </div>
              <pre className="bg-slate-950 p-3 rounded-lg text-[10px] font-mono text-slate-300 overflow-x-auto border border-slate-800">
{`SELECT 
    af.field_name,
    ws.source_name,
    ROUND(ST_Distance(af.geometry::geography, ws.geometry::geography)::numeric, 1) AS dist_m
FROM agricultural_fields af
JOIN water_sources ws ON ST_DWithin(af.geometry::geography, ws.geometry::geography, 2500)
ORDER BY dist_m ASC;`}
              </pre>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="text-xs font-semibold text-amber-400 font-mono flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>3. ST_Intersects & ST_Intersection</span>
              </div>
              <pre className="bg-slate-950 p-3 rounded-lg text-[10px] font-mono text-slate-300 overflow-x-auto border border-slate-800">
{`SELECT 
    af.field_name,
    rz.risk_type,
    ROUND((ST_Area(ST_Transform(ST_Intersection(af.geometry, rz.geometry), 32644)) / 10000.0)::numeric, 2) AS affected_ha
FROM agricultural_fields af
JOIN risk_zones rz ON ST_Intersects(af.geometry, rz.geometry);`}
              </pre>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="text-xs font-semibold text-purple-400 font-mono flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>4. ST_Contains & ST_Within (Administrative Hierarchy)</span>
              </div>
              <pre className="bg-slate-950 p-3 rounded-lg text-[10px] font-mono text-slate-300 overflow-x-auto border border-slate-800">
{`SELECT 
    v.village_name,
    COUNT(af.id) AS field_count,
    BOOL_AND(ST_Within(af.geometry, v.geometry)) AS all_within_village
FROM villages v
JOIN agricultural_fields af ON af.village_id = v.id
GROUP BY v.village_name;`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
