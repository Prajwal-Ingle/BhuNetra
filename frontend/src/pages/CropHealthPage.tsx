import React, { useState, useEffect } from 'react';
import { Sprout, Search, ChevronRight, Activity, MapPin, Droplets } from 'lucide-react';
import { getFields, getVillages, getFieldDetail } from '../services/api';
import { FieldItem, Village } from '../types';

export const CropHealthPage: React.FC = () => {
  const [fields, setFields] = useState<FieldItem[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [selectedVillage, setSelectedVillage] = useState<number | undefined>(undefined);
  const [selectedField, setSelectedField] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVillages() {
      try {
        const v = await getVillages();
        setVillages(v);
      } catch (err) {
        console.error("Error loading villages:", err);
      }
    }
    loadVillages();
  }, []);

  useEffect(() => {
    async function loadFieldData() {
      setLoading(true);
      try {
        const res = await getFields(page, 20, selectedVillage);
        setFields(res.items);
        setTotal(res.total);
      } catch (err) {
        console.error("Error loading fields:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFieldData();
  }, [page, selectedVillage]);

  const handleFieldSelect = async (id: number) => {
    try {
      const detail = await getFieldDetail(id);
      setSelectedField(detail);
    } catch (err) {
      console.error("Error loading field detail:", err);
    }
  };

  const filteredFields = fields.filter(f => 
    f.field_name.toLowerCase().includes(search.toLowerCase()) ||
    f.village_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold text-[#111827] tracking-tight">Agricultural Crop Health Surveillance</h1>
        <p className="text-xs text-[#6b7280] mt-0.5">
          Cadastral parcel vegetation monitoring, multi-temporal NDVI condition profiling, and irrigation network proximity.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-[#e2dfd7] p-3 rounded-2xl">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#6b7280] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search parcel or taluka..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#edece8] border border-[#e2dfd7] rounded-md text-xs pl-8 pr-3 py-1.5 text-[#111827] placeholder-slate-500 focus:outline-none focus:border-agri-500"
            />
          </div>

          <select
            value={selectedVillage || ''}
            onChange={(e) => {
              setSelectedVillage(e.target.value ? Number(e.target.value) : undefined);
              setPage(1);
            }}
            className="bg-[#edece8] border border-[#e2dfd7] rounded-md text-xs px-3 py-1.5 text-[#111827] focus:outline-none focus:border-agri-500"
          >
            <option value="">All Talukas / Villages</option>
            {villages.map((v) => (
              <option key={v.id} value={v.id}>{v.village_name}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-[#6b7280] font-mono">
          Showing {filteredFields.length} of {total} cadastral parcels
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Fields Table */}
        <div className="lg:col-span-2 bg-white border border-[#e2dfd7] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#edece8] text-[#6b7280] text-[11px] border-b border-[#e2dfd7]">
                <tr>
                  <th className="py-2.5 px-3 font-medium">Field Identifier</th>
                  <th className="py-2.5 px-3 font-medium">Taluka</th>
                  <th className="py-2.5 px-3 font-medium">Area (ha)</th>
                  <th className="py-2.5 px-3 font-medium">Latest NDVI</th>
                  <th className="py-2.5 px-3 font-medium">Vigor Status</th>
                  <th className="py-2.5 px-3 font-medium">Nearest Water</th>
                  <th className="py-2.5 px-3 font-medium text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-border/60 text-[#4b5563]">
                {filteredFields.map((f) => {
                  const ndvi = f.latest_ndvi;
                  const isHealthy = ndvi && ndvi >= 0.65;
                  const isModerate = ndvi && ndvi >= 0.45 && ndvi < 0.65;
                  const isSelected = selectedField?.id === f.id;
                  return (
                    <tr 
                      key={f.id} 
                      onClick={() => handleFieldSelect(f.id)}
                      className={`hover:bg-[#faf9f6]/50 cursor-pointer transition ${
                        isSelected ? 'bg-[#faf9f6] text-[#111827]' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-medium text-[#111827] flex items-center space-x-2">
                        <Sprout className="w-3.5 h-3.5 text-agri-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{f.field_name}</span>
                      </td>
                      <td className="py-2.5 px-3 text-[#4b5563]">{f.village_name}</td>
                      <td className="py-2.5 px-3 font-mono text-[#6b7280]">{f.area_hectares} ha</td>
                      <td className="py-2.5 px-3 font-mono font-medium">
                        <span className={isHealthy ? 'text-agri-400' : isModerate ? 'text-amber-400' : 'text-red-400'}>
                          {ndvi ? ndvi.toFixed(3) : 'Pending'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          isHealthy ? 'bg-agri-900/60 text-agri-400' :
                          isModerate ? 'bg-amber-950/60 text-amber-400' :
                          'bg-red-950/60 text-red-400'
                        }`}>
                          {f.health_status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-[#6b7280]">
                        {f.nearest_water_distance_m ? `${f.nearest_water_distance_m.toLocaleString()} m` : 'N/A'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 inline" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Selected Field Deep Dive Dossier */}
        <div className="bg-white border border-[#e2dfd7] rounded-2xl p-5 space-y-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-agri-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#111827]">
              Cadastral Parcel Dossier
            </h2>
          </div>

          {selectedField ? (
            <div className="space-y-4 text-xs">
              <div className="bg-[#edece8] p-3.5 rounded-md border border-[#e2dfd7] space-y-2">
                <div className="font-semibold text-sm text-[#111827]">{selectedField.field_name}</div>
                <div className="text-[#6b7280] text-[11px]">
                  Taluka: <span className="text-[#111827] font-medium">{selectedField.village_name}</span> &bull; District: {selectedField.district_name}
                </div>
                <div className="flex justify-between pt-1 text-[11px] font-mono border-t border-[#e2dfd7] text-[#4b5563]">
                  <span className="text-[#6b7280]">Cadastral Area:</span>
                  <span className="font-semibold text-agri-400">{selectedField.area_hectares} ha</span>
                </div>
              </div>

              {/* Water Proximity Analysis */}
              <div className="bg-[#edece8] p-3.5 rounded-md border border-[#e2dfd7] space-y-1.5">
                <div className="text-[11px] uppercase tracking-wider text-[#6b7280] font-medium">Hydrographic Proximity</div>
                <div className="flex justify-between text-[#4b5563]">
                  <span className="text-[#6b7280]">Water Feature:</span>
                  <span className="text-[#111827] font-medium">
                    {selectedField.nearest_water?.source_name || selectedField.nearest_water_source || 'Canal / Stream'}
                  </span>
                </div>
                <div className="flex justify-between text-[#4b5563]">
                  <span className="text-[#6b7280]">Geodetic Distance:</span>
                  <span className="font-mono text-hydro-400 font-medium">
                    {(selectedField.nearest_water?.distance_meters ?? selectedField.nearest_water_distance_m) != null
                      ? `${Number(selectedField.nearest_water?.distance_meters ?? selectedField.nearest_water_distance_m).toFixed(0)} meters`
                      : 'Calculated in GIS'}
                  </span>
                </div>
              </div>

              {/* Multi-temporal Observations for this Parcel */}
              <div className="space-y-2">
                <div className="text-[11px] uppercase tracking-wider text-[#6b7280] font-medium">Observation History</div>
                {((selectedField.vegetation_history || selectedField.observations) && (selectedField.vegetation_history || selectedField.observations).length > 0) ? (
                  <div className="space-y-1.5">
                    {(selectedField.vegetation_history || selectedField.observations).map((obs: any, idx: number) => (
                      <div key={idx} className="bg-[#edece8] p-2.5 rounded-md border border-[#e2dfd7] flex items-center justify-between text-[11px]">
                        <span className="font-mono text-[#4b5563]">{obs.date || obs.analysis_date || 'Observation'}</span>
                        <div className="flex items-center space-x-3 font-mono">
                          <span className="text-agri-400 font-medium">NDVI {obs.ndvi != null ? Number(obs.ndvi).toFixed(3) : 'N/A'}</span>
                          <span className="text-hydro-400 font-medium">NDWI {obs.ndwi != null ? Number(obs.ndwi).toFixed(3) : 'N/A'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-500 text-xs">No multi-temporal passes available.</div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-[#6b7280] bg-[#edece8]/40 rounded-md border border-[#e2dfd7]">
              Select any parcel from the table to load its spatial dossier and vegetation history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
