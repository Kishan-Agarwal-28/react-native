import View from "@/components/ui/view";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback } from "react";
import { Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardTitleGroup,
} from "@/components/ui/card";
import Switch from "@/components/ui/switch";
import Text from "@/components/ui/text";

import { toast } from "@/components/ui/sonner";
import ThemeToggle from "@/components/ui/theme-toggle";
import { useDatabase } from "@/db/database";
import { getNotificationIds, replaceHabitNotifications } from "@/db/schema";
import {
  formatTimeForUI,
  setAppSetting,
  shiftTimeString,
  useAppSettings,
} from "@/lib/app-settings";
import { triggerLightImpact, triggerSelectionHaptic } from "@/lib/feedback";
import {
  cancelHabitNotifications,
  requestNotificationPermissions,
  rescheduleHabitNotifications,
} from "@/lib/habit-notifications";
import { useHabits } from "@/lib/habit-store";
import { THEME, useTheme } from "@/lib/theme";
import useStyles from "@/lib/use-styles";

// ─── SettingRow — a labelled row with a right-side control ───────────────────

type SettingRowProps = {
  icon: React.ReactNode;
  label: string;
  description?: string;
  control: React.ReactNode;
  onPress?: () => void;
};

function SettingRow({
  icon,
  label,
  description,
  control,
  onPress,
}: SettingRowProps) {
  const { theme } = useTheme();
  const t = THEME[theme];

  const inner = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingVertical: 4,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          backgroundColor: t.colors.secondary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: t.typography.sm,
            fontWeight: "500",
            color: t.colors.foreground,
          }}
        >
          {label}
        </Text>
        {description ? (
          <Text
            style={{
              fontSize: 11,
              color: t.colors.mutedForeground,
              marginTop: 2,
            }}
          >
            {description}
          </Text>
        ) : null}
      </View>
      {control}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={() => {
          triggerSelectionHaptic();
          onPress();
        }}
      >
        {inner}
      </Pressable>
    );
  }

  return inner;
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  const { theme } = useTheme();
  const t = THEME[theme];
  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: "600",
        color: t.colors.mutedForeground,
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 8,
        marginTop: 4,
        paddingHorizontal: 4,
      }}
    >
      {children}
    </Text>
  );
}

// ─── Settings ────────────────────────────────────────────────────────────────

