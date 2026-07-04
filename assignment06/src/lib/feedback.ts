import { getAppSettings } from "@/lib/app-settings";
import * as Haptics from "expo-haptics";

export async function triggerSelectionHaptic(): Promise<void> {
  if (!getAppSettings().hapticsEnabled) return;
  await Haptics.selectionAsync();
}

export async function triggerLightImpact(): Promise<void> {
  if (!getAppSettings().hapticsEnabled) return;
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export async function triggerSuccessFeedback(): Promise<void> {
  if (!getAppSettings().hapticsEnabled) return;
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export async function triggerErrorFeedback(): Promise<void> {
  if (!getAppSettings().hapticsEnabled) return;
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}
