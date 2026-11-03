import React, { useState, useMemo } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Check, 
  Wrench
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { useFreshTrack } from '../../context/useFreshTrack';
import MetricCard from '../MetricCard';

export default function MainDashboardView() {
  const {
    liveData,
    validation,
    activeProfile,
    assessment,
    history,
    lastReceivedAt,
    nowTick,
    acknowledgedAlerts,
    acknowledgeAlert
  } = useFreshTrack();

  const [chartRange, setChartRange] = useState('1h');
  const [activeMetricTab, setActiveMetricTab] = useState('temp'); // 'temp' | 'hum' | 'gas'

  const parsed = liveData?.parsed;
  const secondsAgo = lastReceivedAt ? Math.max(0, Math.floor((nowTick - lastReceivedAt) / 1000)) : null;

  // Filter history for dashboard chart
  const chartData = useMemo(() => {
    if (!history || history.length === 0) return [];
    let durationMs = 3600000;
    if (chartRange === '6h') durationMs = 6 * 3600000;
    else if (chartRange === '24h') durationMs = 24 * 3600000;

    const cutoff = nowTick - durationMs;
    const filtered = history.filter(item => item.timestamp >= cutoff);

    return filtered.map(item => {
      const date = new Date(item.timestamp);
      return {
        ...item,
        displayTime: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
    });
  }, [history, chartRange, nowTick]);

  // Compute trend
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

  const getTempStatus = () => {
    if (!assessment?.temperatureEvaluation) return 'neutral';
    const s = assessment.temperatureEvaluation.status;
    if (s.includes('CRITICAL')) return 'critical';
    if (s.includes('ELEVATED')) return 'warning';
    if (s === 'OPTIMAL') return 'optimal';
    return 'neutral';
  };

  const getHumStatus = () => {
    if (!assessment?.humidityEvaluation) return 'neutral';
    const s = assessment.humidityEvaluation.status;
    if (s.includes('CRITICAL')) return 'critical';
    if (s.includes('ELEVATED') || s.includes('DEFICIENT')) return 'warning';
    if (s === 'OPTIMAL' || s === 'HIGH_ACCEPTABLE') return 'optimal';
    return 'neutral';
  };

  const alerts = assessment?.alerts || [];

  return (
    <div className="space-y-6">
      {/* 1. Overall Chamber Status Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 p-5 sm:p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${assessment.state.badgeClass}`}>
                <span className={`w-2 h-2 rounded-full ${assessment.state.dotClass} ${assessment.state.key !== 'NORMAL' ? 'animate-ping' : ''}`} />
                {assessment.state.label}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Monitoring: <strong className="text-slate-200">{activeProfile.name}</strong>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Food Storage Chamber Environment
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {assessment.state.description}
            </p>
          </div>

          {/* Environmental Suitability Score Card */}
          <div className="shrink-0 bg-slate-950/90 border border-slate-800 rounded-xl p-4 min-w-[200px] text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              Environmental Suitability
            </div>
            <div className="flex items-baseline justify-center">
              <span className={`text-4xl font-black font-mono ${
                assessment.suitabilityIndex === null
                  ? 'text-slate-500'
                  : assessment.suitabilityIndex >= 80 
                  ? 'text-emerald-400' 
                  : assessment.suitabilityIndex >= 50 
                  ? 'text-amber-400' 
                  : 'text-rose-400'
              }`}>
                {assessment.suitabilityIndex ?? '--'}
              </span>
              <span className="text-slate-500 text-sm font-mono ml-1">/100</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Ambient index only; not food core freshness
            </div>
          </div>
        </div>

        {/* Ambient vs Core Temperature Note */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong>Thermal Principle:</strong> The ESP32 measures ambient air temperature. Food core temperature warms much slower due to thermal mass. Sustained exposure is required before microbial growth accelerates.
          </span>
        </div>
      </div>

      {/* 2. Three Primary Sensor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Temperature */}
        <MetricCard
          title="Ambient Temperature"
          value={parsed?.temperature !== null && parsed?.temperature !== undefined ? parsed.temperature.toFixed(1) : null}
          unit="°C"
          targetRange={`${activeProfile.temp.min}°C to ${activeProfile.temp.max}°C`}
          status={getTempStatus()}
          trend={tempTrend}
          icon={Thermometer}
          interpretation={assessment.temperatureEvaluation?.description || 'Reading temperature...'}
          footerNote="Measures air temperature. Core food temperature changes more gradually."
        />

        {/* Humidity */}
        <MetricCard
          title="Relative Humidity"
          value={parsed?.humidity !== null && parsed?.humidity !== undefined ? parsed.humidity.toFixed(1) : null}
          unit="% RH"
          targetRange={`${activeProfile.humidity.min}% to ${activeProfile.humidity.max}%`}
          status={getHumStatus()}
          trend={humTrend}
          icon={Droplets}
          interpretation={assessment.humidityEvaluation?.description || 'Evaluating moisture...'}
          footerNote="High moisture is normal for produce, but promotes mold on dry grains."
        />

        {/* Gas Sensor */}
        <MetricCard
          title="Gas Telemetry (Raw)"
          value={parsed?.gas !== null && parsed?.gas !== undefined ? parsed.gas : null}
          unit="counts"
          targetRange="Uncalibrated"
          status="neutral"
          trend="stable"
          icon={Wind}
          interpretation={assessment.gasEvaluation?.description || 'Raw ADC voltage. Uncalibrated sensor cannot verify food spoilage.'}
          footerNote="Raw hardware telemetry. No ppm or chemical compound inferred."
        />
      </div>

      {/* 3. Live Historical Trend Graph (In-Place, No Redirects) */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Live Environmental Trend
            </h3>
            <span className="text-xs text-slate-400">
              ({chartData.length} logged data points)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Metric Switcher */}
            <div className="flex rounded-lg bg-slate-950 border border-slate-800 p-0.5 text-xs font-mono">
              <button
                onClick={() => setActiveMetricTab('temp')}
                className={`px-2.5 py-1 rounded-md transition ${activeMetricTab === 'temp' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Temperature (°C)
              </button>
              <button
                onClick={() => setActiveMetricTab('hum')}
                className={`px-2.5 py-1 rounded-md transition ${activeMetricTab === 'hum' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Humidity (%)
              </button>
              <button
                onClick={() => setActiveMetricTab('gas')}
                className={`px-2.5 py-1 rounded-md transition ${activeMetricTab === 'gas' ? 'bg-violet-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Gas (ADC)
              </button>
            </div>

            {/* Time range */}
            <div className="flex rounded-lg bg-slate-950 border border-slate-800 p-0.5 text-xs font-mono">
              {['1h', '6h', '24h'].map(r => (
                <button
                  key={r}
                  onClick={() => setChartRange(r)}
                  className={`px-2 py-1 rounded-md transition ${chartRange === r ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-56 w-full">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Awaiting continuous readings from Firebase...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="displayTime" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px' }}
                />
                {activeMetricTab === 'temp' && (
                  <>
                    <ReferenceLine y={activeProfile.temp.max} stroke="#f43f5e" strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="temperature" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                  </>
                )}
                {activeMetricTab === 'hum' && (
                  <>
                    <ReferenceLine y={activeProfile.humidity.max} stroke="#f59e0b" strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="humidity" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
                  </>
                )}
                {activeMetricTab === 'gas' && (
                  <Line type="monotone" dataKey="gas" stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 4. Active Alerts & SOP Recommendations */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Active Alerts & Operational Guidance
            </h3>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            {alerts.length} Active
          </span>
        </div>

        {alerts.length === 0 ? (
          <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-center text-xs text-emerald-300 flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>All monitored storage parameters are within safe limits.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const isAck = !!acknowledgedAlerts[alert.id];
              const isCrit = alert.severity === 'critical';

              return (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-lg border text-xs space-y-2 transition ${
                    isCrit 
                      ? 'bg-rose-950/20 border-rose-800/50 text-rose-200' 
                      : 'bg-amber-950/20 border-amber-800/50 text-amber-200'
                  } ${isAck ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-white">
                      <AlertTriangle className={`w-4 h-4 ${isCrit ? 'text-rose-400' : 'text-amber-400'}`} />
                      <span>{alert.title}</span>
                    </div>

                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      disabled={isAck}
                      className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-[11px] font-medium text-slate-300 hover:text-white flex items-center gap-1 transition"
                    >
                      <Check className="w-3 h-3" />
                      <span>{isAck ? 'Acknowledged' : 'Acknowledge'}</span>
                    </button>
                  </div>

                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {alert.explanation}
                  </p>

                  <div className="flex items-start gap-1.5 text-[11px] text-emerald-300 bg-slate-950/60 p-2 rounded border border-slate-800">
                    <Wrench className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
                    <span><strong>Action:</strong> {alert.recommendedAction}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Device Telemetry & Integrity Summary */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-slate-400 block font-mono text-[10px]">DEVICE HARDWARE</span>
          <span className="font-bold text-white">FreshTrack ESP32</span>
          <span className="text-[10px] text-amber-400 block font-mono">Status: {parsed?.deviceStatus || 'UNKNOWN'}</span>
        </div>

        <div>
          <span className="text-slate-400 block font-mono text-[10px]">DATABASE TELEMETRY</span>
          <span className="font-mono text-emerald-400">/FreshTrack/latest</span>
          <span className="text-[10px] text-slate-400 block">Firebase Realtime DB</span>
        </div>

        <div>
          <span className="text-slate-400 block font-mono text-[10px]">TIMESTAMP PARSER</span>
          <span className="font-mono text-slate-300">{parsed?.rawUpdatedAt ?? 'N/A'}</span>
          <span className="text-[10px] text-slate-400 block">ESP32 Uptime Ticks</span>
        </div>

        <div>
          <span className="text-slate-400 block font-mono text-[10px]">DATA FRESHNESS</span>
          <span className="font-mono text-white">{secondsAgo !== null ? `${secondsAgo}s ago` : 'Waiting'}</span>
          <span className="text-[10px] text-emerald-400 block">{validation.isValid ? 'Telemetry Verified' : 'Check Sensor'}</span>
        </div>
      </div>
    </div>
  );
}
