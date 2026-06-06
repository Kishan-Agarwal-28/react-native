# SafeDrive

React Native / Expo app for the Mobile Development Cohort assignment. SafeDrive is a real-time driver safety platform that uses device sensors to detect dangerous driving events, calculate a live safety score, and present a post-drive summary with actionable feedback.

## Project Overview

SafeDrive is built with Expo Router and TypeScript. The app monitors the accelerometer, gyroscope, magnetometer, and device-motion sensors throughout a drive session, runs on-device signal processing to detect harsh driving events, and deducts points from a rolling score in real time. After the drive, a full summary is saved locally so the driver can review their history over time.

The current implementation includes:

- Sensor calibration before each drive to account for phone orientation inside the car
- Fused multi-sensor event detection for braking, acceleration, turning, steering, and phone handling
- A live score ring that updates as events are detected
- Cooldown logic to prevent duplicate events within 1.5 seconds
- Persistent threshold configuration backed by AsyncStorage
- SQLite-based drive history with per-session event breakdowns
- A post-drive summary screen with score, safety rating, and event counts
- Light and dark theme support

## Tech Stack

- Expo
- React Native
- TypeScript
- Expo Router
- Expo SQLite
- AsyncStorage
- native-ui (ui components)
- Zustand (with `persist` middleware)
- `expo-sensors` (Accelerometer, Gyroscope, Magnetometer, DeviceMotion)
- `react-native-safe-area-context`
- Feather icons via `@expo/vector-icons`

## Sensors Used

| Sensor        | Purpose                                                      |
| ------------- | ------------------------------------------------------------ |
| Accelerometer | Harsh braking, harsh acceleration, excessive device movement |
| Gyroscope     | Sharp turns, aggressive steering, phone handling detection   |
| Magnetometer  | Magnetic mount detection, compass heading                    |
| Device Motion | Fused gravity-corrected acceleration for phone tap detection |

All sensors are polled at a 100 ms interval (`SENSOR_INTERVAL = 100`). Readings are pushed into a rolling `SensorBuffer` (1 600 ms window for events, 6 000 ms window for heading drift) and processed every tick.

## Event Detection Strategy

Each event type is detected by a dedicated function imported from `services/sensors`. Detection gates combine a primary threshold crossing with secondary signal confirmation to minimise false positives — for example, a sharp-turn event requires both a gyroscope Z spike and a sustained lateral acceleration component so that picking up the phone does not fire a turn alert.

A per-type cooldown of 1 500 ms prevents the same event from firing repeatedly within a single manoeuvre.

| Event               | Primary signal                             | Confirmation gate                  |
| ------------------- | ------------------------------------------ | ---------------------------------- |
| Harsh brake         | Accel magnitude ≥ threshold, directional   | Sustained for > 1 reading          |
| Harsh acceleration  | Accel magnitude ≥ threshold, forward       | Sustained for > 1 reading          |
| Sharp turn          | Gyro Z ≥ threshold                         | Lateral accel component present    |
| Aggressive steering | Gyro Z ≥ threshold                         | `MOTION_CONFIRM` accel ≥ 2.0 m/s²  |
| Excessive movement  | Dynamic accel magnitude ≥ threshold        | 400 ms window of sustained force   |
| Phone handling      | Pitch/roll gyro ≥ threshold                | No strong lateral vehicle accel    |
| Phone tap           | Z-axis accel spike ≥ threshold             | Accel-Y road-contact gate negative |
| Magnetic mount      | Magnetometer delta ≥ threshold in one tick | Single-tick spike filter           |
| Heading turn        | Heading drift ≥ threshold over 6 s window  | Calibrated base heading required   |

### Calibration

Before the drive starts, the user is prompted to lay the phone flat and hold it still. The app collects `MIN_CALIBRATION_READINGS` samples, computes a gravity vector and base compass heading, and stores the resulting rotation matrix. All subsequent event detectors receive this matrix to project sensor readings into a car-relative frame. Calibration can be skipped (with a warning) for quick testing.

## Threshold Values

Thresholds are stored in Zustand with AsyncStorage persistence and can be adjusted from the Settings screen. Default values and rationale:

