import React from 'react';
import { 
  MapPin, 
  Calendar, 
  Search, 
  Bell, 
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onSelectPage: (page: string) => void;
  activeRegion: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onSelectPage }) => {
  const pageTitles: Record<string, { title: string; category: string }> = {
    'overview': { title: 'Agricultural Intelligence Overview', category: 'Command Center' },
    'map': { title: 'Interactive Map Studio', category: 'GIS Workspace' },
    'satellite': { title: 'Sentinel-2 Multi-Spectral Analysis', category: 'Remote Sensing' },
    'crop-health': { title: 'Crop Health & Vigor Assessment', category: 'Spatial Intelligence' },
    'land-use': { title: 'Cadastral Land Cover Classification', category: 'Spatial Intelligence' },
    'soil-weather': { title: 'Soil Fertility & Weather Stations', category: 'Pedology & Climate' },
    'ai-predictions': { title: 'Machine Learning Risk & Yield', category: 'AI Analytics' },
    'reports': { title: 'Analytical Geospatial Dossiers', category: 'Publication' },
    'settings': { title: 'System & Database Configuration', category: 'Administration' }
  };

  const currentMeta = pageTitles[currentPage] || { title: 'Geospatial Workspace', category: 'BhuNetra' };

  return (
    <header className="h-16 px-6 border-b border-[#e2dfd7] flex items-center justify-between sticky top-0 z-40 bg-[#edece8]/90 backdrop-blur-md select-none">
      
      {/* Left: Clean Breadcrumb & Context */}
      <div className="flex items-center space-x-3 min-w-0 pr-2">
        <div className="min-w-0">
          <div className="flex items-center space-x-1.5 text-[11px] font-mono text-[#6b7280] truncate whitespace-nowrap">
            <span>{currentMeta.category}</span>
            <span>/</span>
            <span className="text-[#ff6f61] font-semibold truncate">{currentMeta.title}</span>
          </div>
          <div className="flex items-center space-x-2 mt-0.5 truncate whitespace-nowrap">
            <MapPin className="w-3.5 h-3.5 text-[#ff6f61] shrink-0" />
            <span className="text-xs font-bold text-[#111827] truncate">Nagpur District, Maharashtra</span>
            <span className="text-[10px] text-[#6b7280] font-mono hidden md:inline shrink-0">(14 Talukas &bull; 4,860 ha)</span>
          </div>
        </div>
      </div>

      {/* Right: Real Operational Controls in Crisp White & Midnight Navy Pills */}
      <div className="flex items-center space-x-3 shrink-0">
        
        {/* Active Observation Cycle Pill */}
        <div className="hidden md:flex items-center space-x-2 bg-white border border-[#e2dfd7] px-3.5 py-1.5 rounded-full text-xs text-[#111827] shadow-sm font-medium">
          <Calendar className="w-3.5 h-3.5 text-[#ff6f61]" />
          <span>Pass: Oct 2026 &bull; S2 MSI Level-2A</span>
        </div>

        {/* Tools: Search & Alerts (Crisp White Pills) */}
        <div className="flex items-center space-x-1.5">
          <button 
            className="w-8 h-8 rounded-full bg-white border border-[#e2dfd7] flex items-center justify-center text-[#6b7280] hover:text-[#111827] hover:border-slate-400 transition shadow-sm"
            title="Search Cadastral Parcels or Talukas"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          <button 
            className="w-8 h-8 rounded-full bg-white border border-[#e2dfd7] flex items-center justify-center text-[#6b7280] hover:text-[#111827] hover:border-slate-400 transition shadow-sm relative"
            title="Active Agricultural Advisories"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="w-2 h-2 rounded-full bg-[#ff6f61] absolute top-1 right-1" />
          </button>
        </div>

        {/* Primary Action Button (Midnight Navy Pill like 'New Company' in Reference) */}
        <button
          onClick={() => onSelectPage('reports')}
          className="hidden sm:flex items-center space-x-1.5 bg-[#101322] hover:bg-[#1a1e33] text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#ff6f61]" />
          <span>Generate Dossier</span>
        </button>

        {/* User Identity Avatar */}
        <div className="flex items-center space-x-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-white border border-[#e2dfd7] shadow-sm flex items-center justify-center text-[11px] font-bold text-[#111827]">
            BN
          </div>
        </div>

      </div>
    </header>
  );
};
