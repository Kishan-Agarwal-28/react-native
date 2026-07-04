import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  GestureResponderEvent,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import {
  THEME,
  useTheme,
  Theme,
  useThemeTransition,
  ThemeTransitionType,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
} from "@/lib/theme";
import Switch from "@/components/ui/switch";
import Separator from "@/components/ui/separator";
import Input from "@/components/ui/input";
import useStyles from "@/lib/use-styles";

// --- Types ---

/**
 * Configuration options for the theme switch transition.
 * Implementation lives in `@/lib/theme` (Skia Canvas snapshot + circle/fade reveal) —
 * this shape is kept compatible with the old react-native-theme-switch-animation API
 * so existing call sites don't need to change.
 */
export type AnimationConfig = {
  /** The visual style of the transition animation. */
  type: ThemeTransitionType;
  /** Duration of the animation in milliseconds. */
  duration: number;
  /** Determines the exact origin point of the animation on the screen. */
  startingPoint?: {
    /** Starting X coordinate in pixels. Should not exceed screen width. */
    cx?: number;
    /** Starting Y coordinate in pixels. Should not exceed screen height. */
    cy?: number;
    /** Starting X coordinate as a percentage of screen width (-1 to 1). */
    cxRatio?: number;
    /** Starting Y coordinate as a percentage of screen height (-1 to 1). */
    cyRatio?: number;
  };
  /**
   * (Legacy, iOS only) Previously selected the native snapshot strategy used by
   * react-native-theme-switch-animation. The Skia engine captures the view with a
   * single unified strategy (`makeImageFromView`) on every platform, so this no
   * longer has any effect. Kept only so existing configs don't break typechecking.
   */
  captureType?: "layer" | "hierarchy";
};

/**
 * Defines the schedule for automatic time-based theme switching.
 */
export interface TimeRanges {
  /** Time when day mode begins. Format: "HH:mm" (e.g., "07:00") */
  dayStart: string;
  /** Time when night mode begins. Format: "HH:mm" (e.g., "19:00") */
  nightStart: string;
}

/**
 * Props for the ThemeToggle component.
 */
interface ThemeToggleProps {
  /**
   * Determines the layout and functionality level of the component.
   * - `toggle`: A minimal, animated icon button (sun/moon morphing).
   * - `switch`: A standard, minimal UI switch.
   * - `full`: A comprehensive settings panel with schedule and auto-toggle controls.
   * @default 'toggle'
   */
  type?: "toggle" | "switch" | "full";

  /** * Enables automatic theme switching based on the device's ambient light sensor.
   * *Note: Requires testing on a physical device. Simulators do not support light sensors.*
   * @default false
   */
  autoToggle?: boolean;

  /** * The ambient light illuminance threshold (in lux) below which the theme shifts to dark mode.
   * @default 20
   */
  luxThreshold?: number;

  /** * Configuration for automatic theme switching based on a specific daily schedule.
   */
  timeRanges?: TimeRanges;

  /** * When `true` and `type` is `'full'`, reveals the daytime/nighttime configuration inputs
   * allowing the user to set their own schedule.
   * @default false
   */
  showDateTimeOptions?: boolean;

  /** * Enables the full-screen Skia clip/fade transition when switching themes.
   * @default false
   */
  animate?: boolean;

  /** * Custom configuration for the theme switch animation.
   * Applicable only if `animate` is `true`.
   */
  animationConfig?: AnimationConfig;

  /** * Callback fired when the user toggles the "Automatic Brightness" setting in the `'full'` layout.
   * Useful for syncing state to local storage (e.g., MMKV or AsyncStorage).
   */
  onAutoToggleChange?: (enabled: boolean) => void;

  /** * Callback fired when the user updates the custom schedule times in the `'full'` layout.
   */
  onTimeRangesChange?: (ranges: TimeRanges) => void;
}

