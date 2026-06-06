/**
 * @module database
 * @description SQLite persistence layer for SafeDrive drive history records.
 *
 * Uses expo-sqlite v15 synchronous API. The database file is `safedrive.db`
 * stored in the app's local document directory.
 *
 * Schema:
 *  TABLE drives
 *   id               TEXT PRIMARY KEY
 *   start_time       INTEGER  (Unix ms)
 *   end_time         INTEGER  (Unix ms)
 *   score            INTEGER  (0–100)
 *   safety_rating    TEXT
 *   duration         INTEGER  (seconds)
 *   events_json      TEXT     (JSON array of DriveEvent)
 *   event_counts_json TEXT    (JSON object of DriveEventType → number)
 */

import * as SQLite from "expo-sqlite";
import type { DriveRecord, DriveSession } from "@/types";

const DB_NAME = "safedrive.db";
const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS drives (
    id                TEXT PRIMARY KEY NOT NULL,
    start_time        INTEGER NOT NULL,
    end_time          INTEGER NOT NULL DEFAULT 0,
    score             INTEGER NOT NULL DEFAULT 100,
    safety_rating     TEXT    NOT NULL DEFAULT 'Excellent',
    duration          INTEGER NOT NULL DEFAULT 0,
    events_json       TEXT    NOT NULL DEFAULT '[]',
    event_counts_json TEXT    NOT NULL DEFAULT '{}'
  );
`;

let _db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!_db) {
    _db = SQLite.openDatabaseSync(DB_NAME);
    _db.execSync(CREATE_TABLE_SQL);
  }
  return _db;
}

export function saveDrive(session: DriveSession): void {
  const db = getDb();
  db.runSync(
    `INSERT OR REPLACE INTO drives
       (id, start_time, end_time, score, safety_rating, duration, events_json, event_counts_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      session.id,
      session.startTime,
      session.endTime ?? Date.now(),
      Math.round(session.score),
      session.safetyRating,
      session.duration,
      JSON.stringify(session.events),
      JSON.stringify(session.eventCounts),
    ],
  );
}

export function loadAllDrives(): DriveRecord[] {
  const db = getDb();
  return db.getAllSync<DriveRecord>(
    "SELECT * FROM drives ORDER BY start_time DESC",
  );
}

export function loadDriveById(id: string): DriveRecord | null {
  const db = getDb();
  return (
    db.getFirstSync<DriveRecord>("SELECT * FROM drives WHERE id = ?", [id]) ??
    null
  );
}

export function deleteDrive(id: string): void {
  const db = getDb();
  db.runSync("DELETE FROM drives WHERE id = ?", [id]);
}

export function clearAllDrives(): void {
  const db = getDb();
  db.execSync("DELETE FROM drives");
}

export function loadStats(): {
  totalDrives: number;
  avgScore: number;
  totalDuration: number;
  bestScore: number;
} {
  const db = getDb();
  const row = db.getFirstSync<{
    totalDrives: number;
    avgScore: number;
    totalDuration: number;
    bestScore: number;
  }>(
    `SELECT
       COUNT(*)        AS totalDrives,
       AVG(score)      AS avgScore,
       SUM(duration)   AS totalDuration,
       MAX(score)      AS bestScore
     FROM drives`,
  );
  return {
    totalDrives: row?.totalDrives ?? 0,
    avgScore: Math.round(row?.avgScore ?? 0),
    totalDuration: row?.totalDuration ?? 0,
    bestScore: row?.bestScore ?? 0,
  };
}
