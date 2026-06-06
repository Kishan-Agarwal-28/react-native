import { createContext, useContext, useState } from "react";
import { useColorScheme } from "react-native";

export type Theme = "light" | "dark" | "unspecified";

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  "2xl": number;
  "3xl": number;
}

export interface ThemeRadius {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface ThemeTypography {
  xs: number;
  sm: number;
  base: number;
  lg: number;
  xl: number;
  "2xl": number;
}

export interface ThemeConfig {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  radius: ThemeRadius;
  typography: ThemeTypography;
}

const spacing: ThemeSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
};

const radius: ThemeRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

const typography: ThemeTypography = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  "2xl": 24,
};

export const THEME: Record<Theme, ThemeConfig> = {
  light: {
    colors: {
      background: "#ffffff",
      foreground: "#09090b",
      card: "#ffffff",
      cardForeground: "#09090b",
      primary: "#1ecc9a",
      primaryForeground: "#041a13",
      secondary: "#f4f4f5",
      secondaryForeground: "#18181b",
      muted: "#f4f4f5",
      mutedForeground: "#71717a",
      accent: "#f4f4f5",
      accentForeground: "#18181b",
      destructive: "#ef5353",
      destructiveForeground: "#fafafa",
      border: "#e4e4e7",
      input: "#e4e4e7",
      ring: "#1ecc9a",
    },
    spacing,
    radius,
    typography,
  },
  dark: {
    colors: {
      background: "#0f0f12",
      foreground: "#fafafa",
      card: "#18181e",
      cardForeground: "#fafafa",
      primary: "#1ecc9a",
      primaryForeground: "#041a13",
      secondary: "#1a1a20",
      secondaryForeground: "#fafafa",
      muted: "#1a1a20",
      mutedForeground: "#71717a",
      accent: "#27272a",
      accentForeground: "#fafafa",
      destructive: "#ef5353",
      destructiveForeground: "#fafafa",
      border: "#2a2a30",
      input: "#1a1a20",
      ring: "#1ecc9a",
    },
    spacing,
    radius,
    typography,
  },
  unspecified: {
    colors: {
      background: "#0f0f12",
      foreground: "#fafafa",
      card: "#18181e",
      cardForeground: "#fafafa",
      primary: "#1ecc9a",
      primaryForeground: "#041a13",
      secondary: "#1a1a20",
      secondaryForeground: "#fafafa",
      muted: "#1a1a20",
      mutedForeground: "#71717a",
      accent: "#27272a",
      accentForeground: "#fafafa",
      destructive: "#ef5353",
      destructiveForeground: "#fafafa",
      border: "#2a2a30",
      input: "#1a1a20",
      ring: "#1ecc9a",
    },
    spacing,
    radius,
    typography,
  },
};

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>(
    colorScheme === "light" ? "light" : "dark",
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
