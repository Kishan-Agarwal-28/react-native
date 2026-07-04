import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { openDatabaseSync, type SQLiteDatabase } from "expo-sqlite";
import { initDatabase } from "./schema";

const DatabaseContext = createContext<SQLiteDatabase | null>(null);

const db = openDatabaseSync("habits.db");

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initDatabase(db);
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <DatabaseContext.Provider value={db}>{children}</DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const ctx = useContext(DatabaseContext);
  if (!ctx)
    throw new Error("useDatabase must be used within a DatabaseProvider");
  return ctx;
}
