import dayjs, { Dayjs } from "dayjs";
import type { Frequency, Habit, Weekday } from "./habit.types";

export type TimeOfDay = { hours: number; minutes: number };

export function parseTimeString(time: string): TimeOfDay | null {
  if (!time) return null;
  const parsed = dayjs(time);
  if (!parsed.isValid()) return null;
  return { hours: parsed.hour(), minutes: parsed.minute() };
}

function atTime(date: Dayjs, time: TimeOfDay): Dayjs {
  return date.hour(time.hours).minute(time.minutes).second(0).millisecond(0);
}

export function getNextDueDate(
  frequency: Frequency,
  fromDate: Date,
): Date | null {
  const time = parseTimeString(frequency.time);
  if (!time) return null;

  const from = dayjs(fromDate);

  if (frequency.kind === "daily") {
    let next = atTime(from, time);
    if (!next.isAfter(from)) {
      next = next.add(1, "day");
    }
    return next.toDate();
  }

  for (let offset = 0; offset <= 7; offset++) {
    const candidate = atTime(from.add(offset, "day"), time);
    if (
      frequency.weekdays.includes(candidate.day() as Weekday) &&
      candidate.isAfter(from)
    ) {
      return candidate.toDate();
    }
  }
  return null;
}

export type HabitWindow =
  | { status: "ok"; startDate: Date; targetDate: Date }
  | { status: "invalid" };

export function computeHabitWindow(habit: Habit, fromDate?: Date): HabitWindow {
  const now = fromDate ? dayjs(fromDate) : dayjs();
  const startOfToday = now.startOf("day").subtract(1, "millisecond");

  let baseDate = startOfToday;
  if (habit.lastCompletedISO) {
    const lastCompleted = dayjs(habit.lastCompletedISO);
    if (lastCompleted.isAfter(startOfToday)) {
      baseDate = lastCompleted;
    }
  }

  let target = getNextDueDate(habit.frequency, baseDate.toDate());
  if (!target) return { status: "invalid" };

  // FIX: Stop dynamic skipping on refresh.
  // ONLY skip today if the target time had already passed WHEN the habit was explicitly created.
  const createdAtMs = parseInt(habit.id.split("-")[0], 36);
  if (!isNaN(createdAtMs) && !habit.lastCompletedISO) {
    const createdDayjs = dayjs(createdAtMs);
    if (
      createdDayjs.isAfter(startOfToday) &&
      createdDayjs.isAfter(dayjs(target))
    ) {
      const skippedTarget = getNextDueDate(
        habit.frequency,
        createdDayjs.toDate(),
      );
      if (skippedTarget) target = skippedTarget;
    }
  }

  const targetDayjs = dayjs(target);

  let startDate = targetDayjs;
  if (habit.frequency.kind === "daily") {
    startDate = targetDayjs.subtract(1, "day");
  } else {
    do {
      startDate = startDate.subtract(1, "day");
    } while (!habit.frequency.weekdays.includes(startDate.day() as Weekday));
  }

  if (habit.lastCompletedISO) {
    const lastCompleted = dayjs(habit.lastCompletedISO);
    if (
      lastCompleted.isAfter(startDate) &&
      lastCompleted.isBefore(targetDayjs)
    ) {
      startDate = lastCompleted;
    }
  }

  return { status: "ok", startDate: startDate.toDate(), targetDate: target };
}
