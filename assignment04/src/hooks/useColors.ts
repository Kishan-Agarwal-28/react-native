import { useTheme } from "@/contexts/ThemeContext";
import colors from "@/constants/colors";

export function useColors() {
  const { colors: themeColors } = useTheme();
  return { ...themeColors, radius: colors.radius };
}
