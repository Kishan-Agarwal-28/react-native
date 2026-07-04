import { THEME, useTheme } from "@/lib/theme";
import { forwardRef } from "react";
import {
  Text,
  View,
  type ViewStyle,
  type TextStyle,
  type StyleProp,
  type ViewProps,
} from "react-native";
type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost";
type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
} & Omit<ViewProps, "style">;
const Badge = forwardRef<View, BadgeProps>(
  (
    {
      label,
      variant = "default",
      icon,
      style,
      textStyle,
      accessibilityLabel,
      ...rest
    },
    ref,
  ) => {
    const { theme } = useTheme();
    const { colors, spacing, radius } = THEME[theme];
    const variantStyles: Record<
      BadgeVariant,
      {
        container: ViewStyle;
        text: TextStyle;
      }
    > = {
      default: {
        container: {
          backgroundColor: colors.primary,
          borderColor: "transparent",
        },
        text: { color: colors.primaryForeground },
      },
      secondary: {
        container: {
          backgroundColor: colors.secondary,
          borderColor: "transparent",
        },
        text: { color: colors.secondaryForeground },
      },
      destructive: {
        container: {
          backgroundColor: colors.destructive,
          borderColor: "transparent",
        },
        text: { color: colors.destructiveForeground },
      },
      outline: {
        container: {
          backgroundColor: "transparent",
          borderColor: colors.border,
        },
        text: { color: colors.foreground },
      },
      ghost: {
        container: {
          backgroundColor: colors.muted,
          borderColor: "transparent",
        },
        text: { color: colors.mutedForeground },
      },
    };
    const { container, text } = variantStyles[variant];
    return (
      <View
        ref={ref}
        accessibilityRole="text"
        accessibilityLabel={accessibilityLabel ?? label}
        {...rest}
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "flex-start",
            gap: spacing.xs,
            paddingHorizontal: spacing.sm,
            paddingVertical: 3,
            borderRadius: radius.full,
            borderWidth: 1,
          },
          container,
          style,
        ]}
      >
        {icon}
        <Text
          style={[
            { fontSize: 12, fontWeight: "600", letterSpacing: 0.1 },
            text,
            textStyle,
          ]}
          importantForAccessibility="no"
          accessibilityElementsHidden
        >
          {label}
        </Text>
      </View>
    );
  },
);
Badge.displayName = "Badge";
export default Badge;
