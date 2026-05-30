import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";
import { type SQLiteDatabase } from "expo-sqlite";

export interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DatabaseContextType {
  snippets: Snippet[];
  isLoading: boolean;
  createSnippet: (
    data: Omit<Snippet, "id" | "createdAt" | "updatedAt">,
  ) => Promise<Snippet>;
  updateSnippet: (
    id: string,
    data: Partial<Omit<Snippet, "id" | "createdAt" | "updatedAt">>,
  ) => Promise<void>;
  deleteSnippet: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  searchSnippets: (query: string) => Snippet[];
  getSnippet: (id: string) => Snippet | undefined;
  refresh: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);
const STORAGE_KEY = "@snippetvault/snippets";

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// ─── AsyncStorage backend (web) ───────────────────────────────────────────────

async function loadFromStorage(): Promise<Snippet[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveToStorage(snippets: Snippet[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
}

// ─── SQLite backend (native) ──────────────────────────────────────────────────

async function openDB(): Promise<SQLiteDatabase> {
  const SQLite = await import("expo-sqlite");
  return SQLite.openDatabaseAsync("snippetvault.db");
}

async function initDB(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS snippets (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      code TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'plaintext',
      tags TEXT NOT NULL DEFAULT '[]',
      is_favorite INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

async function loadFromDB(db: SQLiteDatabase): Promise<Snippet[]> {
  const rows = await db.getAllAsync<{
    id: string;
    title: string;
    code: string;
    language: string;
    tags: string;
    is_favorite: number;
    created_at: string;
    updated_at: string;
  }>("SELECT * FROM snippets ORDER BY updated_at DESC");
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    code: r.code,
    language: r.language,
    tags: JSON.parse(r.tags || "[]"),
    isFavorite: r.is_favorite === 1,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dbRef = useRef<SQLiteDatabase | null>(null);
  const isWeb = Platform.OS === "web";

  const loadSnippets = useCallback(async () => {
    if (isWeb) {
      const data = await loadFromStorage();
      setSnippets(data);
    } else {
      const data = await loadFromDB(dbRef.current!);
      setSnippets(data);
    }
  }, [isWeb]);

  useEffect(() => {
    (async () => {
      if (isWeb) {
        await loadSnippets();
      } else {
        const db = await openDB();
        dbRef.current = db;
        await initDB(db);
        await loadSnippets();
      }
      setIsLoading(false);
    })();
  }, [loadSnippets, isWeb]);

  const refresh = useCallback(async () => {
    await loadSnippets();
  }, [loadSnippets]);

  const createSnippet = useCallback(
    async (
      data: Omit<Snippet, "id" | "createdAt" | "updatedAt">,
    ): Promise<Snippet> => {
      const id = generateId();
      const now = new Date().toISOString();
      const newSnippet: Snippet = {
        ...data,
        id,
        createdAt: now,
        updatedAt: now,
      };

      if (isWeb) {
        const updated = [newSnippet, ...snippets];
        await saveToStorage(updated);
        setSnippets(updated);
      } else {
        const db = dbRef.current!;
        await db.runAsync(
          "INSERT INTO snippets (id, title, code, language, tags, is_favorite, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          id,
          data.title,
          data.code,
          data.language,
          JSON.stringify(data.tags),
          data.isFavorite ? 1 : 0,
          now,
          now,
        );
        setSnippets((prev) => [newSnippet, ...prev]);
      }
      return newSnippet;
    },
    [isWeb, snippets],
  );

  const updateSnippet = useCallback(
    async (
      id: string,
      data: Partial<Omit<Snippet, "id" | "createdAt" | "updatedAt">>,
    ) => {
      const now = new Date().toISOString();

      if (isWeb) {
        const updated = snippets.map((s) =>
          s.id === id ? { ...s, ...data, updatedAt: now } : s,
        );
        await saveToStorage(updated);
        setSnippets(updated);
      } else {
        const db = dbRef.current!;
        const fields: string[] = [];
        const values: (string | number)[] = [];

        if (data.title !== undefined) {
          fields.push("title = ?");
          values.push(data.title);
        }
        if (data.code !== undefined) {
          fields.push("code = ?");
          values.push(data.code);
        }
        if (data.language !== undefined) {
          fields.push("language = ?");
          values.push(data.language);
        }
        if (data.tags !== undefined) {
          fields.push("tags = ?");
          values.push(JSON.stringify(data.tags));
        }
        if (data.isFavorite !== undefined) {
          fields.push("is_favorite = ?");
          values.push(data.isFavorite ? 1 : 0);
        }

        fields.push("updated_at = ?");
        values.push(now, id);

        await db.runAsync(
          `UPDATE snippets SET ${fields.join(", ")} WHERE id = ?`,
          ...values,
        );
        setSnippets((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, ...data, updatedAt: now } : s,
          ),
        );
      }
    },
    [isWeb, snippets],
  );

  const deleteSnippet = useCallback(
    async (id: string) => {
      if (isWeb) {
        const updated = snippets.filter((s) => s.id !== id);
        await saveToStorage(updated);
        setSnippets(updated);
      } else {
        await dbRef.current!.runAsync("DELETE FROM snippets WHERE id = ?", id);
        setSnippets((prev) => prev.filter((s) => s.id !== id));
      }
    },
    [isWeb, snippets],
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      const snippet = snippets.find((s) => s.id === id);
      if (!snippet) return;
      await updateSnippet(id, { isFavorite: !snippet.isFavorite });
    },
    [snippets, updateSnippet],
  );

  const searchSnippets = useCallback(
    (query: string) => {
      if (!query.trim()) return snippets;
      const q = query.toLowerCase();
      return snippets.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.language.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q)) ||
          s.code.toLowerCase().includes(q),
      );
    },
    [snippets],
  );

  const getSnippet = useCallback(
    (id: string) => snippets.find((s) => s.id === id),
    [snippets],
  );

  return (
    <DatabaseContext.Provider
      value={{
        snippets,
        isLoading,
        createSnippet,
        updateSnippet,
        deleteSnippet,
        toggleFavorite,
        searchSnippets,
        getSnippet,
        refresh,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const ctx = useContext(DatabaseContext);
  if (!ctx) throw new Error("useDatabase must be used within DatabaseProvider");
  return ctx;
}
