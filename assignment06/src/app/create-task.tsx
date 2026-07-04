import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import Text from "@/components/ui/text";
import View from "@/components/ui/view";
import { useDatabase } from "@/db/database";
import {
  getHabitById,
  insertHabit,
  replaceHabitNotifications,
  updateHabit,
} from "@/db/schema";
import {
  triggerLightImpact,
  triggerSelectionHaptic,
  triggerSuccessFeedback,
} from "@/lib/feedback";
import {
  requestNotificationPermissions,
  rescheduleHabitNotifications,
  scheduleHabitNotifications,
} from "@/lib/habit-notifications";
import { parseTimeString } from "@/lib/habit-schedule";
import { useHabits } from "@/lib/habit-store";
import { Habit } from "@/lib/habit.types";
import { THEME, useTheme } from "@/lib/theme";
import { Ionicons, Octicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── constants ───────────────────────────────────────────────────────────────

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5; // always odd — keeps selection centred
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const HOURS = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
);
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0"),
);
const PERIODS = ["AM", "PM"];

// ─── WheelColumn — plain ScrollView, works in Expo Go ────────────────────────

type WheelColumnProps = {
  items: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  width: number;
  accentColor: string;
  mutedColor: string;
  foregroundColor: string;
};

function WheelColumn({
  items,
  selectedIndex,
  onChange,
  width,
  accentColor,
  mutedColor,
  foregroundColor,
}: WheelColumnProps) {
  const ref = useRef<ScrollView>(null);
  // track the last index we fired haptic for so we don't spam
  const lastHapticIndex = useRef(selectedIndex);

  useEffect(() => {
    // scroll to the initial position after mount without animation
    ref.current?.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: false });
  }, []);

  useEffect(() => {
    // keep wheel position in sync when parent updates selected index (e.g. edit prefill)
    ref.current?.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: false });
  }, [selectedIndex]);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const raw = e.nativeEvent.contentOffset.y;
      const index = Math.round(raw / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(items.length - 1, index));
      if (clamped !== lastHapticIndex.current) {
        lastHapticIndex.current = clamped;
        triggerLightImpact();
      }
    },
    [items.length],
  );

  const handleSnapEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const raw = e.nativeEvent.contentOffset.y;
      const index = Math.max(
        0,
        Math.min(items.length - 1, Math.round(raw / ITEM_HEIGHT)),
      );
      onChange(index);
    },
    [items.length, onChange],
  );

  return (
    <View style={{ width, height: WHEEL_HEIGHT, overflow: "hidden" }}>
      {/* selection highlight band */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: ITEM_HEIGHT * 2,
          left: 4,
          right: 4,
          height: ITEM_HEIGHT,
          borderRadius: 10,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: accentColor + "66",
          backgroundColor: accentColor + "14",
          zIndex: 1,
        }}
      />
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleSnapEnd}
        onScrollEndDrag={handleSnapEnd}
        // paddingVertical centres the first/last items in the visible window
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
        style={{ height: WHEEL_HEIGHT }}
      >
        {items.map((item, i) => {
          const distance = Math.abs(i - selectedIndex);
          return (
            <View
              key={i}
              style={{
                height: ITEM_HEIGHT,
                width,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: distance === 0 ? 22 : 17,
                  fontWeight: distance === 0 ? "600" : "400",
                  color: distance === 0 ? foregroundColor : mutedColor,
                  opacity: distance === 0 ? 1 : distance === 1 ? 0.45 : 0.2,
                  transform: [{ scale: distance === 0 ? 1 : 0.88 }],
                }}
              >
                {item}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─── WeekdayPill ─────────────────────────────────────────────────────────────

type WeekdayPillProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  index: number;
  accentColor: string;
  secondaryColor: string;
  foregroundColor: string;
};

function WeekdayPill({
  label,
  selected,
  onPress,
  index,
  accentColor,
  secondaryColor,
  foregroundColor,
}: WeekdayPillProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    // ─── UPDATED SPRING VALUES ───
    scale.value = withSpring(
      0.82,
      { damping: 20, stiffness: 300, mass: 0.8 },
      () => {
        scale.value = withSpring(1, { damping: 20, stiffness: 300, mass: 0.8 });
      },
    );
    triggerSelectionHaptic();
    onPress();
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 45)
        .duration(260)
        .springify()
        .damping(20) // ─── UPDATED SPRING VALUES ───
        .stiffness(300)
        .mass(0.8)}
    >
      <Pressable onPress={handlePress} hitSlop={6}>
        <Animated.View
          style={[
            {
              width: 34,
              height: 34,
              borderRadius: 17,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: selected ? accentColor : secondaryColor,
            },
            animStyle,
          ]}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: selected ? "#fff" : foregroundColor,
              opacity: selected ? 1 : 0.45,
            }}
          >
            {label}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

// ─── CreateTask ───────────────────────────────────────────────────────────────

