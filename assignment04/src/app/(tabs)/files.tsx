import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useFiles, FileItem } from "@/contexts/FileContext";
import { EmptyState } from "@/components/EmptyState";

function formatSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function formatDate(ts?: number): string {
  if (!ts) return "";
  return new Date(ts * 1000).toLocaleDateString();
}

interface FileRowProps {
  item: FileItem;
  onNavigate: () => void;
  onDelete: () => void;
  onShare: () => void;
}

function FileRow({ item, onNavigate, onDelete, onShare }: FileRowProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      onPress={item.isDirectory ? onNavigate : onShare}
      activeOpacity={0.7}
      style={[styles.fileRow, { borderBottomColor: colors.border }]}
    >
      <View
        style={[
          styles.fileIcon,
          {
            backgroundColor: item.isDirectory
              ? colors.accent
              : colors.secondary,
            borderRadius: 8,
          },
        ]}
      >
        <Feather
          name={item.isDirectory ? "folder" : "file-text"}
          size={20}
          color={item.isDirectory ? colors.primary : colors.mutedForeground}
        />
      </View>
      <View style={styles.fileInfo}>
        <Text
          style={[styles.fileName, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text style={[styles.fileMeta, { color: colors.mutedForeground }]}>
          {item.isDirectory ? "Folder" : formatSize(item.size)}
          {item.modificationTime
            ? "  ·  " + formatDate(item.modificationTime)
            : ""}
        </Text>
      </View>
      <View style={styles.fileActions}>
        {!item.isDirectory && (
          <TouchableOpacity
            onPress={onShare}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="share-2" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={onDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="trash-2" size={16} color={colors.destructive} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function FilesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    files,
    isLoading,
    navigate,
    goBack,
    createFolder,
    deleteItem,
    shareFile,
    canGoBack,
    currentPath,
  } = useFiles();
  const [showNewFolder, setShowNewFolder] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const rootLabel = currentPath.split("/").filter(Boolean).pop() ?? "Files";

  const handleNewFolder = () => {
    Alert.prompt(
      "New Folder",
      "Enter folder name",
      async (name) => {
        if (name?.trim()) {
          await createFolder(name.trim());
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      },
      "plain-text",
    );
  };

  const handleDelete = (item: FileItem) => {
    Alert.alert("Delete", `Delete "${item.name}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteItem(item.uri);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerTop}>
          <View style={styles.breadcrumb}>
            {canGoBack && (
              <TouchableOpacity onPress={goBack} style={styles.backBtn}>
                <Feather name="chevron-left" size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              {canGoBack ? rootLabel : "Files"}
            </Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={handleNewFolder}
              style={[
                styles.actionBtn,
                {
                  backgroundColor: colors.secondary,
                  borderRadius: colors.radius,
                },
              ]}
            >
              <Feather name="folder-plus" size={16} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>
        <Text
          style={[styles.pathText, { color: colors.mutedForeground }]}
          numberOfLines={1}
        >
          {currentPath.replace(/.*SnippetVault\//, "~/SnippetVault/")}
        </Text>
      </View>

      <FlatList
        data={files}
        keyExtractor={(item) => item.uri}
        renderItem={({ item }) => (
          <FileRow
            item={item}
            onNavigate={() => navigate(item.uri)}
            onDelete={() => handleDelete(item)}
            onShare={() => shareFile(item.uri)}
          />
        )}
        contentContainerStyle={[
          styles.list,
          files.length === 0 && styles.listEmpty,
          { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 80 },
        ]}
        ListEmptyComponent={
          isLoading ? null : (
            <EmptyState
              icon="folder"
              title="No files yet"
              subtitle="Export snippets to see them here"
            />
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 6,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  breadcrumb: { flexDirection: "row", alignItems: "center", gap: 4 },
  backBtn: { marginRight: 4 },
  headerTitle: { fontSize: 28, fontFamily: "Inter_700Bold" },
  pathText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  list: { paddingVertical: 4 },
  listEmpty: { flex: 1 },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  fileIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 14, fontFamily: "Inter_500Medium", marginBottom: 2 },
  fileMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  fileActions: { flexDirection: "row", gap: 16 },
});
