import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import Text from "@/components/ui/text";
import View from "@/components/ui/view";
import { useDatabase } from "@/db/database";
import {
  deleteHabit,
  getHabitById,
  getLogForDate,
  getLogsForYear,
  getNotificationIds,
  upsertLog,
} from "@/db/schema";
import {
  triggerErrorFeedback,
  triggerLightImpact,
  triggerSuccessFeedback,
} from "@/lib/feedback";
import { cancelHabitNotifications } from "@/lib/habit-notifications";
import { computeHabitWindow } from "@/lib/habit-schedule";
import { useHabits } from "@/lib/habit-store";
import { recalcHabitStreak } from "@/lib/streak";
import { THEME, useTheme } from "@/lib/theme";
import useStyles from "@/lib/use-styles";
import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import Octicons from "@expo/vector-icons/Octicons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import dayjs from "dayjs";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heatmap } from "rn-heatmap";

type DayLog = { date: string; done: boolean };
type HeatmapActivity = { monthIndex: number; dayIndex: number; level: 1 };

const ACTION_WINDOW_DURATION = 5 * 60 * 1000;

const toActiveDays = (logs: DayLog[]): HeatmapActivity[] =>
  logs
    .filter((log) => log.done)
    .map((log) => {
      const d = dayjs(log.date);
      return {
        monthIndex: d.month(),
        dayIndex: d.date() - 1,
        level: 1 as const,
      };
    });

