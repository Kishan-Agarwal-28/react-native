import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as SQLite from "expo-sqlite";

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

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dbRef = useRef<SQLite.SQLiteDatabase | null>(null);

  const loadSnippets = useCallback(async (db: SQLite.SQLiteDatabase) => {
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
    setSnippets(
      rows.map((r) => ({
        id: r.id,
        title: r.title,
        code: r.code,
        language: r.language,
        tags: JSON.parse(r.tags || "[]"),
        isFavorite: r.is_favorite === 1,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
    );
  }, []);

  useEffect(() => {
    (async () => {
      const db = await SQLite.openDatabaseAsync("snippetvault.db");
      dbRef.current = db;
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
      await loadSnippets(db);
      setIsLoading(false);
    })();
  }, [loadSnippets]);

  const refresh = useCallback(async () => {
    if (dbRef.current) await loadSnippets(dbRef.current);
  }, [loadSnippets]);

  const createSnippet = useCallback(
    async (
      data: Omit<Snippet, "id" | "createdAt" | "updatedAt">,
    ): Promise<Snippet> => {
      const db = dbRef.current!;
      const id = generateId();
      const now = new Date().toISOString();
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
      const newSnippet: Snippet = {
        ...data,
        id,
        createdAt: now,
        updatedAt: now,
      };
      setSnippets((prev) => [newSnippet, ...prev]);
      return newSnippet;
    },
    [],
  );

  const updateSnippet = useCallback(
    async (
      id: string,
      data: Partial<Omit<Snippet, "id" | "createdAt" | "updatedAt">>,
    ) => {
      const db = dbRef.current!;
      const now = new Date().toISOString();
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
        prev.map((s) => (s.id === id ? { ...s, ...data, updatedAt: now } : s)),
      );
    },
    [],
  );

  const deleteSnippet = useCallback(async (id: string) => {
    await dbRef.current!.runAsync("DELETE FROM snippets WHERE id = ?", id);
    setSnippets((prev) => prev.filter((s) => s.id !== id));
  }, []);

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
