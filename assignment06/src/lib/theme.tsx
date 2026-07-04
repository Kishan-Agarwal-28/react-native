import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Appearance, useColorScheme } from "react-native";
import {
  Canvas,
  Circle,
  dist,
  Group,
  Image,
  ImageShader,
  makeImageFromView,
  mix,
  vec,
} from "@shopify/react-native-skia";
import type { SkImage } from "@shopify/react-native-skia";
import type { ReactNode, RefObject } from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import {
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export type Theme = "light" | "dark" | "unspecified";

export type ThemeTransitionType = "circular" | "inverted-circular" | "fade";

export type ThemeColors = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
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
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
};
export type ThemeSpacing = {
  xs: number; // 4
  sm: number; // 8
  md: number; // 12
  lg: number; // 16
  xl: number; // 20
  "2xl": number; // 24
  "3xl": number; // 32
};
export type ThemeRadius = {
  sm: number; // 4
  md: number; // 8
  lg: number; // 12
  xl: number; // 16
  full: number; // 9999 — pills, avatars
};

export type ThemeTypography = {
  xs: number; // 11
  sm: number; // 13
  base: number; // 15
  lg: number; // 17
  xl: number; // 20
  "2xl": number; // 24
};

export type ThemeConfig = {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  radius: ThemeRadius;
  typography: ThemeTypography;
};

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
      background: "#fffefc",
      foreground: "#09090b",
      card: "#fef7eb",
      cardForeground: "#09090b",
      popover: "#ffffff",
      popoverForeground: "#09090b",
      primary: "#18181b",
      primaryForeground: "#fafafa",
      secondary: "#f4f4f5",
      secondaryForeground: "#18181b",
      muted: "#f4f4f5",
      mutedForeground: "#71717a",
      accent: "#f4f4f5",
      accentForeground: "#18181b",
      destructive: "#e7000b",
      destructiveForeground: "#fafafa",
      border: "#e4e4e7",
      input: "#e4e4e7",
      ring: "#a1a1aa",
      chart1: "#d4d4d8",
      chart2: "#71717a",
      chart3: "#52525b",
      chart4: "#3f3f46",
      chart5: "#27272a",
      sidebar: "#fafafa",
      sidebarForeground: "#09090b",
      sidebarPrimary: "#18181b",
      sidebarPrimaryForeground: "#fafafa",
      sidebarAccent: "#f4f4f5",
      sidebarAccentForeground: "#18181b",
      sidebarBorder: "#e4e4e7",
      sidebarRing: "#a1a1aa",
    },
    spacing,
    radius,
    typography,
  },
  dark: {
    colors: {
      background: "#09090b",
      foreground: "#fafafa",
      card: "#18181b",
      cardForeground: "#fafafa",
      popover: "#18181b",
      popoverForeground: "#fafafa",
      primary: "#e4e4e7",
      primaryForeground: "#18181b",
      secondary: "#27272a",
      secondaryForeground: "#fafafa",
      muted: "#27272a",
      mutedForeground: "#a1a1aa",
      accent: "#27272a",
      accentForeground: "#fafafa",
      destructive: "#ff6467",
      destructiveForeground: "#fafafa",
      border: "rgba(255, 255, 255, 0.1)",
      input: "rgba(255, 255, 255, 0.15)",
      ring: "#71717a",
      chart1: "#d4d4d8",
      chart2: "#71717a",
      chart3: "#52525b",
      chart4: "#3f3f46",
      chart5: "#27272a",
      sidebar: "#18181b",
      sidebarForeground: "#fafafa",
      sidebarPrimary: "#1447e6",
      sidebarPrimaryForeground: "#fafafa",
      sidebarAccent: "#27272a",
      sidebarAccentForeground: "#fafafa",
      sidebarBorder: "rgba(255, 255, 255, 0.1)",
      sidebarRing: "#71717a",
    },
    spacing,
    radius,
    typography,
  },
  unspecified: {
    colors: {
      background: "#ffffff",
      foreground: "#09090b",
      card: "#ffffff",
      cardForeground: "#09090b",
      popover: "#ffffff",
      popoverForeground: "#09090b",
      primary: "#18181b",
      primaryForeground: "#fafafa",
      secondary: "#f4f4f5",
      secondaryForeground: "#18181b",
      muted: "#f4f4f5",
      mutedForeground: "#71717a",
      accent: "#f4f4f5",
      accentForeground: "#18181b",
      destructive: "#e7000b",
      destructiveForeground: "#fafafa",
      border: "#e4e4e7",
      input: "#e4e4e7",
      ring: "#a1a1aa",
      chart1: "#d4d4d8",
      chart2: "#71717a",
      chart3: "#52525b",
      chart4: "#3f3f46",
      chart5: "#27272a",
      sidebar: "#fafafa",
      sidebarForeground: "#09090b",
      sidebarPrimary: "#18181b",
      sidebarPrimaryForeground: "#fafafa",
      sidebarAccent: "#f4f4f5",
      sidebarAccentForeground: "#18181b",
      sidebarBorder: "#e4e4e7",
      sidebarRing: "#a1a1aa",
    },
    spacing,
    radius,
    typography,
  },
};

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function captureView(ref: RefObject<View | null>): Promise<SkImage | null> {
  return new Promise((resolve) => {
    if (Platform.OS === "web") {
      try {
        (
          makeImageFromView as unknown as (
            ref: RefObject<View | null>,
            cb: (img: SkImage | null) => void,
          ) => void
        )(ref, (img) => resolve(img ?? null));
      } catch {
        resolve(null);
      }
    } else {
      (makeImageFromView(ref) as unknown as Promise<SkImage>)
        .then((img) => resolve(img ?? null))
        .catch(() => resolve(null));
    }
  });
}