/** Strict 24-hour "HH:mm" check: format AND range (hours 00-23, minutes 00-59). */
const isValidTime = (value: string): boolean => {
  if (!/^\d{2}:\d{2}$/.test(value)) return false;
  const [h, m] = value.split(":").map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
};

const computeIsDaytime = (dayStart: string, nightStart: string): boolean => {
  const now = new Date();
  const total = now.getHours() * 60 + now.getMinutes();
  const [dH, dM] = dayStart.split(":").map(Number);
  const [nH, nM] = nightStart.split(":").map(Number);
  const dayMins = dH * 60 + dM;
  const nightMins = nH * 60 + nM;
  if (dayMins < nightMins) {
    return total >= dayMins && total < nightMins;
  }
  return total >= dayMins || total < nightMins;
};

const resolveOrigin = (
  startingPoint: AnimationConfig["startingPoint"] | undefined,
  fallback: { x: number; y: number },
): { x: number; y: number } => {
  if (!startingPoint) return fallback;

  const { cx, cy, cxRatio, cyRatio } = startingPoint;

  const x =
    cx !== undefined
      ? cx
      : cxRatio !== undefined
        ? cxRatio * SCREEN_WIDTH
        : fallback.x;
  const y =
    cy !== undefined
      ? cy
      : cyRatio !== undefined
        ? cyRatio * SCREEN_HEIGHT
        : fallback.y;

  return { x, y };
};

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  type = "toggle",
  autoToggle = false,
  luxThreshold = 20,
  timeRanges,
  showDateTimeOptions = false,
  animate = false,
  animationConfig,
  onAutoToggleChange,
  onTimeRangesChange,
}) => {
  const { theme, setTheme } = useTheme();
  const { triggerTransition } = useThemeTransition();
  const safeThemeName = (
    THEME && typeof THEME === "object" && theme in THEME ? theme : "light"
  ) as Theme;
  const currentColors = THEME[safeThemeName].colors;

  const useSpringIcons = type === "toggle" && !animate;

  const styles = useStyles((themeName, themeObj) => ({
    iconContainer: {
      width: 24,
      height: 24,
      justifyContent: "center",
      alignItems: "center",
    },
    iconWrapper: {
      position: "absolute",
    },
    panelCard: {
      width: "100%",
      borderRadius: themeObj.radius.lg,
      borderWidth: 1,
      borderColor: themeObj.colors.border,
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: themeObj.colors.card,
    },
    settingRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 14,
    },
    rowTitle: {
      fontSize: 16,
      fontWeight: "600",
      letterSpacing: -0.2,
      color: themeObj.colors.foreground,
    },
    rowSubtitle: {
      fontSize: 13,
      marginTop: 2,
      color: themeObj.colors.mutedForeground,
    },
    scheduleContainer: {
      paddingVertical: 14,
    },
    scheduleTitle: {
      fontSize: 16,
      fontWeight: "600",
      letterSpacing: -0.2,
      marginBottom: 12,
      color: themeObj.colors.foreground,
    },
    timeInputsWrapper: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 16,
    },
    timeInput: {
      borderWidth: 1,
      borderRadius: themeObj.radius.md,
      paddingVertical: 8,
      paddingHorizontal: 12,
      fontSize: 15,
      textAlign: "center",
      color: themeObj.colors.foreground,
      borderColor: themeObj.colors.input,
      backgroundColor: themeObj.colors.background,
    },
    luxIndicator: {
      fontSize: 12,
      color: themeObj.colors.mutedForeground,
      marginTop: 4,
    },
    errorText: {
      fontSize: 12,
      marginTop: 4,
      color: themeObj.colors.destructive,
    },
  }));

  const [localAutoToggle, setLocalAutoToggle] = useState(autoToggle);
  const [localDayStart, setLocalDayStart] = useState(
    timeRanges?.dayStart || "07:00",
  );
  const [localNightStart, setLocalNightStart] = useState(
    timeRanges?.nightStart || "19:00",
  );

  const dayInvalid = localDayStart.length > 0 && !isValidTime(localDayStart);
  const nightInvalid =
    localNightStart.length > 0 && !isValidTime(localNightStart);

  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  const lightSensorRef = useRef<any>(null);

  const isDark = useSharedValue(theme === "dark" ? 1 : 0);

  useEffect(() => {
    setLocalAutoToggle(autoToggle);
  }, [autoToggle]);

  useEffect(() => {
    if (timeRanges) {
      setLocalDayStart(timeRanges.dayStart);
      setLocalNightStart(timeRanges.nightStart);
    }
  }, [timeRanges]);

  useEffect(() => {
    if (!(timeRanges || showDateTimeOptions)) return;
    if (!isValidTime(localDayStart) || !isValidTime(localNightStart)) return;
    setTheme(
      computeIsDaytime(localDayStart, localNightStart) ? "light" : "dark",
    );
  }, [localDayStart, localNightStart, showDateTimeOptions]);

  useEffect(() => {
    if (!localAutoToggle) return;

    let isMounted = true;
    let sensorSubscription: { remove: () => void } | null = null;

    const initSensor = async () => {
      try {
        if (!lightSensorRef.current) {
          const expoSensors = await import("expo-sensors");
          lightSensorRef.current = expoSensors.LightSensor;
        }

        const LightSensor = lightSensorRef.current;
        if (!LightSensor || !(await LightSensor.isAvailableAsync())) return;

        LightSensor.setUpdateInterval(500);

        sensorSubscription = LightSensor.addListener(
          ({ illuminance }: { illuminance: number }) => {
            if (!isMounted) return;
            const currentLux = Math.round(illuminance);
            const targetTheme = currentLux < luxThreshold ? "dark" : "light";
            if (themeRef.current !== targetTheme) {
              setTheme(targetTheme);
            }
          },
        );
      } catch {
        // sensor unavailable
      }
    };

    initSensor();

    return () => {
      isMounted = false;
      sensorSubscription?.remove();
    };
  }, [localAutoToggle, luxThreshold, setTheme]);
  useEffect(() => {
    if (!useSpringIcons) {
      isDark.value = theme === "dark" ? 1 : 0;
      return;
    }
    isDark.value = withSpring(theme === "dark" ? 1 : 0, {
      damping: 14,
      stiffness: 120,
    });
  }, [theme, isDark, useSpringIcons]);

  const sunStyle = useAnimatedStyle(() => ({
    opacity: interpolate(isDark.value, [0, 1], [1, 0]),
    transform: [
      { rotate: `${interpolate(isDark.value, [0, 1], [0, 90])}deg` },
      { scale: interpolate(isDark.value, [0, 1], [1, 0.5]) },
    ],
  }));

  const moonStyle = useAnimatedStyle(() => ({
    opacity: interpolate(isDark.value, [0, 1], [0, 1]),
    transform: [
      { rotate: `${interpolate(isDark.value, [0, 1], [-90, 0])}deg` },
      { scale: interpolate(isDark.value, [0, 1], [0.5, 1]) },
    ],
  }));

  const toggleTheme = useCallback(() => {
    setTheme(themeRef.current === "light" ? "dark" : "light");
  }, [setTheme]);

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      if (!animate) {
        toggleTheme();
        return;
      }

      const config: AnimationConfig = animationConfig ?? {
        type: "circular",
        duration: 900,
        captureType: "layer",
      };
      const duration = config.duration ?? 900;
      const transitionType = config.type ?? "circular";

      if (transitionType === "fade") {
        triggerTransition({ duration, type: "fade" });
        return;
      }

      e.currentTarget.measure((_x, _y, width, height, px, py) => {
        const fallback = { x: px + width / 2, y: py + height / 2 };
        const origin = resolveOrigin(config.startingPoint, fallback);
        triggerTransition({
          x: origin.x,
          y: origin.y,
          duration,
          type: transitionType,
        });
      });
    },
    [animate, animationConfig, toggleTheme, triggerTransition],
  );

  const handleAutoToggleSwitch = useCallback(
    (value: boolean) => {
      if (!value) null;
      setLocalAutoToggle(value);
      onAutoToggleChange?.(value);
    },
    [onAutoToggleChange],
  );

  const handleTimeChange = useCallback(
    (mode: "day" | "night", value: string) => {
      if (mode === "day") {
        setLocalDayStart(value);
      } else {
        setLocalNightStart(value);
      }
      const updatedDay = mode === "day" ? value : localDayStart;
      const updatedNight = mode === "night" ? value : localNightStart;
      if (isValidTime(updatedDay) && isValidTime(updatedNight)) {
        onTimeRangesChange?.({
          dayStart: updatedDay,
          nightStart: updatedNight,
        });
      }
    },
    [localDayStart, localNightStart, onTimeRangesChange],
  );

  if (type === "toggle") {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        <View style={styles.iconContainer}>
          {useSpringIcons ? (
            <>
              <Animated.View style={[styles.iconWrapper, sunStyle]}>
                <Feather name="sun" size={24} color={currentColors.primary} />
              </Animated.View>
              <Animated.View style={[styles.iconWrapper, moonStyle]}>
                <Feather name="moon" size={24} color={currentColors.primary} />
              </Animated.View>
            </>
          ) : (
            <Feather
              name={theme === "dark" ? "moon" : "sun"}
              size={24}
              color={currentColors.primary}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  }

  if (type === "switch") {
    return <Switch value={theme === "dark"} onValueChange={toggleTheme} />;
  }

  return (
    <View style={styles.panelCard}>
      <View style={styles.settingRow}>
        <View>
          <Text style={styles.rowTitle}>Dark Mode</Text>
          <Text style={styles.rowSubtitle}>
            Manually override theme preference
          </Text>
        </View>
        <Switch value={theme === "dark"} onValueChange={toggleTheme} />
      </View>

      <Separator />

      <View style={styles.settingRow}>
        <View>
          <Text style={styles.rowTitle}>Automatic Brightness</Text>
          <Text style={styles.rowSubtitle}>Adapts to dynamic lighting</Text>
        </View>
        <Switch
          value={localAutoToggle}
          onValueChange={handleAutoToggleSwitch}
        />
      </View>

      {showDateTimeOptions && (
        <>
          <Separator />
          <View style={styles.scheduleContainer}>
            <Text style={styles.scheduleTitle}>Custom Schedule</Text>
            <View style={styles.timeInputsWrapper}>
              <View style={{ flex: 1 }}>
                <Input
                  inputStyle={[
                    styles.timeInput,
                    dayInvalid && { borderColor: currentColors.destructive },
                  ]}
                  label="Day Mode Starts"
                  value={localDayStart}
                  onChangeText={(val) => handleTimeChange("day", val)}
                  placeholder="07:00"
                  placeholderTextColor={currentColors.mutedForeground}
                  maxLength={5}
                  keyboardType="numbers-and-punctuation"
                />
                {dayInvalid && (
                  <Text style={styles.errorText}>
                    Use 24h HH:mm (00:00–23:59)
                  </Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  inputStyle={[
                    styles.timeInput,
                    nightInvalid && { borderColor: currentColors.destructive },
                  ]}
                  label="Night Mode Starts"
                  value={localNightStart}
                  onChangeText={(val) => handleTimeChange("night", val)}
                  placeholder="19:00"
                  placeholderTextColor={currentColors.mutedForeground}
                  maxLength={5}
                  keyboardType="numbers-and-punctuation"
                />
                {nightInvalid && (
                  <Text style={styles.errorText}>
                    Use 24h HH:mm (00:00–23:59)
                  </Text>
                )}
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

export default ThemeToggle;
