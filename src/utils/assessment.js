/**
 * FreshTrack Storage Environment Assessment Engine
 * 
 * Evaluates ambient environmental conditions based strictly on:
 * - Selected food profile requirements
 * - Temperature deviations and cumulative exposure duration
 * - Humidity suitability per specific food category
 * - Gas sensor reliability (treated as uncalibrated raw telemetry)
 * - Data freshness and sensor health
 * 
 * IMPORTANT: This engine evaluates AMBIENT STORAGE ENVIRONMENT ONLY.
 * It strictly avoids claiming food is fresh, spoiled, safe, or unsafe.
 */

import { FOOD_PROFILES } from '../constants/foodProfiles';

export const ASSESSMENT_STATES = {
  NORMAL: {
    key: 'NORMAL',
    label: 'Normal',
    color: 'emerald',
    badgeClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
    dotClass: 'bg-emerald-400',
    description: 'Ambient environmental parameters are currently within the acceptable boundaries for the selected food profile.'
  },
  ATTENTION_REQUIRED: {
    key: 'ATTENTION_REQUIRED',
    label: 'Attention Required',
    color: 'amber',
    badgeClass: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
    dotClass: 'bg-amber-400',
    description: 'Minor environmental deviation detected or moderate exposure duration observed. Inspect chamber conditions.'
  },
  HIGH_RISK: {
    key: 'HIGH_RISK',
    label: 'High Environmental Risk',
    color: 'rose',
    badgeClass: 'bg-rose-950/60 text-rose-300 border-rose-500/40',
    dotClass: 'bg-rose-400',
    description: 'Sustained or severe ambient deviation outside permissible storage limits. Cold chain or humidity control compromised.'
  },
  SENSOR_ERROR: {
    key: 'SENSOR_ERROR',
    label: 'Sensor Error',
    color: 'red',
    badgeClass: 'bg-red-950/60 text-red-300 border-red-500/40',
    dotClass: 'bg-red-500',
    description: 'Sensors are reporting invalid, out-of-range, or physically implausible readings. Verification required.'
  },
  INSUFFICIENT_DATA: {
    key: 'INSUFFICIENT_DATA',
    label: 'Insufficient Data',
    color: 'zinc',
    badgeClass: 'bg-zinc-800 text-zinc-300 border-zinc-600',
    dotClass: 'bg-zinc-400',
    description: 'Awaiting telemetry from Firebase or telemetry is stale (> 2 minutes without updates).'
  }
};

/**
 * Calculates environmental suitability and generated contextual alerts.
 * 
 * @param {Object} sensorData Parsed sensor data { temperature, humidity, gas, receivedAt, etc. }
 * @param {Object} validation Sensor validation result { isValid, errors, warnings }
 * @param {string} profileId Food profile identifier (e.g. 'mixed', 'meat', 'dairy', etc.)
 * @param {Array} history Recent readings history to assess exposure duration
 * @param {number} staleTimeoutMs Stale data threshold in milliseconds (default 120,000 ms = 2 min)
 */
