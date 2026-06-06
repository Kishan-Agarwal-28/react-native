import { THEME, useTheme } from "@/lib/theme";
import { forwardRef } from "react";
import {
  View,
  Text,
  type ViewStyle,
  type TextStyle,
  type ViewProps,
  type TextProps,
} from "react-native";
type CardSize = "default" | "sm";
type CardProps = {
  size?: CardSize;
  style?: ViewStyle;
} & Omit<ViewProps, "style">;
export const Card = forwardRef<View, CardProps>(
  ({ children, size = "default", style, ...rest }, ref) => {
    const { theme } = useTheme();
    const { colors, radius, spacing } = THEME[theme];
    return (
      <View
        ref={ref}
        {...rest}
        style={[
          {
            backgroundColor: colors.card,
            borderRadius: size === "sm" ? radius.lg : radius.xl,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: "hidden",
            padding: size === "sm" ? spacing.md : spacing.lg,
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  },
);
Card.displayName = "Card";
type CardSectionProps = {
  style?: ViewStyle;
} & Omit<ViewProps, "style">;
export const CardHeader = forwardRef<View, CardSectionProps>(
  ({ children, style, ...rest }, ref) => {
    const { spacing } = THEME[useTheme().theme];
    return (
      <View
        ref={ref}
        {...rest}
        style={[
          {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: spacing.md,
            gap: spacing.sm,
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  },
);
CardHeader.displayName = "CardHeader";
type CardTitleProps = {
  style?: TextStyle;
} & Omit<TextProps, "style">;
export const CardTitle = forwardRef<Text, CardTitleProps>(
  ({ children, style, ...rest }, ref) => {
    const { theme } = useTheme();
    const { colors, typography } = THEME[theme];
    return (
      <Text
        ref={ref}
        accessibilityRole="header"
        {...rest}
        style={[
          {
            color: colors.cardForeground,
            fontSize: typography.lg,
            fontWeight: "700",
            flexShrink: 1,
          },
          style,
        ]}
      >
        {children}
      </Text>
    );
  },
);
CardTitle.displayName = "CardTitle";
export const CardDescription = forwardRef<Text, CardTitleProps>(
  ({ children, style, ...rest }, ref) => {
    const { theme } = useTheme();
    const { colors, typography, spacing } = THEME[theme];
    return (
      <Text
        ref={ref}
        {...rest}
        style={[
          {
            color: colors.mutedForeground,
            fontSize: typography.sm,
            lineHeight: typography.sm * 1.4,
            marginTop: spacing.xs / 2,
          },
          style,
        ]}
      >
        {children}
      </Text>
    );
  },
);
CardDescription.displayName = "CardDescription";
export const CardTitleGroup = forwardRef<View, CardSectionProps>(
  ({ children, style, ...rest }, ref) => (
    <View ref={ref} {...rest} style={[{ flex: 1, gap: 2 }, style]}>
      {children}
    </View>
  ),
);
CardTitleGroup.displayName = "CardTitleGroup";
export const CardAction = forwardRef<View, CardSectionProps>(
  ({ children, style, ...rest }, ref) => (
    <View ref={ref} {...rest} style={[{ flexShrink: 0 }, style]}>
      {children}
    </View>
  ),
);
CardAction.displayName = "CardAction";
export const CardContent = forwardRef<View, CardSectionProps>(
  ({ children, style, ...rest }, ref) => {
    const { spacing } = THEME[useTheme().theme];
    return (
      <View ref={ref} {...rest} style={[{ gap: spacing.sm }, style]}>
        {children}
      </View>
    );
  },
);
CardContent.displayName = "CardContent";
export const CardFooter = forwardRef<View, CardSectionProps>(
  ({ children, style, ...rest }, ref) => {
    const { theme } = useTheme();
    const { colors, spacing } = THEME[theme];
    return (
      <View
        ref={ref}
        {...rest}
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: spacing.sm,
            marginTop: spacing.md,
            paddingTop: spacing.md,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  },
);
CardFooter.displayName = "CardFooter";
