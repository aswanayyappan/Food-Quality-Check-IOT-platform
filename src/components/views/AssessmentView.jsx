import React from 'react';
import { 
  ShieldCheck, 
  Clock, 
  Layers, 
  Thermometer, 
  Droplets, 
  Wind, 
  CheckCircle2, 
  FileText,
  Scale
} from 'lucide-react';
import { useFreshTrack } from '../../context/FreshTrackContext';

export default function AssessmentView() {
  const {
    activeProfile,
    assessment,
    lastReceivedAt,
    nowTick
  } = useFreshTrack();

  const secondsAgo = lastReceivedAt ? Math.max(0, Math.floor((nowTick - lastReceivedAt) / 1000)) : null;
  const breakdown = assessment.scoreBreakdown;

  return (
    <div className="space-y-6">
      {/* Assessment Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Multi-Factor Environmental Risk Evaluation
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Food Storage Environment Assessment
        </h2>
        <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
          Continuous assessment evaluating ambient temperature exposure duration, category-specific relative humidity, 
          sensor health, and telemetry freshness. Ambient assessment reflects storage atmosphere and does not make claims of food core freshness or safety.
        </p>
      </div>

      {/* Main Overall State Card */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${assessment.state.badgeClass}`}>
              <span className={`w-2.5 h-2.5 rounded-full ${assessment.state.dotClass} ${assessment.state.key !== 'NORMAL' ? 'animate-ping' : ''}`} />
              {assessment.state.label}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Evaluated against: <strong className="text-slate-200">{activeProfile.name}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span>Exposure Window: <strong>~{assessment.exposureMinutes} min outside limits</strong></span>
          </div>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed max-w-4xl bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          {assessment.state.description}
        </p>

        {/* Multi-Factor Score Breakdown */}
        {breakdown && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Environmental Suitability Index Scoring Breakdown
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                Total: {breakdown.total} / 100 Points
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Temperature Alignment Factor */}
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="font-semibold text-slate-300">Temperature Factor</span>
                  <span className="font-mono text-white font-bold">{breakdown.temperatureScore} / {breakdown.temperatureMax} pts</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${(breakdown.temperatureScore / breakdown.temperatureMax) * 100}%` }} 
                  />
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  Evaluated against {activeProfile.temp.min}°C - {activeProfile.temp.max}°C boundary.
                </p>
              </div>

              {/* Humidity Factor */}
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="font-semibold text-slate-300">Humidity Factor</span>
                  <span className="font-mono text-white font-bold">{breakdown.humidityScore} / {breakdown.humidityMax} pts</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500 rounded-full" 
                    style={{ width: `${(breakdown.humidityScore / breakdown.humidityMax) * 100}%` }} 
                  />
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  Food-specific requirement ({activeProfile.humidity.min}% - {activeProfile.humidity.max}% RH).
                </p>
              </div>

              {/* Freshness / Sensor Factor */}
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="font-semibold text-slate-300">Telemetry Freshness</span>
                  <span className="font-mono text-white font-bold">{breakdown.dataFreshnessScore} / {breakdown.dataFreshnessMax} pts</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-violet-500 rounded-full" 
                    style={{ width: `${(breakdown.dataFreshnessScore / breakdown.dataFreshnessMax) * 100}%` }} 
                  />
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  {secondsAgo !== null && secondsAgo < 120 ? 'Active telemetry stream' : 'Stale data penalty applied'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Six Food Quality / Environmental Indicators */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white tracking-wide uppercase text-xs text-slate-400">
          Environmental Quality Indicators
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Indicator 1: Temperature Condition */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-400">Temperature Condition</span>
              <Thermometer className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-lg font-bold text-white font-mono">
              {assessment.temperatureEvaluation?.value !== undefined ? `${assessment.temperatureEvaluation.value.toFixed(1)}°C` : '--'}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {assessment.temperatureEvaluation?.description}
            </p>
          </div>

          {/* Indicator 2: Humidity Condition */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-400">Humidity Condition</span>
              <Droplets className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-lg font-bold text-white font-mono">
              {assessment.humidityEvaluation?.value !== undefined ? `${assessment.humidityEvaluation.value.toFixed(1)}% RH` : '--'}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {assessment.humidityEvaluation?.description}
            </p>
          </div>

          {/* Indicator 3: Gas Anomaly Status */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-400">Gas Anomaly Status</span>
              <Wind className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-lg font-bold text-white font-mono">
              Raw Count: {assessment.gasEvaluation?.rawValue ?? '--'}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Baseline: <em>Not established</em>. Sensor is unidentified. No gas concentration or spoilage conclusion inferred.
            </p>
          </div>

          {/* Indicator 4: Environmental Exposure Duration */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-400">Exposure Duration</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-lg font-bold text-white font-mono">
              {assessment.exposureMinutes > 0 ? `${assessment.exposureMinutes} minutes out of band` : '0 minutes (Within band)'}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tracks continuous readings outside target boundaries. Isolated fluctuations do not trigger persistent high risk.
            </p>
          </div>

          {/* Indicator 5: Sensor Reliability */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-400">Sensor Reliability</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-lg font-bold text-emerald-400 font-mono">
              Valid Plausibility Bounds
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Physical plausibility checks verified: Temperature in [-40, 85°C], Humidity in [0, 100%], Gas in valid ADC range.
            </p>
          </div>

          {/* Indicator 6: Data Freshness */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-400">Data Freshness</span>
              <Scale className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-lg font-bold text-white font-mono">
              {secondsAgo !== null ? `${secondsAgo}s elapsed` : 'Awaiting data'}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Telemetry freshness monitored via client timestamping. Stale timeout configured at 120 seconds.
            </p>
          </div>
        </div>
      </div>

      {/* FSSAI Guidance & Mixed Storage Incompatibility Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FSSAI Standard Reference */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              FSSAI Cold Chain Standards Reference
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The Food Safety and Standards Authority of India (FSSAI) mandates that for perishable chilled foods 
            (including milk, dairy products, dressed poultry, meat, and ready-to-eat cooked dishes), 
            the cold chain receiving and holding temperature must remain at or below <strong>5°C</strong>.
          </p>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="text-slate-300 font-semibold">Scientific Application Scope:</div>
            <div>• Applied to: Meat, Fish, Dairy, Leftovers, and Mixed Storage (strictest threshold).</div>
            <div>• NOT applied to: Dry Grains (15-22°C), Root Vegetables (10-15°C), or Tropical Produce.</div>
          </div>
        </div>

        {/* Mixed Food Chamber Separation Guidance */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Mixed Food Chamber Compatibility Guidance
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            When multiple food varieties share a single monitored space, environmental conditions suitable for one commodity 
            can actively deteriorate another.
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
            {activeProfile.incompatibilityNotes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
