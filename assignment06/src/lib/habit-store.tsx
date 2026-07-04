import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { getAllHabits, type Habit } from "@/db/schema";
import { useDatabase } from "@/db/database";

type HabitsContextValue = {
  habits: Habit[];
  loading: boolean;
  refresh: () => void;
};

const HabitsContext = createContext<HabitsContextValue>({
  habits: [],
  loading: true,
  refresh: () => {},
});

export function HabitsProvider({ children }: { children: ReactNode }) {
  const db = useDatabase();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setHabits(getAllHabits(db));
    setLoading(false);
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <HabitsContext.Provider value={{ habits, loading, refresh }}>
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits() {
  return useContext(HabitsContext);
}
