/**
 * @module sensors
 * @description
 * Multi-sensor detection for the SafeDrive app.
 * All detection functions operate on a rolling SensorBuffer and cross-check
 * accelerometer + gyroscope + magnetometer together to eliminate false positives.
 *
 * KEY DESIGN DECISIONS
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. FUSED SUBSCRIPTION  — one callback per 100 ms tick, driven by the
 *    accelerometer clock, carrying the latest gyroscope AND magnetometer
 *    readings alongside it. This avoids the duplicate-firing problem of
 *    independent listeners.
 *
 * 2. TEMPORAL HYSTERESIS — every detector asks "how many of the last N
 *    readings exceeded the threshold?" and requires a minimum count (default
 *    4-of-6 ≈ 400 ms sustained). A pothole spike lasts 1–2 readings; a real
 *    harsh brake lasts 5–10+.
 *
 * 3. CROSS-SENSOR CORRELATION — each event type has a characteristic
 *    multi-sensor signature:
 *      harsh_brake        → high accel.y AND not dominated by lateral (accel.x)
 *      harsh_acceleration → high accel.y AND not dominated by lateral
 *      sharp_turn         → high gyro.z AND confirmed by lateral accel.x
 *      aggressive_steering→ high gyro magnitude AND vehicle in motion (accel mag)
 *      excessive_movement → sustained high accel magnitude minus gravity,
 *                           with directional (x/y) force gate
 *      phone_handling     → high gyro pitch/roll WITHOUT concurrent driving signal
 *      phone_tap          → z-axis spike WITHOUT rotation or vehicle dynamics
 *
 * 4. AUTO-CALIBRATION (Magnetometer + Accelerometer)
 *    The phone can be placed in any orientation in the car (cupholder, vent
 *    mount, dashboard). Raw sensor axes are meaningless without knowing how the
 *    phone is oriented. `calibrate()` snapshots gravity (from accelerometer)
 *    and magnetic north (from magnetometer) to compute a 3×3 rotation matrix
 *    that maps raw device axes → world axes (Forward / Right / Up). After
 *    calibration, `applyRotation()` is called on every accel reading so "Y"
 *    always means "Forward" regardless of phone placement.
 *
 * 5. HEADING-CHANGE TURN VALIDATION (Magnetometer)
 *    Gyroscopes drift over time and miss slow sweeping turns (highway exits).
 *    `detectHeadingTurn()` tracks absolute magnetic heading from the
 *    magnetometer. If heading changes by ≥ HEADING_TURN_DEG over the last
 *    HEADING_WINDOW_MS milliseconds while the vehicle is in motion, a sharp
 *    turn is confirmed — even if gyro.z never spiked.
 *
 * 6. MAGNETIC MOUNT DETECTION (Magnetometer)
 *    Snapping the phone onto a magnetic dashboard mount causes a sudden large
 *    spike in magnetic field magnitude. `detectMagneticMount()` watches for
 *    this and emits a 'phone_mounted' event that the app uses to transition
 *    into strict driving mode and re-trigger calibration.
 *
 * COORDINATE SYSTEM (device in portrait, face up, BEFORE calibration):
 * ──────────────────────────────────────────────────────────────────────
 * Accelerometer (m/s² after GRAVITY multiplication):
 *   x → lateral       (left –,  right +)
 *   y → longitudinal  (back –,  forward +)  ← braking / accel axis
 *   z → vertical      (down –,  up +, includes ~9.81 m/s² at rest)
 *
 * Gyroscope (rad/s — Expo delivers in rad/s, do NOT multiply by GRAVITY):
 *   x → pitch  (nose up / down)
 *   y → roll   (left / right lean)
 *   z → yaw    (turning left / right)        ← sharp-turn axis
 *
 * Magnetometer (μT — raw, not calibrated for hard/soft iron):
 *   x → magnetic east component
 *   y → magnetic north component
 *   z → vertical magnetic component
 *
 * AFTER calibration the rotation matrix is applied to accel so the axes
 * above reflect the car frame, not the device frame.
 */

import { Platform } from "react-native";
import type {
  SensorReading,
  Thresholds,
  DriveEventType,
  EventSeverity,
} from "@/types";
import { Accelerometer, Gyroscope, Magnetometer } from "expo-sensors";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/** A single snapshot from all three sensors at the same logical moment. */
export interface FusedSensorReading {
  accel: SensorReading; // accelerometer in m/s² (gravity multiplied)
  gyro: SensorReading; // gyroscope in rad/s (raw, no gravity factor)
  mag: SensorReading; // magnetometer in μT (raw)
  timestamp: number; // Date.now() at capture
}

