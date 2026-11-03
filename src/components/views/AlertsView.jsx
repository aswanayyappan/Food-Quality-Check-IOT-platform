import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  CheckCircle, 
  Clock, 
  Check, 
  Filter,
  Wrench
} from 'lucide-react';
import { useFreshTrack } from '../../context/FreshTrackContext';

export default function AlertsView() {
  const {
    assessment,
    acknowledgedAlerts,
    acknowledgeAlert
  } = useFreshTrack();

  const [severityFilter, setSeverityFilter] = useState('all');

  const alerts = assessment?.alerts || [];

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter === 'all') return true;
    return a.severity === severityFilter;
  });

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4 text-amber-400" />
            Environmental Safety & Diagnostics Center
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Active Alerts & Operating Guidance
          </h2>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          <button
            onClick={() => setSeverityFilter('all')}
            className={`px-2.5 py-1 rounded-md transition ${severityFilter === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setSeverityFilter('critical')}
            className={`px-2.5 py-1 rounded-md transition ${severityFilter === 'critical' ? 'bg-rose-950 text-rose-300 font-bold border border-rose-800/60' : 'text-slate-400 hover:text-rose-400'}`}
          >
            Critical ({criticalCount})
          </button>
          <button
            onClick={() => setSeverityFilter('warning')}
            className={`px-2.5 py-1 rounded-md transition ${severityFilter === 'warning' ? 'bg-amber-950 text-amber-300 font-bold border border-amber-800/60' : 'text-slate-400 hover:text-amber-400'}`}
          >
            Warnings ({warningCount})
          </button>
        </div>
      </div>

      {/* No alerts state */}
      {filteredAlerts.length === 0 ? (
        <div className="p-10 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Active Environmental Alerts</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            All ambient parameters are operating within established boundaries for the active profile, 
            and telemetry communication is healthy.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => {
            const isAck = !!acknowledgedAlerts[alert.id];
            const isCrit = alert.severity === 'critical';

            return (
              <div
                key={alert.id}
                className={`rounded-xl border p-5 transition relative overflow-hidden ${
                  isCrit
                    ? 'bg-rose-950/20 border-rose-800/50 hover:border-rose-700'
                    : 'bg-amber-950/20 border-amber-800/50 hover:border-amber-700'
                } ${isAck ? 'opacity-60' : ''}`}
              >
                {/* Header bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    {isCrit ? (
                      <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                    )}
                    <h4 className="text-base font-bold text-white">{alert.title}</h4>
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                      isCrit 
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(alert.time).toLocaleTimeString()}
                    </span>

                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      disabled={isAck}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition ${
                        isAck
                          ? 'bg-slate-800/80 text-slate-400 border-slate-700 cursor-default'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isAck ? 'Acknowledged' : 'Acknowledge'}</span>
                    </button>
                  </div>
                </div>

                {/* Triggering condition */}
                <div className="mb-3 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-900 text-xs font-mono text-slate-300 flex items-center gap-2">
                  <span className="text-slate-400">Triggering Metric:</span>
                  <span className="font-semibold text-white">{alert.trigger}</span>
                </div>

                {/* Explanation */}
                <div className="space-y-3 text-xs leading-relaxed">
                  <div>
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block mb-0.5">
                      Scientific Explanation & Context:
                    </span>
                    <p className="text-slate-200">{alert.explanation}</p>
                  </div>

                  {/* Recommended Standard Operating Procedure (SOP) Action */}
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-start gap-2.5">
                    <Wrench className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] block mb-0.5">
                        Recommended Corrective Action (SOP):
                      </span>
                      <p className="text-slate-200">{alert.recommendedAction}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Scientific Restraint Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-300 font-semibold">Food Safety Alert Policy: </strong>
          FreshTrack alerts highlight <em>environmental deviations</em> (refrigeration failure, sensor disconnection, excessive relative humidity). 
          Alerts never assert that food is spoiled, biologically unsafe, or toxic without accredited microbiological analysis or core temperature verification.
        </div>
      </div>
    </div>
  );
}
