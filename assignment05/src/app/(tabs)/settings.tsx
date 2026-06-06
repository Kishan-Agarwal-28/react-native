import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Separator from "@/components/ui/separator";
import Switch from "@/components/ui/switch";
import { THEME, useTheme } from "@/lib/theme";
import { useThresholdStore, DEFAULT_THRESHOLDS } from "@/store/thresholdStore";
import type { Thresholds } from "@/types";

interface ThresholdRow {
  key: keyof Thresholds;
  label: string;
  description: string;
  unit: string;
  step: number;
  min: number;
  max: number;
  penalty: number;
}
const THRESHOLD_ROWS: ThresholdRow[] = [
  {
    key: "harshBrake",
    label: "Harsh Brake",
    description: "Forward deceleration (y-axis)",
    unit: "m/s²",
    step: 0.5,
    min: 2.0,
    max: 10.0,
    penalty: 5,
  },
  {
    key: "harshAcceleration",
    label: "Harsh Acceleration",
    description: "Forward acceleration (y-axis)",
    unit: "m/s²",
    step: 0.5,
    min: 1.5,
    max: 8.0,
    penalty: 5,
  },
  {
    key: "sharpTurn",
    label: "Sharp Turn",
    description: "Yaw rotation rate (z-axis)",
    unit: "rad/s",
    step: 0.1,
    min: 0.3,
    max: 2.0,
    penalty: 3,
  },
  {
    key: "aggressiveSteering",
    label: "Aggressive Steering",
    description: "Total gyroscope magnitude",
    unit: "rad/s",
    step: 0.1,
    min: 0.4,
    max: 3.0,
    penalty: 4,
  },
  {
    key: "excessiveMovement",
    label: "Excessive Movement",
    description: "Net accelerometer magnitude",
    unit: "m/s²",
    step: 0.5,
    min: 2.0,
    max: 10.0,
    penalty: 2,
  },
  {
    key: "phoneHandling",
    label: "Phone Handling",
    description: "Gyro magnitude (pickup spike)",
    unit: "rad/s",
    step: 0.1,
    min: 0.5,
    max: 4.0,
    penalty: 10,
  },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { theme, setTheme } = useTheme();
  const { colors, spacing, radius, typography } = THEME[theme];
  const { thresholds, setThreshold, resetToDefaults } = useThresholdStore();
  const isDark = theme === "dark";

  const handleReset = () => {
    Alert.alert(
      "Reset Thresholds",
      "Restore all detection thresholds to their default values?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", onPress: resetToDefaults },
      ],
    );
  };

  const adjust = (key: keyof Thresholds, delta: number, row: ThresholdRow) => {
    const current = thresholds[key];
    const next = Math.round((current + delta) * 10) / 10;
    if (next < row.min || next > row.max) return;
    setThreshold(key, next);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          paddingTop: insets.top + spacing.sm,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.md,
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
          Settings
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.lg,
          paddingBottom: insets.bottom + 100,
          gap: spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent style={{ gap: spacing.sm }}>
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
                    fontSize: typography.base,
                    color: colors.foreground,
                    fontFamily: "Inter_500Medium",
                    fontWeight: "500",
                  }}
                >
                  Dark Mode
                </Text>
                <Text
                  style={{
                    fontSize: typography.xs,
                    color: colors.mutedForeground,
                    fontFamily: "Inter_400Regular",
                  }}
                >
                  Switch between light and dark theme
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={(v) => setTheme(v ? "dark" : "light")}
                accessibilityLabel="Toggle dark mode"
              />
            </View>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Score Penalties</CardTitle>
          </CardHeader>
          <CardContent style={{ gap: spacing.xs }}>
            <Text
              style={{
                fontSize: typography.xs,
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
                marginBottom: spacing.xs,
              }}
            >
              Points deducted per detected event
            </Text>
            {THRESHOLD_ROWS.map((row, i) => (
              <View key={row.key}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: spacing.xs,
                  }}
                >
                  <Text
                    style={{
                      fontSize: typography.sm,
                      color: colors.foreground,
                      fontFamily: "Inter_400Regular",
                    }}
                  >
                    {row.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: typography.sm,
                      fontWeight: "600",
                      color: colors.destructive,
                      fontFamily: "Inter_600SemiBold",
                    }}
                  >
                    -{row.penalty} pts
                  </Text>
                </View>
                {i < THRESHOLD_ROWS.length - 1 && (
                  <Separator spacing={0} thickness={1} />
                )}
              </View>
            ))}
          </CardContent>
        </Card>
        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: spacing.sm,
            }}
          >
            <Text
              style={{
                fontSize: typography.base,
                fontWeight: "600",
                color: colors.foreground,
                fontFamily: "Inter_600SemiBold",
              }}
            >
              Detection Thresholds
            </Text>
            <TouchableOpacity onPress={handleReset}>
              <Text
                style={{
                  fontSize: typography.sm,
                  color: colors.primary,
                  fontFamily: "Inter_500Medium",
                  fontWeight: "500",
                }}
              >
                Reset defaults
              </Text>
            </TouchableOpacity>
          </View>
          <Text
            style={{
              fontSize: typography.xs,
              color: colors.mutedForeground,
              fontFamily: "Inter_400Regular",
              marginBottom: spacing.md,
            }}
          >
            Lower = more sensitive. Tune these after implementing your sensor
            functions.
          </Text>

          <Card>
            <CardContent style={{ gap: spacing.md }}>
              {THRESHOLD_ROWS.map((row, i) => {
                const value = thresholds[row.key];
                const isDefault = value === DEFAULT_THRESHOLDS[row.key];
                return (
                  <View key={row.key}>
                    <View style={{ gap: spacing.xs }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: spacing.xs,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: typography.sm,
                                fontWeight: "600",
                                color: colors.foreground,
                                fontFamily: "Inter_600SemiBold",
                              }}
                            >
                              {row.label}
                            </Text>
                            {!isDefault && (
                              <View
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: radius.full,
                                  backgroundColor: colors.primary,
                                }}
                              />
                            )}
                          </View>
                          <Text
                            style={{
                              fontSize: typography.xs,
                              color: colors.mutedForeground,
                              fontFamily: "Inter_400Regular",
                            }}
                          >
                            {row.description}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: spacing.sm,
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => adjust(row.key, -row.step, row)}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: radius.md,
                              backgroundColor: colors.muted,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Feather
                              name="minus"
                              size={16}
                              color={colors.foreground}
                            />
                          </TouchableOpacity>
                          <Text
                            style={{
                              fontSize: typography.sm,
                              fontWeight: "700",
                              color: colors.foreground,
                              fontFamily: "Inter_700Bold",
                              minWidth: 52,
                              textAlign: "center",
                            }}
                          >
                            {value.toFixed(1)}{" "}
                            <Text
                              style={{
                                fontSize: typography.xs,
                                fontWeight: "400",
                                color: colors.mutedForeground,
                                fontFamily: "Inter_400Regular",
                              }}
                            >
                              {row.unit}
                            </Text>
                          </Text>
                          <TouchableOpacity
                            onPress={() => adjust(row.key, row.step, row)}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: radius.md,
                              backgroundColor: colors.muted,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Feather
                              name="plus"
                              size={16}
                              color={colors.foreground}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                    {i < THRESHOLD_ROWS.length - 1 && (
                      <Separator spacing={spacing.sm} />
                    )}
                  </View>
                );
              })}
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
