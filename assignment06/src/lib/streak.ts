import dayjs from "dayjs";
import type { SQLiteDatabase } from "expo-sqlite";
import { getHabitById, getLogsForRange, updateStreak } from "@/db/schema";

export function recalcHabitStreak(
  db: SQLiteDatabase,
  habitId: string,
  _todayISO: string,
): void {
  const habit = getHabitById(db, habitId);
  if (!habit) return;

  const logs = getLogsForRange(db, habitId, "1970-01-01", "2099-12-31");
  const doneDates = new Set(
    logs.filter((l) => l.done === 1).map((l) => l.date),
  );

  if (doneDates.size === 0) {
    updateStreak(db, habitId, 0, null);
    return;
  }

  const sorted = Array.from(doneDates).sort();
  const mostRecent = sorted[sorted.length - 1];
  let streak = 1;

  if (habit.frequency.kind === "daily") {
    let cursor = dayjs(mostRecent).subtract(1, "day");
    while (doneDates.has(cursor.format("YYYY-MM-DD"))) {
      streak += 1;
      cursor = cursor.subtract(1, "day");
    }
  } else {
    const weekdays = habit.frequency.weekdays.slice().sort((a, b) => a - b);
    let cursor = dayjs(mostRecent);

    while (true) {
      cursor = cursor.subtract(1, "day");
      const wd = cursor.day();
      if (!weekdays.includes(wd)) continue;
      if (doneDates.has(cursor.format("YYYY-MM-DD"))) {
        streak += 1;
      } else {
        break;
      }
    }
  }

  updateStreak(db, habitId, streak, mostRecent);
}
