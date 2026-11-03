import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onValue, off } from 'firebase/database';

// Firebase configuration for FreshTrack Realtime Database
const FIREBASE_DATABASE_URL = 'https://food-5a17d-default-rtdb.asia-southeast1.firebasedatabase.app';
const DATABASE_PATH = 'FreshTrack/latest';

const firebaseConfig = {
  databaseURL: FIREBASE_DATABASE_URL,
  projectId: 'food-5a17d',
};

// Initialize Firebase App safely (singleton pattern)
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (err) {
  console.warn('Firebase initialization warning:', err);
}

/**
 * Validates a raw sensor packet from Firebase RTDB.
 * Ensures numbers are real and within physical sensor bounds.
 */
export function validateSensorData(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      isValid: false,
      reason: 'Empty or malformed payload received from database',
      data: null
    };
  }

  const errors = [];
  const warnings = [];

  // 1. Temperature validation
  let tempVal = null;
  let tempValid = false;
  if (typeof raw.temperature === 'number' && !isNaN(raw.temperature)) {
    if (raw.temperature >= -40 && raw.temperature <= 85) {
      tempVal = raw.temperature;
      tempValid = true;
    } else {
      errors.push(`Temperature ${raw.temperature}°C out of realistic sensor range (-40 to 85°C)`);
    }
  } else {
    errors.push('Temperature missing or non-numeric');
  }

  // 2. Humidity validation
  let humidityVal = null;
  let humidityValid = false;
  if (typeof raw.humidity === 'number' && !isNaN(raw.humidity)) {
    if (raw.humidity >= 0 && raw.humidity <= 100) {
      humidityVal = raw.humidity;
      humidityValid = true;
    } else {
      errors.push(`Humidity ${raw.humidity}% out of physical range (0-100%)`);
    }
  } else {
    errors.push('Humidity missing or non-numeric');
  }

  // 3. Gas sensor validation (raw reading, strictly uncalibrated)
  let gasVal = null;
  let gasValid = false;
  if (typeof raw.gas === 'number' && !isNaN(raw.gas)) {
    if (raw.gas >= 0 && raw.gas <= 4095) {
      gasVal = raw.gas;
      gasValid = true;
    } else {
      warnings.push(`Gas raw value ${raw.gas} is outside typical 12-bit ADC range`);
      gasVal = raw.gas;
      gasValid = true;
    }
  } else {
    errors.push('Gas sensor reading missing or non-numeric');
  }

  // 4. Timestamp interpretation
  let isTimestampValidEpoch = false;
  let rawTimestamp = raw.updatedAt;
  let timestampDisplay = 'Timestamp unavailable (unsupported format)';

  if (typeof rawTimestamp === 'number') {
    if (rawTimestamp > 1000000000000 && rawTimestamp < 2500000000000) {
      isTimestampValidEpoch = true;
      timestampDisplay = new Date(rawTimestamp).toLocaleString();
    } else if (rawTimestamp > 1000000000 && rawTimestamp < 2500000000) {
      isTimestampValidEpoch = true;
      timestampDisplay = new Date(rawTimestamp * 1000).toLocaleString();
    } else {
      isTimestampValidEpoch = false;
      timestampDisplay = `Device counter: ${rawTimestamp} (uptime / ticks)`;
    }
  }

  const deviceReportedStatus = typeof raw.status === 'string' ? raw.status : 'UNKNOWN';

  return {
    isValid: tempValid && humidityValid && gasValid,
    errors,
    warnings,
    parsed: {
      temperature: tempVal,
      humidity: humidityVal,
      gas: gasVal,
      deviceStatus: deviceReportedStatus,
      rawUpdatedAt: rawTimestamp,
      isTimestampValidEpoch,
      timestampDisplay,
      receivedAt: Date.now() // Client-side reception timestamp for freshness calculation
    }
  };
}

/**
 * Subscribes to real-time updates from Firebase RTDB.
 * Also incorporates REST polling fallback for rock-solid reliability.
 */
export function subscribeToFreshTrackData(onDataCallback, onErrorCallback, onConnectionChange) {
  let dbRef = null;
  let isListening = true;
  let restPollInterval = null;
  let lastDataFingerprint = '';

  const restUrl = `${FIREBASE_DATABASE_URL}/${DATABASE_PATH}.json`;

  const fetchRestData = async (methodName = 'REST Polling') => {
    if (!isListening) return;
    try {
      const response = await fetch(restUrl, {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const rawData = await response.json();
      if (!isListening) return;

      const fingerprint = JSON.stringify(rawData);
      const isNewData = fingerprint !== lastDataFingerprint;
      lastDataFingerprint = fingerprint;

      const validated = validateSensorData(rawData);
      onConnectionChange?.(true, methodName);
      onDataCallback?.(validated, isNewData);
    } catch (err) {
      if (!isListening) return;
      console.warn('FreshTrack REST query issue:', err.message);
      onErrorCallback?.(err);
      onConnectionChange?.(false, 'Disconnected');
    }
  };

  try {
    const db = getDatabase(app);
    dbRef = ref(db, DATABASE_PATH);

    onValue(
      dbRef,
      (snapshot) => {
        if (!isListening) return;
        const rawData = snapshot.val();
        const fingerprint = JSON.stringify(rawData);
        const isNewData = fingerprint !== lastDataFingerprint;
        lastDataFingerprint = fingerprint;

        const validated = validateSensorData(rawData);
        onConnectionChange?.(true, 'Firebase Realtime WebSocket');
        onDataCallback?.(validated, isNewData);
      },
      (error) => {
        console.warn('Firebase RTDB listener error, switching to active REST fallback:', error);
        onConnectionChange?.(false, 'WebSocket Error (Using REST)');
        onErrorCallback?.(error);
        fetchRestData('REST Fallback');
      }
    );
  } catch (err) {
    console.warn('Firebase SDK init failed, falling back to REST poll:', err);
    onConnectionChange?.(false, 'SDK Error (Using REST)');
  }

  restPollInterval = setInterval(() => {
    fetchRestData('REST Sync');
  }, 5000);

  fetchRestData('Initial REST Fetch');

  return () => {
    isListening = false;
    if (restPollInterval) {
      clearInterval(restPollInterval);
    }
    if (dbRef) {
      try {
        off(dbRef);
      } catch {
        // Safe ignore on unmount
      }
    }
  };
}

export { FIREBASE_DATABASE_URL, DATABASE_PATH };
