import React, { useEffect } from "react";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
} from "react-native-reanimated";
import { THEME, useTheme } from "@/lib/theme";
import { getScoreColor, calculateSafetyRating } from "@/services/scoring";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export default function ScoreRing({
  score,
  size = 160,
  strokeWidth = 14,
  showLabel = true,
}: ScoreRingProps) {
  const { theme } = useTheme();
  const { colors, typography } = THEME[theme];

  const clamped = Math.max(0, Math.min(100, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(clamped / 100, {
      mass: 0.5,
      damping: 18,
      stiffness: 80,
    });
  }, [clamped]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const scoreColor = getScoreColor(clamped);
  const rating = calculateSafetyRating(clamped);

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
      }}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={colors.muted}
          strokeWidth={strokeWidth}
        />
        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={scoreColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation={-90}
          origin={`${cx}, ${cy}`}
        />
      </Svg>
      <View
        style={{
          position: "absolute",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: typography["2xl"],
            fontWeight: "800" as const,
            color: scoreColor,
            fontFamily: "Inter_700Bold",
            lineHeight: typography["2xl"] * 1.1,
          }}
        >
          {Math.round(clamped)}
        </Text>
        {showLabel && (
          <Text
            style={{
              fontSize: typography.xs,
              color: colors.mutedForeground,
              fontFamily: "Inter_500Medium",
              marginTop: 2,
            }}
          >
            {rating}
          </Text>
        )}
      </View>
    </View>
  );
}
