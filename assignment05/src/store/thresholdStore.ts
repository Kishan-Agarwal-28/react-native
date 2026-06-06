import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Thresholds } from "@/types";

const ASYNC_STORAGE_KEY = "safedrive-thresholds";

export const DEFAULT_THRESHOLDS: Thresholds = {
  // ── Accelerometer-based ──────────────────────────────────────────────────
  // 12.0 m/s² ≈ 1.2g — needs emergency-level deceleration; won't false-fire
  // on desk jostling or normal road bumps (which peak at 0.3–0.5g).
  harshBrake: 12.0,

  // 7.0 m/s² ≈ 0.7g — aggressive launch but not triggered by pushing a phone
  // across a table (which peaks at ~0.3g for 1–2 readings).
  harshAcceleration: 7.0,

  // 5.5 m/s² dynamic magnitude — needs sustained road-contact forces for
  // 400 ms. Picking the phone straight up off a flat surface stays below this
  // because there's no lateral component to satisfy the directional gate.
  excessiveMovement: 5.5,

  // ── Gyroscope-based ──────────────────────────────────────────────────────
  // 1.8 rad/s — fast cornering. Lateral accel gate rejects most hand rotation.
  sharpTurn: 1.8,

  // 2.5 rad/s — combined with MOTION_CONFIRM = 2.0 m/s² in the detector,
  // this only fires while the vehicle is generating real road-contact dynamics.
  aggressiveSteering: 2.5,

  // ── Phone-handling ───────────────────────────────────────────────────────
  // 1.0 rad/s pitch/roll — sensitivity lowered because phone_tap now handles
  // screen touches separately. This detects rotation from picking the phone up.
  phoneHandling: 1.0,

  // 2.5 m/s² z-axis dynamic force — a finger tap on the screen transmits
  // ~3–5 m/s² into the phone body. Road bumps are filtered by the accel.y gate.
  phoneTap: 2.5,

  // ── Magnetometer-based ───────────────────────────────────────────────────
  // 40 μT delta in one 100 ms tick. Earth's field is 25–65 μT total.
  // Magnetic mounts add 50–200 μT instantly. Road/car vibration < 5 μT delta.
  magneticMountSpike: 40,
};

interface ThresholdState {
  thresholds: Thresholds;
  isLoaded: boolean;
}

interface ThresholdActions {
  setThreshold: <K extends keyof Thresholds>(key: K, value: number) => void;
  resetToDefaults: () => void;
}

type ThresholdStore = ThresholdState & ThresholdActions;

export const useThresholdStore = create<ThresholdStore>()(
  persist(
    (set) => ({
      thresholds: DEFAULT_THRESHOLDS,
      isLoaded: false,

      setThreshold: (key, value) =>
        set((state) => ({
          thresholds: { ...state.thresholds, [key]: value },
        })),

      resetToDefaults: () => set({ thresholds: DEFAULT_THRESHOLDS }),
    }),
    {
      name: ASYNC_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.isLoaded = true;
      },
    },
  ),
);
