import { useSyncExternalStore } from "react";

export type AppSettings = {
  remindersEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:mm
  quietHoursEnd: string; // HH:mm
  soundEnabled: boolean;
  hapticsEnabled: boolean;
};

const defaults: AppSettings = {
  remindersEnabled: true,
  quietHoursEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00",
  soundEnabled: true,
  hapticsEnabled: true,
};

let cachedSettings: AppSettings = defaults;

type StorageValue = boolean | string;

type StorageLike = {
  getBoolean: (key: string) => boolean | undefined;
  getString: (key: string) => string | undefined;
  set: (key: string, value: StorageValue) => void;
  addOnValueChangedListener: (listener: (key: string) => void) => {
    remove: () => void;
  };
};

function createMemoryStorage(): StorageLike {
  const map = new Map<string, StorageValue>();
  const listeners = new Set<(key: string) => void>();

  return {
    getBoolean: (key) => {
      const value = map.get(key);
      return typeof value === "boolean" ? value : undefined;
    },
    getString: (key) => {
      const value = map.get(key);
      return typeof value === "string" ? value : undefined;
    },
    set: (key, value) => {
      map.set(key, value);
      listeners.forEach((listener) => listener(key));
    },
    addOnValueChangedListener: (listener) => {
      listeners.add(listener);
      return {
        remove: () => listeners.delete(listener),
      };
    },
  };
}

function createStorage(): StorageLike {
  try {
    const module = require("react-native-mmkv") as {
      MMKV?: new (config?: { id?: string }) => StorageLike;
    };

    if (module?.MMKV) {
      return new module.MMKV({ id: "app-settings" });
    }
  } catch {
    // Runtime doesn't support MMKV (e.g. Expo Go); fall back safely.
  }

  return createMemoryStorage();
}

const storage = createStorage();

const keys = {
  remindersEnabled: "settings.remindersEnabled",
  quietHoursEnabled: "settings.quietHoursEnabled",
  quietHoursStart: "settings.quietHoursStart",
  quietHoursEnd: "settings.quietHoursEnd",
  soundEnabled: "settings.soundEnabled",
  hapticsEnabled: "settings.hapticsEnabled",
} as const;

function getBoolean(key: string, fallback: boolean): boolean {
  const value = storage.getBoolean(key);
  return typeof value === "boolean" ? value : fallback;
}

function getString(key: string, fallback: string): string {
  const value = storage.getString(key);
  return value ?? fallback;
}

export function getAppSettings(): AppSettings {
  const next: AppSettings = {
    remindersEnabled: getBoolean(
      keys.remindersEnabled,
      defaults.remindersEnabled,
    ),
    quietHoursEnabled: getBoolean(
      keys.quietHoursEnabled,
      defaults.quietHoursEnabled,
    ),
    quietHoursStart: getString(keys.quietHoursStart, defaults.quietHoursStart),
    quietHoursEnd: getString(keys.quietHoursEnd, defaults.quietHoursEnd),
    soundEnabled: getBoolean(keys.soundEnabled, defaults.soundEnabled),
    hapticsEnabled: getBoolean(keys.hapticsEnabled, defaults.hapticsEnabled),
  };

  const unchanged =
    cachedSettings.remindersEnabled === next.remindersEnabled &&
    cachedSettings.quietHoursEnabled === next.quietHoursEnabled &&
    cachedSettings.quietHoursStart === next.quietHoursStart &&
    cachedSettings.quietHoursEnd === next.quietHoursEnd &&
    cachedSettings.soundEnabled === next.soundEnabled &&
    cachedSettings.hapticsEnabled === next.hapticsEnabled;

  if (unchanged) {
    return cachedSettings;
  }

  cachedSettings = next;
  return cachedSettings;
}

export function setAppSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K],
): void {
  const storageKey = keys[key];
  if (typeof value === "boolean") {
    storage.set(storageKey, value);
    return;
  }
  storage.set(storageKey, value);
}

export function subscribeToAppSettings(onChange: () => void): () => void {
  const listener = storage.addOnValueChangedListener((changedKey) => {
    if (
      Object.values(keys).includes(
        changedKey as (typeof keys)[keyof typeof keys],
      )
    ) {
      onChange();
    }
  });
  return () => listener.remove();
}

export function useAppSettings(): AppSettings {
  return useSyncExternalStore(
    subscribeToAppSettings,
    getAppSettings,
    getAppSettings,
  );
}

export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map((p) => parseInt(p, 10));
  const hours = Number.isFinite(h) ? h : 0;
  const minutes = Number.isFinite(m) ? m : 0;
  return hours * 60 + minutes;
}

export function fromMinutes(total: number): string {
  const normalized = ((total % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60)
    .toString()
    .padStart(2, "0");
  const m = (normalized % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function shiftTimeString(time: string, deltaMinutes: number): string {
  return fromMinutes(toMinutes(time) + deltaMinutes);
}

export function formatTimeForUI(time: string): string {
  const [hRaw, mRaw] = time.split(":");
  const h24 = parseInt(hRaw, 10);
  const minutes = (parseInt(mRaw, 10) || 0).toString().padStart(2, "0");
  const isPm = h24 >= 12;
  const h12 = h24 % 12 || 12;
  return `${h12}:${minutes} ${isPm ? "PM" : "AM"}`;
}

export function isTimeInQuietHours(
  hours: number,
  minutes: number,
  settings: AppSettings,
): boolean {
  if (!settings.quietHoursEnabled) return false;

  const current = hours * 60 + minutes;
  const start = toMinutes(settings.quietHoursStart);
  const end = toMinutes(settings.quietHoursEnd);

  if (start === end) return true;
  if (start < end) return current >= start && current < end;
  return current >= start || current < end;
}
