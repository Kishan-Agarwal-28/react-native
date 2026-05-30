import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useColors } from "@/hooks/useColors";
import { useDatabase } from "@/contexts/DatabaseContext";
import { CodeBlock } from "@/components/CodeBlock";
import { LanguageBadge } from "@/components/LanguageBadge";

export default function SnippetDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSnippet, deleteSnippet, toggleFavorite } = useDatabase();

  const snippet = getSnippet(id);

  const [exporting, setExporting] = useState(false);

  if (!snippet) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground, padding: 24 }}>
          Snippet not found.
        </Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      "Delete Snippet",
      `Delete "${snippet.title}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteSnippet(snippet.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            router.back();
          },
        },
      ],
    );
  };

  const handleExport = async (format: "txt" | "js" | "json") => {
    setExporting(true);
    try {
      const dir = FileSystem.documentDirectory + "SnippetVault/Exports/";
      const dirInfo = await FileSystem.getInfoAsync(dir);
      if (!dirInfo.exists)
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });

      let content = "";
      let ext = format;

      if (format === "json") {
        content = JSON.stringify(
          {
            title: snippet.title,
            language: snippet.language,
            tags: snippet.tags,
            code: snippet.code,
            createdAt: snippet.createdAt,
          },
          null,
          2,
        );
      } else {
        content = snippet.code;
        if (format === "txt") ext = "txt";
      }

      const filename =
        snippet.title.replace(/[^a-z0-9]/gi, "_").toLowerCase() + "." + ext;
      const fileUri = dir + filename;
      await FileSystem.writeAsStringAsync(fileUri, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("Exported", `Saved to ~/SnippetVault/Exports/${filename}`);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert("Error", "Export failed.");
    } finally {
      setExporting(false);
    }
  };

  const showExportSheet = () => {
    Alert.alert("Export Snippet", "Choose format", [
      { text: ".txt", onPress: () => handleExport("txt") },
      { text: ".js", onPress: () => handleExport("js") },
      { text: ".json", onPress: () => handleExport("json") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const topPad =
    Platform.OS === "ios" ? insets.top + 8 : Platform.OS === "web" ? 67 : 16;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.navBar,
          { paddingTop: topPad, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Feather name="chevron-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.navActions}>
          <TouchableOpacity
            onPress={() => toggleFavorite(snippet.id)}
            style={styles.navBtn}
            onPressIn={() => Haptics.selectionAsync()}
          >
            <Feather
              name="heart"
              size={20}
              color={
                snippet.isFavorite ? colors.destructive : colors.mutedForeground
              }
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push(`/snippet/edit/${snippet.id}`)}
            style={styles.navBtn}
          >
            <Feather name="edit-2" size={18} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={showExportSheet}
            style={styles.navBtn}
            disabled={exporting}
          >
            <Feather name="share" size={18} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.navBtn}>
            <Feather name="trash-2" size={18} color={colors.destructive} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>
          {snippet.title}
        </Text>

        <View style={styles.meta}>
          <LanguageBadge language={snippet.language} />
          {snippet.tags.map((tag) => (
            <View
              key={tag}
              style={[
                styles.tag,
                { backgroundColor: colors.accent, borderRadius: 4 },
              ]}
            >
              <Text
                style={[styles.tagText, { color: colors.accentForeground }]}
              >
                #{tag}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.dateRow}>
          <Text style={[styles.dateText, { color: colors.mutedForeground }]}>
            Updated {new Date(snippet.updatedAt).toLocaleDateString()}
          </Text>
        </View>

        <CodeBlock code={snippet.code} language={snippet.language} />

        <TouchableOpacity
          onPress={() => router.push(`/ai/${snippet.id}`)}
          style={[
            styles.aiBtn,
            { backgroundColor: colors.primary, borderRadius: colors.radius },
          ]}
          activeOpacity={0.8}
        >
          <Feather name="zap" size={18} color={colors.primaryForeground} />
          <Text style={[styles.aiBtnText, { color: colors.primaryForeground }]}>
            Explain with AI
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  navBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  navActions: { flexDirection: "row" },
  content: { padding: 16, gap: 12 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", lineHeight: 30 },
  meta: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 4 },
  tagText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  dateRow: { marginTop: -4 },
  dateText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  aiBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    marginTop: 4,
  },
  aiBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
