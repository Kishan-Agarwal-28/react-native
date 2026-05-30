import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

export interface FileItem {
  name: string;
  uri: string;
  isDirectory: boolean;
  size?: number;
  modificationTime?: number;
}

interface FileContextType {
  currentPath: string;
  files: FileItem[];
  isLoading: boolean;
  navigate: (path: string) => Promise<void>;
  goBack: () => Promise<void>;
  createFolder: (name: string) => Promise<void>;
  deleteItem: (uri: string) => Promise<void>;
  shareFile: (uri: string) => Promise<void>;
  saveTextFile: (
    name: string,
    content: string,
    folder?: string,
  ) => Promise<string>;
  refresh: () => Promise<void>;
  canGoBack: boolean;
}

const FileContext = createContext<FileContextType | null>(null);
const ROOT_DIR = FileSystem.documentDirectory + "SnippetVault/";

export function FileProvider({ children }: { children: React.ReactNode }) {
  const [currentPath, setCurrentPath] = useState(ROOT_DIR);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pathHistory, setPathHistory] = useState<string[]>([]);

  const ensureRootDir = useCallback(async () => {
    const info = await FileSystem.getInfoAsync(ROOT_DIR);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(ROOT_DIR, { intermediates: true });
    }
  }, []);

  const loadFiles = useCallback(
    async (path: string) => {
      setIsLoading(true);
      try {
        await ensureRootDir();
        const info = await FileSystem.getInfoAsync(path);
        if (!info.exists || !info.isDirectory) {
          setFiles([]);
          return;
        }
        const names = await FileSystem.readDirectoryAsync(path);
        const items: FileItem[] = await Promise.all(
          names.map(async (name) => {
            const uri = path + name;
            const fileInfo = await FileSystem.getInfoAsync(uri);
            return {
              name,
              uri,
              isDirectory: fileInfo.isDirectory ?? false,
              size:
                fileInfo.exists && !fileInfo.isDirectory
                  ? (fileInfo as any).size
                  : undefined,
              modificationTime: fileInfo.exists
                ? (fileInfo as any).modificationTime
                : undefined,
            };
          }),
        );
        items.sort((a, b) => {
          if (a.isDirectory && !b.isDirectory) return -1;
          if (!a.isDirectory && b.isDirectory) return 1;
          return a.name.localeCompare(b.name);
        });
        setFiles(items);
      } catch {
        setFiles([]);
      } finally {
        setIsLoading(false);
      }
    },
    [ensureRootDir],
  );

  useEffect(() => {
    loadFiles(currentPath);
  }, [currentPath, loadFiles]);

  const navigate = useCallback(
    async (path: string) => {
      const dirPath = path.endsWith("/") ? path : path + "/";
      setPathHistory((prev) => [...prev, currentPath]);
      setCurrentPath(dirPath);
    },
    [currentPath],
  );

  const goBack = useCallback(async () => {
    if (pathHistory.length > 0) {
      const prev = pathHistory[pathHistory.length - 1];
      setPathHistory((h) => h.slice(0, -1));
      setCurrentPath(prev);
    }
  }, [pathHistory]);

  const createFolder = useCallback(
    async (name: string) => {
      const folderPath = currentPath + name + "/";
      await FileSystem.makeDirectoryAsync(folderPath, { intermediates: true });
      await loadFiles(currentPath);
    },
    [currentPath, loadFiles],
  );

  const deleteItem = useCallback(
    async (uri: string) => {
      await FileSystem.deleteAsync(uri, { idempotent: true });
      await loadFiles(currentPath);
    },
    [currentPath, loadFiles],
  );

  const shareFile = useCallback(async (uri: string) => {
    const available = await Sharing.isAvailableAsync();
    if (available) {
      await Sharing.shareAsync(uri);
    }
  }, []);

  const saveTextFile = useCallback(
    async (name: string, content: string, folder?: string): Promise<string> => {
      await ensureRootDir();
      const dir = folder ? ROOT_DIR + folder + "/" : ROOT_DIR;
      const dirInfo = await FileSystem.getInfoAsync(dir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }
      const filePath = dir + name;
      await FileSystem.writeAsStringAsync(filePath, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await loadFiles(currentPath);
      return filePath;
    },
    [ensureRootDir, currentPath, loadFiles],
  );

  const refresh = useCallback(async () => {
    await loadFiles(currentPath);
  }, [currentPath, loadFiles]);

  const canGoBack = pathHistory.length > 0 && currentPath !== ROOT_DIR;

  return (
    <FileContext.Provider
      value={{
        currentPath,
        files,
        isLoading,
        navigate,
        goBack,
        createFolder,
        deleteItem,
        shareFile,
        saveTextFile,
        refresh,
        canGoBack,
      }}
    >
      {children}
    </FileContext.Provider>
  );
}

export function useFiles() {
  const ctx = useContext(FileContext);
  if (!ctx) throw new Error("useFiles must be used within FileProvider");
  return ctx;
}
