import React, { useState, useMemo } from 'react';
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
import { 
  LineChart as ChartIcon, 
  Clock, 
  Download, 
  Trash2, 
  Database,
  Thermometer,
  Droplets,
  Wind
} from 'lucide-react';
import { useFreshTrack } from '../../context/FreshTrackContext';

export default function HistoricalView() {
  const {
    history,
    clearSessionHistory,
    activeProfile,
    nowTick
  } = useFreshTrack();

  const [timeRange, setTimeRange] = useState('1h');

  // Filter history based on time range
  const filteredHistory = useMemo(() => {
    if (!history || history.length === 0) return [];
    const now = nowTick;
    let durationMs = 3600000; // 1h default

    if (timeRange === '6h') durationMs = 6 * 3600000;
    else if (timeRange === '24h') durationMs = 24 * 3600000;
    else if (timeRange === '7d') durationMs = 7 * 86400000;

    const cutoff = now - durationMs;
    const filtered = history.filter(item => item.timestamp >= cutoff);

    return filtered.map(item => {
      const date = new Date(item.timestamp);
      const timeStr = timeRange === '7d' || timeRange === '24h'
        ? `${date.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      return {
        ...item,
        displayTime: timeStr,
        riskTemperature: item.temperature > activeProfile.temp.max,
        riskHumidity: item.humidity > activeProfile.humidity.max || item.humidity < activeProfile.humidity.min
      };
    });
  }, [history, timeRange, activeProfile, nowTick]);

  // Export history as CSV
  const handleExportCSV = () => {
    if (history.length === 0) return;
    const headers = ['Timestamp_ISO', 'Timestamp_MS', 'Temperature_C', 'Humidity_RH', 'Gas_Raw_ADC', 'Device_Status'];
    const rows = history.map(h => [
      new Date(h.timestamp).toISOString(),
      h.timestamp,
      h.temperature,
      h.humidity,
      h.gas,
      `"${h.deviceStatus || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FreshTrack_Telemetry_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
            <ChartIcon className="w-4 h-4 text-emerald-400" />
            Time-Series Environmental Logging
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Historical Environmental Analytics
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time range buttons */}
          <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs font-medium">
            {['1h', '6h', '24h', '7d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md transition ${
                  timeRange === range
                    ? 'bg-emerald-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            disabled={history.length === 0}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-xs text-slate-200 border border-slate-800 flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={clearSessionHistory}
            disabled={history.length === 0}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 disabled:opacity-40 text-slate-400 hover:text-rose-400 border border-slate-800 transition"
            title="Clear session history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Honest Data Storage Notice (Strict Requirement) */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-slate-200 font-bold">
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Transparent Data Storage Notice</span>
        </div>
        <p className="leading-relaxed text-slate-400">
          The ESP32 firmware currently updates a single database node at <code className="text-cyan-300 font-mono">/FreshTrack/latest</code>. 
          Historical server-side records are not retained on Firebase by the device. 
          To provide genuine analytical value <strong>without generating fake or fabricated historical data</strong>, 
          FreshTrack records real telemetry packets received continuously during active client sessions.
        </p>
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
          <span>Active Session Points: <strong>{history.length} logged</strong></span>
          <span>Window Displayed: <strong>{filteredHistory.length} points ({timeRange.toUpperCase()})</strong></span>
        </div>
      </div>

      {/* When no history yet */}
      {filteredHistory.length < 2 && (
        <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
          <Clock className="w-8 h-8 text-slate-400 mx-auto animate-pulse" />
          <h4 className="text-sm font-bold text-slate-200">Accumulating Telemetry Points...</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            FreshTrack has received {filteredHistory.length} telemetry reading so far. 
            Historical trendlines render continuously as new readings arrive from Firebase.
          </p>
        </div>
      )}

      {/* Chart 1: Temperature Over Time */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Temperature History (°C)
            </h3>
          </div>
          <div className="text-xs font-mono text-slate-400 flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Ambient Air
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-rose-500 inline-block border-t border-dashed" /> Max Limit ({activeProfile.temp.max}°C)
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredHistory} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="displayTime" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={['auto', 'auto']} unit="°C" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
                formatter={(val) => [`${val.toFixed(1)}°C`, 'Ambient Air']}
              />
              <ReferenceLine y={activeProfile.temp.max} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: `Max ${activeProfile.temp.max}°C`, fill: '#f43f5e', fontSize: 10 }} />
              <ReferenceLine y={activeProfile.temp.min} stroke="#38bdf8" strokeDasharray="4 4" label={{ value: `Min ${activeProfile.temp.min}°C`, fill: '#38bdf8', fontSize: 10 }} />
              <Line 
                type="monotone" 
                dataKey="temperature" 
                stroke="#10b981" 
                strokeWidth={2} 
                dot={{ r: 3, fill: '#10b981' }} 
                activeDot={{ r: 5 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Humidity Over Time */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Relative Humidity History (% RH)
            </h3>
          </div>
          <div className="text-xs font-mono text-slate-400 flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" /> Measured RH
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-500 inline-block border-t border-dashed" /> Envelope ({activeProfile.humidity.min}-{activeProfile.humidity.max}%)
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredHistory} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="displayTime" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 100]} unit="%" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
                formatter={(val) => [`${val.toFixed(1)}% RH`, 'Relative Humidity']}
              />
              <ReferenceLine y={activeProfile.humidity.max} stroke="#f59e0b" strokeDasharray="4 4" />
              <ReferenceLine y={activeProfile.humidity.min} stroke="#f59e0b" strokeDasharray="4 4" />
              <Line 
                type="monotone" 
                dataKey="humidity" 
                stroke="#06b6d4" 
                strokeWidth={2} 
                dot={{ r: 3, fill: '#06b6d4' }} 
                activeDot={{ r: 5 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Gas Sensor Raw Values Over Time */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Gas Sensor Raw ADC Values Over Time
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Uncalibrated Analog Units (No ppm)
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredHistory} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="displayTime" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
                formatter={(val) => [val, 'Raw ADC (uncalibrated)']}
              />
              <Line 
                type="monotone" 
                dataKey="gas" 
                stroke="#a855f7" 
                strokeWidth={2} 
                dot={{ r: 3, fill: '#a855f7' }} 
                activeDot={{ r: 5 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[11px] text-slate-400 pt-1">
          Displays voltage fluctuations on the ESP32 analog pin. Gas sensor model is unidentified. Raw counts reflect raw analog-to-digital converter readings only.
        </p>
      </div>
    </div>
  );
}