const TaskDetails = () => {
  const { task_id } = useLocalSearchParams();
  const id = Array.isArray(task_id) ? task_id[0] : task_id;
  const today = dayjs().format("YYYY-MM-DD");
  const { theme } = useTheme();
  const router = useRouter();
  const db = useDatabase();
  const { habits, refresh } = useHabits();

  const taskDetails =
    habits.find((h) => h.id === id) ?? (id ? getHabitById(db, id) : null);
  const logs = id ? getLogsForYear(db, id, dayjs().year()) : [];
  const activeDays = toActiveDays(
    logs.map((l) => ({ date: l.date, done: l.done === 1 })),
  );
  const isDoneToday = id ? getLogForDate(db, id, today) : false;
  const [nowMs, setNowMs] = useState(() => Date.now());

  const isInActionWindow = useMemo(() => {
    if (!taskDetails) return false;

    const window = computeHabitWindow(taskDetails);
    if (window.status === "invalid") return false;

    const targetMs = window.targetDate.getTime();
    return nowMs >= targetMs && nowMs < targetMs + ACTION_WINDOW_DURATION;
  }, [taskDetails, nowMs]);

  const canMarkDone = isInActionWindow;

  const handleDeleteConfirm = async () => {
    if (!id) return;
    try {
      await triggerSuccessFeedback();
      const notificationIds = getNotificationIds(db, id);
      await cancelHabitNotifications(notificationIds);
      deleteHabit(db, id);
      refresh();
      toast.success("Habit deleted");
      router.replace("/");
    } catch (err) {
      await triggerErrorFeedback();
      toast.error("Couldn't delete habit");
    }
  };

  const handleMarkDone = async () => {
    if (!id || !canMarkDone) return;
    try {
      await triggerLightImpact();
      upsertLog(db, id, today, true);
      recalcHabitStreak(db, id, today);
      refresh();

      progress.value = withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(2, { duration: 400 }),
      );
    } catch {
      await triggerErrorFeedback();
      toast.error("Couldn't mark habit done");
    }
  };

  const styles = useStyles((_, t) => ({
    body: {
      flex: 1,
      backgroundColor: THEME[theme].colors.background,
      alignItems: "center",
    },
    top: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      marginBottom: 30,
    },
    iconBox: {
      width: 120,
      height: 120,
      borderRadius: t.radius.lg,
      backgroundColor: t.colors.secondary,
      justifyContent: "center",
      alignItems: "center",
      flexShrink: 0,
    },
    headerTitle: {
      fontSize: t.typography["2xl"],
      fontWeight: 600,
      marginTop: t.spacing.md,
      letterSpacing: 1.5,
    },
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 20,
    },
    streakColumn: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: t.spacing.sm,
      flexShrink: 0,
      backgroundColor: "transparent",
      marginTop: t.spacing.md,
    },
    streakText: {
      fontSize: t.typography["2xl"] * 2,
      fontWeight: "600",
    },
    streakSubText: {
      fontSize: t.typography.base,
      color: t.colors.mutedForeground,
    },
    heatmapSection: {
      width: "100%",
      paddingHorizontal: 20,
      marginTop: t.spacing.xl,
      backgroundColor: "transparent",
    },
    heatmapLabel: {
      fontSize: t.typography.sm,
      color: t.colors.mutedForeground,
      marginBottom: t.spacing.sm,
    },
    dialogActions: {
      flexDirection: "row",
      gap: t.spacing.sm,
    },
  }));
  const progress = useSharedValue(0);

  const animatedFillStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progress.value, [0, 1], [0, 200], Extrapolation.CLAMP)}%`,
    opacity: interpolate(progress.value, [1, 2], [1, 0], Extrapolation.CLAMP),
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          progress.value,
          [0, 1],
          [0, 45],
          Extrapolation.CLAMP,
        ),
      },
    ],
    opacity: interpolate(progress.value, [1, 2], [1, 0], Extrapolation.CLAMP),
  }));

  const animatedMarkTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.5], [1, 0], Extrapolation.CLAMP),
  }));

  const animatedMarkedTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [1, 2], [0, 1], Extrapolation.CLAMP),
  }));

  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    progress.value = isDoneToday && !isInActionWindow ? 2 : 0;
  }, [isDoneToday, isInActionWindow, progress]);

  if (!taskDetails) {
    return null;
  }

  return (
    <SafeAreaView style={styles.body}>
      <View style={styles.top}>
        <Link href="/" onPress={() => triggerLightImpact()}>
          <Ionicons
            name="chevron-back-outline"
            size={24}
            color={THEME[theme].colors.foreground}
          />
        </Link>
        <View style={styles.headerRight}>
          <Link
            href={{
              pathname: "/create-task",
              params: { task_id },
            }}
            onPress={() => triggerLightImpact()}
          >
            <Feather
              name="edit"
              size={30}
              color={THEME[theme].colors.primary}
            />
          </Link>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Pressable onPress={() => triggerLightImpact()}>
                <MaterialIcons
                  name="delete-outline"
                  size={30}
                  color={THEME[theme].colors.primary}
                />
              </Pressable>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete habit</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{taskDetails.name}" and cancel
                  its scheduled reminders. This can't be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter style={styles.dialogActions}>
                <AlertDialogCancel asChild>
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={() => triggerLightImpact()}
                  />
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button
                    title="Delete"
                    variant="destructive"
                    onPress={handleDeleteConfirm}
                  />
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </View>
      </View>

      <View style={styles.iconBox}>
        <Octicons
          name="tasklist"
          size={30}
          color={THEME[theme].colors.primary}
        />
      </View>
      <Text style={styles.headerTitle}>{taskDetails.name}</Text>
      <View style={{ marginTop: THEME[theme].spacing.md }}>
        <Badge
          label={`${taskDetails.frequency.kind}·${dayjs(taskDetails.frequency.time).format("hh:mm A")}`}
          variant="ghost"
          textStyle={{
            textTransform: "capitalize",
          }}
        />
      </View>
      <View style={styles.streakColumn}>
        <SimpleLineIcons name="fire" size={36} color="orange" />
        <Text style={styles.streakText}>{taskDetails.streak}</Text>
        <Text style={styles.streakSubText}>
          {taskDetails.streak > 1 ? "days" : "day"} streak
        </Text>
      </View>

      <View style={styles.heatmapSection}>
        <Text style={styles.heatmapLabel}>This year</Text>
        <Heatmap
          year={dayjs().year()}
          activeDays={activeDays}
          defaultCellColor={THEME[theme].colors.secondary}
          colorMap={{
            1: THEME[theme].colors.primary,
          }}
          cellSize={20}
          dayGap={5}
          monthlyGap={28}
          cellBorderRadius={4}
          showMonthAnnotation={true}
          monthlyAnnotationFontSize={11}
          monthlyAnnotationColor={THEME[theme].colors.mutedForeground}
          paddingHorizontal={0}
          paddingVertical={4}
          bottomPadding={8}
          showCurrentFullYear={false}
          showScrollBar={true}
        />
      </View>
      <Button
        variant="default"
        disabled={!canMarkDone}
        containerStyle={{
          paddingHorizontal: 20,
          marginTop: THEME[theme].spacing.xl,
        }}
        buttonStyle={{
          overflow: "hidden",
        }}
        onPress={handleMarkDone}
      >
        <Animated.View
          style={[
            {
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              backgroundColor: "#22c55e",
            },
            animatedFillStyle,
          ]}
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
          }}
        >
          <Animated.View style={[animatedIconStyle]}>
            <AntDesign
              name="check"
              size={24}
              color={THEME[theme].colors.background}
            />
          </Animated.View>
          <View
            style={{
              marginLeft: 8,
              justifyContent: "center",
              backgroundColor: "transparent",
            }}
          >
            <Animated.Text
              style={[
                { color: THEME[theme].colors.background, fontWeight: "600" },
                animatedMarkTextStyle,
              ]}
            >
              Mark as done
            </Animated.Text>

            <Animated.Text
              style={[
                {
                  color: THEME[theme].colors.mutedForeground,
                  fontWeight: "600",
                  position: "absolute",
                },
                animatedMarkedTextStyle,
              ]}
            >
              Marked
            </Animated.Text>
          </View>
        </View>
      </Button>
    </SafeAreaView>
  );
};

export default TaskDetails;
