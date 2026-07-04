import { getNotificationIds, replaceHabitNotifications } from "@/db/schema";
import { getAppSettings, isTimeInQuietHours } from "@/lib/app-settings";
import { parseTimeString } from "@/lib/habit-schedule";
import type { Habit } from "@/lib/habit.types";
import * as Notifications from "expo-notifications";
import type { SQLiteDatabase } from "expo-sqlite";
import { Platform } from "react-native";

export async function requestNotificationPermissions(): Promise<boolean> {
  const settings = getAppSettings();
  if (!settings.remindersEnabled) return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

async function ensureChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("habit-reminders", {
    name: "Habit reminders",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function scheduleHabitNotifications(
  habit: Habit,
): Promise<string[]> {
  const settings = getAppSettings();
  if (!settings.remindersEnabled) return [];

  const time = parseTimeString(habit.frequency.time);
  if (!time) return [];

  if (isTimeInQuietHours(time.hours, time.minutes, settings)) {
    return [];
  }

  await ensureChannel();

  const ids: string[] = [];

  if (habit.frequency.kind === "daily") {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: habit.name,
        body: "Time for your habit!",
        sound: settings.soundEnabled ? "default" : false,
        data: {
          path: `/${habit.id}`,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: time.hours,
        minute: time.minutes,
        channelId: "habit-reminders",
      },
    });
    ids.push(id);
  } else {
    for (const weekday of habit.frequency.weekdays) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: habit.name,
          body: "Time for your habit!",
          sound: settings.soundEnabled ? "default" : false,
          data: {
            path: `/${habit.id}`,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: weekday + 1,
          hour: time.hours,
          minute: time.minutes,
          channelId: "habit-reminders",
        },
      });
      ids.push(id);
    }
  }

  return ids;
}

export async function cancelHabitNotifications(ids: string[]): Promise<void> {
  await Promise.all(
    ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)),
  );
}

export async function rescheduleHabitNotifications(
  db: SQLiteDatabase,
  habit: Habit,
): Promise<void> {
  const oldIds = getNotificationIds(db, habit.id);
  await cancelHabitNotifications(oldIds);

  const settings = getAppSettings();
  if (!settings.remindersEnabled) {
    replaceHabitNotifications(db, habit.id, []);
    return;
  }

  const granted = await requestNotificationPermissions();
  if (!granted) {
    replaceHabitNotifications(db, habit.id, []);
    return;
  }

  const newIds = await scheduleHabitNotifications(habit);
  replaceHabitNotifications(db, habit.id, newIds);
}
