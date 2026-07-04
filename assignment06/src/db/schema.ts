// ─── schema.ts ───────────────────────────────────────────────────────────────
// Run once at app start via initDatabase(db). All tables use
// IF NOT EXISTS so re-runs are safe (migrations handled separately).
//
// Expo SQLite v14+ (expo-sqlite/next) uses the synchronous `SQLiteDatabase`
// API. Import and open the db in your root layout:
//
//   import { openDatabaseSync } from "expo-sqlite";
//   const db = openDatabaseSync("streaks.db");
//   initDatabase(db);
//
// Then pass `db` into every storage function below.

import { type SQLiteDatabase } from "expo-sqlite";

// ─────────────────────────────────────────────────────────────────────────────
// DDL
// ─────────────────────────────────────────────────────────────────────────────

export function initDatabase(db: SQLiteDatabase): void {
  db.execSync(`PRAGMA journal_mode = WAL;`);
  db.execSync(`PRAGMA foreign_keys = ON;`);

  // ── habits ────────────────────────────────────────────────────────────────
  // One row per habit. frequency_kind + frequency_time cover daily habits
  // fully. Weekly habits store the shared time here too; the per-weekday rows
  // live in habit_weekdays.
  db.execSync(`
    CREATE TABLE IF NOT EXISTS habits (
      id                  TEXT    PRIMARY KEY NOT NULL,
      name                TEXT    NOT NULL,
      frequency_kind      TEXT    NOT NULL CHECK(frequency_kind IN ('daily', 'weekly')),
      frequency_time      TEXT    NOT NULL DEFAULT '',   -- ISO datetime string for reminder
      streak              INTEGER NOT NULL DEFAULT 0,
      last_completed_iso  TEXT,                          -- NULL if never completed
      created_at          TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // ── habit_weekdays ────────────────────────────────────────────────────────
  // Only populated for weekly habits. weekday matches dayjs().day():
  //   0 = Sunday … 6 = Saturday.
  // Cascade delete keeps this in sync when a habit is removed.
  db.execSync(`
    CREATE TABLE IF NOT EXISTS habit_weekdays (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id  TEXT    NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
      weekday   INTEGER NOT NULL CHECK(weekday BETWEEN 0 AND 6),
      UNIQUE(habit_id, weekday)
    );
  `);

  // ── habit_notification_ids ────────────────────────────────────────────────
  // Weekly habits schedule one notification per weekday → multiple rows.
  // Daily habits have one row. Cascade delete cancels cleanly — fetch all
  // notification_id values for a habit before deleting it so you can call
  // Notifications.cancelScheduledNotificationAsync on each one first.
  db.execSync(`
    CREATE TABLE IF NOT EXISTS habit_notification_ids (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id         TEXT    NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
      notification_id  TEXT    NOT NULL,
      UNIQUE(habit_id, notification_id)
    );
  `);

  // ── habit_logs ────────────────────────────────────────────────────────────
  // One row per (habit, calendar date). This is the source of truth for the
  // heatmap and the weekly dot grid — not derived from streak or
  // last_completed_iso. done is stored as INTEGER 0/1 (SQLite has no BOOLEAN).
  // The UNIQUE constraint means upsert via INSERT OR REPLACE is safe.
  db.execSync(`
    CREATE TABLE IF NOT EXISTS habit_logs (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id  TEXT    NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
      date      TEXT    NOT NULL,   -- YYYY-MM-DD, local date
      done      INTEGER NOT NULL DEFAULT 0 CHECK(done IN (0, 1)),
      UNIQUE(habit_id, date)
    );
  `);

  // ── indexes ───────────────────────────────────────────────────────────────
  // habit_logs is queried by date range heavily (heatmap, weekly grid).
  db.execSync(`
    CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date
      ON habit_logs(habit_id, date);
  `);
  db.execSync(`
    CREATE INDEX IF NOT EXISTS idx_habit_notification_ids_habit
      ON habit_notification_ids(habit_id);
  `);
}

// ─────────────────────────────────────────────────────────────────────────────
// Types (mirrors habit.types.ts but SQLite-native)
// ─────────────────────────────────────────────────────────────────────────────

export type FrequencyKind = "daily" | "weekly";

export type HabitRow = {
  id: string;
  name: string;
  frequency_kind: FrequencyKind;
  frequency_time: string;
  streak: number;
  last_completed_iso: string | null;
  created_at: string;
};

export type HabitWeekdayRow = {
  id: number;
  habit_id: string;
  weekday: number;
};

export type HabitNotificationRow = {
  id: number;
  habit_id: string;
  notification_id: string;
};

export type HabitLogRow = {
  id: number;
  habit_id: string;
  date: string; // YYYY-MM-DD
  done: 0 | 1;
};

// ─────────────────────────────────────────────────────────────────────────────
// Mappers — SQLite rows ↔ app Habit type
// ─────────────────────────────────────────────────────────────────────────────

import type { Habit } from "@/lib/habit.types";

export type { Habit } from "@/lib/habit.types";

export function rowsToHabit(
  row: HabitRow,
  weekdays: number[],
  notificationIds: string[],
): Habit {
  const frequency: Habit["frequency"] =
    row.frequency_kind === "weekly"
      ? { kind: "weekly", weekdays: weekdays as any, time: row.frequency_time }
      : { kind: "daily", time: row.frequency_time };

  return {
    id: row.id,
    name: row.name,
    frequency,
    notificationIds,
    streak: row.streak,
    lastCompletedISO: row.last_completed_iso,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CRUD
// ─────────────────────────────────────────────────────────────────────────────

// ── READ ─────────────────────────────────────────────────────────────────────

export function getAllHabits(db: SQLiteDatabase): Habit[] {
  const rows = db.getAllSync<HabitRow>(
    `SELECT * FROM habits ORDER BY created_at ASC`,
  );

  return rows.map((row) => {
    const weekdays = db
      .getAllSync<{
        weekday: number;
      }>(
        `SELECT weekday FROM habit_weekdays WHERE habit_id = ? ORDER BY weekday`,
        [row.id],
      )
      .map((r) => r.weekday);

    const notificationIds = db
      .getAllSync<{
        notification_id: string;
      }>(
        `SELECT notification_id FROM habit_notification_ids WHERE habit_id = ?`,
        [row.id],
      )
      .map((r) => r.notification_id);

    return rowsToHabit(row, weekdays, notificationIds);
  });
}

export function getHabitById(db: SQLiteDatabase, id: string): Habit | null {
  const row = db.getFirstSync<HabitRow>(`SELECT * FROM habits WHERE id = ?`, [
    id,
  ]);
  if (!row) return null;

  const weekdays = db
    .getAllSync<{
      weekday: number;
    }>(
      `SELECT weekday FROM habit_weekdays WHERE habit_id = ? ORDER BY weekday`,
      [id],
    )
    .map((r) => r.weekday);

  const notificationIds = db
    .getAllSync<{
      notification_id: string;
    }>(
      `SELECT notification_id FROM habit_notification_ids WHERE habit_id = ?`,
      [id],
    )
    .map((r) => r.notification_id);

  return rowsToHabit(row, weekdays, notificationIds);
}

// ── CREATE ────────────────────────────────────────────────────────────────────

export function insertHabit(db: SQLiteDatabase, habit: Habit): void {
  db.withTransactionSync(() => {
    db.runSync(
      `INSERT INTO habits
         (id, name, frequency_kind, frequency_time, streak, last_completed_iso)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        habit.id,
        habit.name,
        habit.frequency.kind,
        habit.frequency.time,
        habit.streak,
        habit.lastCompletedISO || null,
      ],
    );

    if (habit.frequency.kind === "weekly") {
      for (const weekday of habit.frequency.weekdays) {
        db.runSync(
          `INSERT OR IGNORE INTO habit_weekdays (habit_id, weekday) VALUES (?, ?)`,
          [habit.id, weekday],
        );
      }
    }

    for (const nid of habit.notificationIds) {
      db.runSync(
        `INSERT OR IGNORE INTO habit_notification_ids (habit_id, notification_id) VALUES (?, ?)`,
        [habit.id, nid],
      );
    }
  });
}

