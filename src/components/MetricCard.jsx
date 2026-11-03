import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  unit,
  rawLabel,
  targetRange,
  status, // 'optimal' | 'warning' | 'critical' | 'neutral'
  interpretation,
  validity = 'Valid Telemetry',
  isValid = true,
  icon: Icon,
  trend = 'stable', // 'up' | 'down' | 'stable'
  footerNote
}) {
  const getStatusClasses = () => {
    switch (status) {
      case 'optimal':
        return {
          cardBorder: 'border-emerald-500/30 hover:border-emerald-500/50',
          badgeBg: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40',
          iconColor: 'text-emerald-400',
          accentBg: 'from-emerald-500/10 to-transparent'
        };
      case 'warning':
        return {
          cardBorder: 'border-amber-500/30 hover:border-amber-500/50',
          badgeBg: 'bg-amber-950/70 text-amber-300 border-amber-500/40',
          iconColor: 'text-amber-400',
          accentBg: 'from-amber-500/10 to-transparent'
        };
      case 'critical':
        return {
          cardBorder: 'border-rose-500/40 hover:border-rose-500/60 shadow-lg shadow-rose-950/20',
          badgeBg: 'bg-rose-950/70 text-rose-300 border-rose-500/40',
          iconColor: 'text-rose-400',
          accentBg: 'from-rose-500/10 to-transparent'
        };
      default:
        return {
          cardBorder: 'border-slate-800 hover:border-slate-700',
          badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
          iconColor: 'text-slate-400',
          accentBg: 'from-slate-800/10 to-transparent'
        };
    }
  };

  const style = getStatusClasses();

  return (
    <div className={`relative overflow-hidden rounded-xl bg-slate-900/90 border ${style.cardBorder} p-5 backdrop-blur transition-all duration-200 flex flex-col justify-between shadow-md`}>
      {/* Background glow gradient */}
      <div className={`absolute top-0 right-0 left-0 h-24 bg-gradient-to-b ${style.accentBg} pointer-events-none`} />

      <div>
        {/* Header row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className={`p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 ${style.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">{title}</h3>
              {rawLabel && <span className="text-xs text-slate-400">{rawLabel}</span>}
            </div>
          </div>

          {/* Sensor Validity Indicator */}
          <div className="flex items-center gap-1.5">
            {isValid ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-800/40">
                <CheckCircle2 className="w-3 h-3" />
                {validity}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded-full border border-rose-800/40">
                <AlertCircle className="w-3 h-3" />
                {validity}
              </span>
            )}
          </div>
        </div>

        {/* Main reading value display */}
        <div className="my-4 flex items-baseline gap-2">
          <span className="text-4xl md:text-5xl font-bold font-mono tracking-tight text-white">
            {value !== null && value !== undefined ? value : '--'}
          </span>
          {unit && (
            <span className="text-lg md:text-xl font-medium text-slate-400">
              {unit}
            </span>
          )}

          {/* Trend arrow */}
          {trend && (
            <div className="ml-auto flex items-center text-xs text-slate-400">
              {trend === 'up' && (
                <span className="flex items-center text-amber-400 font-mono gap-0.5">
                  <ArrowUpRight className="w-4 h-4" /> Rising
                </span>
              )}
              {trend === 'down' && (
                <span className="flex items-center text-sky-400 font-mono gap-0.5">
                  <ArrowDownRight className="w-4 h-4" /> Falling
                </span>
              )}
              {trend === 'stable' && (
                <span className="flex items-center text-slate-400 font-mono gap-0.5">
                  <Minus className="w-4 h-4" /> Steady
                </span>
              )}
            </div>
          )}
        </div>

        {/* Target Profile Boundary */}
        {targetRange && (
          <div className="mb-3 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Target Range:</span>
            <span className="font-mono text-slate-200 font-medium">{targetRange}</span>
          </div>
        )}

        {/* Short interpretation */}
        <div className="text-xs leading-relaxed text-slate-300 bg-slate-950/40 rounded-lg p-3 border border-slate-800/60">
          <div className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider mb-1">
            Interpretation
          </div>
          {interpretation}
        </div>
      </div>

      {/* Footer note if present */}
      {footerNote && (
        <div className="mt-3 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{footerNote}</span>
        </div>
      )}
    </div>
  );
}

