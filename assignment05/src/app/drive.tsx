import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Progress from "@/components/ui/progress";
import Separator from "@/components/ui/separator";
import { THEME, useTheme } from "@/lib/theme";
import ScoreRing from "@/components/ScoreRing";
import EventItem from "@/components/EventItem";
import { useDriveStore } from "@/store/driveStore";
import { useThresholdStore } from "@/store/thresholdStore";
import { saveDrive } from "@/services/database";
import {
  subscribeToFusedSensors,
  SensorBuffer,
  calibrate,
  computeHeadingDeg,
  detectHarshBrake,
  detectHarshAcceleration,
  detectSharpTurn,
  detectAggressiveSteering,
  detectExcessiveMovement,
  detectPhoneHandling,
  detectPhoneTap,
  detectMagneticMount,
  detectHeadingTurn,
  MIN_CALIBRATION_READINGS,
} from "@/services/sensors";
import type { CalibrationResult, RotationMatrix } from "@/services/sensors";
import {
  formatDuration,
  EVENT_LABELS,
  EVENT_ICONS,
  getScoreColor,
} from "@/services/scoring";
import type { DriveEvent, SensorReading } from "@/types";

const SENSOR_INTERVAL = 100;
const EVENT_COOLDOWN_MS = 1500;

const CALIBRATION_COLLECT_MS = MIN_CALIBRATION_READINGS * SENSOR_INTERVAL + 300;
type CalibrationStep = "prompt" | "collecting" | "success" | "failed" | "done";

