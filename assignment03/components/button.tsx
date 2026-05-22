import { THEME } from "@/lib/constants";
import useStyles from "@/lib/use-styles";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Theme, useTheme } from "@/lib/theme_context";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant =
  | "default"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "destructive";

type ButtonProps = {
  title?: string;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle & TextStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  variant?: ButtonVariant;
  asChild?: boolean;
  pressedEffect?: boolean;
  color?: string;
} & Omit<PressableProps, "style" | "onPress">;

type VariantStyle = {
  container: ViewStyle;
  button: ViewStyle;
  text: TextStyle;
  normalBg: string;
  pressedBg: string;
};

const getVariantStyles = (
  theme: Theme,
  variant: ButtonVariant,
  disabled: boolean,
): VariantStyle => {
  const t = THEME[theme];
  const opacity = disabled ? 0.5 : 1;

  const base = {
    container: { opacity } as ViewStyle,
    button: {} as ViewStyle,
    text: {} as TextStyle,
    normalBg: "transparent",
    pressedBg: "transparent",
  };

  switch (variant) {
    case "default":
      return {
        ...base,
        button: { backgroundColor: t.accent },
        text: { color: t.text4, fontWeight: "600" },
        normalBg: t.accent,
        pressedBg: "#E55A28",
      };
    case "outline":
      return {
        ...base,
        button: {
          backgroundColor: "transparent",
          borderWidth: 1.5,
          borderColor: t.accentBg,
        },
        text: { color: t.accent, fontWeight: "600" },
        normalBg: "transparent",
        pressedBg: t.accentBg,
      };
    case "secondary":
      return {
        ...base,
        button: { backgroundColor: t.accentBg },
        text: { color: t.accent, fontWeight: "600" },
        normalBg: t.accentBg,
        pressedBg: t.accent + "30",
      };
    case "ghost":
      return {
        ...base,
        button: { backgroundColor: "transparent" },
        text: { color: t.text1, fontWeight: "500" },
        normalBg: "transparent",
        pressedBg: t.inputBg,
      };
    case "link":
      return {
        ...base,
        button: { backgroundColor: "transparent" },
        text: {
          color: t.accent,
          fontWeight: "500",
          textDecorationLine: "underline",
        },
        normalBg: "transparent",
        pressedBg: "transparent",
      };
    case "destructive":
      return {
        ...base,
        button: { backgroundColor: t.destructiveBg },
        text: { color: t.destructive, fontWeight: "600" },
        normalBg: t.destructiveBg,
        pressedBg: t.destructive + "30",
      };
  }
};

const TIMING_CONFIG = {
  duration: 180,
  easing: Easing.inOut(Easing.ease),
};

const Button = ({
  title,
  onPress,
  containerStyle,
  buttonStyle,
  textStyle,
  disabled = false,
  loading = false,
  children,
  variant = "default",
  asChild = false,
  pressedEffect = true,
  color,
  ...rest
}: ButtonProps) => {
  const { theme } = useTheme();
  const pressProgress = useSharedValue(0);

  const styles = useStyles(() => ({
    container: {
      width: "100%",
    },
    button: {
      padding: 10,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: 50,
      flexDirection: "row",
      gap: 8,
    },
    text: {
      fontSize: 15,
      letterSpacing: 0.2,
    },
  }));

  const variantStyles = getVariantStyles(theme, variant, disabled);
  const isDisabled = disabled || loading;
  const flattenedButtonStyle = StyleSheet.flatten(buttonStyle) || {};
  const extractedTextColor = color || flattenedButtonStyle.color;

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

  if (asChild && children) {
    return <>{children}</>;
  }

  const loaderColor = extractedTextColor
    ? extractedTextColor
    : variant === "default"
      ? THEME[theme].text4
      : THEME[theme].accent;

  return (
    <View style={[styles.container, variantStyles.container, containerStyle]}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[
          styles.button,
          variantStyles.button,
          animatedStyle,
          buttonStyle,
        ]}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator size="small" color={loaderColor} />
        ) : (
          <>
            {children}
            {title && (
              <Text
                style={[
                  styles.text,
                  variantStyles.text,
                  extractedTextColor ? { color: extractedTextColor } : null,
                  textStyle,
                ]}
              >
                {title}
              </Text>
            )}
          </>
        )}
      </AnimatedPressable>
    </View>
  );
};

export default Button;
