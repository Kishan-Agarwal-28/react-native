export type Frequency =
  | { kind: "daily"; time: string }
  | { kind: "weekly"; weekdays: number[]; time: string };

export type Habit = {
  id: string;
  name: string;
  frequency: Frequency;
  notificationIds: string[];
  streak: number;
  lastCompletedISO: string | null;
};
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
