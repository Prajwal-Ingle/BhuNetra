import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Satellite, 
  Sprout, 
  Layers, 
  CloudSun, 
  Cpu, 
  FileText, 
  Settings,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onSelectPage: (page: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const navSections = [
  {
    group: 'Command Center',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: 'Live' },
      { id: 'map', label: 'Interactive Map Studio', icon: Map, badge: 'GIS' },
      { id: 'satellite', label: 'Satellite Analysis', icon: Satellite, badge: 'MSI' },
      { id: 'reports', label: 'Analytical Reports', icon: FileText, badge: 'PDF' }
    ]
  },
  {
    group: 'Spatial Intelligence',
    items: [
      { id: 'crop-health', label: 'Crop Health Vigor', icon: Sprout },
      { id: 'land-use', label: 'Land Use & Cover', icon: Layers },
      { id: 'soil-weather', label: 'Soil & Weather', icon: CloudSun },
      { id: 'ai-predictions', label: 'AI Risk & Yield', icon: Cpu, badge: 'ML' }
    ]
  },
  {
    group: 'Configuration',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings }
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentPage, 
  onSelectPage,
  collapsed = false,
  onToggleCollapse
}) => {
  return (
    <aside 
      className={`bg-[#edece8] border-r border-[#e2dfd7] flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none transition-all duration-300 z-50 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div className={`h-16 border-b border-[#e2dfd7] flex items-center ${
          collapsed ? 'justify-center px-2' : 'justify-between px-4'
        }`}>
          <div 
            onClick={() => onSelectPage('overview')}
            className="flex items-center space-x-3 cursor-pointer group min-w-0"
            title="BhuNetra Overview"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2d60ff] to-[#ff6f61] p-0.5 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Eye className="w-5 h-5 text-[#ff6f61]" />
              </div>
            </div>
            {!collapsed && (
              <div className="min-w-0 overflow-hidden">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-base text-[#111827] tracking-tight block leading-tight truncate">
                    BhuNetra
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff6f61]" />
                </div>
                <span className="text-[10px] text-[#6b7280] font-medium block leading-tight truncate mt-0.5">
                  Geospatial Intelligence
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-5 overflow-y-auto flex-1 no-scrollbar">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!collapsed && (
                <div className="px-3 text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5 font-mono">
                  {section.group}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectPage(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-2xl text-xs font-medium transition-all relative group ${
                      isActive
                        ? 'bg-white text-[#111827] font-bold shadow-sm border border-[#e2dfd7]'
                        : 'text-[#6b7280] hover:text-[#111827] hover:bg-white/60 border border-transparent'
                    } ${collapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-[#ff6f61]' : 'text-[#6b7280] group-hover:text-[#111827]'
                    }`} />
                    
                    {!collapsed && (
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className="truncate">{item.label}</span>
                        {isActive ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ff6f61] shrink-0" />
                        ) : (
                          item.badge && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-[#e5e3de] text-[#6b7280] border border-[#d5d2c9] group-hover:text-[#111827]">
                              {item.badge}
                            </span>
                          )
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer: User & Clean Collapse Button */}
      {onToggleCollapse && (
        <div className="p-3 border-t border-[#e2dfd7] space-y-2">
          {!collapsed && (
            <div className="flex items-center space-x-2.5 p-2 rounded-2xl bg-white border border-[#e2dfd7] shadow-sm">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#ff6f61] to-[#f04f78] text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-sm relative">
                BN
                <span className="w-2 h-2 rounded-full bg-[#10b981] ring-2 ring-white absolute -top-0.5 -right-0.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-[#111827] truncate leading-tight">Admin Console</div>
                <div className="text-[9px] text-[#6b7280] font-mono truncate leading-tight">Nagpur District</div>
              </div>
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="w-full py-2 px-3 rounded-xl bg-white hover:bg-[#faf9f6] border border-[#e2dfd7] flex items-center justify-center text-[#6b7280] hover:text-[#111827] transition text-xs font-semibold shadow-sm"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-[#111827]" />
            ) : (
              <div className="flex items-center space-x-2">
                <ChevronLeft className="w-3.5 h-3.5 text-[#6b7280]" />
                <span>Collapse Sidebar</span>
              </div>
            )}
          </button>
        </div>
      )}
    </aside>
  );
};
