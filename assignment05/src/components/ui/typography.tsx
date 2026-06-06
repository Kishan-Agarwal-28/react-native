import { THEME, useTheme } from "@/lib/theme";
import { forwardRef } from "react";
import {
  Platform,
  Text,
  View,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
export type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "p"
  | "lead"
  | "large"
  | "small"
  | "muted"
  | "blockquote"
  | "code"
  | "label"
  | "caption";
type BaseProps = {
  style?: StyleProp<TextStyle>;
} & Omit<TextProps, "style">;
type TypographyProps =
  | ({
      variant?: Exclude<TypographyVariant, "blockquote" | "code">;
    } & BaseProps)
  | ({
      variant: "blockquote" | "code";
      containerStyle?: StyleProp<ViewStyle>;
    } & BaseProps);
const HEADING_VARIANTS = new Set<TypographyVariant>(["h1", "h2", "h3", "h4"]);
const MONO_FONT = Platform.select<string>({
  ios: "Courier New",
  android: "monospace",
  default: "monospace",
});
const Typography = forwardRef<Text, TypographyProps>((props, ref) => {
  const {
    variant = "p",
    children,
    style,
    accessibilityRole,
    accessibilityLabel,
    ...restProps
  } = props;
  const { containerStyle, ...textProps } = restProps as typeof restProps & {
    containerStyle?: StyleProp<ViewStyle>;
  };
  const { theme } = useTheme();
  const { colors, spacing, radius, typography } = THEME[theme];
  const variantStyle = ((): TextStyle => {
    switch (variant) {
      case "h1":
        return {
          fontSize: typography["2xl"],
          fontWeight: "800",
          letterSpacing: -0.5,
          lineHeight: typography["2xl"] * 1.2,
          color: colors.foreground,
        };
      case "h2":
        return {
          fontSize: typography.xl,
          fontWeight: "700",
          letterSpacing: -0.3,
          lineHeight: typography.xl * 1.25,
          color: colors.foreground,
        };
      case "h3":
        return {
          fontSize: typography.lg,
          fontWeight: "600",
          letterSpacing: -0.2,
          lineHeight: typography.lg * 1.3,
          color: colors.foreground,
        };
      case "h4":
        return {
          fontSize: typography.base,
          fontWeight: "600",
          letterSpacing: -0.1,
          lineHeight: typography.base * 1.4,
          color: colors.foreground,
        };
      case "p":
        return {
          fontSize: typography.base,
          fontWeight: "400",
          lineHeight: typography.base * 1.6,
          color: colors.foreground,
        };
      case "lead":
        return {
          fontSize: typography.lg,
          fontWeight: "400",
          lineHeight: typography.lg * 1.55,
          color: colors.mutedForeground,
        };
      case "large":
        return {
          fontSize: typography.lg,
          fontWeight: "600",
          lineHeight: typography.lg * 1.3,
          color: colors.foreground,
        };
      case "small":
        return {
          fontSize: typography.sm,
          fontWeight: "500",
          lineHeight: typography.sm * 1.4,
          color: colors.foreground,
        };
      case "muted":
        return {
          fontSize: typography.sm,
          fontWeight: "400",
          lineHeight: typography.sm * 1.4,
          color: colors.mutedForeground,
        };
      case "blockquote":
        return {
          fontSize: typography.base,
          fontWeight: "400",
          fontStyle: "italic",
          lineHeight: typography.base * 1.6,
          color: colors.mutedForeground,
        };
      case "code":
        return {
          fontFamily: MONO_FONT,
          fontSize: typography.sm,
          fontWeight: "400",
          lineHeight: typography.sm * 1.5,
          color: colors.foreground,
        };
      case "label":
        return {
          fontSize: typography.xs,
          fontWeight: "600",
          letterSpacing: 0.6,
          textTransform: "uppercase",
          lineHeight: typography.xs * 1.4,
          color: colors.foreground,
        };
      case "caption":
        return {
          fontSize: typography.xs,
          fontWeight: "400",
          lineHeight: typography.xs * 1.4,
          color: colors.mutedForeground,
        };
    }
  })();
  const resolvedRole =
    accessibilityRole ?? (HEADING_VARIANTS.has(variant) ? "header" : undefined);
  const textNode = (
    <Text
      ref={ref}
      accessibilityRole={resolvedRole}
      accessibilityLabel={accessibilityLabel}
      {...textProps}
      style={[variantStyle, style]}
    >
      {children}
    </Text>
  );
  if (variant === "blockquote") {
    return (
      <View
        style={[
          {
            borderLeftWidth: 3,
            borderLeftColor: colors.border,
            paddingLeft: spacing.md,
            alignSelf: "stretch",
          },
          containerStyle,
        ]}
        importantForAccessibility="no"
      >
        {textNode}
      </View>
    );
  }
  if (variant === "code") {
    return (
      <View
        style={[
          {
            alignSelf: "flex-start",
            backgroundColor: colors.muted,
            borderRadius: radius.sm,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs / 2,
          },
          containerStyle,
        ]}
        importantForAccessibility="no"
      >
        {textNode}
      </View>
    );
  }
  return textNode;
});
Typography.displayName = "Typography";
export default Typography;
