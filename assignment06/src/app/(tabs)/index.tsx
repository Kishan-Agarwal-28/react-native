import View from "@/components/ui/view";
import Text from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import dayjs from "dayjs";
import Badge from "@/components/ui/badge";
import useStyles from "@/lib/use-styles";
import { Card, CardContent } from "@/components/ui/card";
import Octicons from "@expo/vector-icons/Octicons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { THEME, useTheme } from "@/lib/theme";
import { FlashList } from "@shopify/flash-list";
import { Habit } from "@/lib/habit.types";
import TaskWaveLoader from "@/components/task-wave-loader";
import React, { useCallback, useMemo } from "react";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { useDatabase } from "@/db/database";
import { useHabits } from "@/lib/habit-store";
import { getLogForDate, upsertLog } from "@/db/schema";
import { recalcHabitStreak } from "@/lib/streak";
import { Link, router } from "expo-router";
import { Pressable, TouchableOpacity, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { MaterialIcons } from "@expo/vector-icons";
import { triggerSuccessFeedback } from "@/lib/feedback";
import Skeleton from "@/components/ui/skeleton";
import {
  Canvas,
  Group,
  Skia,
  Skottie,
  useClock,
} from "@shopify/react-native-skia";
const legoAnimationJSON = require("@/assets/empty.json");
const animation = Skia.Skottie.Make(JSON.stringify(legoAnimationJSON));

function formatHabitTime(time: string): string {
  if (!time) return "Anytime";
  const parsed = dayjs(time);
  return parsed.isValid() ? parsed.format("hh:mm A") : "Anytime";
}

function formatWeekdays(weekdays: number[]): string {
  return [...weekdays]
    .sort((a, b) => a - b)
    .map((d) => dayjs().day(d).format("dd"))
    .join(", ");
}
const CARD_HEIGHT = 144;
const PADDING_TOP = 32;
const VISIBLE_CARDS = 5;
const HabitCard: React.FC<{
  item: Habit;
  index: number;
  totalHabits: number;
  scrollY: SharedValue<number>;
  onMarkEntry: (habitId: string) => void;
  onPress: () => void;
}> = ({ item, index, totalHabits, scrollY, onMarkEntry, onPress }) => {
  const { theme } = useTheme();
  const styles = useStyles((_, t) => ({
    card: {
      marginBottom: 14,
      marginHorizontal: 16,
      height: 130,
    },
    cardRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 16,
    },
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: t.radius.md,
      backgroundColor: t.colors.secondary,
      justifyContent: "center",
      alignItems: "center",
      flexShrink: 0,
    },
    infoColumn: {
      flex: 1,
      gap: 2,
      backgroundColor: "transparent",
    },
    habitName: {
      fontSize: t.typography.lg,
      fontWeight: "700",
    },
    metaText: {
      fontSize: t.typography.sm,
      color: t.colors.mutedForeground,
    },
    streakColumn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      flexShrink: 0,
      backgroundColor: "transparent",
    },
    streakText: {
      fontSize: t.typography.base,
      fontWeight: "600",
    },
    loaderColumn: {
      flexShrink: 0,
      backgroundColor: "transparent",
      height: 60,
      width: 50,
      justifyContent: "center",
      alignItems: "center",
    },
  }));

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
  const AnimatedCard = Animated.createAnimatedComponent(Pressable);

  return (
    <AnimatedCard onPress={onPress} style={[styles.card, animatedScaleStyle]}>
      <Card>
        <CardContent style={styles.cardRow}>
          <View style={styles.iconBox}>
            <Octicons
              name="tasklist"
              size={22}
              color={THEME[theme].colors.primary}
            />
          </View>

          <View style={styles.infoColumn}>
            <Text style={styles.habitName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.metaText} numberOfLines={1}>
              {formatHabitTime(item.frequency.time)}
            </Text>
            <Text style={styles.metaText} numberOfLines={1}>
              {item.frequency.kind === "daily"
                ? "Daily"
                : `Weekly on ${formatWeekdays(item.frequency.weekdays)}`}
            </Text>
          </View>

          <View style={styles.streakColumn}>
            <SimpleLineIcons name="fire" size={20} color="orange" />
            <Text style={styles.streakText}>{item.streak}</Text>
          </View>

          <View style={styles.loaderColumn}>
            <TaskWaveLoader habit={item} onMarkEntry={onMarkEntry} />
          </View>
        </CardContent>
      </Card>
    </AnimatedCard>
  );
};

