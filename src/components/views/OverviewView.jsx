import React from 'react';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  ShieldAlert, 
  Info, 
  ArrowRight,
  Layers,
  CheckCircle
} from 'lucide-react';
import { useFreshTrack } from '../../context/FreshTrackContext';
import MetricCard from '../MetricCard';

export default function OverviewView() {
  const {
    liveData,
    validation,
    activeProfile,
    activeProfileId,
    setActiveTab,
    assessment,
    history
  } = useFreshTrack();

  const parsed = liveData?.parsed;
  const timestampText = parsed?.timestampDisplay || 'Timestamp unavailable';

  // Compute trend for temperature and humidity from session history
  let tempTrend = 'stable';
  let humTrend = 'stable';
  if (history.length >= 2) {
    const last = history[history.length - 1];
    const prev = history[history.length - 2];
    if (last.temperature > prev.temperature + 0.1) tempTrend = 'up';
    else if (last.temperature < prev.temperature - 0.1) tempTrend = 'down';

    if (last.humidity > prev.humidity + 0.3) humTrend = 'up';
    else if (last.humidity < prev.humidity - 0.3) humTrend = 'down';
  }

  // Derive metric card status
  const getTempCardStatus = () => {
    if (!assessment?.temperatureEvaluation) return 'neutral';
    const s = assessment.temperatureEvaluation.status;
    if (s.includes('CRITICAL')) return 'critical';
    if (s.includes('ELEVATED')) return 'warning';
    if (s === 'OPTIMAL') return 'optimal';
    return 'neutral';
  };

  const getHumCardStatus = () => {
    if (!assessment?.humidityEvaluation) return 'neutral';
    const s = assessment.humidityEvaluation.status;
    if (s.includes('CRITICAL')) return 'critical';
    if (s.includes('ELEVATED') || s.includes('DEFICIENT')) return 'warning';
    if (s === 'OPTIMAL' || s === 'HIGH_ACCEPTABLE') return 'optimal';
    return 'neutral';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Status & Context */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${assessment.state.badgeClass}`}>
                <span className={`w-2 h-2 rounded-full ${assessment.state.dotClass} ${assessment.state.key !== 'NORMAL' ? 'animate-ping' : ''}`} />
                {assessment.state.label}
              </span>

              <span className="text-xs text-slate-400 font-mono">
                Storage Environment Assessment
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Food Storage Chamber Condition
            </h1>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {assessment.state.description}
            </p>

            {/* Mixed food specific guidance alert */}
            {activeProfileId === 'mixed' && (
              <div className="mt-3 p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200/90 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 font-semibold">Mixed Food Chamber Notice: </strong>
                  Different foods possess conflicting storage needs (e.g. cold meats vs ambient tubers). 
                  Currently evaluating against the <em>strictest applicable standard (≤ {activeProfile.temp.max}°C cold chain)</em> for perishable items.
                </div>
              </div>
            )}
          </div>

          {/* Environmental Suitability Index Gauge Card */}
          <div className="shrink-0 bg-slate-950/80 border border-slate-800 rounded-xl p-4 min-w-[240px] text-center flex flex-col items-center justify-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Environmental Suitability Index
            </span>
            <div className="relative flex items-center justify-center my-1">
              <span className={`text-4xl font-extrabold font-mono ${
                assessment.suitabilityIndex === null
                  ? 'text-slate-500'
                  : assessment.suitabilityIndex >= 80 
                  ? 'text-emerald-400' 
                  : assessment.suitabilityIndex >= 50 
                  ? 'text-amber-400' 
                  : 'text-rose-400'
              }`}>
                {assessment.suitabilityIndex !== null ? assessment.suitabilityIndex : '--'}
              </span>
              <span className="text-slate-500 text-lg font-mono ml-1">/100</span>
            </div>
            <div className="text-[10px] text-slate-400 max-w-[200px] leading-tight mt-1">
              Ambient suitability only; does not claim food safety or freshness probability.
            </div>
          </div>
        </div>

        {/* Ambient vs Core Temperature Scientific Disclaimer */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
            <span>
              <strong>Scientific Principle:</strong> Ambient air temperature fluctuates rapidly; inner food core temperature changes slowly due to thermal mass.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('live')}
            className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1 transition shrink-0"
          >
            Inspect Thermal Dynamics <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3 Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Temperature */}
        <MetricCard
          title="Ambient Temperature"
          rawLabel="Digital Thermal Sensor"
          value={parsed?.temperature !== null && parsed?.temperature !== undefined ? parsed.temperature.toFixed(1) : null}
          unit="°C"
          targetRange={`${activeProfile.temp.min}°C to ${activeProfile.temp.max}°C`}
          status={getTempCardStatus()}
          trend={tempTrend}
          isValid={validation.isValid && parsed?.temperature !== null && parsed?.temperature !== undefined}
          validity={validation.isValid ? 'Valid Reading' : 'Sensor Fault'}
          icon={Thermometer}
          interpretation={assessment.temperatureEvaluation?.description || 'Evaluating temperature against profile limits...'}
          footerNote="Measures surrounding air temperature. Does not represent food core temperature."
        />

        {/* Card 2: Humidity */}
        <MetricCard
          title="Relative Humidity"
          rawLabel="Capacitive Moisture Sensor"
          value={parsed?.humidity !== null && parsed?.humidity !== undefined ? parsed.humidity.toFixed(1) : null}
          unit="% RH"
          targetRange={`${activeProfile.humidity.min}% to ${activeProfile.humidity.max}% RH`}
          status={getHumCardStatus()}
          trend={humTrend}
          isValid={validation.isValid && parsed?.humidity !== null && parsed?.humidity !== undefined}
          validity={validation.isValid ? 'Valid Reading' : 'Sensor Fault'}
          icon={Droplets}
          interpretation={assessment.humidityEvaluation?.description || 'Evaluating moisture level against food profile...'}
          footerNote="Food-specific evaluation. High humidity is normal and required for certain fresh produce."
        />

        {/* Card 3: Gas Sensor */}
        <MetricCard
          title="Gas Telemetry (Raw)"
          rawLabel="Analog Sensor (Model Unidentified)"
          value={parsed?.gas !== null && parsed?.gas !== undefined ? parsed.gas : null}
          unit="raw ADC"
          targetRange="Baseline uncalibrated"
          status="neutral"
          trend="stable"
          isValid={validation.isValid && parsed?.gas !== null && parsed?.gas !== undefined}
          validity="Uncalibrated Sensor"
          icon={Wind}
          interpretation={assessment.gasEvaluation?.description || 'Raw ADC voltage. Uncalibrated sensor cannot identify specific gas compounds or confirm food spoilage.'}
          footerNote="Strictly unverified telemetry. No ppm or chemical identification inferred."
        />
      </div>

      {/* Secondary Status & Telemetry Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Details & FSSAI Cold Chain */}
        <div className="lg:col-span-2 rounded-xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-semibold text-white">Food Profile Standards & Storage Guidance</h3>
            </div>
            <button
              onClick={() => setActiveTab('profiles')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1"
            >
              Change Profile <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Food Classification
              </span>
              <span className="text-base font-bold text-slate-200">{activeProfile.name}</span>
              <p className="text-xs text-slate-400 leading-relaxed">{activeProfile.guidance}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Food Safety Reference
              </span>
              <span className="text-base font-bold text-slate-200">
                {activeProfile.strictestApplies ? 'FSSAI / FDA Cold Chain (≤ 5°C)' : 'Ambient / Controlled RH'}
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                {activeProfile.temp.guidance}
              </p>
            </div>
          </div>

          {/* Device status vs independent assessment */}
          <div className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="text-slate-400">
                <span className="font-semibold text-slate-300">ESP32 Device Status:</span>{' '}
                <span className="font-mono text-amber-400 font-bold">{parsed?.deviceStatus || 'UNKNOWN'}</span>
                <span className="text-slate-400 ml-2">(Reported directly by microcontroller)</span>
              </div>
              <div className="text-slate-400">
                <span className="font-semibold text-slate-300">Timestamp Interpretation:</span>{' '}
                <span className="font-mono text-slate-300">{timestampText}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('device')}
              className="text-xs text-slate-400 hover:text-white underline underline-offset-2 shrink-0"
            >
              Hardware Details
            </button>
          </div>
        </div>

        {/* Quick Alert Summary Card */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-semibold text-white">Active Environmental Alerts</h3>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {assessment.alerts?.length || 0}
              </span>
            </div>

            {assessment.alerts?.length === 0 ? (
              <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-center space-y-1 my-3">
                <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto" />
                <div className="text-xs font-semibold text-emerald-300">All Parameters Within Limits</div>
                <div className="text-[11px] text-emerald-400/70">No environmental anomalies detected.</div>
              </div>
            ) : (
              <div className="space-y-2.5 my-2 max-h-[220px] overflow-y-auto pr-1">
                {assessment.alerts.slice(0, 3).map((alert, idx) => (
                  <div
                    key={alert.id || idx}
                    className={`p-2.5 rounded-lg border text-xs ${
                      alert.severity === 'critical'
                        ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                        : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>{alert.title}</span>
                      <span className="text-[10px] uppercase font-mono px-1 rounded bg-black/40">
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-[11px] opacity-90 mt-1 line-clamp-2">{alert.explanation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('alerts')}
            className="w-full mt-3 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center justify-center gap-1.5"
          >
            <span>Open Comprehensive Alert Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
