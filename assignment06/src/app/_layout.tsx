import { Toaster } from "@/components/ui/sonner";
import ThemeToggle from "@/components/ui/theme-toggle";
import View from "@/components/ui/view";
import { DatabaseProvider } from "@/db/database";
import { getAppSettings } from "@/lib/app-settings";
import { requestNotificationPermissions } from "@/lib/habit-notifications";
import { HabitsProvider } from "@/lib/habit-store";
import { ThemeProvider } from "@/lib/theme";
import { PortalHost } from "@rn-primitives/portal";
import * as Notifications from "expo-notifications";
import { router, Stack, useRootNavigationState } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound:
      getAppSettings().remindersEnabled && getAppSettings().soundEnabled,
    shouldSetBadge: false,
  }),
});

function Layout() {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="create-task" />
          <Stack.Screen
            name="[task_id]"
            options={{
              presentation: "formSheet",
              sheetGrabberVisible: true,
              sheetCornerRadius: 16,
            }}
          />
        </Stack>
        <View
          style={{
            position: "absolute",
            top: insets.top + 16,
            right: 16,
            zIndex: 999,
          }}
        >
          <ThemeToggle animate />
        </View>
      </View>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (getAppSettings().remindersEnabled) {
      requestNotificationPermissions();
    }
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("habit-reminders", {
        name: "Habit reminders",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
  }, []);

  useEffect(() => {
    if (!rootNavigationState?.key) return;

    async function checkNotification() {
      const response = await Notifications.getLastNotificationResponseAsync();
      if (!response) return;

      const data = response.notification.request.content.data;
      await Notifications.clearLastNotificationResponseAsync();

      if (data?.path) {
        router.replace({
          pathname: "/[task_id]",
          params: {
            task_id: String(data.path).replace("/", ""),
          },
        });
      }
    }

    checkNotification();
  }, [rootNavigationState?.key]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider persist={true}>
        <DatabaseProvider>
          <HabitsProvider>
            <StatusBar style="auto" animated />
            <Layout />
            <Toaster />
            <PortalHost />
          </HabitsProvider>
        </DatabaseProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