| Key                  | Default | Unit  | Reasoning                                                                                       |
| -------------------- | ------- | ----- | ----------------------------------------------------------------------------------------------- |
| `harshBrake`         | 12.0    | m/s²  | ≈ 1.2g — emergency-level deceleration; normal road bumps peak at 0.3–0.5g                       |
| `harshAcceleration`  | 7.0     | m/s²  | ≈ 0.7g — aggressive launch; sliding the phone across a desk peaks at ~0.3g                      |
| `excessiveMovement`  | 5.5     | m/s²  | Dynamic magnitude with 400 ms sustain gate; picking up the phone lacks lateral component        |
| `sharpTurn`          | 1.8     | rad/s | Fast cornering; lateral accel gate rejects most hand rotation                                   |
| `aggressiveSteering` | 2.5     | rad/s | Combined with 2.0 m/s² motion-confirm gate                                                      |
| `phoneHandling`      | 1.0     | rad/s | Pitch/roll rotation from lifting the phone; lower than steering because `phoneTap` handles taps |
| `phoneTap`           | 2.5     | m/s²  | Finger tap transmits ≈ 3–5 m/s² into phone body; road bumps filtered by accel-Y gate            |
| `magneticMountSpike` | 40      | μT    | Earth's field is 25–65 μT total; magnetic mounts add 50–200 μT in one tick                      |

## Driving Score Calculation

Every drive starts at **100 points**. Points are deducted each time a confirmed event fires, subject to the 1 500 ms per-type cooldown. The score never goes below 0.

| Event type          | Deduction |
| ------------------- | --------- |
| Harsh brake         | −5 pts    |
| Harsh acceleration  | −5 pts    |
| Sharp turn          | −3 pts    |
| Aggressive steering | −3 pts    |
| Excessive movement  | −3 pts    |
| Phone handling      | −10 pts   |
| Phone tap           | −10 pts   |
| Magnetic mount snap | −2 pts    |
| Heading turn        | −3 pts    |

### Safety Rating

| Score range | Rating    |
| ----------- | --------- |
| 90 – 100    | Excellent |
| 75 – 89     | Good      |
| 55 – 74     | Fair      |
| 0 – 54      | Poor      |

## Dashboard and Analytics

The Active Drive screen shows:

- A live score ring with a colour that shifts from green → amber → red as the score drops
- Real-time accelerometer, gyroscope, and magnetometer axis readings
- A compass heading derived from the magnetometer and gravity vector
- Calibration status badge (Calibrated / Uncalibrated)
- A live event feed (most recent 10 events, newest first)
- Per-type event counters

The Summary screen shows:

- Final score ring and safety rating
- Drive duration, total event count, and total points deducted
- Event breakdown table with counts and deductions per type

The History screen shows:

- A list of all saved drives with date, duration, event count, and score
- Score trend sparkline across recent sessions

## Navigation Structure

The app uses Expo Router with a root stack and a bottom tab layout.

- Root stack: tabs, drive session
- Tabs: Home, History, Stats, Settings

```
App Root
├── Tabs
│   ├── Home (last score, quick stats, Start Drive)
│   ├── History (past sessions, score trend)
│   ├── Stats (aggregate breakdowns)
│   └── Settings (thresholds, theme, permissions)
├── Drive Screen (live session with calibration overlay)
```

## How to Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start the Expo dev server:

```bash
npm start
```

3. Run the app on an Android emulator, iOS simulator, or a physical device using the Expo Go app or a development build.

> **Note:** Sensor features require a physical device. The accelerometer, gyroscope, and magnetometer are not available in most simulators. For best calibration results, use a device mounted or resting flat inside a vehicle.

## Assumptions Made

- The phone is assumed to be in a fixed position inside the car (cupholder, dashboard mount, or seat) during a drive. The calibration step sets a reference orientation; the detectors use this to project readings into a vehicle-relative frame.
- Sensor data is not uploaded anywhere. All processing and storage is on-device.
- The 100 ms polling interval was chosen as a balance between detection responsiveness and battery draw. Reducing it below 50 ms produces diminishing returns on a moving phone and increases CPU usage significantly.
- The `SensorBuffer` window of 1 600 ms (16 readings at 100 ms) was chosen to capture the full duration of a typical braking or acceleration event without retaining stale data that would average out the peak.
- Heading-turn detection uses a separate 6 000 ms buffer because heading drift from a lane change or large turn develops over several seconds, not milliseconds.
- Cooldown of 1 500 ms per event type prevents repeated firing during a single sustained manoeuvre (e.g. a long hard brake fires once, not ten times).
- Magnetic mount detection intentionally triggers a re-calibration after 1 500 ms because snapping into a mount changes the phone's orientation and invalidates the previous gravity vector.
- The app targets React Native's new architecture. If you encounter bridge-related warnings with older Expo SDK versions, enable the new architecture in `app.json`.

## Demo
https://github.com/user-attachments/assets/2d1ce57b-0832-4916-aed0-24e4a68ef650

