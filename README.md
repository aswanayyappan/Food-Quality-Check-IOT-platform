# FreshTrack — IoT Food Storage Monitoring & Environmental Risk Assessment

FreshTrack is an industrial IoT food storage chamber monitoring, cold-chain compliance, and environmental risk assessment dashboard. It connects to an ESP32 microcontroller broadcasting sensor telemetry to Google Firebase Realtime Database.

---

## ⚠️ Scientific Integrity & Operational Philosophy

FreshTrack is designed as an **environmental risk assessment and monitoring platform**:
- **Ambient vs. Core Temperature:** The ESP32 measures surrounding air temperature. FreshTrack explicitly distinguishes ambient air from internal core food temperature. Brief spikes (e.g. door opening) elevate air readings rapidly, while high thermal mass protects internal core temperature. Sustained exposure is required before microbial growth accelerates into the danger zone.
- **Uncalibrated Gas Sensor:** The onboard gas sensor is labeled **Other / Not Identified**. Readings are presented strictly as raw ADC values. FreshTrack **never claims food is spoiled or safe** based on uncalibrated gas telemetry, nor does it infer specific gas compounds or ppm concentrations without formal calibration.
- **Scientific Restraint:** FreshTrack avoids misleading "Freshness Percentage" scores. Instead, it provides a transparent **Environmental Suitability Index (0–100)** with documented food-specific scoring rules.

---

## 🛠 Tech Stack

- **Frontend:** React 19, modern modular component architecture
- **Styling:** Tailwind CSS v4, dark industrial IoT aesthetic
- **Icons:** Lucide React
- **Charts:** Recharts time-series data visualizations
- **Backend / Telemetry:** Firebase Realtime Database (WebSocket + active REST fallback)
- **Deployment:** Render Static Sites compatible (`dist/`)

---

## 📡 Firebase Realtime Database Integration

- **Database URL:** `https://food-5a17d-default-rtdb.asia-southeast1.firebasedatabase.app`
- **Database Path:** `/FreshTrack/latest`

### ESP32 Telemetry Schema:
```json
{
  "gas": 256,
  "humidity": 84.5,
  "status": "WARNING",
  "temperature": 31.7,
  "updatedAt": 32236
}
```

### Telemetry Handling:
1. **Temperature:** Validated physical range (-40°C to +85°C). Displayed in °C (optional °F toggle).
2. **Humidity:** Validated range (0% to 100% RH). Evaluated per food category (high humidity is normal and required for produce, but hazardous for grains).
3. **Gas:** Treated as raw ADC counts. Baseline unestablished.
4. **Device Status:** Preserved as reported by the ESP32 (e.g. `WARNING`), separate from FreshTrack's independent calculation.
5. **Timestamp:** Raw counter `32236` is identified as device uptime ticks (not epoch ms). Freshness is tracked using client-side verified arrival timestamps.

---

## 🥦 Supported Food Categories

1. **Mixed Food (Default Monitored Category):** Explains divergent storage requirements and evaluates against the strictest applicable cold-chain standard (≤ 5°C) for perishable items.
2. **Meat and Poultry:** Cold chain ≤ 4°C, 85–90% RH.
3. **Fish and Seafood:** 0°C to 2°C, 90–95% RH.
4. **Dairy Products:** 1°C to 4°C, 65–75% RH.
5. **Cooked Food & Leftovers:** Rapid chill ≤ 4°C (FSSAI receiving ≤ 5°C), sealed container guidance.
6. **Fresh Fruits:** 1°C to 5°C, 85–95% RH (prevents wilting and transpiration).
7. **Fresh Vegetables:** Greens: 1°C to 5°C (90–95% RH); Root tubers: 10°C to 15°C (65–70% RH).
8. **Dry Food & Grains:** 15°C to 22°C, < 60% RH (high RH causes aflatoxin/mold risks).
9. **Custom Storage Profile:** User-configurable temperature and humidity thresholds.

---

## 🚀 Navigation Views

1. **Overview:** System status, active profile context, 3 metric cards (Temp, Humidity, Gas), suitability index, active alerts summary.
2. **Live Monitoring:** Real-time gauge cluster, ambient vs food core thermal lag explanation, raw Firebase JSON packet inspector.
3. **Food Assessment:** Multi-factor scoring breakdown, 6 environmental quality indicators, FSSAI cold chain compliance reference, mixed storage incompatibility matrix.
4. **Historical Analytics:** Recharts time-series graphs for Temp, Humidity, and Gas (1h, 6h, 24h, 7d), threshold reference lines, CSV export.
5. **Alerts:** Filterable alert center (Critical, Warning) with triggering metric, scientific explanation, standard operating procedure (SOP) action, and acknowledgement.
6. **Food Profiles:** Library of 9 storage profiles, incompatibility warnings, and custom profile editor.
7. **Device Information:** ESP32 diagnostics, communication ping, database path, security analysis of unauthenticated writes, production database rules guide.
8. **Settings:** Temperature unit (°C/°F), stale data timeout (1m, 2m, 5m), sound notifications, mixed food strictest mode, diagnostic telemetry test harness.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Lint codebase (0 warnings, 0 errors)
npm run lint

# Build for production
npm run build
```

---

## 🌐 Deployment to Render Static Sites

1. Connect your repository to **Render**.
2. Create a new **Static Site**.
3. Configure:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
4. Deploy!
