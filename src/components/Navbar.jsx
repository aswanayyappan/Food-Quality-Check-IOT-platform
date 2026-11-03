import React from 'react';
import { 
  Activity, 
  Layers,
  LayoutDashboard,
  LineChart,
  BookOpen,
  Settings as SettingsIcon
} from 'lucide-react';
import { useFreshTrack } from '../context/useFreshTrack';
import { FOOD_PROFILES } from '../constants/foodProfiles';

export default function Navbar() {
  const {
    activeTab,
    setActiveTab,
    isConnected,
    connectionMethod,
    liveData,
    lastReceivedAt,
    nowTick,
    activeProfileId,
    setActiveProfileId,
    assessment
  } = useFreshTrack();

  const secondsAgo = lastReceivedAt ? Math.max(0, Math.floor((nowTick - lastReceivedAt) / 1000)) : null;
  const isStale = secondsAgo !== null && secondsAgo > 120;
  const criticalCount = assessment?.alerts?.filter(a => a.severity === 'critical').length || 0;

  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
    { id: 'profiles', label: 'Food Guidelines', icon: BookOpen },
    { id: 'settings', label: 'Device & Settings', icon: SettingsIcon }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 sm:h-16 gap-3">
          {/* Logo & Category Selector */}
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-950/40 border border-emerald-400/30">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white font-mono">FRESHTRACK</span>
                <span className="text-[10px] text-slate-400 block -mt-1 font-mono">IoT Food Monitor</span>
              </div>
            </div>

            {/* Food Profile Selector */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5">
              <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
              <select
                value={activeProfileId}
                onChange={(e) => setActiveProfileId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-1"
                title="Select food category"
              >
                {Object.values(FOOD_PROFILES).map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                    {p.name} {p.id === 'mixed' ? '(Mixed Food)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation Tabs (Clear & Direct, No Hidden Redirects) */}
          <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/80 self-center sm:self-auto overflow-x-auto max-w-full">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-600 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.id === 'dashboard' && criticalCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse ml-0.5" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Status Badge */}
          <div className="hidden md:flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isConnected 
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40' 
                : 'bg-rose-950/60 text-rose-300 border-rose-800/40'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span>{isConnected ? (connectionMethod.includes('WebSocket') ? 'Live WS' : 'REST Live') : 'Offline'}</span>
            </div>

            <div className="text-[11px] text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800">
              {secondsAgo !== null ? (
                <span className={isStale ? 'text-amber-400' : 'text-slate-300'}>
                  {secondsAgo < 5 ? 'Live' : `${secondsAgo}s ago`}
                </span>
              ) : (
                'Waiting'
              )}
            </div>

            {liveData?.parsed?.deviceStatus && (
              <span className="text-[11px] font-mono font-bold px-2 py-1 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
                ESP32: {liveData.parsed.deviceStatus}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
