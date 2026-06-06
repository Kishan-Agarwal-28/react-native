import { create } from "zustand";
import type { DriveEvent, DriveEventType, DriveSession } from "@/types";
import { calculateSafetyRating, SCORE_PENALTIES } from "@/services/scoring";

interface DriveState {
  session: DriveSession | null;
  isRecording: boolean;
}

interface DriveActions {
  startDrive: () => void;
  endDrive: () => DriveSession | null;
  addEvent: (event: DriveEvent) => void;
  reset: () => void;
}

type DriveStore = DriveState & DriveActions;

const initialEventCounts = (): Record<DriveEventType, number> => ({
  harsh_brake: 0,
  harsh_acceleration: 0,
  sharp_turn: 0,
  phone_handling: 0,
  aggressive_steering: 0,
  excessive_movement: 0,
});

export const useDriveStore = create<DriveStore>((set, get) => ({
  session: null,
  isRecording: false,

  startDrive: () => {
    const id =
      Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const newSession: DriveSession = {
      id,
      startTime: Date.now(),
      score: 100,
      safetyRating: "Excellent",
      events: [],
      duration: 0,
      isActive: true,
      eventCounts: initialEventCounts(),
    };
    set({ session: newSession, isRecording: true });
  },

  endDrive: () => {
    const { session } = get();
    if (!session) return null;

    const endTime = Date.now();
    const duration = Math.floor((endTime - session.startTime) / 1000);
    const completed: DriveSession = {
      ...session,
      endTime,
      duration,
      isActive: false,
      safetyRating: calculateSafetyRating(session.score),
    };

    set({ session: completed, isRecording: false });
    return completed;
  },

  addEvent: (event: DriveEvent) => {
    const { session } = get();
    if (!session || !session.isActive) return;

    const penalty = SCORE_PENALTIES[event.type];
    const newScore = Math.max(0, session.score - penalty);
    const newCounts = {
      ...session.eventCounts,
      [event.type]: (session.eventCounts[event.type] ?? 0) + 1,
    };

    set({
      session: {
        ...session,
        score: newScore,
        safetyRating: calculateSafetyRating(newScore),
        events: [...session.events, event],
        eventCounts: newCounts,
      },
    });
  },

  reset: () => set({ session: null, isRecording: false }),
}));