interface TransitionState {
  active: boolean;
  overlay1: SkImage | null;
  overlay2: SkImage | null;
  type: ThemeTransitionType;
}

/** Options accepted by `triggerTransition`. All optional — sensible defaults are applied. */
export interface TriggerTransitionOptions {
  /** Origin x in px. Defaults to screen center. Ignored for `type: "fade"`. */
  x?: number;
  /** Origin y in px. Defaults to screen center. Ignored for `type: "fade"`. */
  y?: number;
  /** Animation duration in ms. @default 450 */
  duration?: number;
  /** Visual style of the transition. @default "circular" */
  type?: ThemeTransitionType;
}

interface TransitionContextValue extends TransitionState {
  ref: RefObject<View | null>;
  transition: SharedValue<number>;
  circle: SharedValue<{ x: number; y: number; r: number }>;
  triggerTransition: (options?: TriggerTransitionOptions) => Promise<void>;
}

const TransitionContext = createContext<TransitionContextValue | null>(null);

export const useThemeTransition = () => {
  const ctx = useContext(TransitionContext);
  if (!ctx)
    throw new Error(
      "useThemeTransition must be inside ThemeTransitionProvider",
    );
  return ctx;
};

const reducer = (_: TransitionState, next: TransitionState) => next;

const initial: TransitionState = {
  active: false,
  overlay1: null,
  overlay2: null,
  type: "circular",
};

const { width: W, height: H } = Dimensions.get("screen");
const corners = [vec(0, 0), vec(W, 0), vec(W, H), vec(0, H)];

export const SCREEN_WIDTH = W;
export const SCREEN_HEIGHT = H;

export const ThemeTransitionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { setTheme, theme } = useTheme();

  const ref = useRef<View>(null);
  const circle = useSharedValue({ x: 0, y: 0, r: 0 });
  const transition = useSharedValue(0);
  const [{ active, overlay1, overlay2, type }, dispatch] = useReducer(
    reducer,
    initial,
  );

  const triggerTransition = useCallback(
    async ({
      x,
      y,
      duration = 450,
      type = "circular",
    }: TriggerTransitionOptions = {}) => {
      if (active) return;

      const nextTheme: Theme = theme === "light" ? "dark" : "light";
      const originX = x ?? W / 2;
      const originY = y ?? H / 2;

      const maxR = Math.max(
        ...corners.map((c) => dist(c, { x: originX, y: originY })),
      );
      circle.value = { x: originX, y: originY, r: maxR };

      dispatch({ active: true, overlay1: null, overlay2: null, type });
      const snap1 = await captureView(ref);
      dispatch({ active: true, overlay1: snap1, overlay2: null, type });

      await wait(16);
      setTheme(nextTheme);
      await wait(16);

      const snap2 = await captureView(ref);
      dispatch({ active: true, overlay1: snap1, overlay2: snap2, type });
      transition.value = 0;
      transition.value = withTiming(1, { duration });
      await wait(duration);

      dispatch({ active: false, overlay1: null, overlay2: null, type });
    },
    [active, circle, setTheme, theme, transition],
  );
  return (
    <TransitionContext.Provider
      value={{
        active,
        overlay1,
        overlay2,
        type,
        ref,
        transition,
        circle,
        triggerTransition,
      }}
    >
      <View ref={ref} collapsable={false} style={fillStyle.fill}>
        {children}
      </View>
      <ThemeTransitionCanvas />
    </TransitionContext.Provider>
  );
};

