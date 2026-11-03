import React, { useState, useEffect } from 'react';
import { FreshTrackContext } from './FreshTrackContextDefinition';
import { subscribeToFreshTrackData } from '../services/firebase';
import { evaluateStorageEnvironment } from '../utils/assessment';
import { FOOD_PROFILES } from '../constants/foodProfiles';

const LOCAL_STORAGE_HISTORY_KEY = 'freshtrack_telemetry_history_v1';
const LOCAL_STORAGE_SETTINGS_KEY = 'freshtrack_user_settings_v1';

export function FreshTrackProvider({ children }) {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Selected food profile - default is 'mixed' as required by prompt
  const [activeProfileId, setActiveProfileId] = useState('mixed');

  // Custom storage profile parameters
  const [customProfileConfig, setCustomProfileConfig] = useState({
    name: 'Custom Cold Store',
    tempMin: 2,
    tempMax: 8,
    humidityMin: 40,
    humidityMax: 80,
    guidance: 'Custom user defined parameters'
  });

  // Settings
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      tempUnit: 'C',
      staleTimeoutSec: 120,
      soundEnabled: false,
      mixedFoodStrictest: true,
      gasBaseline: null,
      autoRefreshInterval: 5
    };
  });

  // Connection & Raw Sensor State
  const [isConnected, setIsConnected] = useState(false);
  const [connectionMethod, setConnectionMethod] = useState('Connecting...');
  const [liveData, setLiveData] = useState(null);
  const [validation, setValidation] = useState({ isValid: true, errors: [], warnings: [] });
  const [lastReceivedAt, setLastReceivedAt] = useState(null);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState({});

  // Session Time-Series History
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cutoff = Date.now() - 7 * 86400000;
          return parsed.filter(item => item.timestamp > cutoff);
        }
      }
    } catch (e) {
      console.warn('Could not restore local history:', e);
    }
    return [];
  });

  // Timer tick state for UI relative time counter
  const [nowTick, setNowTick] = useState(() => Date.now());

  // Save settings when modified
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Keep live tick updated every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTick(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Firebase Realtime Subscription
  useEffect(() => {
    const unsubscribe = subscribeToFreshTrackData(
      (validatedPacket, isNewData) => {
        setLiveData(validatedPacket);
        setValidation({
          isValid: validatedPacket.isValid,
          errors: validatedPacket.errors,
          warnings: validatedPacket.warnings
        });

        if (validatedPacket.parsed) {
          const timestamp = validatedPacket.parsed.receivedAt || Date.now();
          setLastReceivedAt(timestamp);

          // Add to time-series history
          if (validatedPacket.isValid) {
            setHistory(prevHistory => {
              if (!isNewData && prevHistory.length > 0) {
                return prevHistory;
              }
              const newEntry = {
                timestamp,
                temperature: validatedPacket.parsed.temperature,
                humidity: validatedPacket.parsed.humidity,
                gas: validatedPacket.parsed.gas,
                deviceStatus: validatedPacket.parsed.deviceStatus
              };
              const updated = [...prevHistory.slice(-999), newEntry];
              try {
                localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(updated.slice(-300)));
              } catch {
                // quota safety
              }
              return updated;
            });
          }
        }
      },
      (error) => {
        console.warn('FreshTrack telemetry stream error:', error);
      },
      (connected, method) => {
        setIsConnected(connected);
        setConnectionMethod(method);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Evaluate assessment dynamically
  const assessment = evaluateStorageEnvironment(
    liveData,
    validation,
    activeProfileId,
    history,
    (settings.staleTimeoutSec || 120) * 1000
  );

  // Temperature converter helper
  const formatTemp = (celsiusValue) => {
    if (typeof celsiusValue !== 'number' || isNaN(celsiusValue)) return '--';
    if (settings.tempUnit === 'F') {
      const fahrenheit = (celsiusValue * 9) / 5 + 32;
      return `${fahrenheit.toFixed(1)}°F`;
    }
    return `${celsiusValue.toFixed(1)}°C`;
  };

  // Convert raw value without unit
  const convertTempValue = (celsiusValue) => {
    if (typeof celsiusValue !== 'number' || isNaN(celsiusValue)) return null;
    if (settings.tempUnit === 'F') {
      return ((celsiusValue * 9) / 5 + 32);
    }
    return celsiusValue;
  };

  // Clear local session history
  const clearSessionHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_HISTORY_KEY);
    } catch {
      // ignore
    }
  };

  // Acknowledge an alert
  const acknowledgeAlert = (alertId) => {
    setAcknowledgedAlerts(prev => ({ ...prev, [alertId]: Date.now() }));
  };

  // Inject sample reading for offline/demonstration purposes
  const injectSampleData = (samplePacket) => {
    const validated = {
      isValid: true,
      errors: [],
      warnings: [],
      parsed: {
        ...samplePacket,
        receivedAt: Date.now(),
        isTimestampValidEpoch: false,
        timestampDisplay: `Device counter: ${samplePacket.updatedAt}`
      }
    };
    setLiveData(validated);
    setLastReceivedAt(Date.now());
  };

  return (
    <FreshTrackContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isMobileNavOpen,
        setIsMobileNavOpen,
        activeProfileId,
        setActiveProfileId,
        activeProfile: FOOD_PROFILES[activeProfileId] || FOOD_PROFILES.mixed,
        customProfileConfig,
        setCustomProfileConfig,
        settings,
        setSettings,
        isConnected,
        connectionMethod,
        liveData,
        validation,
        lastReceivedAt,
        nowTick,
        history,
        clearSessionHistory,
        assessment,
        formatTemp,
        convertTempValue,
        acknowledgedAlerts,
        acknowledgeAlert,
        injectSampleData
      }}
    >
      {children}
    </FreshTrackContext.Provider>
  );
}

export { useFreshTrack } from './useFreshTrack';