// ── UPDATE ────────────────────────────────────────────────────────────────────

export function updateHabit(db: SQLiteDatabase, habit: Habit): void {
  db.withTransactionSync(() => {
    db.runSync(
      `UPDATE habits
       SET name = ?, frequency_kind = ?, frequency_time = ?,
           streak = ?, last_completed_iso = ?
       WHERE id = ?`,
      [
        habit.name,
        habit.frequency.kind,
        habit.frequency.time,
        habit.streak,
        habit.lastCompletedISO || null,
        habit.id,
      ],
    );

    // replace weekdays wholesale
    db.runSync(`DELETE FROM habit_weekdays WHERE habit_id = ?`, [habit.id]);
    if (habit.frequency.kind === "weekly") {
      for (const weekday of habit.frequency.weekdays) {
        db.runSync(
          `INSERT OR IGNORE INTO habit_weekdays (habit_id, weekday) VALUES (?, ?)`,
          [habit.id, weekday],
        );
      }
    }

    // replace notification ids wholesale (caller cancels old ones first)
    db.runSync(`DELETE FROM habit_notification_ids WHERE habit_id = ?`, [
      habit.id,
    ]);
    for (const nid of habit.notificationIds) {
      db.runSync(
        `INSERT OR IGNORE INTO habit_notification_ids (habit_id, notification_id) VALUES (?, ?)`,
        [habit.id, nid],
      );
    }
  });
}

