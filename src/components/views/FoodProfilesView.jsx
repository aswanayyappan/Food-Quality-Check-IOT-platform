import React, { useState } from 'react';
import { 
  Apple, 
  Check, 
  Sliders, 
  Info, 
  Thermometer, 
  Droplets,
  Beef,
  Fish,
  Milk,
  Utensils,
  Carrot,
  Wheat,
  PackageOpen,
  ArrowRight
} from 'lucide-react';
import { useFreshTrack } from '../../context/FreshTrackContext';
import { FOOD_PROFILES } from '../../constants/foodProfiles';

const ICON_MAP = {
  PackageOpen,
  Beef,
  Fish,
  Milk,
  Utensils,
  Apple,
  Carrot,
  Wheat,
  Sliders
};

export default function FoodProfilesView() {
  const {
    activeProfileId,
    setActiveProfileId,
    customProfileConfig,
    setCustomProfileConfig
  } = useFreshTrack();

  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [customForm, setCustomForm] = useState(customProfileConfig);

  const handleSaveCustom = (e) => {
    e.preventDefault();
    setCustomProfileConfig(customForm);
    setIsEditingCustom(false);
    setActiveProfileId('custom');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
            <Apple className="w-4 h-4 text-emerald-400" />
            Storage Environment Standards Library
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Food Profiles & Environmental Thresholds
          </h2>
        </div>
      </div>

      {/* Explanatory Banner on Categorization vs Universal Thresholds */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>Scientific Necessity of Food-Specific Standards</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          Applying a single universal temperature and humidity threshold across all foods is scientifically invalid. 
          Fresh fruits and vegetables require 85-95% relative humidity to avoid transpiration and wilting, whereas 
          the identical moisture level in dry grain storage triggers rapid fungal mold, aflatoxin synthesis, and spoilage. 
          Select the active category below to align FreshTrack’s monitoring algorithms with correct food standards.
        </p>
      </div>

      {/* Grid of Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Object.values(FOOD_PROFILES).map((profile) => {
          const Icon = ICON_MAP[profile.icon] || Apple;
          const isActive = activeProfileId === profile.id;

          return (
            <div
              key={profile.id}
              className={`rounded-xl border p-5 flex flex-col justify-between transition-all duration-200 relative overflow-hidden ${
                isActive
                  ? 'bg-gradient-to-b from-emerald-950/40 to-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/30'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg border ${
                      isActive 
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60' 
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight">{profile.name}</h3>
                      {profile.id === 'mixed' && (
                        <span className="text-[10px] uppercase font-mono font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-800/40">
                          Active Default
                        </span>
                      )}
                    </div>
                  </div>

                  {isActive ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800/40">
                      <Check className="w-3 h-3" /> Selected
                    </span>
                  ) : null}
                </div>

                <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                  {profile.shortDesc}
                </p>

                {/* Target Metric Badges */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase">
                      <Thermometer className="w-3 h-3 text-emerald-400" /> Temp Target
                    </div>
                    <div className="text-xs font-mono font-bold text-white mt-0.5">
                      {profile.temp.min}°C to {profile.temp.max}°C
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase">
                      <Droplets className="w-3 h-3 text-cyan-400" /> Humidity
                    </div>
                    <div className="text-xs font-mono font-bold text-white mt-0.5">
                      {profile.humidity.min}% to {profile.humidity.max}%
                    </div>
                  </div>
                </div>

                {/* Ambient Guidance */}
                <div className="text-[11px] text-slate-300 bg-slate-950/40 rounded-lg p-2.5 border border-slate-800/60 leading-relaxed mb-4">
                  {profile.ambientDisclaimer}
                </div>

                {/* Incompatibilities if any */}
                {profile.incompatibilityNotes && profile.incompatibilityNotes.length > 0 && (
                  <div className="mb-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 block mb-1">
                      Critical Compatibility Note:
                    </span>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      {profile.incompatibilityNotes[0]}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div>
                {isActive ? (
                  <div className="w-full py-2 px-3 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-xs font-semibold text-center">
                    Currently Active Profile
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveProfileId(profile.id)}
                    className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center justify-center gap-1.5"
                  >
                    <span>Apply This Profile</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Storage Profile Customizer Panel */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Custom Storage Profile Parameters</h3>
          </div>
          <button
            onClick={() => setIsEditingCustom(!isEditingCustom)}
            className="text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
          >
            {isEditingCustom ? 'Cancel Editing' : 'Configure Custom Envelope'}
          </button>
        </div>

        {isEditingCustom ? (
          <form onSubmit={handleSaveCustom} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Min Temp (°C)</label>
                <input
                  type="number"
                  step="0.5"
                  value={customForm.tempMin}
                  onChange={(e) => setCustomForm({ ...customForm, tempMin: parseFloat(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Max Temp (°C)</label>
                <input
                  type="number"
                  step="0.5"
                  value={customForm.tempMax}
                  onChange={(e) => setCustomForm({ ...customForm, tempMax: parseFloat(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Min Humidity (%)</label>
                <input
                  type="number"
                  value={customForm.humidityMin}
                  onChange={(e) => setCustomForm({ ...customForm, humidityMin: parseFloat(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Max Humidity (%)</label>
                <input
                  type="number"
                  value={customForm.humidityMax}
                  onChange={(e) => setCustomForm({ ...customForm, humidityMax: parseFloat(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingCustom(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                Save & Apply Custom Profile
              </button>
            </div>
          </form>
        ) : (
          <p className="text-xs text-slate-400">
            Current custom boundary: <strong>{customProfileConfig.tempMin}°C to {customProfileConfig.tempMax}°C</strong>,{' '}
            <strong>{customProfileConfig.humidityMin}% to {customProfileConfig.humidityMax}% RH</strong>.
          </p>
        )}
      </div>
    </div>
  );
}
