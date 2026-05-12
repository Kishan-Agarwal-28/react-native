import { useWindowDimensions } from "react-native";

export const BREAKPOINTS = {
  phone: 0,
  tablet: 600,
  largeTablet: 900,
} as const;

export type DeviceType = "phone" | "tablet" | "largeTablet";

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;
  const scaleBase = Math.min(width, height);

  const deviceType: DeviceType =
    width >= BREAKPOINTS.largeTablet
      ? "largeTablet"
      : width >= BREAKPOINTS.tablet
        ? "tablet"
        : "phone";

  const isPhone = deviceType === "phone";
  const isTablet = deviceType === "tablet" || deviceType === "largeTablet";
  const isLargeTablet = deviceType === "largeTablet";
  function rSelect<T>(values: { phone: T; tablet?: T; largeTablet?: T }): T {
    if (isLargeTablet && values.largeTablet !== undefined)
      return values.largeTablet;
    if (isTablet && values.tablet !== undefined) return values.tablet;
    return values.phone;
  }
  function rScale(base: number, min?: number, max?: number): number {
    const scaled = (base * scaleBase) / 390;
    const lo = min ?? base * 0.75;
    const hi = max ?? base * 1.8;
    return Math.min(Math.max(scaled, lo), hi);
  }

  const spacing = {
    xs: rScale(4),
    sm: rScale(8),
    md: rScale(12),
    lg: rScale(16),
    xl: rScale(20),
    xxl: rScale(28),
  };

  const fontSize = {
    xs: rScale(10, 10, 14),
    sm: rScale(12, 12, 16),
    md: rScale(14, 14, 18),
    lg: rScale(16, 16, 20),
    xl: rScale(18, 18, 24),
    xxl: rScale(24, 24, 36),
    hero: rScale(28, 28, 42),
  };

  const iconSize = {
    sm: rScale(14, 14, 20),
    md: rScale(18, 18, 26),
    lg: rScale(24, 24, 34),
    xl: rSelect({ phone: 32, tablet: 40, largeTablet: 48 }),
  };

  const listColumns = rSelect({ phone: 1, tablet: 2, largeTablet: 3 });

  const maxContentWidth = rSelect({
    phone: width,
    tablet: Math.min(width, 720),
    largeTablet: Math.min(width, 1000),
  });

  const headerHeight = rSelect({ phone: 100, tablet: 110, largeTablet: 120 });

  return {
    width,
    height,
    isLandscape,
    deviceType,
    isPhone,
    isTablet,
    isLargeTablet,
    rSelect,
    rScale,
    spacing,
    fontSize,
    iconSize,
    listColumns,
    maxContentWidth,
    headerHeight,
  };
}