export function updateStreak(
  db: SQLiteDatabase,
  habitId: string,
  streak: number,
  _mostRecentDate: string | null,
): void {
  // FIX: We stop this function from overwriting last_completed_iso.
  // The streak calculator outputs flat strings (e.g. "2026-07-03") which
  // break the exact timestamp math needed by the wave loader.
  db.runSync(`UPDATE habits SET streak = ? WHERE id = ?`, [streak, habitId]);
}
// ── DELETE ────────────────────────────────────────────────────────────────────

// Returns the notification IDs so the caller can cancel them before deleting.
export function getNotificationIds(
  db: SQLiteDatabase,
  habitId: string,
): string[] {
  return db
    .getAllSync<{
      notification_id: string;
    }>(
      `SELECT notification_id FROM habit_notification_ids WHERE habit_id = ?`,
      [habitId],
    )
    .map((r) => r.notification_id);
}

export function deleteHabit(db: SQLiteDatabase, habitId: string): void {
  // child rows cascade automatically (PRAGMA foreign_keys = ON)
  db.runSync(`DELETE FROM habits WHERE id = ?`, [habitId]);
}

// ── LOGS ─────────────────────────────────────────────────────────────────────

export function upsertLog(
  db: SQLiteDatabase,
  habitId: string,
  date: string, // YYYY-MM-DD
  done: boolean,
): void {
  db.withTransactionSync(() => {
    db.runSync(
      `INSERT INTO habit_logs (habit_id, date, done)
       VALUES (?, ?, ?)
       ON CONFLICT(habit_id, date) DO UPDATE SET done = excluded.done`,
      [habitId, date, done ? 1 : 0],
    );

    // FIX: Unconditionally update the exact timestamp so the wave loader stays green.
    // (If unchecked, it reverts to null to accurately reset today's UI state).
    const timestamp = done ? new Date().toISOString() : null;
    db.runSync(`UPDATE habits SET last_completed_iso = ? WHERE id = ?`, [
      timestamp,
      habitId,
    ]);
  });
}

// Used by the heatmap — returns every log for a habit in the current year.
export function getLogsForYear(
  db: SQLiteDatabase,
  habitId: string,
  year: number,
): HabitLogRow[] {
  return db.getAllSync<HabitLogRow>(
    `SELECT * FROM habit_logs
     WHERE habit_id = ?
       AND date BETWEEN ? AND ?
     ORDER BY date ASC`,
    [habitId, `${year}-01-01`, `${year}-12-31`],
  );
}

// Used by the weekly dot grid — returns logs for a date range.
export function getLogsForRange(
  db: SQLiteDatabase,
  habitId: string,
  from: string, // YYYY-MM-DD
  to: string, // YYYY-MM-DD
): HabitLogRow[] {
  return db.getAllSync<HabitLogRow>(
    `SELECT * FROM habit_logs
     WHERE habit_id = ? AND date BETWEEN ? AND ?
     ORDER BY date ASC`,
    [habitId, from, to],
  );
}

export function getLogForDate(
  db: SQLiteDatabase,
  habitId: string,
  date: string, // YYYY-MM-DD
): boolean {
  const row = db.getFirstSync<{ done: number }>(
    `SELECT done FROM habit_logs WHERE habit_id = ? AND date = ?`,
    [habitId, date],
  );
  return row ? row.done === 1 : false;
}

export function replaceHabitNotifications(
  db: SQLiteDatabase,
  habitId: string,
  notificationIds: string[],
): void {
  db.withTransactionSync(() => {
    db.runSync(`DELETE FROM habit_notification_ids WHERE habit_id = ?`, [
      habitId,
    ]);
    for (const nid of notificationIds) {
      db.runSync(
        `INSERT OR IGNORE INTO habit_notification_ids (habit_id, notification_id) VALUES (?, ?)`,
        [habitId, nid],
      );
    }
  });
}