const Home: React.FC = () => {
  const { habits, loading, refresh } = useHabits();
  const db = useDatabase();
  const { theme } = useTheme();
  const today = dayjs().format("YYYY-MM-DD");

  const styles = useStyles((_, t) => ({
    body: {
      flex: 1,
      backgroundColor: t.colors.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    headerRight: {
      marginRight: 40,
    },
    headerText: {
      fontSize: t.typography["2xl"],
      fontWeight: "900",
      marginBottom: t.spacing.xs,
    },
    headerSubtext: {
      fontWeight: "300",
      color: t.colors.mutedForeground,
    },
    listContent: {
      paddingTop: 32,
      paddingBottom: 24,
    },
    fabContainer: {
      position: "absolute",
      bottom: 120,
      right: 30,
      width: 72,
      height: 72,
      borderRadius: 36,
      overflow: "hidden",
      zIndex: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 15,
    },

    fabBlur: {
      ...StyleSheet.absoluteFill,
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 36,
      overflow: "hidden",
      borderWidth: 1,
      borderColor:
        theme === "dark" ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.85)",
      backgroundColor:
        theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.25)",
    },

    fabTint: {
      ...StyleSheet.absoluteFill,
      backgroundColor: t.colors.primary,
      opacity: 0.18,
      borderRadius: 36,
    },
  }));

  const handleMarkEntry = useCallback(
    (habitId: string) => {
      const currentlyDone = getLogForDate(db, habitId, today);
      upsertLog(db, habitId, today, !currentlyDone);
      recalcHabitStreak(db, habitId, today);
      refresh();
    },
    [db, refresh, today],
  );

  const doneCount = useMemo(() => {
    return habits.filter((h) => getLogForDate(db, h.id, today)).length;
  }, [habits, db, today]);

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
  const AnimatedList = Animated.createAnimatedComponent(FlashList);
  const clock = useClock();
  const frame = useDerivedValue(() => {
    const fps = animation.fps();
    const duration = animation.duration();
    const currentFrame =
      Math.floor((clock.value / 1000) * fps) % (duration * fps);
    return currentFrame;
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.body}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Skeleton
              style={{
                width: 90,
                height: 34,
                borderRadius: 8,
              }}
            />

            <View style={{ height: 8 }} />

            <Skeleton
              style={{
                width: 120,
                height: 16,
                borderRadius: 6,
              }}
            />
          </View>

          <Skeleton
            style={{
              width: 110,
              height: 34,
              borderRadius: 999,
            }}
          />
        </View>

        <View style={{ paddingTop: 32 }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <View
              key={index}
              style={{
                marginHorizontal: 16,
                marginBottom: 14,
                height: 130,
                borderRadius: 20,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              {/* Icon */}
              <Skeleton
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                }}
              />

              {/* Text */}
              <View
                style={{
                  flex: 1,
                  gap: 8,
                }}
              >
                <Skeleton
                  style={{
                    width: "70%",
                    height: 18,
                    borderRadius: 6,
                  }}
                />

                <Skeleton
                  style={{
                    width: "45%",
                    height: 14,
                    borderRadius: 6,
                  }}
                />

                <Skeleton
                  style={{
                    width: "60%",
                    height: 14,
                    borderRadius: 6,
                  }}
                />
              </View>

              {/* Streak */}
              <View
                style={{
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Skeleton
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                  }}
                />

                <Skeleton
                  style={{
                    width: 18,
                    height: 14,
                    borderRadius: 4,
                  }}
                />
              </View>

              {/* Action */}
              <Skeleton
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                }}
              />
            </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.body}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerText}>Today</Text>
          <Text style={styles.headerSubtext}>
            {dayjs().format("ddd, DD MMM")}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Badge
            label={`${doneCount} of ${habits.length} done`}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}
          />
        </View>
      </View>
      {habits.length === 0 ? (
        <>
          <View style={{ flex: 1 }}>
            <Canvas
              style={{
                width: 400,
                height: 400,
                transform: [{ translateX: -50 }, { translateY: 100 }],
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
          contentContainerStyle={styles.listContent}
          data={habits as Habit[]}
          keyExtractor={(item: unknown) => (item as Habit).id}
          renderItem={({ item, index }: { item: unknown; index: number }) => (
            <HabitCard
              item={item as Habit}
              index={index}
              totalHabits={habits.length}
              scrollY={scrollY}
              onMarkEntry={handleMarkEntry}
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
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={async () => {
          await triggerSuccessFeedback();
          router.push({
            pathname: "/create-task",
          });
        }}
        style={styles.fabContainer}
      >
        <BlurView
          intensity={40}
          tint={theme === "dark" ? "dark" : "light"}
          style={styles.fabBlur}
        >
          <View style={styles.fabTint} />
          <MaterialIcons
            name="add"
            size={34}
            color={THEME[theme].colors.foreground}
          />
        </BlurView>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Home;
