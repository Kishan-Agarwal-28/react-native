import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { LanguageBadge } from "./LanguageBadge";
import type { Snippet } from "@/contexts/DatabaseContext";

interface SnippetCardProps {
  snippet: Snippet;
  onPress: () => void;
  onToggleFavorite: () => void;
}

export function SnippetCard({
  snippet,
  onPress,
  onToggleFavorite,
}: SnippetCardProps) {
  const colors = useColors();

  const handleFavoritePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleFavorite();
  };

  const preview = snippet.code.split("\n").slice(0, 3).join("\n");

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return "just now";
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {snippet.title}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleFavoritePress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather
            name={snippet.isFavorite ? "heart" : "heart"}
            size={18}
            color={
              snippet.isFavorite ? colors.destructive : colors.mutedForeground
            }
          />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.codePreview,
          {
            backgroundColor: colors.codeBackground,
            borderRadius: colors.radius / 2,
          },
        ]}
      >
        <Text
          style={[styles.codeText, { color: colors.codeForeground }]}
          numberOfLines={3}
        >
          {preview || "// empty snippet"}
        </Text>
      </View>

      <View style={styles.footer}>
        <LanguageBadge language={snippet.language} small />
        <View style={styles.footerRight}>
          {snippet.tags.slice(0, 2).map((tag) => (
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
          {snippet.tags.length > 2 && (
            <Text style={[styles.moreText, { color: colors.mutedForeground }]}>
              +{snippet.tags.length - 2}
            </Text>
          )}
          <Text style={[styles.time, { color: colors.mutedForeground }]}>
            {timeAgo(snippet.updatedAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 14,
    gap: 10,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  titleRow: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  codePreview: {
    padding: 10,
  },
  codeText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
  moreText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  time: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
