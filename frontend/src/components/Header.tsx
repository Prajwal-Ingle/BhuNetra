import React from 'react';
import { Globe, Satellite, Server, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  activeRegion: string;
}

export const Header: React.FC<HeaderProps> = ({ activeRegion }) => {
  return (
    <header className="h-14 bg-earth-900 border-b border-earth-border flex items-center justify-between px-6 sticky top-0 z-30 select-none">
      <div className="flex items-center space-x-4">
        {/* Region Indicator */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Monitoring Region:</span>
          <span className="font-semibold text-slate-100 flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-agri-500"></span>
            <span>{activeRegion}</span>
            <span className="text-slate-400 font-normal">(Vidarbha, MH)</span>
          </span>
        </div>

        <div className="h-4 w-px bg-earth-border" />

        {/* Spatial CRS Badges */}
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono text-[11px] text-slate-300">EPSG:4326 &bull; UTM 44N</span>
        </div>

        <div className="h-4 w-px bg-earth-border" />

        {/* Satellite Sensor Badge */}
        <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-400">
          <Satellite className="w-3.5 h-3.5 text-hydro-400" />
          <span className="text-slate-300">Sentinel-2 MSI Level-2A</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Cloud PostGIS Status */}
        <div className="flex items-center space-x-2 bg-earth-850 border border-earth-border text-xs px-2.5 py-1 rounded-md text-slate-300">
          <Server className="w-3.5 h-3.5 text-agri-400" />
          <span className="text-[11px] font-medium text-slate-300">Supabase PostGIS</span>
          <span className="w-1.5 h-1.5 rounded-full bg-agri-500"></span>
        </div>

        {/* System Health */}
        <div className="hidden sm:flex items-center space-x-1.5 bg-earth-850 border border-earth-border text-xs px-2.5 py-1 rounded-md text-slate-300 font-mono text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-agri-400" />
          <span>RAM &lt; 350 MB</span>
        </div>
      </div>
    </header>
  );
};
