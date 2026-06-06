import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { THEME, useTheme } from "@/lib/theme";
import ScoreRing from "@/components/ScoreRing";
import StatCard from "@/components/StatCard";
import { loadAllDrives, loadStats } from "@/services/database";
import {
  formatDuration,
  formatTimestamp,
  getScoreColor,
  getRatingBadgeVariant,
} from "@/services/scoring";
import type { DriveRecord } from "@/types";

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { colors, spacing, radius, typography } = THEME[theme];

  const [recentDrives, setRecentDrives] = React.useState<DriveRecord[]>([]);
  const [stats, setStats] = React.useState({
    totalDrives: 0,
    avgScore: 0,
    totalDuration: 0,
    bestScore: 0,
  });

  useFocusEffect(
    React.useCallback(() => {
      try {
        setRecentDrives(loadAllDrives().slice(0, 3));
        setStats(loadStats());
      } catch {}
    }, []),
  );

  const lastScore = recentDrives.length > 0 ? recentDrives[0].score : 100;
  const lastRating =
    recentDrives.length > 0
      ? (recentDrives[0].safety_rating as any)
      : "No drives yet";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.md,
        paddingBottom: insets.bottom + 100,
        paddingHorizontal: spacing.lg,
        gap: spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text
            style={{
              fontSize: typography["2xl"],
              fontWeight: "800",
              color: colors.foreground,
              fontFamily: "Inter_700Bold",
            }}
          >
            SafeDrive
          </Text>
          <Text
            style={{
              fontSize: typography.sm,
              color: colors.mutedForeground,
              fontFamily: "Inter_400Regular",
            }}
          >
            Drive safe, score high
          </Text>
        </View>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: radius.full,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name="shield" size={22} color={colors.primaryForeground} />
        </View>
      </View>
      <Card>
        <CardContent
          style={{
            alignItems: "center",
            paddingVertical: spacing["2xl"],
            gap: spacing.md,
          }}
        >
          <ScoreRing score={lastScore} size={180} strokeWidth={16} />
          <Badge
            label={lastRating}
            variant={
              recentDrives.length > 0
                ? getRatingBadgeVariant(recentDrives[0].safety_rating as any)
                : "ghost"
            }
          />
          <Text
            style={{
              fontSize: typography.sm,
              color: colors.mutedForeground,
              fontFamily: "Inter_400Regular",
            }}
          >
            {recentDrives.length > 0
              ? "Last drive score"
              : "Start your first drive"}
          </Text>
        </CardContent>
      </Card>
      <Button
        title="Start Drive"
        onPress={() => router.push("/drive")}
        buttonStyle={{ paddingVertical: spacing.lg }}
      />
      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        <StatCard
          icon="map"
          value={String(stats.totalDrives)}
          label="Total Drives"
          color={colors.primary}
        />
        <StatCard
          icon="trending-up"
          value={stats.totalDrives > 0 ? String(stats.avgScore) : "—"}
          label="Avg Score"
          color={getScoreColor(stats.avgScore)}
        />
        <StatCard
          icon="clock"
          value={
            stats.totalDuration > 0 ? formatDuration(stats.totalDuration) : "—"
          }
          label="Total Time"
          color="#16a34a"
        />
      </View>
      {recentDrives.length > 0 && (
        <View style={{ gap: spacing.sm }}>
          <Text
            style={{
              fontSize: typography.base,
              fontWeight: "600",
              color: colors.foreground,
              fontFamily: "Inter_600SemiBold",
            }}
          >
            Recent Drives
          </Text>
          {recentDrives.map((drive) => (
            <Card key={drive.id} size="sm">
              <CardContent
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.md,
                  paddingVertical: spacing.md,
                }}
              >
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: radius.full,
                    backgroundColor: `${getScoreColor(drive.score)}18`,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 2,
                    borderColor: getScoreColor(drive.score),
                  }}
                >
                  <Text
                    style={{
                      fontSize: typography.base,
                      fontWeight: "700",
                      color: getScoreColor(drive.score),
                      fontFamily: "Inter_700Bold",
                    }}
                  >
                    {drive.score}
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
                    {formatTimestamp(drive.start_time)}
                  </Text>
                  <Text
                    style={{
                      fontSize: typography.xs,
                      color: colors.mutedForeground,
                      fontFamily: "Inter_400Regular",
                      marginTop: 2,
                    }}
                  >
                    {formatDuration(drive.duration)} ·{" "}
                    {JSON.parse(drive.events_json ?? "[]").length} events
                  </Text>
                </View>
                <Badge
                  label={drive.safety_rating}
                  variant={getRatingBadgeVariant(drive.safety_rating as any)}
                />
              </CardContent>
            </Card>
          ))}
        </View>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Safety Reminder</CardTitle>
        </CardHeader>
        <CardContent>
          <Text
            style={{
              fontSize: typography.sm,
              color: colors.mutedForeground,
              lineHeight: typography.sm * 1.6,
              fontFamily: "Inter_400Regular",
            }}
          >
            Keep your phone mounted and avoid touching it while driving. Phone
            handling costs -10 points per event — the biggest score deduction in
            SafeDrive.
          </Text>
        </CardContent>
      </Card>
    </ScrollView>
  );
}
