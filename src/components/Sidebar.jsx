import React from 'react';
import { 
  LayoutDashboard, 
  Gauge, 
  ShieldCheck, 
  LineChart, 
  Bell, 
  Apple, 
  Cpu, 
  Settings,
  Database,
  ChevronRight
} from 'lucide-react';
import { useFreshTrack } from '../context/FreshTrackContext';
import { DATABASE_PATH } from '../services/firebase';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: null },
  { id: 'live', label: 'Live Monitoring', icon: Gauge, badge: 'Realtime' },
  { id: 'assessment', label: 'Food Assessment', icon: ShieldCheck, badge: null },
  { id: 'historical', label: 'Historical Analytics', icon: LineChart, badge: null },
  { id: 'alerts', label: 'Alerts', icon: Bell, badgeAlerts: true },
  { id: 'profiles', label: 'Food Profiles', icon: Apple, badge: '9 Profiles' },
  { id: 'device', label: 'Device Information', icon: Cpu, badge: 'ESP32' },
  { id: 'settings', label: 'Settings', icon: Settings, badge: null },
];

export default function Sidebar() {
  const { 
    activeTab, 
    setActiveTab, 
    isMobileNavOpen, 
    setIsMobileNavOpen,
    isConnected,
    assessment,
    activeProfile
  } = useFreshTrack();

  const totalAlerts = assessment?.alerts?.length || 0;
  const criticalCount = assessment?.alerts?.filter(a => a.severity === 'critical').length || 0;

  const handleNavClick = (id) => {
    setActiveTab(id);
    setIsMobileNavOpen(false);
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between p-4 bg-slate-950/95 border-r border-slate-800 text-slate-300">
      <div>
        {/* Navigation Section Title */}
        <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Navigation Modules
        </div>

        {/* Menu Items */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-950/80 to-slate-900 text-emerald-300 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badgeAlerts && totalAlerts > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      criticalCount > 0 
                        ? 'bg-rose-950 text-rose-300 border border-rose-800/60 animate-pulse'
                        : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                    }`}>
                      {totalAlerts}
                    </span>
                  )}
                  {item.badge && (
                    <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Active Profile Context Card */}
        <div className="mt-6 p-3 rounded-lg bg-slate-900/80 border border-slate-800/80">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
            Active Target Profile
          </div>
          <div className="text-sm font-bold text-white flex items-center justify-between">
            <span>{activeProfile.name}</span>
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800/40">
              {activeProfile.temp.min}°C to {activeProfile.temp.max}°C
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
            {activeProfile.shortDesc}
          </div>
        </div>
      </div>

      {/* Industrial Telemetry Footer */}
      <div className="pt-4 border-t border-slate-800/80 space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span>Path:</span>
          </span>
          <span className="font-mono text-[11px] text-slate-300">/{DATABASE_PATH}</span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <span>Backend Link:</span>
          <span className={`font-mono text-[11px] ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isConnected ? 'Connected' : 'Reconnecting'}
          </span>
        </div>

        <div className="p-2 rounded bg-slate-950/60 border border-slate-900 text-[10px] text-slate-400">
          <span className="text-slate-400 font-semibold block mb-0.5">Scientific Restraint</span>
          Environmental monitoring platform. Does not determine food safety without core inspection.
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileNavOpen(false)} 
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
