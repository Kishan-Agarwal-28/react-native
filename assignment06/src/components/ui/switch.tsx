import { THEME, useTheme } from "@/lib/theme";
import { forwardRef, useEffect } from "react";
import { Pressable, type View, type PressableProps } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
type SwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
} & Omit<PressableProps, "style" | "value" | "onPress">;
const TRACK_WIDTH = 44;
const TRACK_HEIGHT = 24;
const THUMB_SIZE = 20;
const TRACK_PADDING = 2;
const TRANSLATE_X_MAX = TRACK_WIDTH - THUMB_SIZE - TRACK_PADDING * 2;
export const Switch = forwardRef<View, SwitchProps>(
  (
    {
      value = false,
      onValueChange,
      disabled = false,
      accessibilityLabel,
      accessibilityHint,
      ...rest
    },
    ref,
  ) => {
    const { theme } = useTheme();
    const { colors } = THEME[theme];
    const progress = useSharedValue(value ? 1 : 0);
    useEffect(() => {
      progress.value = withTiming(value ? 1 : 0, { duration: 200 });
    }, [value, progress]);
    const trackAnimatedStyle = useAnimatedStyle(() => {
      return {
        backgroundColor: interpolateColor(
          progress.value,
          [0, 1],
          [colors.input, colors.primary],
        ),
      };
    });
    const thumbAnimatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          {
            translateX: progress.value * TRANSLATE_X_MAX,
          },
        ],
      };
    });
    const handlePress = () => {
      if (disabled) return;
      onValueChange?.(!value);
    };
    return (
      <Pressable
        ref={ref}
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled }}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        {...rest}
        style={[
          {
            width: TRACK_WIDTH,
            height: TRACK_HEIGHT,
            padding: TRACK_PADDING,
            borderRadius: 999,
            justifyContent: "center",
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <Animated.View
          style={[
            {
              ...StyleSheet.absoluteFillObject,
              borderRadius: 999,
            },
            trackAnimatedStyle,
          ]}
        />

        <Animated.View
          style={[
            {
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              backgroundColor: colors.background,
              borderRadius: 999,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
              elevation: 2,
            },
            thumbAnimatedStyle,
          ]}
        />
      </Pressable>
    );
  },
);
import { StyleSheet } from "react-native";
Switch.displayName = "Switch";
export default Switch;
