import React from 'react';
import { FreshTrackProvider } from './context/FreshTrackContext';
import { useFreshTrack } from './context/useFreshTrack';
import Navbar from './components/Navbar';
import MainDashboardView from './components/views/MainDashboardView';
import HistoricalView from './components/views/HistoricalView';
import FoodProfilesView from './components/views/FoodProfilesView';
import SettingsView from './components/views/SettingsView';

function DashboardContent() {
  const { activeTab } = useFreshTrack();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <MainDashboardView />;
      case 'analytics':
        return <HistoricalView />;
      case 'profiles':
        return <FoodProfilesView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <MainDashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Clean Navbar */}
      <Navbar />

      {/* Main Single Clean Workspace (No Bulky Sidebar, No Unexpected Redirects) */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {renderActiveView()}
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold text-slate-300">FreshTrack IoT Storage Platform</span>
          <span className="text-[11px] text-slate-400">
            Environmental Risk Assessment only. Ambient air sensors do not evaluate microbiological food safety.
          </span>
          <span className="font-mono text-[10px] text-emerald-400">Firebase RTDB Connected</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <FreshTrackProvider>
      <DashboardContent />
    </FreshTrackProvider>
  );
}
