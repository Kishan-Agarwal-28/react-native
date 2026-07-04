import { useMemo } from "react";
import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from "react-native";
import { THEME, Theme, useTheme } from "@/lib/theme";

export type NamedStyles = Record<string, ViewStyle | TextStyle | ImageStyle>;

export type ThemeObject = (typeof THEME)[Theme];

function useStyles<T extends NamedStyles>(
  stylesheet: (theme: Theme, ThemeObj: ThemeObject) => T,
): T {
  const { theme } = useTheme();

  return useMemo(() => {
    const themeObj =
      theme in THEME
        ? THEME[theme as Theme]
        : (theme as unknown as ThemeObject);
    const themeName = theme in THEME ? (theme as Theme) : "light";
    return StyleSheet.create(stylesheet(themeName, themeObj));
  }, [theme]);
}

export default useStyles;
