import React from 'react';
import { 
  Settings, 
  Volume2, 
  VolumeX, 
  Sliders, 
  FlaskConical, 
  Globe
} from 'lucide-react';
import { useFreshTrack } from '../../context/FreshTrackContext';

export default function SettingsView() {
  const {
    settings,
    setSettings,
    injectSampleData
  } = useFreshTrack();

  const handleUnitToggle = (unit) => {
    setSettings(prev => ({ ...prev, tempUnit: unit }));
  };

  const handleStaleTimeoutChange = (sec) => {
    setSettings(prev => ({ ...prev, staleTimeoutSec: sec }));
  };

  const handleSoundToggle = () => {
    setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const handleMixedStrictestToggle = () => {
    setSettings(prev => ({ ...prev, mixedFoodStrictest: !prev.mixedFoodStrictest }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4 text-emerald-400" />
          System Preferences & Diagnostics
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Dashboard Settings & Diagnostic Sandbox
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Preferences Card */}
        <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Display & Assessment Preferences</span>
          </h3>

          {/* Temperature Unit Preference */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div>
              <span className="text-sm font-semibold text-white block">Temperature Unit</span>
              <span className="text-xs text-slate-400">Display temperature in Celsius or Fahrenheit (internally computed in °C)</span>
            </div>
            <div className="flex rounded-lg bg-slate-950 border border-slate-800 p-0.5 text-xs font-mono">
              <button
                onClick={() => handleUnitToggle('C')}
                className={`px-3 py-1.5 rounded-md transition ${settings.tempUnit === 'C' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                °C
              </button>
              <button
                onClick={() => handleUnitToggle('F')}
                className={`px-3 py-1.5 rounded-md transition ${settings.tempUnit === 'F' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                °F
              </button>
            </div>
          </div>

          {/* Stale Timeout Preference */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div>
              <span className="text-sm font-semibold text-white block">Stale Telemetry Threshold</span>
              <span className="text-xs text-slate-400">Duration without updates before marking device data stale</span>
            </div>
            <div className="flex rounded-lg bg-slate-950 border border-slate-800 p-0.5 text-xs font-mono">
              {[60, 120, 300].map((sec) => (
                <button
                  key={sec}
                  onClick={() => handleStaleTimeoutChange(sec)}
                  className={`px-2.5 py-1.5 rounded-md transition ${settings.staleTimeoutSec === sec ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  {sec === 60 ? '1m' : sec === 120 ? '2m' : '5m'}
                </button>
              ))}
            </div>
          </div>

          {/* Mixed Food Strictest Standard Policy */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div className="pr-4">
              <span className="text-sm font-semibold text-white block">Mixed Food Strictest Standard</span>
              <span className="text-xs text-slate-400">Assess mixed food chamber against strictest requirement (≤ 5°C cold chain)</span>
            </div>
            <button
              onClick={handleMixedStrictestToggle}
              className={`w-11 h-6 rounded-full transition-colors relative ${settings.mixedFoodStrictest ? 'bg-emerald-600' : 'bg-slate-800'}`}
            >
              <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${settings.mixedFoodStrictest ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          {/* Sound Alerts */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-white block">Audible Alert Chimes</span>
              <span className="text-xs text-slate-400">Play subtle auditory tone when a critical risk alert triggers</span>
            </div>
            <button
              onClick={handleSoundToggle}
              className={`p-2 rounded-lg border transition ${settings.soundEnabled ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-slate-950 text-slate-500 border-slate-800'}`}
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Diagnostic Sandbox & Payload Injection */}
        <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-cyan-400" />
              <span>Diagnostic Telemetry Sandbox</span>
            </h3>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              Test Harness
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Test how FreshTrack’s environmental assessment engine handles different telemetry scenarios without touching the hardware.
          </p>

          <div className="space-y-2.5">
            {/* Preset 1: Prompt's actual example data */}
            <button
              onClick={() => injectSampleData({
                gas: 256,
                humidity: 84.5,
                status: 'WARNING',
                temperature: 31.7,
                updatedAt: 32236
              })}
              className="w-full p-3 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition text-xs space-y-1"
            >
              <div className="font-bold text-amber-300 flex items-center justify-between">
                <span>Load Existing Firebase Reading (Example from Prompt)</span>
                <span className="text-[10px] font-mono text-slate-400">31.7°C | 84.5% | 256 ADC</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Demonstrates high ambient temperature warning, high humidity contextualization, raw gas telemetry, and ESP32 WARNING flag.
              </p>
            </button>

            {/* Preset 2: Optimal Cold Chain */}
            <button
              onClick={() => injectSampleData({
                gas: 180,
                humidity: 88.0,
                status: 'OK',
                temperature: 3.2,
                updatedAt: 45000
              })}
              className="w-full p-3 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition text-xs space-y-1"
            >
              <div className="font-bold text-emerald-300 flex items-center justify-between">
                <span>Load Optimal Refrigeration Reading</span>
                <span className="text-[10px] font-mono text-slate-400">3.2°C | 88.0% | 180 ADC</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Evaluates compliant cold chain conditions satisfying FSSAI/FDA cold storage standards.
              </p>
            </button>

            {/* Preset 3: Accidental Freeze Risk */}
            <button
              onClick={() => injectSampleData({
                gas: 195,
                humidity: 62.0,
                status: 'OK',
                temperature: -3.5,
                updatedAt: 48000
              })}
              className="w-full p-3 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition text-xs space-y-1"
            >
              <div className="font-bold text-sky-300 flex items-center justify-between">
                <span>Load Sub-Zero Temperature Deviation</span>
                <span className="text-[10px] font-mono text-slate-400">-3.5°C | 62.0% | 195 ADC</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Demonstrates accidental freeze hazard for non-frozen produce or dairy products.
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Render Static Sites Deployment Ready Card */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <strong className="text-white block">Render Static Sites Deployment Compatibility</strong>
            <span>Built as an optimized static React Single-Page Application (`dist/`). Ready for continuous deployment on Render Static Sites.</span>
          </div>
        </div>
        <div className="font-mono text-slate-300 text-[11px] bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 shrink-0">
          Build Command: <code className="text-emerald-400">npm run build</code>
        </div>
      </div>
    </div>
  );
}
