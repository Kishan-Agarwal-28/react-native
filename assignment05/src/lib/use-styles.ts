import { useMemo } from "react";
import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from "react-native";
import { Theme, useTheme } from "@/lib/theme";

export type NamedStyles = Record<string, ViewStyle | TextStyle | ImageStyle>;

const useStyles = <T extends NamedStyles>(stylesheet: (theme: Theme) => T) => {
  const { theme } = useTheme();
  return useMemo(() => StyleSheet.create(stylesheet(theme)), [theme]);
};

export default useStyles;