export default function Settings() {
  const { theme } = useTheme();
  const t = THEME[theme];
  const settings = useAppSettings();
  const db = useDatabase();
  const { habits, refresh } = useHabits();

  const rescheduleAllHabits = useCallback(async () => {
    for (const habit of habits) {
      await rescheduleHabitNotifications(db, habit);
    }
    refresh();
  }, [habits, db, refresh]);

  const clearAllHabitReminders = useCallback(async () => {
    for (const habit of habits) {
      const ids = getNotificationIds(db, habit.id);
      await cancelHabitNotifications(ids);
      replaceHabitNotifications(db, habit.id, []);
    }
    refresh();
  }, [habits, db, refresh]);

  const handleRemindersToggle = useCallback(
    async (enabled: boolean) => {
      await triggerSelectionHaptic();
      setAppSetting("remindersEnabled", enabled);

      if (!enabled) {
        await clearAllHabitReminders();
        return;
      }

      const granted = await requestNotificationPermissions();
      if (!granted) {
        setAppSetting("remindersEnabled", false);
        toast.error("Notification permission denied");
        return;
      }

      await rescheduleAllHabits();
    },
    [clearAllHabitReminders, rescheduleAllHabits],
  );

  const handleQuietHoursEnabledToggle = useCallback(
    async (enabled: boolean) => {
      await triggerSelectionHaptic();
      setAppSetting("quietHoursEnabled", enabled);
      if (settings.remindersEnabled) {
        await rescheduleAllHabits();
      }
    },
    [settings.remindersEnabled, rescheduleAllHabits],
  );

  const handleSoundToggle = useCallback(
    async (enabled: boolean) => {
      await triggerSelectionHaptic();
      setAppSetting("soundEnabled", enabled);
      if (settings.remindersEnabled) {
        await rescheduleAllHabits();
      }
    },
    [settings.remindersEnabled, rescheduleAllHabits],
  );

  const handleHapticsToggle = useCallback((enabled: boolean) => {
    setAppSetting("hapticsEnabled", enabled);
  }, []);

  const adjustQuietTime = useCallback(
    async (
      field: "quietHoursStart" | "quietHoursEnd",
      deltaMinutes: number,
    ) => {
      await triggerLightImpact();
      const next = shiftTimeString(settings[field], deltaMinutes);
      setAppSetting(field, next);
      if (settings.remindersEnabled && settings.quietHoursEnabled) {
        await rescheduleAllHabits();
      }
    },
    [settings, rescheduleAllHabits],
  );

  const styles = useStyles((_, t) => ({
    body: {
      flex: 1,
      backgroundColor: t.colors.background,
    },
    scroll: {
      paddingHorizontal: 16,
      paddingBottom: 40,
      gap: 8,
    },
    pageTitle: {
      fontSize: t.typography["2xl"],
      fontWeight: "700",
      paddingHorizontal: 16,
      paddingBottom: 16,
      color: t.colors.foreground,
    },
  }));

  return (
    <SafeAreaView style={styles.body}>
      <Text style={styles.pageTitle}>Settings</Text>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Notifications ── */}
        <SectionLabel>Notifications</SectionLabel>
        <Card size="sm" style={{ marginBottom: 16 }}>
          <CardContent>
            {/* master toggle */}
            <SettingRow
              icon={
                <Ionicons
                  name="notifications-outline"
                  size={18}
                  color={t.colors.primary}
                />
              }
              label="Reminders"
              description="Allow habit reminders on this device"
              control={
                <Switch
                  value={settings.remindersEnabled}
                  onValueChange={handleRemindersToggle}
                  accessibilityLabel="Toggle reminders"
                />
              }
            />

            {/* quiet hours accordion — only meaningful when notifications are on */}
            {settings.remindersEnabled && (
              <View style={{ marginTop: 8 }}>
                <Accordion type="single" collapsible>
                  <AccordionItem value="quiet-hours">
                    <AccordionTrigger
                      style={{ paddingVertical: 10, paddingHorizontal: 0 }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 14,
                        }}
                      >
                        <View
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 8,
                            backgroundColor: t.colors.secondary,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Ionicons
                            name="moon-outline"
                            size={18}
                            color={t.colors.primary}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: t.typography.sm,
                              fontWeight: "500",
                              color: t.colors.foreground,
                            }}
                          >
                            Quiet hours
                          </Text>
                          <Text
                            style={{
                              fontSize: 11,
                              color: t.colors.mutedForeground,
                              marginTop: 2,
                            }}
                          >
                            {settings.quietHoursEnabled
                              ? `${formatTimeForUI(settings.quietHoursStart)} - ${formatTimeForUI(settings.quietHoursEnd)}`
                              : "Off"}
                          </Text>
                        </View>
                      </View>
                    </AccordionTrigger>
                    <AccordionContent>
                      <View style={{ paddingVertical: 4, gap: 14 }}>
                        {/* enable quiet hours toggle */}
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: t.typography.sm,
                              color: t.colors.foreground,
                            }}
                          >
                            Enable quiet hours
                          </Text>
                          <Switch
                            value={settings.quietHoursEnabled}
                            onValueChange={handleQuietHoursEnabledToggle}
                            accessibilityLabel="Toggle quiet hours"
                          />
                        </View>
                        {settings.quietHoursEnabled && (
                          <View style={{ gap: 8 }}>
                            <View
                              style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                backgroundColor: t.colors.background,
                                borderRadius: t.radius.md,
                                padding: 12,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: t.typography.sm,
                                  color: t.colors.mutedForeground,
                                }}
                              >
                                Start
                              </Text>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 12,
                                }}
                              >
                                <Pressable
                                  onPress={() =>
                                    adjustQuietTime("quietHoursStart", -15)
                                  }
                                >
                                  <Feather
                                    name="minus-circle"
                                    size={18}
                                    color={t.colors.primary}
                                  />
                                </Pressable>
                                <Text
                                  style={{
                                    fontSize: t.typography.sm,
                                    fontWeight: "500",
                                    color: t.colors.foreground,
                                    minWidth: 72,
                                    textAlign: "center",
                                  }}
                                >
                                  {formatTimeForUI(settings.quietHoursStart)}
                                </Text>
                                <Pressable
                                  onPress={() =>
                                    adjustQuietTime("quietHoursStart", 15)
                                  }
                                >
                                  <Feather
                                    name="plus-circle"
                                    size={18}
                                    color={t.colors.primary}
                                  />
                                </Pressable>
                              </View>
                            </View>
                            <View
                              style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                backgroundColor: t.colors.background,
                                borderRadius: t.radius.md,
                                padding: 12,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: t.typography.sm,
                                  color: t.colors.mutedForeground,
                                }}
                              >
                                End
                              </Text>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 12,
                                }}
                              >
                                <Pressable
                                  onPress={() =>
                                    adjustQuietTime("quietHoursEnd", -15)
                                  }
                                >
                                  <Feather
                                    name="minus-circle"
                                    size={18}
                                    color={t.colors.primary}
                                  />
                                </Pressable>
                                <Text
                                  style={{
                                    fontSize: t.typography.sm,
                                    fontWeight: "500",
                                    color: t.colors.foreground,
                                    minWidth: 72,
                                    textAlign: "center",
                                  }}
                                >
                                  {formatTimeForUI(settings.quietHoursEnd)}
                                </Text>
                                <Pressable
                                  onPress={() =>
                                    adjustQuietTime("quietHoursEnd", 15)
                                  }
                                >
                                  <Feather
                                    name="plus-circle"
                                    size={18}
                                    color={t.colors.primary}
                                  />
                                </Pressable>
                              </View>
                            </View>
                          </View>
                        )}
                      </View>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </View>
            )}
          </CardContent>
        </Card>

        {/* ── Sound & Haptics ── */}
        <SectionLabel>Sound & Haptics</SectionLabel>
        <Card size="sm" style={{ marginBottom: 16 }}>
          <CardContent style={{ gap: 16 }}>
            <SettingRow
              icon={
                <Ionicons
                  name="volume-medium-outline"
                  size={18}
                  color={t.colors.primary}
                />
              }
              label="Sounds"
              description="Play a sound when marking a habit done"
              control={
                <Switch
                  value={settings.soundEnabled}
                  onValueChange={handleSoundToggle}
                  accessibilityLabel="Toggle sounds"
                />
              }
            />
            <SettingRow
              icon={
                <MaterialCommunityIcons
                  name="vibrate"
                  size={18}
                  color={t.colors.primary}
                />
              }
              label="Haptics"
              description="Vibration feedback on interactions"
              control={
                <Switch
                  value={settings.hapticsEnabled}
                  onValueChange={handleHapticsToggle}
                  accessibilityLabel="Toggle haptics"
                />
              }
            />
          </CardContent>
        </Card>

        {/* ── Appearance ── */}
        <SectionLabel>Appearance</SectionLabel>
        <Card size="sm" style={{ marginBottom: 16 }}>
          <CardHeader>
            <CardTitleGroup>
              <CardTitle>Theme</CardTitle>
              <CardDescription>Coming soon</CardDescription>
            </CardTitleGroup>
            <CardAction>
              <Ionicons
                name="color-palette-outline"
                size={18}
                color={t.colors.mutedForeground}
              />
            </CardAction>
          </CardHeader>
          <CardContent>
            <ThemeToggle type="full" />
          </CardContent>
        </Card>

        {/* ── About ── */}
        <SectionLabel>About</SectionLabel>
        <Card size="sm">
          <CardContent style={{ gap: 16 }}>
            <Accordion type="single" collapsible>
              <AccordionItem value="about">
                <AccordionTrigger
                  style={{ paddingVertical: 4, paddingHorizontal: 0 }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        backgroundColor: t.colors.secondary,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons
                        name="information-circle-outline"
                        size={18}
                        color={t.colors.primary}
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: t.typography.sm,
                        fontWeight: "500",
                        color: t.colors.foreground,
                      }}
                    >
                      About Streaks
                    </Text>
                  </View>
                </AccordionTrigger>
                <AccordionContent>
                  <View style={{ gap: 8, paddingVertical: 4 }}>
                    {[
                      { label: "Version", value: "1.0.0" },
                      { label: "Built with", value: "Expo + native-ui" },
                      { label: "Assignment", value: "Mobile Dev Cohort" },
                    ].map(({ label, value }) => (
                      <View
                        key={label}
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: t.typography.sm,
                            color: t.colors.mutedForeground,
                          }}
                        >
                          {label}
                        </Text>
                        <Text
                          style={{
                            fontSize: t.typography.sm,
                            color: t.colors.foreground,
                          }}
                        >
                          {value}
                        </Text>
                      </View>
                    ))}
                  </View>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
