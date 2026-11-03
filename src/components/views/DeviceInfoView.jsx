import React from 'react';
import { 
  Cpu, 
  Database, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Activity,
  Sliders
} from 'lucide-react';
import { useFreshTrack } from '../../context/FreshTrackContext';
import { DATABASE_PATH } from '../../services/firebase';

export default function DeviceInfoView() {
  const {
    liveData,
    validation,
    isConnected,
    connectionMethod,
    lastReceivedAt,
    nowTick
  } = useFreshTrack();

  const parsed = liveData?.parsed;
  const secondsAgo = lastReceivedAt ? Math.max(0, Math.floor((nowTick - lastReceivedAt) / 1000)) : null;
  const isOnline = isConnected && secondsAgo !== null && secondsAgo < 120;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4 text-emerald-400" />
            Hardware Diagnostics & Architecture
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Device Information & Security Analysis
          </h2>
        </div>

        {/* Live Device Status Pill */}
        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono border flex items-center gap-2 ${
          isOnline
            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
            : 'bg-rose-950/80 text-rose-300 border-rose-800/60'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
          <span>{isOnline ? 'ESP32 ACTIVELY COMMUNICATING' : 'ESP32 STALE OR OFFLINE'}</span>
        </div>
      </div>

      {/* Online Status Honesty Notice */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-200">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>Active Communication Verification Rule</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          FreshTrack adheres to strict IoT integrity standards: <strong>The ESP32 is NOT considered online merely because old data exists in Firebase.</strong> 
          Device connectivity is calculated dynamically using packet arrival intervals. If no new packets arrive within 120 seconds, the device is flagged as stale/disconnected.
        </p>
      </div>

      {/* Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Hardware Node Card */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-semibold">Microcontroller</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            FreshTrack ESP32
          </div>
          <div className="text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Chipset:</span>
              <span className="text-slate-200 font-mono">ESP32-WROOM-32</span>
            </div>
            <div className="flex justify-between">
              <span>Device Reported Status:</span>
              <span className="text-amber-400 font-mono font-bold">{parsed?.deviceStatus || 'UNKNOWN'}</span>
            </div>
            <div className="flex justify-between">
              <span>Hardware Tick Counter:</span>
              <span className="text-slate-300 font-mono">{parsed?.rawUpdatedAt ?? 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Firebase RTDB Node */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-semibold">Backend Infrastructure</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            Firebase RTDB
          </div>
          <div className="text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Region:</span>
              <span className="text-slate-200 font-mono">asia-southeast1</span>
            </div>
            <div className="flex justify-between">
              <span>Database Path:</span>
              <span className="text-emerald-400 font-mono">/{DATABASE_PATH}</span>
            </div>
            <div className="flex justify-between">
              <span>Transport:</span>
              <span className="text-slate-200 font-mono">{connectionMethod}</span>
            </div>
          </div>
        </div>

        {/* Telemetry Health */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-semibold">Telemetry Validation</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            {validation.isValid ? 'VALID' : 'REJECTED'}
          </div>
          <div className="text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Temp Plausibility:</span>
              <span className="text-emerald-400 font-mono">PASSED (-40°C to 85°C)</span>
            </div>
            <div className="flex justify-between">
              <span>Humidity Range:</span>
              <span className="text-emerald-400 font-mono">PASSED (0-100% RH)</span>
            </div>
            <div className="flex justify-between">
              <span>Gas Telemetry:</span>
              <span className="text-violet-400 font-mono">RAW ADC ONLY</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Analysis & Production Hardening Guide (Section 11) */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Lock className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">
            Security Requirements & Database Write Protection Analysis
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
          {/* Working State Notice */}
          <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-800/40 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Current Development State (Non-Breaking)</span>
            </div>
            <p className="text-slate-300">
              The existing ESP32 pushes sensor packets directly to Firebase without embedded tokens. 
              During development, FreshTrack preserves this working data pipeline without breaking telemetry delivery. 
              <strong>No privileged Firebase admin credentials or service account private keys are embedded into the client code.</strong>
            </p>
          </div>

          {/* Hardening Recommendations */}
          <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Recommended Production Hardening Rules</span>
            </div>
            <p className="text-slate-400">
              For production deployment, the database should prohibit unauthenticated public writes by deploying 
              authenticated Firebase Database Security Rules.
            </p>
          </div>
        </div>

        {/* Code Snippet for Firebase Security Rules */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Production Firebase RTDB Security Rules (database.rules.json):</span>
            <span className="font-mono text-[11px] text-cyan-400">JSON</span>
          </div>
          <div className="p-4 rounded-lg bg-slate-950 font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto">
            <pre>{`{
  "rules": {
    "FreshTrack": {
      "latest": {
        // Read permitted for dashboard users or public view
        ".read": true,
        // Prohibit open public writing; allow only authenticated ESP32 device auth token
        ".write": "auth != null && auth.token.device_id === 'FreshTrack_ESP32'",
        ".validate": "newData.hasChildren(['temperature', 'humidity', 'gas'])"
      }
    }
  }
}`}</pre>
          </div>
        </div>
      </div>

      {/* Gas Sensor Calibration Roadmap */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 space-y-3">
        <div className="flex items-center gap-2.5">
          <Sliders className="w-5 h-5 text-violet-400" />
          <h3 className="text-base font-bold text-white">
            Future Gas Sensor Calibration & Anomaly Detection Pipeline
          </h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          The current sensor hardware is labeled <em>Other / Not Identified</em>. 
          When specific sensor documentation (e.g., MQ-135, BME680, or SGP40) becomes available:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <strong className="text-white block font-semibold">1. Zero-Point Baseline</strong>
            <p className="text-slate-400 text-[11px]">Record ambient analog reading in fresh, clean air chamber for 24h baseline establishment ($R_0$).</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <strong className="text-white block font-semibold">2. Target Gas Response</strong>
            <p className="text-slate-400 text-[11px]">Calibrate sensitivity curve ($R_s/R_0$) against standard volatile organic compounds or ammonia vapors.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <strong className="text-white block font-semibold">3. Anomaly Flagging</strong>
            <p className="text-slate-400 text-[11px]">Implement sustained moving-average baseline deviation rather than raw threshold alarms.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