export default function DriveScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { colors, spacing, radius, typography } = THEME[theme];

  const { session, startDrive, endDrive, addEvent } = useDriveStore();
  const { thresholds } = useThresholdStore();

  const [elapsed, setElapsed] = useState(0);
  const [accel, setAccel] = useState<SensorReading>({ x: 0, y: 0, z: 0 });
  const [gyro, setGyro] = useState<SensorReading>({ x: 0, y: 0, z: 0 });
  const [mag, setMag] = useState<SensorReading>({ x: 0, y: 0, z: 0 });
  const [calibStep, setCalibStep] = useState<CalibrationStep>("prompt");
  const [ending, setEnding] = useState(false);
  const calibProgress = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  const lastEventTime = useRef<Record<string, number>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fusedUnsubRef = useRef<() => void>(() => {});

  const sensorBuffer = useRef(new SensorBuffer(1600, SENSOR_INTERVAL));
  const headingBuffer = useRef(new SensorBuffer(6000, SENSOR_INTERVAL));

  const calibRef = useRef<CalibrationResult | null>(null);
  const mountCooldownRef = useRef(false);

  const thresholdsRef = useRef(thresholds);
  const fireEventRef = useRef<
    (type: string, severity: string, value: number, label: string) => void
  >(() => {});

  useEffect(() => {
    thresholdsRef.current = thresholds;
  }, [thresholds]);
  useEffect(() => {
    startDrive();
  }, []);
  useEffect(() => {
    if (calibStep !== "done") return;
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [calibStep]);

  const fireEvent = useCallback(
    (type: string, severity: string, value: number, label: string) => {
      const now = Date.now();
      if ((lastEventTime.current[type] ?? 0) + EVENT_COOLDOWN_MS > now) return;
      lastEventTime.current[type] = now;
      const event: DriveEvent = {
        id: `${type}-${now}`,
        type: type as DriveEvent["type"],
        timestamp: now,
        severity: severity as DriveEvent["severity"],
        value,
        label,
      };
      addEvent(event);
    },
    [addEvent],
  );

  useEffect(() => {
    fireEventRef.current = fireEvent;
  }, [fireEvent]);
  useEffect(() => {
    sensorBuffer.current.clear();
    headingBuffer.current.clear();

    const unsub = subscribeToFusedSensors((fused) => {
      setAccel(fused.accel);
      setGyro(fused.gyro);
      setMag(fused.mag);

      sensorBuffer.current.push(fused);
      headingBuffer.current.push(fused);

      if (calibStep !== "done") return;

      const buf = sensorBuffer.current;
      const hBuf = headingBuffer.current;
      const t = thresholdsRef.current;
      const fire = fireEventRef.current;
      const matrix: RotationMatrix | null = calibRef.current?.matrix || null;

      const mountResult = detectMagneticMount(buf);
      if (mountResult.detected && !mountCooldownRef.current) {
        mountCooldownRef.current = true;
        fire(
          mountResult.type,
          mountResult.severity,
          mountResult.value,
          "Phone Mounted",
        );

        setTimeout(() => {
          const result = calibrate(sensorBuffer.current);
          if (result) {
            calibRef.current = result;
            console.log(
              "[SafeDrive] Re-calibrated after mount snap. Heading:",
              result.baseHeadingDeg.toFixed(1),
              "°",
            );
          }
          mountCooldownRef.current = false;
        }, 1500);
      }

      const results = [
        detectHarshBrake(buf, t, matrix),
        detectHarshAcceleration(buf, t, matrix),
        detectExcessiveMovement(buf, t, matrix),
        detectSharpTurn(buf, t, matrix),
        detectAggressiveSteering(buf, t, matrix),
        detectPhoneHandling(buf, t, matrix),
        detectPhoneTap(buf, t, matrix),
        detectHeadingTurn(hBuf, t),
      ];

      for (const result of results) {
        if (result.detected) {
          fire(
            result.type,
            result.severity,
            result.value,
            EVENT_LABELS[result.type as keyof typeof EVENT_LABELS],
          );
        }
      }
    }, SENSOR_INTERVAL);

    fusedUnsubRef.current = unsub;
    return unsub;
  }, [calibStep]);
  const handleStartCalibration = useCallback(() => {
    sensorBuffer.current.clear();
    calibProgress.setValue(0);
    setCalibStep("collecting");

    Animated.timing(calibProgress, {
      toValue: 1,
      duration: CALIBRATION_COLLECT_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(() => {
      const result = calibrate(sensorBuffer.current);
      if (result) {
        calibRef.current = result;
        console.log(
          "[SafeDrive] Calibration complete. Base heading:",
          result.baseHeadingDeg.toFixed(1),
          "°",
        );
        setCalibStep("success");
        setTimeout(() => {
          Animated.timing(overlayOpacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }).start(() => setCalibStep("done"));
        }, 1000);
      } else {
        console.warn(
          "[SafeDrive] Calibration failed — insufficient or degenerate data.",
        );
        setCalibStep("failed");
      }
    });
  }, [calibProgress, overlayOpacity]);

  const handleRetryCalibration = useCallback(() => {
    overlayOpacity.setValue(1);
    setCalibStep("prompt");
  }, [overlayOpacity]);

  const handleEndDrive = () => {
    setEnding(true);
    if (timerRef.current) clearInterval(timerRef.current);
    fusedUnsubRef.current();
    sensorBuffer.current.clear();
    headingBuffer.current.clear();
    calibRef.current = null;

    const completed = endDrive();
    if (completed) {
      try {
        saveDrive(completed);
      } catch (e) {
        console.error("[SafeDrive] Failed to save drive:", e);
      }
    }
    router.back();
  };

  const score = session?.score ?? 100;
  const events = session?.events ?? [];
  const recentEvents = [...events].reverse().slice(0, 10);
  const eventCounts = session?.eventCounts;

  const headingDeg: number = (() => {
    try {
      return Math.round(computeHeadingDeg(mag, accel));
    } catch {
      return 0;
    }
  })();
  const renderCalibrationOverlay = () => {
    if (calibStep === "done") return null;

    return (
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colors.background,
          opacity: overlayOpacity,
          zIndex: 100,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: spacing.xl ?? 32,
        }}
        pointerEvents={calibStep === "success" ? "none" : "auto"}
      >
        {calibStep === "prompt" && (
          <View style={{ alignItems: "center", gap: spacing.lg }}>
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: colors.muted,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name="smartphone" size={44} color={colors.foreground} />
            </View>
            <Text
              style={{
                fontSize: typography["2xl"] ?? 24,
                fontWeight: "700",
                fontFamily: "Inter_700Bold",
                color: colors.foreground,
                textAlign: "center",
              }}
            >
              Calibrate Sensors
            </Text>
            <View style={{ gap: spacing.md, width: "100%" }}>
              {[
                {
                  icon: "map-pin" as const,
                  text: "Place your phone flat on the seat or dashboard",
                },
                {
                  icon: "slash" as const,
                  text: "Keep the phone still — don't hold or move it",
                },
                {
                  icon: "check-circle" as const,
                  text: "Tap Calibrate and hold steady for 2 seconds",
                },
              ].map(({ icon, text }, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.md,
                    backgroundColor: colors.muted,
                    borderRadius: radius.lg ?? 12,
                    padding: spacing.md,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: colors.background,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Feather name={icon} size={18} color={colors.foreground} />
                  </View>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: typography.sm,
                      fontFamily: "Inter_400Regular",
                      color: colors.foreground,
                      lineHeight: 20,
                    }}
                  >
                    {text}
                  </Text>
                </View>
              ))}
            </View>
            <Text
              style={{
                fontSize: typography.xs,
                fontFamily: "Inter_400Regular",
                color: colors.mutedForeground,
                textAlign: "center",
                lineHeight: 18,
              }}
            >
              Calibration lets SafeDrive know how your phone is oriented in the
              car, so braking and turning are detected accurately — even in a
              cupholder or on a mount.
            </Text>
            <TouchableOpacity
              onPress={handleStartCalibration}
              style={{
                backgroundColor: colors.foreground,
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.xl ?? 32,
                borderRadius: radius.full ?? 999,
                width: "100%",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: typography.base,
                  fontWeight: "700",
                  fontFamily: "Inter_700Bold",
                  color: colors.background,
                }}
              >
                Calibrate
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                calibRef.current = null;
                setCalibStep("done");
              }}
            >
              <Text
                style={{
                  fontSize: typography.sm,
                  fontFamily: "Inter_400Regular",
                  color: colors.mutedForeground,
                  textDecorationLine: "underline",
                }}
              >
                Skip (reduced accuracy)
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {calibStep === "collecting" && (
          <View style={{ alignItems: "center", gap: spacing.xl ?? 32 }}>
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.muted,
              }}
            >
              <Feather name="smartphone" size={48} color={colors.foreground} />
            </View>
            <Text
              style={{
                fontSize: typography.xl ?? 20,
                fontWeight: "600",
                fontFamily: "Inter_600SemiBold",
                color: colors.foreground,
              }}
            >
              Hold steady…
            </Text>
            <View
              style={{
                width: 240,
                height: 6,
                borderRadius: 3,
                backgroundColor: colors.muted,
                overflow: "hidden",
              }}
            >
              <Animated.View
                style={{
                  height: "100%",
                  backgroundColor: "#16a34a",
                  borderRadius: 3,
                  width: calibProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                }}
              />
            </View>

            <Text
              style={{
                fontSize: typography.sm,
                fontFamily: "Inter_400Regular",
                color: colors.mutedForeground,
              }}
            >
              Measuring gravity and heading…
            </Text>
          </View>
        )}
        {calibStep === "success" && (
          <View style={{ alignItems: "center", gap: spacing.lg }}>
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: "#dcfce7",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name="check-circle" size={52} color="#16a34a" />
            </View>
            <Text
              style={{
                fontSize: typography["2xl"] ?? 24,
                fontWeight: "700",
                fontFamily: "Inter_700Bold",
                color: colors.foreground,
              }}
            >
              All set!
            </Text>
            <Text
              style={{
                fontSize: typography.sm,
                fontFamily: "Inter_400Regular",
                color: colors.mutedForeground,
                textAlign: "center",
              }}
            >
              Sensors calibrated. Starting your drive…
            </Text>
          </View>
        )}
        {calibStep === "failed" && (
          <View style={{ alignItems: "center", gap: spacing.lg }}>
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: "#fee2e2",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name="alert-circle" size={52} color="#dc2626" />
            </View>
            <Text
              style={{
                fontSize: typography["2xl"] ?? 24,
                fontWeight: "700",
                fontFamily: "Inter_700Bold",
                color: colors.foreground,
                textAlign: "center",
              }}
            >
              Calibration Failed
            </Text>
            <Text
              style={{
                fontSize: typography.sm,
                fontFamily: "Inter_400Regular",
                color: colors.mutedForeground,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              The phone may be too close to a magnet or moving. Place it flat on
              a stable surface away from speakers and try again.
            </Text>

            <TouchableOpacity
              onPress={handleRetryCalibration}
              style={{
                backgroundColor: colors.foreground,
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.xl ?? 32,
                borderRadius: radius.full ?? 999,
                width: "100%",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: typography.base,
                  fontWeight: "700",
                  fontFamily: "Inter_700Bold",
                  color: colors.background,
                }}
              >
                Try Again
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                calibRef.current = null;
                setCalibStep("done");
              }}
            >
              <Text
                style={{
                  fontSize: typography.sm,
                  fontFamily: "Inter_400Regular",
                  color: colors.mutedForeground,
                  textDecorationLine: "underline",
                }}
              >
                Skip anyway
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Top bar */}
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
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: calibStep === "done" ? "#16a34a" : "#ca8a04",
            }}
          />
          <Text
            style={{
              fontSize: typography.base,
              fontWeight: "600",
              color: colors.foreground,
              fontFamily: "Inter_600SemiBold",
            }}
          >
            {calibStep === "done" ? "Recording" : "Waiting…"}
          </Text>
        </View>
        <Text
          style={{
            fontSize: typography["2xl"],
            fontWeight: "700",
            color: colors.foreground,
            fontFamily: "Inter_700Bold",
            letterSpacing: 2,
          }}
        >
          {formatDuration(elapsed)}
        </Text>
        <TouchableOpacity onPress={handleEndDrive} disabled={ending}>
          <Text
            style={{
              fontSize: typography.sm,
              color: colors.destructive,
              fontFamily: "Inter_600SemiBold",
              fontWeight: "600",
            }}
          >
            End Drive
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.lg,
          paddingBottom: insets.bottom + 32,
          gap: spacing.md,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            alignItems: "center",
            gap: spacing.md,
            paddingVertical: spacing.md,
          }}
        >
          <ScoreRing score={score} size={160} strokeWidth={14} />
          <View style={{ width: "100%" }}>
            <Progress
              value={score}
              style={{ backgroundColor: getScoreColor(score) }}
            />
          </View>
          <Text
            style={{
              fontSize: typography.xs,
              color: colors.mutedForeground,
              fontFamily: "Inter_400Regular",
            }}
          >
            Score deducts per detected event
          </Text>
        </View>
        <Card>
          <CardHeader>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <CardTitle>Live Sensor Data</CardTitle>
              <View
                style={{
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 2,
                  borderRadius: radius.full,
                  backgroundColor:
                    calibStep === "done" && calibRef.current
                      ? "#dcfce7"
                      : "#fef9c3",
                }}
              >
                <Text
                  style={{
                    fontSize: typography.xs,
                    fontFamily: "Inter_600SemiBold",
                    fontWeight: "600",
                    color:
                      calibStep === "done" && calibRef.current
                        ? "#166534"
                        : "#854d0e",
                  }}
                >
                  {calibStep === "done" && calibRef.current
                    ? "✓ Calibrated"
                    : "Uncalibrated"}
                </Text>
              </View>
            </View>
          </CardHeader>
          <CardContent style={{ gap: spacing.sm }}>
            <Text
              style={{
                fontSize: typography.xs,
                fontWeight: "600",
                color: colors.mutedForeground,
                fontFamily: "Inter_600SemiBold",
              }}
            >
              ACCELEROMETER (m/s²)
            </Text>
            <View style={{ flexDirection: "row", gap: spacing.sm }}>
              {(["x", "y", "z"] as const).map((axis) => (
                <View
                  key={axis}
                  style={{
                    flex: 1,
                    backgroundColor: colors.muted,
                    borderRadius: radius.md,
                    padding: spacing.sm,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: typography.xs,
                      color: colors.mutedForeground,
                      fontFamily: "Inter_400Regular",
                    }}
                  >
                    {axis.toUpperCase()}
                  </Text>
                  <Text
                    style={{
                      fontSize: typography.base,
                      fontWeight: "700",
                      color: colors.foreground,
                      fontFamily: "Inter_700Bold",
                    }}
                  >
                    {accel[axis].toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            <Separator spacing={spacing.xs} />

            <Text
              style={{
                fontSize: typography.xs,
                fontWeight: "600",
                color: colors.mutedForeground,
                fontFamily: "Inter_600SemiBold",
              }}
            >
              GYROSCOPE (rad/s)
            </Text>
            <View style={{ flexDirection: "row", gap: spacing.sm }}>
              {(["x", "y", "z"] as const).map((axis) => (
                <View
                  key={axis}
                  style={{
                    flex: 1,
                    backgroundColor: colors.muted,
                    borderRadius: radius.md,
                    padding: spacing.sm,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: typography.xs,
                      color: colors.mutedForeground,
                      fontFamily: "Inter_400Regular",
                    }}
                  >
                    {axis.toUpperCase()}
                  </Text>
                  <Text
                    style={{
                      fontSize: typography.base,
                      fontWeight: "700",
                      color: colors.foreground,
                      fontFamily: "Inter_700Bold",
                    }}
                  >
                    {gyro[axis].toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            <Separator spacing={spacing.xs} />

            <Text
              style={{
                fontSize: typography.xs,
                fontWeight: "600",
                color: colors.mutedForeground,
                fontFamily: "Inter_600SemiBold",
              }}
            >
              MAGNETOMETER (μT)
            </Text>
            <View style={{ flexDirection: "row", gap: spacing.sm }}>
              {(["x", "y", "z"] as const).map((axis) => (
                <View
                  key={axis}
                  style={{
                    flex: 1,
                    backgroundColor: colors.muted,
                    borderRadius: radius.md,
                    padding: spacing.sm,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: typography.xs,
                      color: colors.mutedForeground,
                      fontFamily: "Inter_400Regular",
                    }}
                  >
                    {axis.toUpperCase()}
                  </Text>
                  <Text
                    style={{
                      fontSize: typography.base,
                      fontWeight: "700",
                      color: colors.foreground,
                      fontFamily: "Inter_700Bold",
                    }}
                  >
                    {mag[axis].toFixed(1)}
                  </Text>
                </View>
              ))}
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: colors.muted,
                borderRadius: radius.md,
                padding: spacing.sm,
                marginTop: spacing.xs,
              }}
            >
              <Text
                style={{
                  fontSize: typography.xs,
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                }}
              >
                Heading
              </Text>
              <Text
                style={{
                  fontSize: typography.base,
                  fontWeight: "700",
                  color: colors.foreground,
                  fontFamily: "Inter_700Bold",
                }}
              >
                {headingDeg}°
              </Text>
            </View>
          </CardContent>
        </Card>
        {eventCounts && (
          <Card>
            <CardHeader>
              <CardTitle>Event Counters</CardTitle>
            </CardHeader>
            <CardContent>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: spacing.sm,
                }}
              >
                {(Object.entries(eventCounts) as [string, number][]).map(
                  ([type, count]) => (
                    <View
                      key={type}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: spacing.xs,
                        backgroundColor: colors.muted,
                        paddingHorizontal: spacing.sm,
                        paddingVertical: spacing.xs,
                        borderRadius: radius.full,
                      }}
                    >
                      <Feather
                        name={
                          EVENT_ICONS[type as keyof typeof EVENT_ICONS] as any
                        }
                        size={12}
                        color={
                          count > 0
                            ? colors.destructive
                            : colors.mutedForeground
                        }
                      />
                      <Text
                        style={{
                          fontSize: typography.xs,
                          color:
                            count > 0
                              ? colors.foreground
                              : colors.mutedForeground,
                          fontFamily: "Inter_400Regular",
                        }}
                      >
                        {EVENT_LABELS[type as keyof typeof EVENT_LABELS]} ·{" "}
                        <Text
                          style={{
                            fontFamily: "Inter_600SemiBold",
                            fontWeight: "600",
                          }}
                        >
                          {count}
                        </Text>
                      </Text>
                    </View>
                  ),
                )}
              </View>
            </CardContent>
          </Card>
        )}
        {recentEvents.length > 0 ? (
          <View style={{ gap: spacing.xs }}>
            <Text
              style={{
                fontSize: typography.sm,
                fontWeight: "600",
                color: colors.foreground,
                fontFamily: "Inter_600SemiBold",
                marginBottom: spacing.xs,
              }}
            >
              Event Feed
            </Text>
            {recentEvents.map((event) => (
              <EventItem key={event.id} event={event} />
            ))}
          </View>
        ) : (
          <View
            style={{
              alignItems: "center",
              paddingVertical: spacing["2xl"],
              gap: spacing.sm,
            }}
          >
            <Feather name="check-circle" size={40} color="#16a34a" />
            <Text
              style={{
                fontSize: typography.base,
                fontWeight: "600",
                color: colors.foreground,
                fontFamily: "Inter_600SemiBold",
              }}
            >
              No events yet
            </Text>
            <Text
              style={{
                fontSize: typography.sm,
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
                textAlign: "center",
              }}
            >
              Drive safely to keep your score at 100
            </Text>
          </View>
        )}
      </ScrollView>
      {renderCalibrationOverlay()}
    </View>
  );
}
