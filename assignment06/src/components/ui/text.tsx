import { THEME, useTheme } from "@/lib/theme";
import * as React from "react";
import { Text as RNText, type TextProps as RNTextProps } from "react-native";

export interface TextProps extends RNTextProps {}

const Text = React.forwardRef<RNText, TextProps>(({ style, ...props }, ref) => {
  const { theme } = useTheme();
  const { colors } = THEME[theme];

  return (
    <RNText
      ref={ref}
      style={[{ color: colors.foreground }, style]}
      {...props}
    />
  );
});
Text.displayName = "Text";

export default Text;
