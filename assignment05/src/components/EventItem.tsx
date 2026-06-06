import React from "react";
import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { THEME, useTheme } from "@/lib/theme";
import {
  EVENT_LABELS,
  EVENT_ICONS,
  getScoreColor,
  SCORE_PENALTIES,
} from "@/services/scoring";
import type { DriveEvent } from "@/types";

interface EventItemProps {
  event: DriveEvent;
}

const SEVERITY_OPACITY: Record<string, number> = {
  low: 0.7,
  medium: 0.85,
  high: 1,
};

export default function EventItem({ event }: EventItemProps) {
  const { theme } = useTheme();
  const { colors, spacing, radius, typography } = THEME[theme];

  const time = new Date(event.timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const penalty = SCORE_PENALTIES[event.type];
  const iconName = EVENT_ICONS[event.type] as keyof typeof Feather.glyphMap;
  const label = EVENT_LABELS[event.type];
  const dotColor = getScoreColor(100 - penalty * 4);
  const opacity = SEVERITY_OPACITY[event.severity] ?? 1;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colors.muted,
        marginBottom: spacing.xs,
        opacity,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: radius.full,
          backgroundColor: `${dotColor}22`,
          alignItems: "center",
          justifyContent: "center",
          marginRight: spacing.sm,
        }}
      >
        <Feather name={iconName} size={16} color={dotColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: typography.sm,
            fontWeight: "600" as const,
            color: colors.foreground,
            fontFamily: "Inter_600SemiBold",
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontSize: typography.xs,
            color: colors.mutedForeground,
            fontFamily: "Inter_400Regular",
            marginTop: 1,
          }}
        >
          {event.severity.charAt(0).toUpperCase() + event.severity.slice(1)} ·{" "}
          {time}
        </Text>
      </View>
      <Text
        style={{
          fontSize: typography.sm,
          fontWeight: "700" as const,
          color: dotColor,
          fontFamily: "Inter_700Bold",
        }}
      >
        -{penalty}
      </Text>
    </View>
  );
}