export interface DetectionResult {
  detected: boolean;
  type: DriveEventType | "phone_mounted";
  /** Instantaneous raw value of the primary signal axis (for UI display). */
  value: number;
  severity: EventSeverity;
  /**
   * 0–1 confidence derived from hysteresis: how many recent readings passed
   * vs how many were required. Useful for progressive UI feedback.
   */
  confidence: number;
}

/**
 * A 3×3 rotation matrix stored row-major.
 *   [ r[0] r[1] r[2] ]
 *   [ r[3] r[4] r[5] ]
 *   [ r[6] r[7] r[8] ]
 *
 * Multiply a column vector (x, y, z) to transform device axes → world axes.
 */
export type RotationMatrix = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

/** Result returned by `calibrate()`. */
export interface CalibrationResult {
  matrix: RotationMatrix;
  /** Heading at calibration time in degrees [0, 360). Used as the drive baseline. */
  baseHeadingDeg: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export const GRAVITY = 9.81;

/**
 * Number of recent readings inspected per detection call.
 * At 100 ms polling → 6 readings = 600 ms window.
 */
const HYSTERESIS_WINDOW = 6;

/**
 * Minimum readings that must pass the detector test to confirm an event.
 * 4-of-6 means ~400 ms of sustained signal is required.
 */
const HYSTERESIS_REQUIRED = 4;

/**
 * Heading change (degrees) required over HEADING_WINDOW_MS to confirm a turn
 * via magnetometer alone. 45° in 5 s catches highway sweeping exits.
 */
const HEADING_TURN_DEG = 45;

/**
 * Time window over which heading change is measured for slow-turn detection.
 * 5000 ms = the gyroscope window is far too short; magnetometer needs longer.
 */
const HEADING_WINDOW_MS = 5000;

/**
 * How much the magnetic field magnitude must jump (in μT) in one tick to
 * register as a magnetic mount snap. Car mounts add 50–200 μT instantly.
 */
const MAG_MOUNT_SPIKE_UT = 40; // μT delta in a single 100 ms tick

/**
 * Minimum number of readings needed in the buffer before we run any
 * calibration or detection. Prevents stale-zero contamination at startup.
 */
const MIN_CALIBRATION_READINGS = 10; // 1 second at 100 ms

// ─────────────────────────────────────────────────────────────────────────────
// SENSOR BUFFER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A fixed-size FIFO of FusedSensorReadings.
 * Detectors call countLastN() to enforce temporal consistency.
 */
export class SensorBuffer {
  private buffer: FusedSensorReading[] = [];
  private readonly maxSize: number;

  /** @param windowMs   How far back to keep readings (default 600 ms)  */
  /** @param intervalMs Sensor polling interval (default 100 ms)         */
  constructor(
    readonly windowMs = 600,
    readonly intervalMs = 100,
  ) {
    this.maxSize = Math.ceil(windowMs / intervalMs);
  }

  push(reading: FusedSensorReading): void {
    this.buffer.push(reading);
    if (this.buffer.length > this.maxSize) this.buffer.shift();
  }

  get latest(): FusedSensorReading | undefined {
    return this.buffer[this.buffer.length - 1];
  }

  get oldest(): FusedSensorReading | undefined {
    return this.buffer[0];
  }

  get size(): number {
    return this.buffer.length;
  }

  get isFull(): boolean {
    return this.buffer.length >= this.maxSize;
  }

  /**
   * Count how many of the last `n` readings satisfy `test`.
   * If fewer than `n` readings exist, only those available are checked —
   * so detection cannot fire until at least HYSTERESIS_REQUIRED readings
   * are in the buffer.
   */
  countLastN(n: number, test: (r: FusedSensorReading) => boolean): number {
    return this.buffer.slice(-n).filter(test).length;
  }

  /** Rolling average of any scalar extracted from the buffer. */
  average(extract: (r: FusedSensorReading) => number): number {
    if (this.buffer.length === 0) return 0;
    return this.buffer.reduce((s, r) => s + extract(r), 0) / this.buffer.length;
  }

  /** Returns a shallow copy of all readings (oldest → newest). */
  snapshot(): FusedSensorReading[] {
    return [...this.buffer];
  }

