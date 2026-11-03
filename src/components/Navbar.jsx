import React from 'react';
import { 
  Activity, 
  AlertTriangle, 
  Menu, 
  X, 
  Clock, 
  Layers
} from 'lucide-react';
import { useFreshTrack } from '../context/FreshTrackContext';
import { FOOD_PROFILES } from '../constants/foodProfiles';

export default function Navbar() {
  const {
    setActiveTab,
    isMobileNavOpen,
    setIsMobileNavOpen,
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
  const warningCount = assessment?.alerts?.filter(a => a.severity === 'warning').length || 0;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Toggle navigation menu"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div 
              onClick={() => setActiveTab('overview')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-950/40 border border-emerald-400/30 group-hover:scale-105 transition">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight text-white font-mono">FRESHTRACK</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                    IoT v2.1
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 hidden sm:block">
                  Industrial Food Storage Environment Monitor
                </div>
              </div>
            </div>
          </div>

          {/* Center: Food Profile Quick Selector */}
          <div className="hidden md:flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5">
            <Layers className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">Profile:</span>
            <select
              value={activeProfileId}
              onChange={(e) => setActiveProfileId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-2"
            >
              {Object.values(FOOD_PROFILES).map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                  {p.name} {p.id === 'mixed' ? '(Default)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Right actions: Status, Time, Alerts */}
          <div className="flex items-center gap-3">
            {/* Live Connection Pill */}
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isConnected 
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40' 
                : 'bg-rose-950/60 text-rose-300 border-rose-800/40'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              {isConnected ? (
                <span>{connectionMethod.includes('WebSocket') ? 'Live WS' : 'REST Live'}</span>
              ) : (
                <span>Offline</span>
              )}
            </div>

            {/* Freshness / Elapsed Time */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {secondsAgo !== null ? (
                <span className={isStale ? 'text-amber-400 font-medium' : 'text-slate-300'}>
                  {secondsAgo < 5 ? 'Just now' : `${secondsAgo}s ago`}
                  {isStale && ' (Stale)'}
                </span>
              ) : (
                <span className="text-slate-500">Waiting for data</span>
              )}
            </div>

            {/* ESP32 Hardware Status Badge */}
            {liveData?.parsed?.deviceStatus && (
              <div className="hidden lg:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-amber-950/50 text-amber-300 border border-amber-800/40">
                <span className="text-[10px] text-amber-400/80 uppercase font-mono">ESP32:</span>
                <span className="font-bold">{liveData.parsed.deviceStatus}</span>
              </div>
            )}

            {/* Active Alerts Trigger Pill */}
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                criticalCount > 0
                  ? 'bg-rose-950/80 text-rose-300 border-rose-800/60 hover:bg-rose-900 animate-pulse'
                  : warningCount > 0
                  ? 'bg-amber-950/80 text-amber-300 border-amber-800/60 hover:bg-amber-900'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-300'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{criticalCount + warningCount}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
