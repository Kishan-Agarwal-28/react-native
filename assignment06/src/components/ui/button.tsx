import { THEME, useTheme, type Theme } from "@/lib/theme";
import { useButtonGroupItem } from "@/components/ui/button-group";
import { forwardRef } from "react";
import {
  ActivityIndicator,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
export type ButtonVariant =
  | "default"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "destructive";
export type ButtonProps = {
  title?: string;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle & TextStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  variant?: ButtonVariant;
  pressedEffect?: boolean;
  color?: string;
} & Omit<PressableProps, "style" | "onPress">;
type VariantStyle = {
  button: ViewStyle;
  text: TextStyle;
  normalBg: string;
  pressedBg: string;
};
const getVariantStyles = (
  theme: Theme,
  variant: ButtonVariant,
): VariantStyle => {
  const { colors } = THEME[theme];
  switch (variant) {
    case "default":
      return {
        button: { backgroundColor: colors.primary },
        text: { color: colors.primaryForeground, fontWeight: "600" },
        normalBg: colors.primary,
        pressedBg: colors.primary + "e6",
      };
    case "outline":
      return {
        button: {
          backgroundColor: "transparent",
          borderWidth: 1.5,
          borderColor: colors.border,
        },
        text: { color: colors.foreground, fontWeight: "600" },
        normalBg: "transparent",
        pressedBg: colors.accent,
      };
    case "secondary":
      return {
        button: { backgroundColor: colors.secondary },
        text: { color: colors.secondaryForeground, fontWeight: "600" },
        normalBg: colors.secondary,
        pressedBg: colors.secondaryForeground + "20",
      };
    case "ghost":
      return {
        button: { backgroundColor: "transparent" },
        text: { color: colors.foreground, fontWeight: "500" },
        normalBg: "transparent",
        pressedBg: colors.accent,
      };
    case "link":
      return {
        button: { backgroundColor: "transparent" },
        text: {
          color: colors.primary,
          fontWeight: "500",
          textDecorationLine: "underline",
        },
        normalBg: "transparent",
        pressedBg: "transparent",
      };
    case "destructive":
      return {
        button: { backgroundColor: colors.destructive },
        text: { color: colors.destructiveForeground, fontWeight: "600" },
        normalBg: colors.destructive,
        pressedBg: colors.destructive + "cc",
      };
  }
};
const TIMING_CONFIG = {
  duration: 180,
  easing: Easing.inOut(Easing.ease),
};
const AnimatedPressable = Animated.createAnimatedComponent(
  require("react-native").Pressable,
);
const Button = forwardRef<View, ButtonProps>(
  (
    {
      title,
      onPress,
      containerStyle,
      buttonStyle,
      textStyle,
      disabled = false,
      loading = false,
      children,
      variant = "default",
      pressedEffect = true,
      color,
      accessibilityLabel,
      accessibilityHint,
      ...rest
    },
    ref,
  ) => {
    const { theme } = useTheme();
    const { colors, spacing, radius, typography } = THEME[theme];
    const pressProgress = useSharedValue(0);
    const {
      isInGroup,
      orientation,
      buttonStyle: groupButtonStyle,
    } = useButtonGroupItem();
    const variantStyles = getVariantStyles(theme, variant);
    const isDisabled = disabled || loading;
    const flatButtonStyle = StyleSheet.flatten(buttonStyle) ?? {};
    const resolvedTextColor =
      color ?? (flatButtonStyle.color as string | undefined);
    const animatedStyle = useAnimatedStyle(() => {
      if (!pressedEffect) return {};
      return {
        backgroundColor: interpolateColor(
          pressProgress.value,
          [0, 1],
          [variantStyles.normalBg, variantStyles.pressedBg],
        ),
        transform: [
          {
            scale: withTiming(
              pressProgress.value === 1 ? 0.98 : 1,
              TIMING_CONFIG,
            ),
          },
        ],
      };
    });
    const handlePressIn = () => {
      if (!pressedEffect) return;
      pressProgress.value = withTiming(1, TIMING_CONFIG);
    };
    const handlePressOut = () => {
      if (!pressedEffect) return;
      pressProgress.value = withTiming(0, TIMING_CONFIG);
    };
    const loaderColor =
      resolvedTextColor ??
      (variant === "default" ? colors.primaryForeground : colors.primary);
    return (
      <View
        ref={ref}
        style={[
          isInGroup && orientation === "horizontal"
            ? { flex: 1 }
            : { width: "100%" },
          { opacity: isDisabled ? 0.5 : 1 },
          containerStyle,
        ]}
      >
        <AnimatedPressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isDisabled}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel ?? title ?? undefined}
          accessibilityHint={accessibilityHint}
          accessibilityState={{
            disabled: isDisabled,
            busy: loading,
          }}
          {...rest}
          style={[
            {
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              borderRadius: radius.lg,
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: 50,
              flexDirection: "row",
              gap: spacing.sm,
            },
            variantStyles.button,
            animatedStyle,
            groupButtonStyle,
            buttonStyle,
          ]}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color={loaderColor}
              accessibilityLabel="Loading"
            />
          ) : (
            <>
              {children}
              {title && (
                <Text
                  style={[
                    {
                      fontSize: typography.base,
                      letterSpacing: 0.2,
                    },
                    variantStyles.text,
                    resolvedTextColor ? { color: resolvedTextColor } : null,
                    textStyle,
                  ]}
                  importantForAccessibility="no"
                  accessibilityElementsHidden
                >
                  {title}
                </Text>
              )}
            </>
          )}
        </AnimatedPressable>
      </View>
    );
  },
);
Button.displayName = "Button";
export default Button;
