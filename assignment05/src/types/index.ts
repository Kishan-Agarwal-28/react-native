export type DriveEventType =
  | "harsh_brake"
  | "harsh_acceleration"
  | "sharp_turn"
  | "phone_handling"
  | "aggressive_steering"
  | "excessive_movement";

export type EventSeverity = "low" | "medium" | "high";

export type SafetyRating = "Excellent" | "Good" | "Fair" | "Poor" | "Dangerous";

export interface DriveEvent {
  id: string;
  type: DriveEventType;
  timestamp: number;
  severity: EventSeverity;

  value: number;
  label: string;
}

export interface SensorReading {
  x: number;
  y: number;
  z: number;
}

export interface DriveSession {
  id: string;
  startTime: number;
  endTime?: number;
  score: number;
  safetyRating: SafetyRating;
  events: DriveEvent[];
  duration: number;
  isActive: boolean;
  eventCounts: Record<DriveEventType, number>;
}

export interface DriveRecord {
  id: string;
  start_time: number;
  end_time: number;
  score: number;
  safety_rating: string;
  duration: number;
  events_json: string;
  event_counts_json: string;
}

export interface Thresholds {
  harshBrake: number;
  harshAcceleration: number;
  sharpTurn: number;
  aggressiveSteering: number;
  excessiveMovement: number;
  phoneHandling: number;
  phoneTap: number;
  magneticMountSpike: number;
}

export interface ScorePenalties {
  harsh_brake: number;
  harsh_acceleration: number;
  sharp_turn: number;
  phone_handling: number;
  aggressive_steering: number;
  excessive_movement: number;
}