export function evaluateStorageEnvironment(
  sensorData,
  validation,
  profileId = 'mixed',
  history = [],
  staleTimeoutMs = 120000
) {
  const profile = FOOD_PROFILES[profileId] || FOOD_PROFILES.mixed;
  const now = Date.now();

  // 1. Check Data Availability & Stale State
  if (!sensorData || !sensorData.parsed) {
    return {
      state: ASSESSMENT_STATES.INSUFFICIENT_DATA,
      suitabilityIndex: null,
      temperatureEvaluation: { status: 'UNKNOWN', description: 'No telemetry available' },
      humidityEvaluation: { status: 'UNKNOWN', description: 'No telemetry available' },
      gasEvaluation: { status: 'UNVERIFIED', description: 'Sensor model uncalibrated' },
      exposureMinutes: 0,
      alerts: [{
        id: 'no-data',
        severity: 'warning',
        title: 'No Live Sensor Data',
        trigger: 'Missing Firebase reading',
        time: now,
        explanation: 'The dashboard is currently waiting for sensor telemetry from Firebase Realtime Database (/FreshTrack/latest).',
        recommendedAction: 'Verify ESP32 power supply, Wi-Fi connectivity, and Firebase database credentials.'
      }],
      scoreBreakdown: null,
      isStale: false
    };
  }

  const { temperature, humidity, gas, receivedAt, deviceStatus } = sensorData.parsed;
  const isStale = (now - receivedAt) > staleTimeoutMs;
  const alerts = [];

  // 2. Sensor Validation Check
  if (!validation.isValid) {
    return {
      state: ASSESSMENT_STATES.SENSOR_ERROR,
      suitabilityIndex: 0,
      temperatureEvaluation: { status: 'ERROR', description: validation.errors.join('; ') },
      humidityEvaluation: { status: 'ERROR', description: 'Invalid sensor input' },
      gasEvaluation: { status: 'UNVERIFIED', description: 'Unverified sensor input' },
      exposureMinutes: 0,
      alerts: [{
        id: 'sensor-invalid',
        severity: 'critical',
        title: 'Sensor Telemetry Validation Failure',
        trigger: validation.errors.join(', '),
        time: now,
        explanation: 'Hardware sensors produced values outside physical operating parameters.',
        recommendedAction: 'Check ESP32 sensor wiring (DHT22 / SHT31 / Gas analog pin).'
      }],
      scoreBreakdown: null,
      isStale
    };
  }

  // 3. Stale Data Notice
  if (isStale) {
    const elapsedMinutes = Math.floor((now - receivedAt) / 60000);
    alerts.push({
      id: 'stale-data',
      severity: 'warning',
      title: 'Stale Sensor Telemetry',
      trigger: `Last packet received ${elapsedMinutes}m ago`,
      time: now,
      explanation: 'No recent updates received from the ESP32. Displayed readings may not reflect current storage conditions.',
      recommendedAction: 'Inspect ESP32 microcontroller status, router connection, or Firebase push loop.'
    });
  }

  // 4. Device-Reported Status Flag
  if (deviceStatus && deviceStatus.toUpperCase() === 'WARNING') {
    alerts.push({
      id: 'device-reported-warning',
      severity: 'warning',
      title: 'ESP32 Device Self-Reported Warning',
      trigger: `Status flag: "${deviceStatus}"`,
      time: now,
      explanation: 'The ESP32 firmware embedded a WARNING status flag in the JSON packet. FreshTrack preserves this hardware indicator separately from environmental calculation.',
      recommendedAction: 'Check local ESP32 serial logs or onboard indicator LEDs for firmware diagnostic codes.'
    });
  }

  // 5. Temperature Evaluation with Food-Profile Logic
  let tempStatus = 'NORMAL';
  let tempScore = 50; // out of 50 points
  let tempDescription = '';

  const tempMin = profile.temp.min;
  const tempMax = profile.temp.max;

  // Compute exposure duration outside profile limits
  let outOfBoundsCount = 0;
  const recentSlice = history.slice(-30); // Look at last ~30 readings
  if (recentSlice.length > 0) {
    outOfBoundsCount = recentSlice.filter(pt => {
      const t = pt.temperature;
      return t !== null && (t < tempMin || t > tempMax);
    }).length;
  }
  const estimatedExposureMinutes = Math.round((outOfBoundsCount * 5) / 60 * 10) / 10; // approximate based on interval

  if (temperature > tempMax) {
    const delta = temperature - tempMax;
    if (delta > 8) {
      tempStatus = 'CRITICAL_HIGH';
      tempScore = Math.max(0, 50 - delta * 4);
      tempDescription = `Ambient temperature (${temperature.toFixed(1)}°C) is severely above the ${profile.name} threshold (max ${tempMax}°C). If this is perishable food, warm air creates high microbial multiplication risk (FSSAI/FDA danger zone: 5°C-60°C). Note: Core food temperature lags ambient air.`;
      
      alerts.push({
        id: 'temp-critical-high',
        severity: 'critical',
        title: `Ambient High-Temperature Deviation (${temperature.toFixed(1)}°C)`,
        trigger: `${temperature.toFixed(1)}°C > Max Limit ${tempMax}°C (Exceeds by +${delta.toFixed(1)}°C)`,
        time: now,
        explanation: `Ambient storage air is substantially warmer than recommended for ${profile.name}. Sustained exposure will compromise shelf-life. Ambient sensor measures air, not inner core temperature.`,
        recommendedAction: `Inspect refrigeration cooling cycle, check door gaskets, and measure internal food core temperature with a calibrated penetration probe.`
      });
    } else {
      tempStatus = 'ELEVATED_HIGH';
      tempScore = Math.max(20, 50 - delta * 3.5);
      tempDescription = `Ambient temperature (${temperature.toFixed(1)}°C) is moderately above the recommended limit of ${tempMax}°C. Brief spikes (e.g. door opening) may not immediately warm food core, but sustained exposure should be mitigated.`;
      
      alerts.push({
        id: 'temp-elevated',
        severity: 'warning',
        title: `Elevated Ambient Temperature (${temperature.toFixed(1)}°C)`,
        trigger: `${temperature.toFixed(1)}°C > Limit ${tempMax}°C`,
        time: now,
        explanation: `Temperature is outside the optimal preservation band for ${profile.name}.`,
        recommendedAction: `Verify chamber thermostat setpoint and ensure door was not inadvertently left ajar.`
      });
    }
  } else if (temperature < tempMin) {
    const delta = tempMin - temperature;
    if (delta > 5) {
      tempStatus = 'CRITICAL_LOW';
      tempScore = Math.max(10, 50 - delta * 4);
      tempDescription = `Ambient temperature (${temperature.toFixed(1)}°C) is significantly below the minimum limit (${tempMin}°C). Potential risk of accidental freezing or chilling injury depending on food texture.`;
      
      alerts.push({
        id: 'temp-critical-low',
        severity: 'warning',
        title: `Low Ambient Temperature (${temperature.toFixed(1)}°C)`,
        trigger: `${temperature.toFixed(1)}°C < Min Limit ${tempMin}°C`,
        time: now,
        explanation: `Storage temperature is colder than intended for ${profile.name}. May cause texture degradation or cell-wall collapse if water freezes.`,
        recommendedAction: `Adjust refrigeration setpoint to prevent freeze damage.`
      });
    } else {
      tempStatus = 'ELEVATED_LOW';
      tempScore = 40;
      tempDescription = `Ambient temperature (${temperature.toFixed(1)}°C) is slightly below the target minimum (${tempMin}°C).`;
    }
  } else {
    tempStatus = 'OPTIMAL';
    tempScore = 50;
    tempDescription = `Ambient temperature (${temperature.toFixed(1)}°C) is fully within the optimal range (${tempMin}°C - ${tempMax}°C) for ${profile.name}.`;
  }

  // 6. Humidity Evaluation with Food-Profile Logic
  let humStatus = 'NORMAL';
  let humScore = 30; // out of 30 points
  let humDescription = '';

  const humMin = profile.humidity.min;
  const humMax = profile.humidity.max;

  if (humidity > humMax) {
    const delta = humidity - humMax;
    // Note: In fruits and vegetables, high humidity is often desired or normal!
    if (profile.id === 'fruits' || profile.id === 'vegetables') {
      humStatus = 'HIGH_ACCEPTABLE';
      humScore = 28;
      humDescription = `Relative humidity (${humidity.toFixed(1)}% RH) is elevated. In fresh produce, high humidity is physiologically normal and beneficial to prevent wilting and moisture loss, provided there is no free surface water condensation.`;
    } else if (profile.id === 'grains') {
      humStatus = 'CRITICAL_HIGH';
      humScore = Math.max(0, 30 - delta * 1.5);
      humDescription = `Critical: Relative humidity (${humidity.toFixed(1)}% RH) exceeds the safe threshold (<60% RH) for dry grains. High humidity promotes rapid mold growth, aflatoxin contamination, and insect pest proliferation.`;
      
      alerts.push({
        id: 'humidity-grains-danger',
        severity: 'critical',
        title: `Excessive Humidity for Dry Goods (${humidity.toFixed(1)}% RH)`,
        trigger: `${humidity.toFixed(1)}% RH > Max Safe Limit ${humMax}% RH`,
        time: now,
        explanation: 'Moisture ingress in dry storage creates prime conditions for mold, mycotoxins, and grain spoilage.',
        recommendedAction: 'Engage dehumidification immediately, inspect for roof/pipe leaks, and verify hermetic sealing of grain containers.'
      });
    } else {
      humStatus = 'ELEVATED_HIGH';
      humScore = Math.max(12, 30 - delta * 0.8);
      humDescription = `Relative humidity (${humidity.toFixed(1)}% RH) is above the target envelope (${humMin}-${humMax}% RH). May encourage surface condensation if temperature fluctuates.`;
      
      alerts.push({
        id: 'humidity-elevated',
        severity: 'warning',
        title: `High Relative Humidity (${humidity.toFixed(1)}% RH)`,
        trigger: `${humidity.toFixed(1)}% RH > Max ${humMax}% RH`,
        time: now,
        explanation: `Ambient air moisture exceeds the recommended profile envelope for ${profile.name}.`,
        recommendedAction: `Inspect chamber drainage line and verify door seal integrity.`
      });
    }
  } else if (humidity < humMin) {
    const delta = humMin - humidity;
    if (profile.id === 'fruits' || profile.id === 'vegetables' || profile.id === 'fish') {
      humStatus = 'DEFICIENT_LOW';
      humScore = Math.max(10, 30 - delta * 1.0);
      humDescription = `Relative humidity (${humidity.toFixed(1)}% RH) is dry for fresh produce or seafood. Low moisture causes rapid transpiration, cell collapse, wilting, and dehydration.`;
      
      alerts.push({
        id: 'humidity-desiccation-risk',
        severity: 'warning',
        title: `Low Humidity / Desiccation Risk (${humidity.toFixed(1)}% RH)`,
        trigger: `${humidity.toFixed(1)}% RH < Min ${humMin}% RH`,
        time: now,
        explanation: `Produce and seafood require high ambient humidity to prevent drying out and rapid weight loss.`,
        recommendedAction: `Use humidity-controlled crisper drawers, micro-perforated packaging, or active misting.`
      });
    } else {
      humStatus = 'LOW_ACCEPTABLE';
      humScore = 24;
      humDescription = `Relative humidity (${humidity.toFixed(1)}% RH) is below ${humMin}%. Dry ambient conditions generally suppress microbial growth on sealed products.`;
    }
  } else {
    humStatus = 'OPTIMAL';
    humScore = 30;
    humDescription = `Relative humidity (${humidity.toFixed(1)}% RH) is within the optimal storage envelope (${humMin}% - ${humMax}% RH).`;
  }

  // 7. Gas Sensor Evaluation (Strict scientific restraint)
  let gasStatus = 'UNVERIFIED_TELEMETRY';
  let gasDescription = `Raw reading: ${gas}. Sensor model is unidentified/uncalibrated. Baseline is not established. No chemical or spoilage conclusions can be drawn from this value alone.`;

  // 8. Calculate Overall Environmental Suitability Index (0 - 100)
  let freshnessScore = isStale ? 5 : 20;
  const suitabilityIndex = Math.min(100, Math.max(0, Math.round(tempScore + humScore + freshnessScore)));

  // 9. Derive Final Overall Assessment State
  let state = ASSESSMENT_STATES.NORMAL;

  if (isStale) {
    state = ASSESSMENT_STATES.INSUFFICIENT_DATA;
  } else if (tempStatus === 'CRITICAL_HIGH' || humStatus === 'CRITICAL_HIGH') {
    state = ASSESSMENT_STATES.HIGH_RISK;
  } else if (tempStatus.startsWith('ELEVATED') || humStatus.startsWith('ELEVATED') || humStatus.startsWith('DEFICIENT')) {
    state = ASSESSMENT_STATES.ATTENTION_REQUIRED;
  } else {
    state = ASSESSMENT_STATES.NORMAL;
  }

  return {
    state,
    suitabilityIndex,
    temperatureEvaluation: {
      status: tempStatus,
      value: temperature,
      targetMin: tempMin,
      targetMax: tempMax,
      score: Math.round(tempScore),
      description: tempDescription
    },
    humidityEvaluation: {
      status: humStatus,
      value: humidity,
      targetMin: humMin,
      targetMax: humMax,
      score: Math.round(humScore),
      description: humDescription
    },
    gasEvaluation: {
      status: gasStatus,
      rawValue: gas,
      baseline: 'Not established',
      calibration: 'Not available',
      description: gasDescription
    },
    exposureMinutes: estimatedExposureMinutes,
    alerts,
    scoreBreakdown: {
      temperatureScore: Math.round(tempScore),
      temperatureMax: 50,
      humidityScore: Math.round(humScore),
      humidityMax: 30,
      dataFreshnessScore: freshnessScore,
      dataFreshnessMax: 20,
      total: suitabilityIndex
    },
    isStale
  };
}
