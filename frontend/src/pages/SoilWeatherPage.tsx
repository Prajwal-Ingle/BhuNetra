import React, { useState, useEffect } from 'react';
import { CloudSun, Droplet, Thermometer, Beaker, Wind } from 'lucide-react';
import { getSoilData, getSoilStats, getWeatherData, getLatestWeather } from '../services/api';
import { SoilStation, WeatherStation } from '../types';

export const SoilWeatherPage: React.FC = () => {
  const [soilStations, setSoilStations] = useState<SoilStation[]>([]);
  const [soilStats, setSoilStats] = useState<any>(null);
  const [weatherList, setWeatherList] = useState<WeatherStation[]>([]);
  const [latestWeather, setLatestWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [soil, sStats, weather, lWeather] = await Promise.all([
          getSoilData(),
          getSoilStats(),
          getWeatherData(),
          getLatestWeather()
        ]);
        setSoilStations(soil);
        setSoilStats(sStats);
        setWeatherList(weather);
        setLatestWeather(lWeather);
      } catch (err) {
        console.error("Soil/Weather load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-2 border-agri-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-[#111827] tracking-tight">Soil Chemistry &amp; Agro-Meteorology</h1>
        <p className="text-xs text-[#6b7280] mt-0.5">
          Ground soil laboratory profiles calibrated from ICAR-NBSS&amp;LUP benchmark series &amp; IMD agro-meteorological station telemetry.
        </p>
      </div>

      {/* Atmospheric Weather Overview Strip */}
      <div className="bg-white border border-[#e2dfd7] rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <div className="text-[11px] font-medium text-[#6b7280] flex items-center space-x-1.5">
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            <span>Mean Temperature</span>
          </div>
          <div className="text-lg font-semibold text-[#111827] font-mono">
            {latestWeather?.avg_temperature_c || 31.4} &deg;C
          </div>
          <div className="text-[11px] text-[#6b7280]">Vidarbha Ambient</div>
        </div>

        <div className="space-y-1 border-l border-[#e2dfd7] pl-4">
          <div className="text-[11px] font-medium text-[#6b7280] flex items-center space-x-1.5">
            <Droplet className="w-3.5 h-3.5 text-hydro-400" />
            <span>Relative Humidity</span>
          </div>
          <div className="text-lg font-semibold text-[#111827] font-mono">
            {latestWeather?.avg_humidity_pct || 58.0}%
          </div>
          <div className="text-[11px] text-[#6b7280]">Canopy Transpiration</div>
        </div>

        <div className="space-y-1 border-l border-[#e2dfd7] pl-4">
          <div className="text-[11px] font-medium text-[#6b7280] flex items-center space-x-1.5">
            <CloudSun className="w-3.5 h-3.5 text-agri-400" />
            <span>Mean Rainfall</span>
          </div>
          <div className="text-lg font-semibold text-[#111827] font-mono">
            {latestWeather?.total_rainfall_mm || 0.0} mm
          </div>
          <div className="text-[11px] text-[#6b7280]">Post-Monsoon Regime</div>
        </div>

        <div className="space-y-1 border-l border-[#e2dfd7] pl-4">
          <div className="text-[11px] font-medium text-[#6b7280] flex items-center space-x-1.5">
            <Beaker className="w-3.5 h-3.5 text-amber-500" />
            <span>Soil pH Profile</span>
          </div>
          <div className="text-lg font-semibold text-amber-400 font-mono">
            {soilStats?.avg_ph?.toFixed(1) || '7.8'}
          </div>
          <div className="text-[11px] text-[#6b7280]">Slightly Alkaline Vertisol</div>
        </div>
      </div>

      {/* Two Column Layout: Soil Stations and Weather Network */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Soil Testing Stations Table */}
        <div className="bg-white border border-[#e2dfd7] rounded-2xl p-5 space-y-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#111827]">
              ICAR-NBSS&amp;LUP Soil Testing Stations
            </h2>
            <span className="text-[11px] text-[#6b7280]">Deep Black Cotton Soil (Vertisols) chemical constituents</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#edece8] text-[#6b7280] text-[11px] border-b border-[#e2dfd7]">
                <tr>
                  <th className="py-2.5 px-3 font-medium">Location</th>
                  <th className="py-2.5 px-2 font-medium">pH</th>
                  <th className="py-2.5 px-2 font-medium">N (kg/ha)</th>
                  <th className="py-2.5 px-2 font-medium">P (kg/ha)</th>
                  <th className="py-2.5 px-2 font-medium">K (kg/ha)</th>
                  <th className="py-2.5 px-2 font-medium">OC (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-border/60 text-[#4b5563]">
                {soilStations.map((st) => (
                  <tr key={st.id} className="hover:bg-[#faf9f6]/40 transition">
                    <td className="py-2.5 px-3 font-medium text-[#111827]">{st.location}</td>
                    <td className="py-2.5 px-2 font-mono text-amber-400 font-medium">{st.ph}</td>
                    <td className="py-2.5 px-2 font-mono text-[#6b7280]">{st.nitrogen_kgha}</td>
                    <td className="py-2.5 px-2 font-mono text-[#6b7280]">{st.phosphorus_kgha}</td>
                    <td className="py-2.5 px-2 font-mono text-[#6b7280]">{st.potassium_kgha}</td>
                    <td className="py-2.5 px-2 font-mono text-agri-400 font-medium">{st.organic_carbon_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Weather Stations Ledger */}
        <div className="bg-white border border-[#e2dfd7] rounded-2xl p-5 space-y-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#111827]">
              Agro-Meteorological Station Network
            </h2>
            <span className="text-[11px] text-[#6b7280]">IMD automatic weather stations across Nagpur talukas</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#edece8] text-[#6b7280] text-[11px] border-b border-[#e2dfd7]">
                <tr>
                  <th className="py-2.5 px-3 font-medium">Station</th>
                  <th className="py-2.5 px-3 font-medium">Temperature</th>
                  <th className="py-2.5 px-3 font-medium">Humidity</th>
                  <th className="py-2.5 px-3 font-medium">Rainfall</th>
                  <th className="py-2.5 px-3 font-medium">Observation Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-border/60 text-[#4b5563]">
                {weatherList.map((wt) => (
                  <tr key={wt.id} className="hover:bg-[#faf9f6]/40 transition">
                    <td className="py-2.5 px-3 font-medium text-[#111827]">Nagpur Station #{wt.id}</td>
                    <td className="py-2.5 px-3 font-mono text-[#111827]">{wt.temperature_c}&deg;C</td>
                    <td className="py-2.5 px-3 font-mono text-hydro-400">{wt.humidity_pct}%</td>
                    <td className="py-2.5 px-3 font-mono text-[#6b7280]">{wt.rainfall_mm} mm</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#6b7280]">{wt.observation_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
