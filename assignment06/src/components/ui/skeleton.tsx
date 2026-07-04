import { THEME, useTheme } from "@/lib/theme";
import React, { useEffect } from "react";
import { View, type ViewProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
const Skeleton = React.forwardRef<View, ViewProps>(
  ({ style, ...props }, ref) => {
    const { theme } = useTheme();
    const { colors } = THEME[theme];
    const backgroundColor = theme === "dark" ? "#201f1f82" : "#d4d0d054";
    const opacity = useSharedValue(0.5);
    useEffect(() => {
      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.5, {
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        true,
      );
    }, [opacity]);
    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
    }));
    return (
      <Animated.View
        ref={ref as any}
        style={[
          {
            backgroundColor,
            borderRadius: 8,
          },
          animatedStyle,
          style,
        ]}
        {...props}
      />
    );
  },
);
Skeleton.displayName = "Skeleton";
export default Skeleton;
