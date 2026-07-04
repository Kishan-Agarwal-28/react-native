import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  Canvas,
  Circle,
  DashPathEffect,
  Group,
  Path,
  Skia,
  rect,
  rrect,
} from "@shopify/react-native-skia";
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { computeHabitWindow } from "@/lib/habit-schedule";
import type { Habit } from "@/lib/habit.types";
import dayjs from "dayjs";

const ACTION_WINDOW_DURATION = 5 * 60 * 1000;
const CHECK_DRAW_DURATION = 450;

type WindowOverride = { startDate: Date | string; targetDate: Date | string };

type TaskWaveLoaderProps = {
  habit: Habit;
  /** Parent-supplied window. When present, this always wins — see note below. */
  windowOverride?: WindowOverride;
  onMarkEntry: (habitId: string) => void | Promise<void>;
};

type Status = "invalid" | "loading" | "action_window" | "missed";

const TaskWaveLoader: React.FC<TaskWaveLoaderProps> = ({
  habit,
  windowOverride,
  onMarkEntry,
}) => {
  const SIZE = 40;
  const STROKE_WIDTH = 3;
  const r = SIZE / 2;
  const padding = STROKE_WIDTH;
  const outerCircleRadius = r - STROKE_WIDTH / 2;
  const innerCircleSize = SIZE - padding * 2;
  const waveFrequency = 4;
  const amplitude = 4;

  const roundedRectangle = rrect(
    rect(padding, padding, innerCircleSize, innerCircleSize),
    innerCircleSize / 2,
    innerCircleSize / 2,
  );

  const [status, setStatus] = useState<Status>("loading");
  const [optimisticWindow, setOptimisticWindow] = useState<{
    startDate: Date;
    targetDate: Date;
  } | null>(null);

  const lastCompletedRef = useRef(habit.lastCompletedISO);
  useEffect(() => {
    if (lastCompletedRef.current !== habit.lastCompletedISO) {
      lastCompletedRef.current = habit.lastCompletedISO;
      setOptimisticWindow(null);
    }
  }, [habit.lastCompletedISO]);

  // Priority: parent override > optimistic (post-tap) > derived from habit
  const effectiveWindow = useMemo(() => {
    if (windowOverride) {
      return {
        status: "ok" as const,
        startDate: dayjs(windowOverride.startDate).toDate(),
        targetDate: dayjs(windowOverride.targetDate).toDate(),
      };
    }
    if (optimisticWindow) {
      return { status: "ok" as const, ...optimisticWindow };
    }
    return computeHabitWindow(habit);
  }, [windowOverride, optimisticWindow, habit]);
  const phase = useSharedValue(0);
  const progress = useSharedValue(0);
  const checkEnd = useSharedValue(1);

  useEffect(() => {
    phase.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 1500, easing: Easing.linear }),
      -1,
      false,
    );
  }, [phase]);

  useEffect(() => {
    if (effectiveWindow.status === "invalid") {
      setStatus("invalid");
      return;
    }

    const startMs = effectiveWindow.startDate.getTime();
    const targetMs = effectiveWindow.targetDate.getTime();

    const checkTime = () => {
      const nowMs = Date.now();

      if (nowMs >= targetMs && nowMs < targetMs + ACTION_WINDOW_DURATION) {
        setStatus("action_window");
        progress.value = 100;
      } else if (nowMs >= targetMs + ACTION_WINDOW_DURATION) {
        setStatus("missed");
        progress.value = 100;
      } else {
        setStatus("loading");
        const totalDuration = targetMs - startMs;
        const elapsed = nowMs - startMs;
        const currentProgress =
          totalDuration > 0 ? (elapsed / totalDuration) * 100 : 100;

        progress.value = withTiming(
          Math.max(0, Math.min(100, currentProgress)),
          {
            duration: 1000,
            easing: Easing.linear,
          },
        );
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, [effectiveWindow, progress]);

  const animatedPath = useDerivedValue(() => {
    const verticalOffset = (1 - progress.value / 100) * innerCircleSize;
    let pathString = `M 0 ${SIZE}`;

    for (let i = 0; i <= SIZE; i += 2) {
      const angle = (i / SIZE) * (Math.PI * waveFrequency) + phase.value;
      const y = (Math.sin(angle) * amplitude) / 2 + verticalOffset;
      pathString += ` L ${i} ${y}`;
    }

    const finalAngle = Math.PI * waveFrequency + phase.value;
    const finalY = (Math.sin(finalAngle) * amplitude) / 2 + verticalOffset;
    pathString += ` L ${SIZE} ${finalY} L ${SIZE} ${SIZE} Z`;

    const path = Skia.Path.MakeFromSVGString(pathString);
    return path ?? Skia.Path.Make();
  });

  // Drawn once, sits *beneath* the wave so the rising fill covers it
  // bottom-up as the new cycle progresses.
  const checkmarkPath = useMemo(() => {
    const path = Skia.Path.Make();
    const box = innerCircleSize;
    path.moveTo(padding + box * 0.22, padding + box * 0.52);
    path.lineTo(padding + box * 0.42, padding + box * 0.72);
    path.lineTo(padding + box * 0.78, padding + box * 0.28);
    return path;
  }, [innerCircleSize, padding]);

  const getBorderColor = () => {
    if (status === "invalid") return "#D1D5DB";
    if (status === "action_window") return "#EF4444";
    if (status === "missed") return "#9CA3AF";
    return "#40f628";
  };

  const handlePress = async () => {
    if (status !== "action_window") return;

    const now = dayjs().toDate();

    const optimisticHabit = { ...habit, lastCompletedISO: now.toISOString() };
    const next = computeHabitWindow(optimisticHabit, now);

    if (next.status !== "ok") return;

    checkEnd.value = 0;
    checkEnd.value = withTiming(1, {
      duration: CHECK_DRAW_DURATION,
      easing: Easing.out(Easing.cubic),
    });

    setOptimisticWindow({
      startDate: next.startDate,
      targetDate: next.targetDate,
    });

    try {
      await onMarkEntry(habit.id);
    } catch (err) {
      setOptimisticWindow(null);
      checkEnd.value = 0;
    }
  };

  if (status === "invalid") {
    return (
      <View
        style={{
          width: SIZE,
          height: SIZE,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Canvas style={StyleSheet.absoluteFill}>
          <Circle
            cx={r}
            cy={r}
            r={outerCircleRadius}
            color={getBorderColor()}
            style="stroke"
            strokeWidth={3}
          >
            <DashPathEffect intervals={[3, 3]} />
          </Circle>
        </Canvas>
        <Text style={{ fontSize: 12, color: "#9CA3AF" }}>–</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={status !== "action_window"}
      onPress={handlePress}
      style={{
        width: SIZE + 10,
        height: SIZE + 10,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Canvas style={{ height: SIZE, width: SIZE }}>
        <Circle
          cx={r}
          cy={r}
          r={outerCircleRadius}
          color={getBorderColor()}
          style="stroke"
          strokeWidth={STROKE_WIDTH}
        />
        {status === "loading" && (
          <Group clip={roundedRectangle}>
            <Path
              path={checkmarkPath}
              color="#16881A"
              style="stroke"
              strokeWidth={3}
              strokeCap="round"
              strokeJoin="round"
              start={0}
              end={checkEnd}
            />
            <Path path={animatedPath} color="#25dc0d" />
          </Group>
        )}
      </Canvas>
    </TouchableOpacity>
  );
};

export default TaskWaveLoader;