  clear(): void {
    this.buffer = [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBSCRIPTION FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Subscribe to accelerometer + gyroscope + magnetometer as a single fused stream.
 *
 * Architecture:
 *   • Gyroscope listener — caches its latest value only.
 *   • Magnetometer listener — caches its latest value only.
 *   • Accelerometer listener — primary "clock": fires the fused callback once
 *     per tick using whatever the most recent gyro + mag readings are.
 *
 * This gives exactly one callback per intervalMs with no duplicate firing.
 * The callback is withheld until ALL THREE sensors have reported at least once.
 *
 * @returns unsubscribe function — call in useEffect cleanup.
 */
export function subscribeToFusedSensors(
  callback: (data: FusedSensorReading) => void,
  intervalMs = 100,
): () => void {
  if (Platform.OS === "web") {
    console.warn("[SafeDrive] Sensors are not supported on web");
    return () => {};
  }

  let latestGyro: SensorReading | null = null;
  let latestMag: SensorReading | null = null;

  Accelerometer.setUpdateInterval(intervalMs);
  Gyroscope.setUpdateInterval(intervalMs);
  Magnetometer.setUpdateInterval(intervalMs);

  const gyroSub = Gyroscope.addListener(({ x, y, z }) => {
    latestGyro = { x, y, z };
  });

  const magSub = Magnetometer.addListener(({ x, y, z }) => {
    latestMag = { x, y, z };
  });

  // Accel is the clock — fires the fused callback
  const accelSub = Accelerometer.addListener(({ x, y, z }) => {
    // Wait until all sensors have reported at least once
    if (!latestGyro || !latestMag) return;

    callback({
      accel: { x: x * GRAVITY, y: y * GRAVITY, z: z * GRAVITY },
      gyro: { ...latestGyro },
      mag: { ...latestMag },
      timestamp: Date.now(),
    });
  });

  return () => {
    accelSub.remove();
    gyroSub.remove();
    magSub.remove();
  };
}

// Backward-compat single-sensor subscriptions
export function subscribeToAccelerometer(
  callback: (data: SensorReading) => void,
  intervalMs = 100,
): () => void {
  if (Platform.OS === "web") {
    console.warn("[SafeDrive] Accelerometer is not supported on web");
    return () => {};
  }
  Accelerometer.setUpdateInterval(intervalMs);
  const sub = Accelerometer.addListener(({ x, y, z }) =>
    callback({ x: x * GRAVITY, y: y * GRAVITY, z: z * GRAVITY }),
  );
  return () => sub.remove();
}

export function subscribeToGyroscope(
  callback: (data: SensorReading) => void,
  intervalMs = 100,
): () => void {
  if (Platform.OS === "web") {
    console.warn("[SafeDrive] Gyroscope is not supported on web");
    return () => {};
  }
  Gyroscope.setUpdateInterval(intervalMs);
  const sub = Gyroscope.addListener(({ x, y, z }) => callback({ x, y, z }));
  return () => sub.remove();
}

export function subscribeToMagnetometer(
  callback: (data: SensorReading) => void,
  intervalMs = 100,
): () => void {
  if (Platform.OS === "web") {
    console.warn("[SafeDrive] Magnetometer is not supported on web");
    return () => {};
  }
  Magnetometer.setUpdateInterval(intervalMs);
  const sub = Magnetometer.addListener(({ x, y, z }) => callback({ x, y, z }));
  return () => sub.remove();
}

export async function checkAccelerometerAvailability(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  return Accelerometer.isAvailableAsync();
}

export async function checkGyroscopeAvailability(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  return Gyroscope.isAvailableAsync();
}

export async function checkMagnetometerAvailability(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  return Magnetometer.isAvailableAsync();
}

// ─────────────────────────────────────────────────────────────────────────────
// MATH HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function magnitude(r: SensorReading): number {
  return Math.sqrt(r.x * r.x + r.y * r.y + r.z * r.z);
}

function normalize(r: SensorReading): SensorReading {
  const mag = magnitude(r);
  if (mag === 0) return { x: 0, y: 0, z: 0 };
  return { x: r.x / mag, y: r.y / mag, z: r.z / mag };
}

function cross(a: SensorReading, b: SensorReading): SensorReading {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function deriveSeverity(value: number, threshold: number): EventSeverity {
  if (value >= threshold * 1.6) return "high";
  if (value >= threshold * 1.2) return "medium";
  return "low";
}

function buildResult(
  passing: number,
  type: DriveEventType,
  value: number,
  threshold: number,
  required = HYSTERESIS_REQUIRED,
): DetectionResult {
  return {
    detected: passing >= required,
    type,
    value,
    severity: deriveSeverity(value, threshold),
    confidence: clamp01(passing / required),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTO-CALIBRATION (Magnetometer + Accelerometer)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute a rotation matrix that maps raw device axes → world axes.
 *
 * ALGORITHM (same as Android SensorManager.getRotationMatrix):
 * ─────────────────────────────────────────────────────────────
 *  1. gravity vector  G = average accel over the buffer (points toward Earth center)
 *  2. magnetic vector H = average mag over the buffer (points toward magnetic North)
 *  3. East  = normalize(H × G)       (cross product gives East)
 *  4. North = normalize(G × East)    (perpendicular to both, points North in horizontal plane)
 *  5. Up    = normalize(G) reversed  (opposite to gravity = Up)
 *
 *  The 3×3 matrix rows are [East, North, Up].
 *  Multiplying a device-frame vector by this matrix gives the world-frame vector
 *  where X = East, Y = North (≈ Forward in car), Z = Up.
 *
 * WHY THIS WORKS:
 *  No matter how the phone is tilted or rotated in the car, gravity always
 *  points down and the magnetometer always points toward magnetic north.
 *  These two independent vectors fully constrain the 3D orientation of the
 *  device relative to Earth. The cross-products build an orthonormal basis
 *  (three mutually perpendicular unit vectors) that represents that orientation.
 *
 * LIMITATIONS:
 *  • Assumes the phone is stationary during calibration (gravity vector is
 *    meaningful only when the car isn't accelerating). Call calibrate() while
 *    the car is at rest or cruising at constant speed.
 *  • Hard/soft iron distortion near speakers, car frames, or magnetic mounts
 *    will skew the North estimate. A full Ellipsoid calibration would help but
 *    is overkill for this use case — the heading is used only to detect
 *    *changes*, not absolute bearing, so constant offsets cancel out.
 *  • Returns null if the buffer has fewer than MIN_CALIBRATION_READINGS or if
 *    the gravity/magnetic vectors are near-parallel (undefined cross product).
 *
 * @param buffer  SensorBuffer with at least MIN_CALIBRATION_READINGS readings.
 * @returns CalibrationResult or null if calibration cannot be completed.
 */
export function calibrate(buffer: SensorBuffer): CalibrationResult | null {
  if (buffer.size < MIN_CALIBRATION_READINGS) {
    console.warn("[SafeDrive] calibrate() called with insufficient readings");
    return null;
  }

  const readings = buffer.snapshot();

  // Average gravity and magnetic vectors over all buffered readings
  const avgAccel: SensorReading = {
    x: readings.reduce((s, r) => s + r.accel.x, 0) / readings.length,
    y: readings.reduce((s, r) => s + r.accel.y, 0) / readings.length,
    z: readings.reduce((s, r) => s + r.accel.z, 0) / readings.length,
  };

  const avgMag: SensorReading = {
    x: readings.reduce((s, r) => s + r.mag.x, 0) / readings.length,
    y: readings.reduce((s, r) => s + r.mag.y, 0) / readings.length,
    z: readings.reduce((s, r) => s + r.mag.z, 0) / readings.length,
  };

  // Build world-frame basis vectors
  // gravity points DOWN so negate it to get the UP direction
  const up = normalize({ x: -avgAccel.x, y: -avgAccel.y, z: -avgAccel.z });
  const H = normalize(avgMag);

  // East = magnetic_north × up (right-hand rule)
  const east = normalize(cross(H, up));

  // Check for degenerate case (phone pointing directly at magnetic north)
  if (magnitude(east) < 0.1) {
    console.warn(
      "[SafeDrive] calibrate() degenerate: gravity and magnetic vectors near-parallel",
    );
    return null;
  }

  // North = up × east
  const north = normalize(cross(up, east));

  // Row-major 3×3 rotation matrix: [East | North | Up]
  const matrix: RotationMatrix = [
    east.x,
    east.y,
    east.z,
    north.x,
    north.y,
    north.z,
    up.x,
    up.y,
    up.z,
  ];

  // Compute heading at calibration time so detectHeadingTurn can track deltas
  const baseHeadingDeg = computeHeadingDeg(avgMag, avgAccel);

  return { matrix, baseHeadingDeg };
}

/**
 * Apply a calibration rotation matrix to a raw accelerometer reading.
 * Returns a new SensorReading in world-frame coordinates
 * (X = East/Right, Y = North/Forward, Z = Up).
 *
 * If no calibration has been done yet (matrix is null), returns the
 * original reading unchanged so all detectors degrade gracefully.
 */
export function applyRotation(
  reading: SensorReading,
  matrix: RotationMatrix | null,
): SensorReading {
  if (!matrix) return reading;
  return {
    x: matrix[0] * reading.x + matrix[1] * reading.y + matrix[2] * reading.z,
    y: matrix[3] * reading.x + matrix[4] * reading.y + matrix[5] * reading.z,
    z: matrix[6] * reading.x + matrix[7] * reading.y + matrix[8] * reading.z,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HEADING HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute magnetic heading in degrees [0, 360) from magnetometer + accelerometer.
 *
 * Tilt-compensated heading:
 *   1. Compute pitch and roll from accelerometer
 *   2. Rotate magnetometer vector to horizontal plane using pitch/roll
 *   3. atan2 gives bearing relative to magnetic north
 *
 * This is the same algorithm used by compass apps to compensate for tilt.
 */
export function computeHeadingDeg(
  mag: SensorReading,
  accel: SensorReading,
): number {
  const norm = magnitude(accel);
  if (norm === 0) return 0;

  const ax = accel.x / norm;
  const ay = accel.y / norm;
  const az = accel.z / norm;

  // Pitch and roll from accelerometer
  const pitch = Math.asin(-ax);
  const roll = Math.atan2(ay, az);

  // Tilt-compensated magnetic field components
  const mx = mag.x * Math.cos(pitch) + mag.z * Math.sin(pitch);
  const my =
    mag.x * Math.sin(roll) * Math.sin(pitch) +
    mag.y * Math.cos(roll) -
    mag.z * Math.sin(roll) * Math.cos(pitch);

  // Heading: 0 = North, increases clockwise
  let heading = Math.atan2(-my, mx) * (180 / Math.PI);
  if (heading < 0) heading += 360;
  return heading;
}

/**
 * Smallest signed angular difference between two headings in degrees.
 * Returns a value in (−180, 180].
 */
function headingDelta(from: number, to: number): number {
  let delta = to - from;
  while (delta > 180) delta -= 360;
  while (delta <= -180) delta += 360;
  return delta;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAGNETOMETER-BASED DETECTORS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Magnetic mount snap detection.
 *
 * Signature:
 *   • |mag_magnitude(t) − mag_magnitude(t−1)| > MAG_MOUNT_SPIKE_UT
 *   • Fires on the first reading that crosses the threshold (no hysteresis —
 *     a mount snap is instantaneous and we want to catch it immediately)
 *
 * Why 40 μT?
 *   Earth's magnetic field is 25–65 μT total. A magnetic phone mount adds
 *   50–200 μT at contact range. A delta of 40 μT in 100 ms is physically
 *   impossible without a strong nearby magnet — car speakers, seatbelts, and
 *   road vibration produce deltas < 5 μT.
 *
 * The result type is 'phone_mounted' — handle this in DriveScreen to
 * re-trigger calibration and switch to strict driving mode.
 */
export function detectMagneticMount(buffer: SensorBuffer): DetectionResult {
  const readings = buffer.snapshot();
  if (readings.length < 2) {
    return {
      detected: false,
      type: "phone_mounted",
      value: 0,
      severity: "low",
      confidence: 0,
    };
  }

  const latest = readings[readings.length - 1];
  const prev = readings[readings.length - 2];

  const latestMagMag = magnitude(latest.mag);
  const prevMagMag = magnitude(prev.mag);
  const delta = Math.abs(latestMagMag - prevMagMag);

  return {
    detected: delta > MAG_MOUNT_SPIKE_UT,
    type: "phone_mounted",
    value: delta,
    severity: delta > MAG_MOUNT_SPIKE_UT * 2 ? "high" : "medium",
    confidence: clamp01(delta / (MAG_MOUNT_SPIKE_UT * 2)),
  };
}

/**
 * Slow heading-change turn detection (magnetometer primary, motion-gated).
 *
 * Catches what gyroscopes miss:
 *   • A sweeping highway exit over 3–5 seconds has low instantaneous yaw rate
 *     (gyro.z barely moves) but the compass heading changes 45–90°.
 *   • This detector looks back HEADING_WINDOW_MS and measures total heading change.
 *
 * Signature:
 *   • |headingDelta(oldest_heading, newest_heading)| ≥ HEADING_TURN_DEG
 *   • Vehicle in motion: average dynamic accel magnitude > MOTION_CONFIRM
 *   • Window: HEADING_WINDOW_MS (5000 ms) — much longer than gyro hysteresis
 *
 * The result type is 'sharp_turn' — it feeds the same event pipeline as the
 * gyroscope sharp-turn detector, so both can fire and the cooldown deduplicates.
 *
 * Note on magnetometer noise:
 *   Heading computed from raw magnetometer is noisy (±5–10°). Using a 5-second
 *   window averages out most noise — you need a *real* 45° turn, not jitter.
 */
export function detectHeadingTurn(
  buffer: SensorBuffer,
  thresholds: Thresholds,
): DetectionResult {
  const MOTION_CONFIRM = 1.0; // m/s² — vehicle must be moving

  const readings = buffer.snapshot();
  if (readings.length < 2) {
    return {
      detected: false,
      type: "sharp_turn",
      value: 0,
      severity: "low",
      confidence: 0,
    };
  }

  const now = readings[readings.length - 1].timestamp;
  const windowStart = now - HEADING_WINDOW_MS;

  // Find the oldest reading within the heading window
  const windowReadings = readings.filter((r) => r.timestamp >= windowStart);
  if (windowReadings.length < 2) {
    return {
      detected: false,
      type: "sharp_turn",
      value: 0,
      severity: "low",
      confidence: 0,
    };
  }

  const oldest = windowReadings[0];
  const latest = windowReadings[windowReadings.length - 1];

  const oldestHeading = computeHeadingDeg(oldest.mag, oldest.accel);
  const latestHeading = computeHeadingDeg(latest.mag, latest.accel);
  const totalTurn = Math.abs(headingDelta(oldestHeading, latestHeading));

  // Gate: vehicle must be in motion (not phone sitting on desk while being calibrated)
  const avgDynamicAccel =
    windowReadings.reduce(
      (s, r) => s + Math.max(0, magnitude(r.accel) - GRAVITY),
      0,
    ) / windowReadings.length;
  const isInMotion = avgDynamicAccel > MOTION_CONFIRM;

  const detected = totalTurn >= HEADING_TURN_DEG && isInMotion;
  const threshold = HEADING_TURN_DEG;

  return {
    detected,
    type: "sharp_turn",
    value: totalTurn,
    severity: deriveSeverity(totalTurn, threshold),
    confidence: clamp01(totalTurn / threshold),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MULTI-SENSOR DETECTION FUNCTIONS
//
// Every function accepts a SensorBuffer + optional RotationMatrix.
// When a calibration matrix is present, accel readings are rotated into
// world-frame before thresholding — so Y always means "Forward."
//
// Typical usage in a component:
//
//   const buffer = useMemo(() => new SensorBuffer(600, 100), []);
//   const calibRef = useRef<CalibrationResult | null>(null);
//
//   useEffect(() => {
//     return subscribeToFusedSensors((fused) => {
//       buffer.push(fused);
//
//       // After 1 s of data, calibrate once (or re-calibrate on mount snap)
//       if (!calibRef.current && buffer.size >= MIN_CALIBRATION_READINGS) {
//         calibRef.current = calibrate(buffer);
//       }
//
//       const matrix = calibRef.current?.matrix ?? null;
//       const result = detectHarshBrake(buffer, thresholds, matrix);
//       if (result.detected) handleEvent(result);
//     });
//   }, []);
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Harsh braking — accelerometer primary (world-frame Y axis after calibration).
 *
 * Signature:
 *   • accel_world.y < −threshold  (forward deceleration in car frame)
 *   • |accel_world.y| ≥ 0.5 × |accel_world.x| (not a lateral swerve)
 *   • Sustained for HYSTERESIS_REQUIRED readings (~400 ms)
 */
export function detectHarshBrake(
  buffer: SensorBuffer,
  thresholds: Thresholds,
  matrix: RotationMatrix | null = null,
): DetectionResult {
  const threshold = thresholds.harshBrake;

  const passing = buffer.countLastN(HYSTERESIS_WINDOW, ({ accel }) => {
    const a = applyRotation(accel, matrix);
    const isDecelerating = a.y < -threshold;
    const notDominatedByLateral = Math.abs(a.y) >= Math.abs(a.x) * 0.5;
    return isDecelerating && notDominatedByLateral;
  });

  const raw = buffer.latest?.accel ?? { x: 0, y: 0, z: 0 };
  const value = Math.abs(applyRotation(raw, matrix).y);
  return buildResult(passing, "harsh_brake", value, threshold);
}

/**
 * Harsh acceleration — mirror of harsh braking on the positive Y axis.
 *
 * Signature:
 *   • accel_world.y > threshold
 *   • |accel_world.y| ≥ 0.5 × |accel_world.x|
 *   • Sustained for HYSTERESIS_REQUIRED readings
 */
export function detectHarshAcceleration(
  buffer: SensorBuffer,
  thresholds: Thresholds,
  matrix: RotationMatrix | null = null,
): DetectionResult {
  const threshold = thresholds.harshAcceleration;

  const passing = buffer.countLastN(HYSTERESIS_WINDOW, ({ accel }) => {
    const a = applyRotation(accel, matrix);
    const isAccelerating = a.y > threshold;
    const notDominatedByLateral = Math.abs(a.y) >= Math.abs(a.x) * 0.5;
    return isAccelerating && notDominatedByLateral;
  });

  const raw = buffer.latest?.accel ?? { x: 0, y: 0, z: 0 };
  const value = applyRotation(raw, matrix).y;
  return buildResult(passing, "harsh_acceleration", value, threshold);
}

/**
 * Excessive movement — sustained high total accelerometer magnitude.
 *
 * Signature:
 *   • magnitude(accel) − gravity > threshold
 *   • At least one axis shows directional force (not just vertical z bounce)
 *   • Sustained: 4-of-6 readings (~400 ms)
 *
 * The directional gate (accel.x or accel.y > VEHICLE_MOTION_GATE) distinguishes
 * road-contact forces from someone picking up the phone vertically off a desk.
 */
export function detectExcessiveMovement(
  buffer: SensorBuffer,
  thresholds: Thresholds,
  matrix: RotationMatrix | null = null,
): DetectionResult {
  const threshold = thresholds.excessiveMovement;
  const VEHICLE_MOTION_GATE = 1.5;

  const passing = buffer.countLastN(HYSTERESIS_WINDOW, ({ accel }) => {
    const a = applyRotation(accel, matrix);
    const dynamicMag = Math.max(0, magnitude(a) - GRAVITY);
    const hasDirectionalForce =
      Math.abs(a.y) > VEHICLE_MOTION_GATE ||
      Math.abs(a.x) > VEHICLE_MOTION_GATE;
    return dynamicMag > threshold && hasDirectionalForce;
  });

  const raw = buffer.latest?.accel ?? { x: 0, y: 0, z: 0 };
  const value = Math.max(0, magnitude(applyRotation(raw, matrix)) - GRAVITY);
  return buildResult(passing, "excessive_movement", value, threshold);
}

/**
 * Sharp turn — gyroscope primary, accelerometer lateral as confirmation.
 *
 * Signature:
 *   • |gyro.z| > threshold  (high yaw rate)
 *   • |accel_world.x| > LATERAL_CONFIRM (lateral G confirming real turn)
 *   • Sustained for HYSTERESIS_REQUIRED readings
 *
 * Complement with detectHeadingTurn() which catches slow sweeping turns
 * that never break the gyro threshold.
 */
export function detectSharpTurn(
  buffer: SensorBuffer,
  thresholds: Thresholds,
  matrix: RotationMatrix | null = null,
): DetectionResult {
  const threshold = thresholds.sharpTurn;
  const LATERAL_CONFIRM = 0.5;

  const passing = buffer.countLastN(HYSTERESIS_WINDOW, ({ accel, gyro }) => {
    const a = applyRotation(accel, matrix);
    const isHighYaw = Math.abs(gyro.z) > threshold;
    const hasLateralAccel = Math.abs(a.x) > LATERAL_CONFIRM;
    return isHighYaw && hasLateralAccel;
  });

  const value = Math.abs(buffer.latest?.gyro.z ?? 0);
  return buildResult(passing, "sharp_turn", value, threshold);
}

/**
 * Aggressive steering — sustained high total gyroscope magnitude while
 * the vehicle is clearly in motion.
 *
 * Signature:
 *   • magnitude(gyro) > threshold
 *   • magnitude(accel) − gravity > MOTION_CONFIRM  (car is moving)
 *   • Sustained for HYSTERESIS_REQUIRED readings
 *
 * MOTION_CONFIRM raised to 2.0 m/s² to prevent desk jostling false positives.
 */
export function detectAggressiveSteering(
  buffer: SensorBuffer,
  thresholds: Thresholds,
  matrix: RotationMatrix | null = null,
): DetectionResult {
  const threshold = thresholds.aggressiveSteering;
  const MOTION_CONFIRM = 2.0;

  const passing = buffer.countLastN(HYSTERESIS_WINDOW, ({ accel, gyro }) => {
    const a = applyRotation(accel, matrix);
    const isHighGyro = magnitude(gyro) > threshold;
    const isInMotion = Math.max(0, magnitude(a) - GRAVITY) > MOTION_CONFIRM;
    return isHighGyro && isInMotion;
  });

  const value = magnitude(buffer.latest?.gyro ?? { x: 0, y: 0, z: 0 });
  return buildResult(passing, "aggressive_steering", value, threshold);
}

/**
 * Phone handling — gyroscope pitch/roll spike WITHOUT concurrent driving signal.
 *
 * Signature:
 *   • sqrt(gyro.x² + gyro.y²) > threshold  (pitch/roll spike from pickup)
 *   • |accel_world.y| < harshBrake × 0.6   (not braking / accelerating)
 *   • |gyro.z| < sharpTurn × 0.6           (not in a real turn)
 *   • Sustained for HYSTERESIS_REQUIRED readings
 */
export function detectPhoneHandling(
  buffer: SensorBuffer,
  thresholds: Thresholds,
  matrix: RotationMatrix | null = null,
): DetectionResult {
  const threshold = thresholds.phoneHandling;
  const BRAKING_GATE = thresholds.harshBrake * 0.6;
  const TURNING_GATE = thresholds.sharpTurn * 0.6;

  const passing = buffer.countLastN(HYSTERESIS_WINDOW, ({ accel, gyro }) => {
    const a = applyRotation(accel, matrix);
    const pitchRollMag = Math.sqrt(gyro.x * gyro.x + gyro.y * gyro.y);
    const isHandling = pitchRollMag > threshold;
    const isDrivingBraking = Math.abs(a.y) > BRAKING_GATE;
    const isDrivingTurning = Math.abs(gyro.z) > TURNING_GATE;
    return isHandling && !isDrivingBraking && !isDrivingTurning;
  });

  const g = buffer.latest?.gyro ?? { x: 0, y: 0, z: 0 };
  const value = Math.sqrt(g.x * g.x + g.y * g.y);
  return buildResult(passing, "phone_handling", value, threshold);
}

/**
 * Phone tap detection — z-axis micro-impact WITHOUT rotation or vehicle dynamics.
 *
 * Signature:
 *   • |accel_world.z − GRAVITY| > threshold  (screen tap = force into screen face)
 *   • magnitude(gyro) < TAP_GYRO_GATE        (taps don't rotate the device)
 *   • |accel_world.y| < harshBrake × 0.5     (reject potholes / road dips)
 *   • 3-of-4 readings (taps are brief ~200–300 ms)
 *
 * After calibration, z in world-frame is always "Up" so tapping the screen
 * (which is face-up) is still captured correctly regardless of phone placement.
 */
export function detectPhoneTap(
  buffer: SensorBuffer,
  thresholds: Thresholds,
  matrix: RotationMatrix | null = null,
): DetectionResult {
  const threshold = thresholds.phoneTap;
  const TAP_GYRO_GATE = 0.8;
  const TAP_WINDOW = 4;
  const TAP_REQUIRED = 3;

  const passing = buffer.countLastN(TAP_WINDOW, ({ accel, gyro }) => {
    const a = applyRotation(accel, matrix);
    const zDynamic = Math.abs(Math.abs(a.z) - GRAVITY);
    const hasZSpike = zDynamic > threshold;
    const noRotation = magnitude(gyro) < TAP_GYRO_GATE;
    const notBrakingOrPothole = Math.abs(a.y) < thresholds.harshBrake * 0.5;
    return hasZSpike && noRotation && notBrakingOrPothole;
  });

  const rawA = buffer.latest?.accel ?? { x: 0, y: 0, z: 0 };
  const a = applyRotation(rawA, matrix);
  const value = Math.abs(Math.abs(a.z) - GRAVITY);
  return buildResult(passing, "phone_handling", value, threshold, TAP_REQUIRED);
}

// Re-export MIN_CALIBRATION_READINGS so DriveScreen can use it for the
// "wait before calibrating" guard without importing a magic number.
export { MIN_CALIBRATION_READINGS };
