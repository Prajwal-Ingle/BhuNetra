import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { OverviewPage } from './pages/OverviewPage';
import { InteractiveMapPage } from './pages/InteractiveMapPage';
import { SatellitePage } from './pages/SatellitePage';
import { CropHealthPage } from './pages/CropHealthPage';
import { LandUsePage } from './pages/LandUsePage';
import { SoilWeatherPage } from './pages/SoilWeatherPage';
import { AiPredictionsPage } from './pages/AiPredictionsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('overview');
  const [activeRegion] = useState<string>('Nagpur District');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewPage onNavigate={(page) => setCurrentPage(page)} />;
      case 'map':
        return <InteractiveMapPage />;
      case 'satellite':
        return <SatellitePage />;
      case 'crop-health':
        return <CropHealthPage />;
      case 'land-use':
        return <LandUsePage />;
      case 'soil-weather':
        return <SoilWeatherPage />;
      case 'ai-predictions':
        return <AiPredictionsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage onNavigate={(page) => setCurrentPage(page)} />;
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-txt-primary flex overflow-hidden font-sans">
      {/* Sleek Left-Hand Side Menu (Sidebar) */}
      <Sidebar 
        currentPage={currentPage} 
        onSelectPage={setCurrentPage} 
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area: Top Bar + Page Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Floating Pill Navigation Bar */}
        <Navbar 
          currentPage={currentPage} 
          onSelectPage={setCurrentPage} 
          activeRegion={activeRegion} 
        />

        {/* Dynamic Page Viewport */}
        <main className="flex-1 overflow-y-auto">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
};

export default App;
