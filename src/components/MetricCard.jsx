import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  unit,
  targetRange,
  status, // 'optimal' | 'warning' | 'critical' | 'neutral'
  interpretation,
  icon: Icon,
  trend = 'stable',
  footerNote
}) {
  const getStatusStyles = () => {
    switch (status) {
      case 'optimal':
        return {
          border: 'border-emerald-500/30 hover:border-emerald-500/50',
          badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
          iconColor: 'text-emerald-400',
          badgeText: 'Optimal',
          badgeIcon: CheckCircle2
        };
      case 'warning':
        return {
          border: 'border-amber-500/40 hover:border-amber-500/60',
          badge: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
          iconColor: 'text-amber-400',
          badgeText: 'Attention',
          badgeIcon: AlertTriangle
        };
      case 'critical':
        return {
          border: 'border-rose-500/50 hover:border-rose-500/70 shadow-lg shadow-rose-950/20',
          badge: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
          iconColor: 'text-rose-400',
          badgeText: 'Risk Deviation',
          badgeIcon: AlertOctagon
        };
      default:
        return {
          border: 'border-slate-800 hover:border-slate-700',
          badge: 'bg-slate-800 text-slate-300 border-slate-700',
          iconColor: 'text-slate-400',
          badgeText: 'Uncalibrated',
          badgeIcon: Minus
        };
    }
  };

  const style = getStatusStyles();
  const BadgeIcon = style.badgeIcon;

  return (
    <div className={`rounded-xl bg-slate-900/95 border ${style.border} p-5 transition-all shadow-md flex flex-col justify-between`}>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className={`p-1.5 rounded-lg bg-slate-800 border border-slate-700 ${style.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            )}
            <h3 className="text-xs font-bold text-slate-200 tracking-wider uppercase font-mono">{title}</h3>
          </div>

          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${style.badge}`}>
            <BadgeIcon className="w-3 h-3" />
            {style.badgeText}
          </span>
        </div>

        {/* Big Reading Value */}
        <div className="my-2 flex items-baseline gap-1.5">
          <span className="text-4xl sm:text-5xl font-extrabold font-mono text-white tracking-tight">
            {value !== null && value !== undefined ? value : '--'}
          </span>
          {unit && (
            <span className="text-lg font-semibold text-slate-400">
              {unit}
            </span>
          )}

          {trend && (
            <div className="ml-auto text-xs text-slate-400 font-mono flex items-center">
              {trend === 'up' && (
                <span className="text-amber-400 flex items-center"><ArrowUpRight className="w-3.5 h-3.5" /> Up</span>
              )}
              {trend === 'down' && (
                <span className="text-sky-400 flex items-center"><ArrowDownRight className="w-3.5 h-3.5" /> Down</span>
              )}
              {trend === 'stable' && (
                <span className="text-slate-400 flex items-center"><Minus className="w-3.5 h-3.5" /> Steady</span>
              )}
            </div>
          )}
        </div>

        {/* Target Range */}
        {targetRange && (
          <div className="mb-3 px-2.5 py-1 rounded bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Safe Limit:</span>
            <span className="font-mono text-emerald-400 font-semibold">{targetRange}</span>
          </div>
        )}

        {/* Interpretation */}
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
          {interpretation}
        </p>
      </div>

      {/* Footer Note */}
      {footerNote && (
        <div className="mt-3 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
          {footerNote}
        </div>
      )}
    </div>
  );
}
