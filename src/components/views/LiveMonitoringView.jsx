import React from 'react';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Activity,
  Terminal
} from 'lucide-react';
import { useFreshTrack } from '../../context/FreshTrackContext';
import { DATABASE_PATH } from '../../services/firebase';

export default function LiveMonitoringView() {
  const {
    liveData,
    validation,
    connectionMethod,
    lastReceivedAt,
    nowTick,
    activeProfile,
    assessment,
    formatTemp
  } = useFreshTrack();

  const parsed = liveData?.parsed;
  const temp = parsed?.temperature;
  const hum = parsed?.humidity;
  const gas = parsed?.gas;

  const secondsAgo = lastReceivedAt ? Math.max(0, Math.floor((nowTick - lastReceivedAt) / 1000)) : null;

  // Calculation for gauge positions
  const tempPct = temp !== null && temp !== undefined ? Math.min(100, Math.max(0, ((temp + 10) / 60) * 100)) : 0;
  const humPct = hum !== null && hum !== undefined ? Math.min(100, Math.max(0, hum)) : 0;
  const gasPct = gas !== null && gas !== undefined ? Math.min(100, Math.max(0, (gas / 1024) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Instrument Telemetry Stream
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Realtime Sensor Telemetry & Diagnostics
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Source: <span className="text-emerald-400">{connectionMethod}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Ping: <span className="text-slate-200">{secondsAgo !== null ? `${secondsAgo}s ago` : 'Waiting'}</span>
          </div>
        </div>
      </div>

      {/* Main Gauges Cluster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Temperature Gauge Card */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
                <Thermometer className="w-4 h-4 text-emerald-400" />
                <span>Ambient Air Temperature</span>
              </div>
              <span className="text-xs font-mono text-slate-400">DHT / SHT31</span>
            </div>

            <div className="text-center py-4">
              <div className="text-5xl font-mono font-bold text-white tracking-tight">
                {temp !== null && temp !== undefined ? temp.toFixed(1) : '--'}
                <span className="text-2xl text-slate-400 font-normal ml-1">°C</span>
              </div>
              <div className="text-xs text-slate-400 mt-1 font-mono">
                {temp !== null && temp !== undefined ? formatTemp(temp) : ''}
              </div>
            </div>

            {/* Gauge progress bar */}
            <div className="space-y-1.5 mt-2">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>-10°C</span>
                <span className="text-emerald-400">Target: {activeProfile.temp.min}° - {activeProfile.temp.max}°C</span>
                <span>50°C</span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 relative">
                {/* Target profile zone highlight */}
                <div 
                  className="absolute top-0 bottom-0 bg-emerald-500/20 border-x border-emerald-500/40"
                  style={{
                    left: `${Math.max(0, ((activeProfile.temp.min + 10) / 60) * 100)}%`,
                    width: `${Math.max(2, (((activeProfile.temp.max - activeProfile.temp.min) / 60) * 100))}%`
                  }}
                />
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    temp > activeProfile.temp.max ? 'bg-rose-500' : temp < activeProfile.temp.min ? 'bg-sky-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${tempPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Status: </span>
            {assessment.temperatureEvaluation?.description}
          </div>
        </div>

        {/* Humidity Gauge Card */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
                <Droplets className="w-4 h-4 text-cyan-400" />
                <span>Relative Humidity</span>
              </div>
              <span className="text-xs font-mono text-slate-400">Capacitive</span>
            </div>

            <div className="text-center py-4">
              <div className="text-5xl font-mono font-bold text-white tracking-tight">
                {hum !== null && hum !== undefined ? hum.toFixed(1) : '--'}
                <span className="text-2xl text-slate-400 font-normal ml-1">% RH</span>
              </div>
              <div className="text-xs text-slate-400 mt-1 font-mono">
                Dew point estimated: ~{temp && hum ? (temp - ((100 - hum) / 5)).toFixed(1) : '--'}°C
              </div>
            </div>

            {/* Gauge progress bar */}
            <div className="space-y-1.5 mt-2">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>0%</span>
                <span className="text-cyan-400">Target: {activeProfile.humidity.min}% - {activeProfile.humidity.max}%</span>
                <span>100%</span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 relative">
                {/* Target profile zone highlight */}
                <div 
                  className="absolute top-0 bottom-0 bg-cyan-500/20 border-x border-cyan-500/40"
                  style={{
                    left: `${activeProfile.humidity.min}%`,
                    width: `${activeProfile.humidity.max - activeProfile.humidity.min}%`
                  }}
                />
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    hum > activeProfile.humidity.max ? 'bg-amber-500' : hum < activeProfile.humidity.min ? 'bg-sky-500' : 'bg-cyan-500'
                  }`}
                  style={{ width: `${humPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Status: </span>
            {assessment.humidityEvaluation?.description}
          </div>
        </div>

        {/* Gas Sensor Card */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
                <Wind className="w-4 h-4 text-violet-400" />
                <span>Gas Sensor (Raw ADC)</span>
              </div>
              <span className="text-xs font-mono text-amber-400/90 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                Uncalibrated
              </span>
            </div>

            <div className="text-center py-4">
              <div className="text-5xl font-mono font-bold text-white tracking-tight">
                {gas !== null && gas !== undefined ? gas : '--'}
                <span className="text-lg text-slate-400 font-mono font-normal ml-1">counts</span>
              </div>
              <div className="text-xs text-slate-400 mt-1 font-mono">
                Analog Pin ADC Voltage: ~{gas ? ((gas / 4095) * 3.3).toFixed(2) : '--'}V
              </div>
            </div>

            {/* Raw level indicator */}
            <div className="space-y-1.5 mt-2">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>0 (Min)</span>
                <span className="text-slate-400">Baseline: Not established</span>
                <span>1024+</span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-violet-500/70 rounded-full transition-all duration-500"
                  style={{ width: `${gasPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Interpretation: </span>
            Insufficient calibration data. Unverified raw value. No reliable spoilage conclusion can be made.
          </div>
        </div>
      </div>

      {/* Ambient Sensor vs Food Core Temperature - Scientific Visual Diagram */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">
            Ambient Air Sensor vs. Food Core Temperature Dynamics
          </h3>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
          FreshTrack strictly distinguishes between <strong>ambient air temperature</strong> measured by the ESP32 sensors 
          and the <strong>internal core temperature</strong> of the stored food. Because food has high thermal mass and water content, 
          heat transfer through the product requires significant time.
        </p>

        {/* Dynamic Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 text-sm">Ambient Air (Measured by FreshTrack)</span>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">Fast Response (~Seconds)</span>
            </div>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
              <li>Responds almost immediately to door openings, defrost cycles, and chamber air currents.</li>
              <li>A door opened for 2 minutes can spike air temperature from 3°C to 18°C.</li>
              <li>Indicates <em>environmental refrigeration performance</em>, not instantaneous food warming.</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 text-sm">Internal Food Core (Physiological Safety)</span>
              <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">Slow Response (~Hours)</span>
            </div>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
              <li>Protected by specific heat capacity ($C_p \approx 3.5 \text{ kJ/kg}\cdot\text{K}$) and packaging thermal resistance.</li>
              <li>Brief air spikes do not compromise core food safety.</li>
              <li><strong>Sustained exposure</strong> (&gt;2-4 hours above 5°C) is required before core food temperature reaches the microbial danger zone.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Raw Firebase Payload Inspector */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Live Firebase Payload Inspector</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Path: /{DATABASE_PATH}
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Direct inspection of the latest JSON packet fetched from the Firebase Realtime Database. 
          FreshTrack parses, validates, and evaluates this telemetry without modifying or inventing values.
        </p>

        <div className="p-4 rounded-lg bg-slate-950 font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800">
          <pre>{JSON.stringify({
            gas: parsed?.gas ?? null,
            humidity: parsed?.humidity ?? null,
            status: parsed?.deviceStatus ?? null,
            temperature: parsed?.temperature ?? null,
            updatedAt: parsed?.rawUpdatedAt ?? null
          }, null, 2)}</pre>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
          <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800/60">
            <span className="text-slate-400 block font-mono text-[11px]">raw.updatedAt:</span>
            <span className="text-white font-mono font-semibold">{parsed?.rawUpdatedAt ?? 'null'}</span>
            <span className="text-[10px] text-amber-400/80 block mt-0.5">Uptime counter (not epoch ms)</span>
          </div>
          <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800/60">
            <span className="text-slate-400 block font-mono text-[11px]">raw.status:</span>
            <span className="text-amber-400 font-mono font-semibold">{parsed?.deviceStatus ?? 'null'}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">ESP32 firmware status</span>
          </div>
          <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800/60">
            <span className="text-slate-400 block font-mono text-[11px]">Data Freshness:</span>
            <span className="text-emerald-400 font-mono font-semibold">
              {secondsAgo !== null ? `${secondsAgo}s ago` : 'N/A'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Client-verified timestamp</span>
          </div>
          <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800/60">
            <span className="text-slate-400 block font-mono text-[11px]">Validation State:</span>
            <span className="text-emerald-400 font-mono font-semibold">
              {validation.isValid ? 'PASSED (3/3 Sensors)' : 'FAILED'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Bounds & type verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