const CreateTask = () => {
  const { theme } = useTheme();
  const t = THEME[theme];
  const { width: screenWidth } = useWindowDimensions();

  // SEGMENT_WIDTH fills the card minus its own 3px padding on each side
  // card sits inside paddingHorizontal:16 on the scroll view
  const CARD_INNER = screenWidth - 32 - 6; // screen - scroll padding - segment track padding
  const SEGMENT_WIDTH = CARD_INNER / 2;

  // form state
  const [habitName, setHabitName] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [hourIndex, setHourIndex] = useState(6);
  const [minuteIndex, setMinuteIndex] = useState(0);
  const [periodIndex, setPeriodIndex] = useState(0);

  // segmented control
  const segmentX = useSharedValue(0);

  const { task_id } = useLocalSearchParams();
  const editingId = task_id
    ? Array.isArray(task_id)
      ? task_id[0]
      : task_id
    : null;
  const isEditing = !!editingId;
  const db = useDatabase();
  const { habits, refresh } = useHabits();
  const [isPrefilled, setIsPrefilled] = useState(false);

  const existingHabit = useMemo(() => {
    if (!editingId) return null;
    return (
      habits.find((h) => h.id === editingId) ?? getHabitById(db, editingId)
    );
  }, [editingId, habits, db]);

  useEffect(() => {
    setIsPrefilled(false);
  }, [editingId]);

  useEffect(() => {
    if (!isEditing || !existingHabit || isPrefilled) return;

    setHabitName(existingHabit.name);
    setFrequency(existingHabit.frequency.kind);
    segmentX.value = withSpring(
      existingHabit.frequency.kind === "daily" ? 0 : SEGMENT_WIDTH,
      {
        damping: 20,
        stiffness: 300,
        mass: 0.8,
      },
    );

    if (existingHabit.frequency.kind === "weekly") {
      setSelectedWeekdays(existingHabit.frequency.weekdays);
    } else {
      setSelectedWeekdays([]);
    }

    const time = parseTimeString(existingHabit.frequency.time);
    if (time) {
      const isPm = time.hours >= 12;
      const hour12 = time.hours % 12 || 12;
      const nextHourIndex = HOURS.indexOf(String(hour12).padStart(2, "0"));
      const nextMinuteIndex = MINUTES.indexOf(
        String(time.minutes).padStart(2, "0"),
      );
      setHourIndex(nextHourIndex >= 0 ? nextHourIndex : 6);
      setMinuteIndex(nextMinuteIndex >= 0 ? nextMinuteIndex : 0);
      setPeriodIndex(isPm ? 1 : 0);
    }

    setIsPrefilled(true);
  }, [isEditing, existingHabit, isPrefilled, segmentX, SEGMENT_WIDTH]);

  const switchFrequency = (next: "daily" | "weekly") => {
    setFrequency(next);
    // ─── UPDATED SPRING VALUES ───
    segmentX.value = withSpring(next === "daily" ? 0 : SEGMENT_WIDTH, {
      damping: 20,
      stiffness: 300,
      mass: 0.8,
    });
    triggerSelectionHaptic();
  };

  const segmentIndicator = useAnimatedStyle(() => ({
    transform: [{ translateX: segmentX.value }],
  }));

  const toggleWeekday = (i: number) => {
    setSelectedWeekdays((prev) =>
      prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i],
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
      {/* ── header ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingBottom: 16,
        }}
      >
        <Pressable
          onPress={() => {
            triggerLightImpact();
            router.back();
          }}
          hitSlop={8}
        >
          <Ionicons
            name="close-outline"
            size={28}
            color={t.colors.foreground}
          />
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={{
              fontSize: t.typography.xl,
              fontWeight: "700",
            }}
          >
            {isEditing ? "Edit habit" : "Create habit"}
          </Text>
        </View>
        {/* spacer to balance the close icon */}
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 32,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── name + icon ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: t.radius.lg,
              backgroundColor: t.colors.secondary,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Octicons name="tasklist" size={22} color={t.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label="Habit name"
              placeholder="What's your habit?"
              value={habitName}
              onChangeText={setHabitName}
            />
          </View>
        </View>

        {/* ── frequency segment ── */}
        <View>
          <Text
            style={{
              fontSize: t.typography.sm,
              color: t.colors.mutedForeground,
              marginBottom: 8,
            }}
          >
            Frequency
          </Text>
          {/* track */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: t.colors.secondary,
              borderRadius: t.radius.md,
              padding: 3,
            }}
          >
            {/* sliding pill */}
            <Animated.View
              style={[
                {
                  position: "absolute",
                  top: 3,
                  left: 3,
                  width: SEGMENT_WIDTH,
                  bottom: 3,
                  borderRadius: t.radius.md - 2,
                  backgroundColor: t.colors.primary,
                },
                segmentIndicator,
              ]}
            />
            {(["daily", "weekly"] as const).map((f) => (
              <Pressable
                key={f}
                onPress={() => switchFrequency(f)}
                style={{
                  width: SEGMENT_WIDTH,
                  paddingVertical: 9,
                  alignItems: "center",
                  zIndex: 1,
                }}
              >
                <Text
                  style={{
                    fontSize: t.typography.sm,
                    fontWeight: "600",
                    color: frequency === f ? "#fff" : t.colors.mutedForeground,
                  }}
                >
                  {f === "daily" ? "Daily" : "Weekly"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── weekday picker ── */}
        {frequency === "weekly" && (
          <Animated.View
            entering={FadeInDown.duration(280).springify().damping(16)}
            style={{
              backgroundColor: t.colors.secondary,
              borderRadius: t.radius.lg,
              padding: 16,
            }}
          >
            <Text
              style={{
                fontSize: t.typography.sm,
                color: t.colors.mutedForeground,
                marginBottom: 12,
              }}
            >
              Repeat on
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {WEEKDAYS.map((day, i) => (
                <WeekdayPill
                  key={i}
                  index={i}
                  label={day}
                  selected={selectedWeekdays.includes(i)}
                  onPress={() => toggleWeekday(i)}
                  accentColor={t.colors.primary}
                  secondaryColor={t.colors.background}
                  foregroundColor={t.colors.foreground}
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* ── time wheel ── */}
        <View>
          <Text
            style={{
              fontSize: t.typography.sm,
              color: t.colors.mutedForeground,
              marginBottom: 8,
            }}
          >
            Reminder time
          </Text>
          <View
            style={{
              backgroundColor: t.colors.secondary,
              borderRadius: t.radius.lg,
              paddingVertical: 12,
              paddingHorizontal: 8,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: t.colors.mutedForeground,
                textAlign: "center",
                marginBottom: 8,
                opacity: 0.7,
              }}
            >
              Scroll up or down to set time
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <WheelColumn
                items={HOURS}
                selectedIndex={hourIndex}
                onChange={setHourIndex}
                width={72}
                accentColor={t.colors.primary}
                mutedColor={t.colors.mutedForeground}
                foregroundColor={t.colors.foreground}
              />
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "300",
                  color: t.colors.mutedForeground,
                  paddingBottom: 2,
                  marginHorizontal: 2,
                }}
              >
                :
              </Text>
              <WheelColumn
                items={MINUTES}
                selectedIndex={minuteIndex}
                onChange={setMinuteIndex}
                width={72}
                accentColor={t.colors.primary}
                mutedColor={t.colors.mutedForeground}
                foregroundColor={t.colors.foreground}
              />
              <View style={{ width: 20 }} />
              <WheelColumn
                items={PERIODS}
                selectedIndex={periodIndex}
                onChange={setPeriodIndex}
                width={56}
                accentColor={t.colors.primary}
                mutedColor={t.colors.mutedForeground}
                foregroundColor={t.colors.foreground}
              />
            </View>
          </View>
        </View>

        {/* ── save ── */}
        <View style={{ marginTop: 8 }}>
          <Button
            title={isEditing ? "Update habit" : "Create habit"}
            onPress={async () => {
              triggerSuccessFeedback();

              if (!habitName.trim()) {
                toast.error("Please enter a habit name");
                return;
              }

              if (frequency === "weekly" && selectedWeekdays.length === 0) {
                toast.error("Select at least one weekday");
                return;
              }

              const hour12 = parseInt(HOURS[hourIndex], 10);
              const minute = parseInt(MINUTES[minuteIndex], 10);
              const hour24 =
                periodIndex === 0 ? hour12 % 12 : (hour12 % 12) + 12;
              const timeISO = dayjs()
                .hour(hour24)
                .minute(minute)
                .second(0)
                .millisecond(0)
                .toISOString();

              const frequencyObj: Habit["frequency"] =
                frequency === "daily"
                  ? { kind: "daily", time: timeISO }
                  : {
                      kind: "weekly",
                      weekdays: selectedWeekdays,
                      time: timeISO,
                    };

              const existing = editingId ? getHabitById(db, editingId) : null;

              const habit: Habit = {
                id: editingId ?? generateId(),
                name: habitName.trim(),
                frequency: frequencyObj,
                notificationIds: existing?.notificationIds ?? [],
                streak: existing?.streak ?? 0,
                lastCompletedISO: existing?.lastCompletedISO ?? null,
              };

              try {
                if (editingId) {
                  updateHabit(db, habit);
                  await rescheduleHabitNotifications(db, habit);
                } else {
                  insertHabit(db, habit);
                  const granted = await requestNotificationPermissions();
                  if (granted) {
                    const ids = await scheduleHabitNotifications(habit);
                    replaceHabitNotifications(db, habit.id, ids);
                  }
                }

                refresh();
                router.back();
              } catch (err) {
                console.error(err);
                toast.error("Couldn't save habit");
              }
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateTask;
