import React from 'react';
import { FreshTrackProvider, useFreshTrack } from './context/FreshTrackContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import OverviewView from './components/views/OverviewView';
import LiveMonitoringView from './components/views/LiveMonitoringView';
import AssessmentView from './components/views/AssessmentView';
import HistoricalView from './components/views/HistoricalView';
import AlertsView from './components/views/AlertsView';
import FoodProfilesView from './components/views/FoodProfilesView';
import DeviceInfoView from './components/views/DeviceInfoView';
import SettingsView from './components/views/SettingsView';

function DashboardContent() {
  const { activeTab } = useFreshTrack();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView />;
      case 'live':
        return <LiveMonitoringView />;
      case 'assessment':
        return <AssessmentView />;
      case 'historical':
        return <HistoricalView />;
      case 'alerts':
        return <AlertsView />;
      case 'profiles':
        return <FoodProfilesView />;
      case 'device':
        return <DeviceInfoView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Industrial Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>FreshTrack IoT Food Storage Environment Platform</span>
          <span className="text-[11px] text-slate-400">
            Monitoring & Environmental Risk Assessment only. Ambient air sensors do not evaluate microbiological food safety.
          </span>
          <span className="font-mono text-[10px]">Firebase RTDB Connected</span>
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