const fillStyle = StyleSheet.create({ fill: { flex: 1 } });

export const ThemeTransitionCanvas = () => {
  const { overlay1, overlay2, circle, transition, type } = useThemeTransition();

  const r = useDerivedValue(() => {
    if (type === "inverted-circular") {
      return mix(transition.value, circle.value.r, 0);
    }
    return mix(transition.value, 0, circle.value.r);
  }, [type]);

  return (
    <Canvas
      style={[
        StyleSheet.absoluteFill,
        ,
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          overflow: "hidden",
          margin: 0,
          padding: 0,
        },
      ]}
      pointerEvents="none"
    >
      {type === "inverted-circular" ? (
        <>
          <Image
            image={overlay2}
            x={0}
            y={0}
            width={W}
            height={H}
            fit="cover"
          />
          {overlay1 && (
            <Circle c={circle} r={r}>
              <ImageShader
                image={overlay1}
                x={0}
                y={0}
                width={W}
                height={H}
                fit="cover"
              />
            </Circle>
          )}
        </>
      ) : type === "fade" ? (
        <>
          <Image
            image={overlay1}
            x={0}
            y={0}
            width={W}
            height={H}
            fit="cover"
          />
          {overlay2 && (
            <Group opacity={transition}>
              <Image
                image={overlay2}
                x={0}
                y={0}
                width={W}
                height={H}
                fit="cover"
              />
            </Group>
          )}
        </>
      ) : (
        <>
          <Image
            image={overlay1}
            x={0}
            y={0}
            width={W}
            height={H}
            fit="cover"
          />
          {overlay2 && (
            <Circle c={circle} r={r}>
              <ImageShader
                image={overlay2}
                x={0}
                y={0}
                width={W}
                height={H}
                fit="cover"
              />
            </Circle>
          )}
        </>
      )}
    </Canvas>
  );
};

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "unspecified",
  setTheme: () => {},
});

const encodeTheme = (theme: Theme): number => {
  if (theme === "light") return 0;
  if (theme === "dark") return 1;
  return -1;
};

const decodeTheme = (val: number | undefined): Theme | null => {
  if (val === 0) return "light";
  if (val === 1) return "dark";
  if (val === -1) return "unspecified";
  return null;
};

export const ThemeProvider = ({
  children,
  persist = false,
}: {
  children: React.ReactNode;
  persist?: boolean;
}) => {
  useColorScheme();
  const [themePreference, setThemePreference] = useState<Theme>("unspecified");
  const [isReady, setIsReady] = useState(!persist);

  const storageRef = useRef<any>(null);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemePreference(newTheme);
    Appearance.setColorScheme(newTheme);
  }, []);

  useEffect(() => {
    if (!persist) return;

    const loadTheme = async () => {
      try {
        const { createMMKV } = await import("react-native-mmkv");

        storageRef.current = createMMKV({
          id: "app-storage",
          compareBeforeSet: true,
        });

        const savedThemeBit = storageRef.current.getNumber("app-theme");
        const decodedTheme = decodeTheme(savedThemeBit);

        if (decodedTheme) {
          setThemePreference(decodedTheme);
          Appearance.setColorScheme(decodedTheme);
        }
      } catch (error) {
        console.error(
          "Failed to dynamically load MMKV or retrieve theme:",
          error,
        );
      } finally {
        setIsReady(true);
      }
    };

    loadTheme();
  }, [persist]);

  useEffect(() => {
    if (!persist || !isReady || !storageRef.current) return;

    try {
      storageRef.current.set("app-theme", encodeTheme(themePreference));
    } catch (error) {
      console.error("Failed to save theme to MMKV:", error);
    }
  }, [themePreference, persist, isReady]);
  const contextValue = useMemo(
    () => ({
      theme: themePreference,
      setTheme,
    }),
    [themePreference, setTheme],
  );

  if (!isReady) {
    return null;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeTransitionProvider>{children}</ThemeTransitionProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
