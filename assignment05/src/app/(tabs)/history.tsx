import React, { useState, useCallback } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Badge from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import Skeleton from "@/components/ui/skeleton";
import { THEME, useTheme } from "@/lib/theme";
import {
  loadAllDrives,
  clearAllDrives,
  deleteDrive,
} from "@/services/database";
import {
  formatDuration,
  formatTimestamp,
  getScoreColor,
  getRatingBadgeVariant,
  EVENT_LABELS,
} from "@/services/scoring";
import type { DriveRecord, DriveEventType } from "@/types";

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { colors, spacing, radius, typography } = THEME[theme];

  const [drives, setDrives] = useState<DriveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    try {
      setDrives(loadAllDrives());
    } catch {
      setDrives([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handleDelete = (id: string) => {
    Alert.alert("Delete Drive", "Remove this drive from history?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteDrive(id);
          setDrives((prev) => prev.filter((d) => d.id !== id));
        },
      },
    ]);
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear All History",
      "This will permanently delete all your drive records.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            clearAllDrives();
            setDrives([]);
          },
        },
      ],
    );
  };

  const renderSkeleton = () => (
    <View style={{ gap: spacing.sm, paddingHorizontal: spacing.lg }}>
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} style={{ height: 88, borderRadius: radius.xl }} />
      ))}
    </View>
  );

  const renderItem = ({ item }: { item: DriveRecord }) => {
    const isExpanded = expanded === item.id;
    const eventCounts: Record<DriveEventType, number> = JSON.parse(
      item.event_counts_json ?? "{}",
    );
    const totalEvents = Object.values(eventCounts).reduce(
      (sum, v) => sum + v,
      0,
    );
    const scoreColor = getScoreColor(item.score);

    return (
      <Card key={item.id} style={{ marginBottom: spacing.sm }}>
        <CardContent style={{ gap: spacing.sm }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.md,
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: radius.full,
                backgroundColor: `${scoreColor}18`,
                borderWidth: 2.5,
                borderColor: scoreColor,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: typography.lg,
                  fontWeight: "700",
                  color: scoreColor,
                  fontFamily: "Inter_700Bold",
                }}
              >
                {item.score}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: typography.sm,
                  fontWeight: "600",
                  color: colors.foreground,
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                {formatTimestamp(item.start_time)}
              </Text>
              <Text
                style={{
                  fontSize: typography.xs,
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                  marginTop: 2,
                }}
              >
                {formatDuration(item.duration)} · {totalEvents} event
                {totalEvents !== 1 ? "s" : ""}
              </Text>
            </View>

            <View style={{ gap: spacing.xs, alignItems: "flex-end" }}>
              <Badge
                label={item.safety_rating}
                variant={getRatingBadgeVariant(item.safety_rating as any)}
              />
              <View style={{ flexDirection: "row", gap: spacing.xs }}>
                <TouchableOpacity
                  onPress={() => setExpanded(isExpanded ? null : item.id)}
                >
                  <Feather
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={colors.mutedForeground}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Feather
                    name="trash-2"
                    size={16}
                    color={colors.destructive}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {isExpanded && (
            <View
              style={{
                backgroundColor: colors.muted,
                borderRadius: radius.lg,
                padding: spacing.md,
                gap: spacing.xs,
              }}
            >
              <Text
                style={{
                  fontSize: typography.xs,
                  fontWeight: "600",
                  color: colors.mutedForeground,
                  fontFamily: "Inter_600SemiBold",
                  marginBottom: spacing.xs,
                }}
              >
                EVENT BREAKDOWN
              </Text>
              {(Object.entries(eventCounts) as [DriveEventType, number][])
                .filter(([, count]) => count > 0)
                .map(([type, count]) => (
                  <View
                    key={type}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: typography.sm,
                        color: colors.foreground,
                        fontFamily: "Inter_400Regular",
                      }}
                    >
                      {EVENT_LABELS[type]}
                    </Text>
                    <Text
                      style={{
                        fontSize: typography.sm,
                        fontWeight: "600",
                        color: colors.foreground,
                        fontFamily: "Inter_600SemiBold",
                      }}
                    >
                      {count}×
                    </Text>
                  </View>
                ))}
              {totalEvents === 0 && (
                <Text
                  style={{
                    fontSize: typography.sm,
                    color: colors.mutedForeground,
                    fontFamily: "Inter_400Regular",
                  }}
                >
                  Perfect drive — no events detected!
                </Text>
              )}
            </View>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header bar */}
      <View
        style={{
          paddingTop: insets.top + spacing.sm,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.md,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.background,
        }}
      >
        <Text
          style={{
            fontSize: typography.xl,
            fontWeight: "700",
            color: colors.foreground,
            fontFamily: "Inter_700Bold",
          }}
        >
          Drive History
        </Text>
        {drives.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text
              style={{
                fontSize: typography.sm,
                color: colors.destructive,
                fontFamily: "Inter_500Medium",
              }}
            >
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={{ paddingTop: spacing.lg }}>{renderSkeleton()}</View>
      ) : drives.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Feather name="clock" size={28} color={colors.mutedForeground} />
            </EmptyMedia>
            <EmptyTitle>No drives yet</EmptyTitle>
            <EmptyDescription>
              Complete your first drive to see your history and performance
              stats here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <FlatList
          data={drives}
          keyExtractor={(d) => d.id}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            paddingBottom: insets.bottom + 100,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
