import { THEME, useTheme } from "@/lib/theme";
import { forwardRef, useEffect } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
type ProgressProps = {
  value?: number;
} & ViewProps;
const PROGRESS_HEIGHT = 8;
export const Progress = forwardRef<View, ProgressProps>(
  ({ value = 0, style, ...rest }, ref) => {
    const { theme } = useTheme();
    const { colors } = THEME[theme];
    const clampedValue = Math.min(Math.max(value, 0), 100);
    const animatedProgress = useSharedValue(clampedValue);
    useEffect(() => {
      animatedProgress.value = withSpring(clampedValue, {
        mass: 0.3,
        damping: 15,
        stiffness: 120,
      });
    }, [clampedValue, animatedProgress]);
    const indicatorAnimatedStyle = useAnimatedStyle(() => {
      return {
        width: `${animatedProgress.value}%`,
      };
    });
    return (
      <View
        ref={ref}
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: clampedValue,
          text: `${clampedValue}% completed`,
        }}
        {...rest}
        style={[
          styles.track,
          {
            backgroundColor: colors.secondary,
            height: PROGRESS_HEIGHT,
            borderRadius: PROGRESS_HEIGHT / 2,
          },
          style,
        ]}
      >
        <Animated.View
          style={[
            styles.indicator,
            {
              backgroundColor: colors.primary,
              height: PROGRESS_HEIGHT,
              borderRadius: PROGRESS_HEIGHT / 2,
            },
            indicatorAnimatedStyle,
          ]}
        />
      </View>
    );
  },
);
const styles = StyleSheet.create({
  track: {
    width: "100%",
    overflow: "hidden",
  },
  indicator: {
    width: 0,
  },
});
Progress.displayName = "Progress";
export default Progress;
