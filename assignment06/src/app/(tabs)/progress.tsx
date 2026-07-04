import { Pressable, ScrollView } from "react-native";
import View from "@/components/ui/view";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import Animated, {
  FadeInDown,
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import dayjs from "dayjs";
import { type SQLiteDatabase } from "expo-sqlite";
import { useDatabase } from "@/db/database";
import { useHabits } from "@/lib/habit-store";
import { getLogsForRange } from "@/db/schema";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo } from "react";
import {
  Canvas,
  Group,
  Skia,
  Skottie,
  useClock,
} from "@shopify/react-native-skia";
const legoAnimationJSON = require("@/assets/empty.json");
const animation = Skia.Skottie.Make(JSON.stringify(legoAnimationJSON));
import Text from "@/components/ui/text";
import {
  Card,
  CardHeader,
  CardTitleGroup,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { THEME, useTheme } from "@/lib/theme";
import useStyles from "@/lib/use-styles";
import type { Habit } from "@/lib/habit.types";
import { FlashList } from "@shopify/flash-list";

// ─── constants ───────────────────────────────────────────────────────────────

const WEEK_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

function getWeekLogs(
  habitId: string,
  db: SQLiteDatabase,
): Record<number, boolean> {
  const today = dayjs();
  const shiftedDay = (today.day() + 6) % 7;
  const monday = today.subtract(shiftedDay, "day");
  const sunday = monday.add(6, "day");

  const weekStart = monday.format("YYYY-MM-DD");
  const weekEnd = sunday.format("YYYY-MM-DD");

  const logs = getLogsForRange(db, habitId, weekStart, weekEnd);
  const result: Record<number, boolean> = {};

  for (const log of logs) {
    if (log.done === 1) {
      const parts = log.date.split("-");
      if (parts.length === 3) {
        const year = Number(parts[0]);
        const month = Number(parts[1]) - 1;
        const day = Number(parts[2]);
        const logDate = new Date(year, month, day);
        result[logDate.getDay()] = true;
      }
    }
  }
  return result;
}

function getLongestStreak(
  habits: Habit[],
  db: SQLiteDatabase,
): { streak: number; name: string } {
  return habits.reduce(
    (best, h) =>
      h.streak > best.streak ? { streak: h.streak, name: h.name } : best,
    { streak: 0, name: "" },
  );
}

// ─── DayDot ──────────────────────────────────────────────────────────────────

type DayDotProps = {
  label: string;
  state: "done" | "missed" | "today" | "future";
  accentColor: string;
  mutedColor: string;
  foreground: string;
};

function DayDot({ label, state, accentColor, mutedColor }: DayDotProps) {
  const dotStyle = {
    done: { bg: accentColor, border: "transparent" as const },
    today: { bg: "transparent", border: accentColor },
    missed: { bg: "transparent", border: mutedColor + "55" },
    future: { bg: "transparent", border: "transparent" as const },
  }[state];

  const labelColor = state === "today" ? accentColor : mutedColor;

  return (
    <View style={{ alignItems: "center", gap: 6, flex: 1 }}>
      <Text
        style={{
          fontSize: 10,
          color: labelColor,
          fontWeight: state === "today" ? "600" : "400",
        }}
      >
        {label}
      </Text>
      {state === "future" ? (
        <View
          style={{
            width: 8,
            height: 2,
            borderRadius: 1,
            backgroundColor: mutedColor + "30",
          }}
        />
      ) : (
        <View
          style={{
            width: 9,
            height: 9,
            borderRadius: 5,
            backgroundColor: dotStyle.bg,
            borderWidth: dotStyle.border === "transparent" ? 0 : 1.5,
            borderColor: dotStyle.border,
          }}
        />
      )}
    </View>
  );
}

// ─── HabitWeekCard ────────────────────────────────────────────────────────────

type HabitWeekCardProps = {
  habit: Habit;
  index: number;
  logs: Record<number, boolean>;
  totalHabits: number;
  onPress: () => void;
  scrollY: SharedValue<number>;
};

function HabitWeekCard({
  habit,
  index,
  logs,
  totalHabits,
  onPress,
  scrollY,
}: HabitWeekCardProps) {
  const { theme } = useTheme();
  const t = THEME[theme];

  const todayDayjs = dayjs().day();
  const todayDisplayIdx = DISPLAY_ORDER.indexOf(todayDayjs);
  const AnimatedCard = Animated.createAnimatedComponent(Pressable);
  const styles = useStyles((_, t) => ({
    card: {
      marginBottom: 14,
      marginHorizontal: 16,
      height: 130,
    },
  }));
  const CARD_HEIGHT = 144;
  const PADDING_TOP = 32;
  const VISIBLE_CARDS = 5;
  const animatedScaleStyle = useAnimatedStyle(() => {
    const maxScroll = (totalHabits - VISIBLE_CARDS) * CARD_HEIGHT;
    const cardAbsoluteTop = PADDING_TOP + index * CARD_HEIGHT;
    if (cardAbsoluteTop > maxScroll) {
      return { transform: [{ scale: 1 }] };
    }

    const cardTopFromViewport = cardAbsoluteTop - scrollY.value;
    const clampedTop = Math.min(0, cardTopFromViewport);

    const scale = interpolate(clampedTop, [-CARD_HEIGHT, 0], [0, 1], "clamp");

    return { transform: [{ scale }] };
  });
  return (
    <AnimatedCard onPress={onPress} style={[styles.card, animatedScaleStyle]}>
      <Card size="sm">
        <CardHeader>
          <CardTitleGroup>
            <CardTitle>{habit.name}</CardTitle>
            <CardDescription>
              {habit.frequency.kind === "daily"
                ? "Daily"
                : `Weekly · ${(habit.frequency as any).weekdays?.length ?? 0} days`}
            </CardDescription>
          </CardTitleGroup>
          <CardAction>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <SimpleLineIcons name="fire" size={13} color="#f59e0b" />
              <Text
                style={{
                  fontSize: t.typography.sm,
                  fontWeight: "600",
                  color: t.colors.foreground,
                }}
              >
                {habit.streak}
              </Text>
            </View>
          </CardAction>
        </CardHeader>

        <CardContent>
          <View style={{ flexDirection: "row" }}>
            {DISPLAY_ORDER.map((dayjsDay, displayIdx) => {
              const label = WEEK_LABELS[displayIdx];
              const isToday = displayIdx === todayDisplayIdx;
              const isFuture = displayIdx > todayDisplayIdx;

              let state: DayDotProps["state"];
              if (isFuture) {
                state = "future";
              } else if (logs && logs[dayjsDay]) {
                state = "done";
              } else if (isToday) {
                state = "today";
              } else {
                state = "missed";
              }

              return (
                <DayDot
                  key={displayIdx}
                  label={label}
                  state={state}
                  accentColor={t.colors.primary}
                  mutedColor={t.colors.mutedForeground}
                  foreground={t.colors.foreground}
                />
              );
            })}
          </View>
        </CardContent>
      </Card>
    </AnimatedCard>
  );
}

// ─── Progress ────────────────────────────────────────────────────────────────

export default function Progress() {
  const { theme } = useTheme();
  const t = THEME[theme];

  const { habits, refresh } = useHabits();
  const db = useDatabase();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  // FIX: Centralize the DB logs into a single state tied to the 'habits' array.
  // Because we know the streak updates instantly, this guarantees React will force
  // a deep re-render of your dots and completion rate at the exact same moment!
  const allWeekLogs = useMemo(() => {
    const map: Record<string, Record<number, boolean>> = {};
    habits.forEach((h) => {
      map[h.id] = getWeekLogs(h.id, db);
    });
    return map;
  }, [habits, db]);

  const completion = useMemo(() => {
    let done = 0;
    let total = 0;
    const todayDayjs = dayjs().day();
    const todayIdx = DISPLAY_ORDER.indexOf(todayDayjs);

    habits.forEach((h) => {
      const logs = allWeekLogs[h.id];
      DISPLAY_ORDER.forEach((dayjsDay, idx) => {
        if (idx <= todayIdx) {
          total++;
          if (logs && logs[dayjsDay]) done++;
        }
      });
    });
    return total === 0 ? 100 : Math.round((done / total) * 100);
  }, [habits, allWeekLogs]);

  const longest = getLongestStreak(habits, db);

  const styles = useStyles((_, t) => ({
    body: {
      flex: 1,
      backgroundColor: t.colors.background,
    },
    pageTitle: {
      fontSize: t.typography["2xl"],
      fontWeight: "700",
      paddingHorizontal: 16,
      paddingBottom: 16,
      color: t.colors.foreground,
    },
    scroll: {
      paddingHorizontal: 16,
      paddingBottom: 40,
      gap: 12,
    },
  }));
  const AnimatedList = Animated.createAnimatedComponent(FlashList);
  const clock = useClock();
  const frame = useDerivedValue(() => {
    const fps = animation.fps();
    const duration = animation.duration();
    const currentFrame =
      Math.floor((clock.value / 1000) * fps) % (duration * fps);
    return currentFrame;
  });
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
  return (
    <SafeAreaView style={styles.body}>
      <Text style={styles.pageTitle}>Progress</Text>
      <View style={styles.scroll}>
        {/* ── stat row ── */}
        <Animated.View
          entering={FadeInDown.duration(280)
            .springify()
            .damping(20)
            .stiffness(300)
            .mass(0.8)}
          style={{ flexDirection: "row", gap: 12 }}
        >
          {/* completion % */}
          <Card size="sm" style={{ flex: 1 }}>
            <CardHeader>
              <CardTitleGroup>
                <CardDescription>This week</CardDescription>
                <CardTitle
                  style={{
                    fontSize: t.typography["2xl"] * 1.1,
                    fontWeight: "700",
                    color: t.colors.foreground,
                  }}
                >
                  {completion}%
                </CardTitle>
              </CardTitleGroup>
              <CardAction>
                <Feather
                  name="trending-up"
                  size={18}
                  color={t.colors.primary}
                />
              </CardAction>
            </CardHeader>
            <CardContent>
              {/* progress bar */}
              <View
                style={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: t.colors.secondary,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    width: `${completion}%`,
                    height: "100%",
                    borderRadius: 2,
                    backgroundColor: t.colors.primary,
                  }}
                />
              </View>
              <Text
                style={{
                  fontSize: 11,
                  color: t.colors.mutedForeground,
                  marginTop: 6,
                }}
              >
                completion rate
              </Text>
            </CardContent>
          </Card>

          {/* longest streak */}
          <Card size="sm" style={{ flex: 1 }}>
            <CardHeader>
              <CardTitleGroup>
                <CardDescription>Longest streak</CardDescription>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "baseline",
                    gap: 4,
                  }}
                >
                  <SimpleLineIcons name="fire" size={16} color="#f59e0b" />
                  <CardTitle
                    style={{
                      fontSize: t.typography["2xl"] * 1.1,
                      fontWeight: "700",
                      color: t.colors.foreground,
                    }}
                  >
                    {longest.streak}
                  </CardTitle>
                </View>
              </CardTitleGroup>
            </CardHeader>
            <CardContent>
              <Text
                style={{
                  fontSize: 11,
                  color: t.colors.mutedForeground,
                  marginTop: 2,
                }}
                numberOfLines={1}
              >
                {longest.name}
              </Text>
            </CardContent>
          </Card>
        </Animated.View>

        {/* ── week section label ── */}
        <Text
          style={{
            fontSize: 11,
            fontWeight: "600",
            color: t.colors.mutedForeground,
            textTransform: "uppercase",
            letterSpacing: 0.8,
            paddingHorizontal: 4,
            marginTop: 4,
          }}
        >
          This week
        </Text>
      </View>
      {habits.length === 0 ? (
        <>
          <View style={{ flex: 1 }}>
            <Canvas
              style={{
                width: 400,
                height: 400,
                transform: [{ translateX: -50 }, { translateY: 10 }],
              }}
            >
              <Group transform={[{ scale: 0.5 }]}>
                <Skottie animation={animation} frame={frame} />
              </Group>
            </Canvas>
          </View>
        </>
      ) : (
        <AnimatedList
          onScroll={scrollHandler}
          showsVerticalScrollIndicator={false}
          data={habits as Habit[]}
          keyExtractor={(item: unknown) => (item as Habit).id}
          renderItem={({ item, index }: { item: unknown; index: number }) => (
            <HabitWeekCard
              habit={item as Habit}
              index={index}
              scrollY={scrollY}
              totalHabits={habits.length}
              logs={allWeekLogs[(item as Habit).id]}
              onPress={() => {
                router.push({
                  pathname: "/[task_id]",
                  params: {
                    task_id: (item as Habit).id,
                  },
                });
              }}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
