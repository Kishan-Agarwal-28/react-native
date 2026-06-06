import type { DriveEventType, SafetyRating, ScorePenalties } from "@/types";
export const SCORE_PENALTIES: ScorePenalties = {
  harsh_brake: 5,
  harsh_acceleration: 5,
  sharp_turn: 3,
  phone_handling: 10,
  aggressive_steering: 4,
  excessive_movement: 2,
};
export const EVENT_LABELS: Record<DriveEventType, string> = {
  harsh_brake: "Harsh Brake",
  harsh_acceleration: "Harsh Accel",
  sharp_turn: "Sharp Turn",
  phone_handling: "Phone Handling",
  aggressive_steering: "Agg. Steering",
  excessive_movement: "Excess Movement",
};

export const EVENT_ICONS: Record<DriveEventType, string> = {
  harsh_brake: "alert-triangle",
  harsh_acceleration: "zap",
  sharp_turn: "corner-right-down",
  phone_handling: "smartphone",
  aggressive_steering: "navigation",
  excessive_movement: "activity",
};

export function calculateSafetyRating(score: number): SafetyRating {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 40) return "Poor";
  return "Dangerous";
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "#16a34a";
  if (score >= 75) return "#65a30d";
  if (score >= 60) return "#d97706";
  if (score >= 40) return "#ea580c";
  return "#dc2626";
}
export function getRatingBadgeVariant(
  rating: SafetyRating,
): "default" | "destructive" {
  switch (rating) {
    case "Excellent":
      return "default";
    case "Good":
      return "default";
    case "Fair":
      return "default";
    case "Poor":
      return "destructive";
    case "Dangerous":
      return "destructive";
  }
}
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
