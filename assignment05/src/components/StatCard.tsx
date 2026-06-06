import React from "react";
import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { THEME, useTheme } from "@/lib/theme";

interface StatCardProps {
  icon: keyof typeof Feather.glyphMap;
  value: string;
  label: string;
  color?: string;
}

export default function StatCard({ icon, value, label, color }: StatCardProps) {
  const { theme } = useTheme();
  const { colors, spacing, radius, typography } = THEME[theme];
  const accent = color ?? colors.primary;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        alignItems: "center",
        gap: spacing.xs,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: radius.full,
          backgroundColor: `${accent}18`,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Feather name={icon} size={20} color={accent} />
      </View>
      <Text
        style={{
          fontSize: typography.xl,
          fontWeight: "700" as const,
          color: colors.foreground,
          fontFamily: "Inter_700Bold",
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: typography.xs,
          color: colors.mutedForeground,
          textAlign: "center",
          fontFamily: "Inter_400Regular",
        }}
      >
        {label}
      </Text>
    </View>
  );
}
