import { THEME, useTheme } from "@/lib/theme";
import * as React from "react";
import { View as RNView, type ViewProps } from "react-native";

export type { ViewProps } from "react-native";

const View = React.forwardRef<RNView, ViewProps>(({ style, ...props }, ref) => {
  const { theme } = useTheme();
  const { colors } = THEME[theme];

  return (
    <RNView
      ref={ref}
      style={[{ backgroundColor: "transparent" }, style]}
      {...props}
    />
  );
});
View.displayName = "View";

export default View;
