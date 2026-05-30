import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

const LANGUAGE_COLORS: Record<string, string> = {
  javascript: "#F1E05A",
  typescript: "#3178C6",
  python: "#3572A5",
  rust: "#DEA584",
  go: "#00ADD8",
  java: "#B07219",
  kotlin: "#A97BFF",
  swift: "#FA7343",
  cpp: "#F34B7D",
  c: "#555555",
  csharp: "#178600",
  ruby: "#701516",
  php: "#4F5D95",
  html: "#E34C26",
  css: "#563D7C",
  bash: "#89E051",
  shell: "#89E051",
  sql: "#E38C00",
  json: "#292929",
  yaml: "#CB171E",
  markdown: "#083FA1",
  plaintext: "#6B7280",
};

interface LanguageBadgeProps {
  language: string;
  small?: boolean;
}

export function LanguageBadge({ language, small }: LanguageBadgeProps) {
  const colors = useColors();
  const lang = language.toLowerCase();
  const dotColor = LANGUAGE_COLORS[lang] ?? "#6B7280";

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colors.secondary, borderRadius: colors.radius / 2 },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text
        style={[
          styles.text,
          { color: colors.mutedForeground, fontSize: small ? 10 : 12 },
        ]}
      >
        {language}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    fontFamily: "Inter_500Medium",
  },
});
