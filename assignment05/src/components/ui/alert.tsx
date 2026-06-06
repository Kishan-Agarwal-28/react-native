import { THEME, useTheme } from "@/lib/theme";
import React, { forwardRef } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from "react-native";
export type AlertVariant =
  | "default"
  | "destructive"
  | "warning"
  | "success"
  | "info";
const VARIANT_PALETTE: Record<
  AlertVariant,
  {
    accent: string;
    bg: string;
    bgDark: string;
  }
> = {
  default: { accent: "#71717a", bg: "#fafafa", bgDark: "#18181b" },
  destructive: { accent: "#dc2626", bg: "#fff1f1", bgDark: "#2a0a0a" },
  warning: { accent: "#d97706", bg: "#fffbeb", bgDark: "#1c1500" },
  success: { accent: "#16a34a", bg: "#f0fdf4", bgDark: "#071a0e" },
  info: { accent: "#2563eb", bg: "#eff6ff", bgDark: "#040d1f" },
};
type AlertContextValue = {
  variant: AlertVariant;
  accentColor: string;
};
const AlertContext = React.createContext<AlertContextValue>({
  variant: "default",
  accentColor: VARIANT_PALETTE.default.accent,
});
const useAlertContext = () => React.useContext(AlertContext);
type AlertProps = ViewProps & {
  variant?: AlertVariant;
  style?: StyleProp<ViewStyle>;
};
type IconProps = {
  color?: string;
  size?: number;
};
const Alert = forwardRef<View, AlertProps>(
  ({ children, variant = "default", style, ...props }, ref) => {
    const { theme } = useTheme();
    const { colors, spacing, radius } = THEME[theme];
    const palette = VARIANT_PALETTE[variant];
    const accentColor =
      variant === "default" ? colors.mutedForeground : palette.accent;
    const bgColor = theme === "dark" ? palette.bgDark : palette.bg;
    const childArray = React.Children.toArray(children);
    const alertSubNames = new Set([
      "AlertTitle",
      "AlertDescription",
      "AlertAction",
    ]);
    let iconChild: React.ReactNode = null;
    let restChildren: React.ReactNode[] = childArray;
    const first = childArray[0] as React.ReactElement | undefined;
    if (
      first &&
      React.isValidElement(first) &&
      !alertSubNames.has((first.type as any)?.displayName ?? "")
    ) {
      iconChild = first;
      restChildren = childArray.slice(1);
    }
    const iconElement = iconChild as React.ReactElement<IconProps> | null;
    return (
      <AlertContext.Provider value={{ variant, accentColor }}>
        <View
          ref={ref}
          accessibilityRole="alert"
          {...props}
          style={[
            styles.root,
            {
              backgroundColor: bgColor,
              borderColor: colors.border,
              borderLeftColor: accentColor,
              borderRadius: radius.lg,
              padding: spacing.lg,
              gap: spacing.xs,
            },
            style,
          ]}
        >
          <View style={styles.row}>
            {iconElement ? (
              <View style={[styles.iconSlot, { marginTop: 1 }]}>
                {React.cloneElement(iconElement, {
                  color: iconElement.props.color ?? accentColor,
                  size: iconElement.props.size ?? 18,
                })}
              </View>
            ) : null}

            <View style={styles.contentColumn}>{restChildren}</View>
          </View>
        </View>
      </AlertContext.Provider>
    );
  },
);
Alert.displayName = "Alert";
type AlertTitleProps = TextProps & {
  style?: StyleProp<TextStyle>;
};
const AlertTitle = forwardRef<Text, AlertTitleProps>(
  ({ children, style, ...props }, ref) => {
    const { theme } = useTheme();
    const { colors, typography } = THEME[theme];
    return (
      <Text
        ref={ref}
        accessibilityRole="header"
        {...props}
        style={[
          styles.title,
          {
            color: colors.foreground,
            fontSize: typography.sm,
          },
          style,
        ]}
      >
        {children}
      </Text>
    );
  },
);
AlertTitle.displayName = "AlertTitle";
type AlertDescriptionProps = TextProps & {
  style?: StyleProp<TextStyle>;
};
const AlertDescription = forwardRef<Text, AlertDescriptionProps>(
  ({ children, style, ...props }, ref) => {
    const { theme } = useTheme();
    const { colors, typography, spacing } = THEME[theme];
    return (
      <Text
        ref={ref}
        {...props}
        style={[
          {
            color: colors.mutedForeground,
            fontSize: typography.xs,
            lineHeight: typography.xs * 1.55,
            marginTop: spacing.xs,
          },
          style,
        ]}
      >
        {children}
      </Text>
    );
  },
);
AlertDescription.displayName = "AlertDescription";
type AlertActionProps = ViewProps & {
  style?: StyleProp<ViewStyle>;
};
const AlertAction = forwardRef<View, AlertActionProps>(
  ({ children, style, ...props }, ref) => {
    const { theme } = useTheme();
    const { spacing } = THEME[theme];
    return (
      <View
        ref={ref}
        {...props}
        style={[{ marginTop: spacing.sm, alignSelf: "flex-start" }, style]}
      >
        {children}
      </View>
    );
  },
);
AlertAction.displayName = "AlertAction";
const styles = StyleSheet.create({
  root: {
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconSlot: {
    marginRight: 12,
    flexShrink: 0,
  },
  contentColumn: {
    flex: 1,
  },
  title: {
    fontWeight: "600",
    letterSpacing: 0.1,
  },
});
export { Alert, AlertAction, AlertDescription, AlertTitle };
