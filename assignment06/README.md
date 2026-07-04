# Streaks Habit Tracker

React Native / Expo app for the Mobile Development Cohort assignment. Streaks is a comprehensive habit-tracking application designed to demonstrate advanced mobile notification handling. Users can create, track, and maintain streaks for daily or weekly habits, supported by a robust architecture for both local scheduled reminders and server-side push notifications.

## Project Overview

Streaks is built with Expo Router and TypeScript. The application goes beyond basic CRUD operations by integrating a deep notification system. It handles local scheduling for recurring habit reminders, manages push notification tokens for remote nudges, dynamically routes users via deep links directly from notifications, and strictly isolates notification side-effects from UI components.

The current implementation includes:

- Habit creation with customizable emojis, daily/weekly frequencies, and specific reminder times

- Local notification scheduling that automatically reschedules on edit and cancels on deletion

- A persistent streak calculation system that rewards consistency and resets on missed days

- Push notification registration with an easily accessible Expo Push Token interface

- Unified deep-link handling that routes both local and push notification taps to the specific habit detail screen

- Reactive notification permission flows, including graceful fallbacks and system setting redirects for denied permissions

- Dedicated Android high-importance notification channels

- Local data persistence using AsyncStorage/SQLite to ensure habits and scheduled notification IDs survive app restarts

## Tech Stack

- Expo

- React Native

- TypeScript

- Expo Router

- `expo-notifications` (Local and Push Notification handling)

- `expo-device` (Device registration)

- `expo-clipboard` (Token copying)

- AsyncStorage / SQLite (Persistence)

- Zustand / React Context (State management)

## Notification Strategy

The core of Streaks revolves around understanding exactly _when_ and _how_ to use different notification types. All notification logic is abstracted away from UI components and resides in `src/lib/notifications/`.

**Notification TypePrimary Use CaseDelivery MechanismLocal Notifications**Routine, predictable habit reminders (e.g., "Drink Water at 8:00 AM").Scheduled on-device by the app. Works entirely offline.**Push Notifications**Dynamic server-side events, streak nudges, announcements, or remote reminders.Sent via Apple Push Notification service (APNs) or Firebase Cloud Messaging (FCM) through Expo's servers.

### Event Lifecycle & Scheduling

To prevent duplicate or orphaned reminders, the app meticulously manages notification IDs stored alongside the habit data.

**User ActionNotification BehaviorSave New Habit**Computes the schedule, registers local reminders via `expo-notifications`, and saves the returned IDs to the habit object.**Edit Habit**Retrieves existing notification IDs, cancels them, schedules new reminders based on updated time/frequency, and overwrites the IDs.**Delete Habit**Retrieves notification IDs for _only_ that habit and cancels them. Other habits remain unaffected.

### Deep Linking & Payload Contract

When a notification (local or push) is tapped, a unified foreground/background handler intercepts the data payload and routes the user directly to the relevant habit.

**Data Contract Example:**

JSON

```
{
  "title": "Time to drink water 💧",
  "body": "Tap to log it and keep your streak alive!",
  "data": {
    "screen": "/habit",
    "habitId": "habit_123abc"
  }
}
```

### Android Notification Channels

On Android, a custom high-importance channel is initialized immediately. **Design Note:** The Android channel must exist _before_ requesting notification permissions. Android 8.0+ requires channels to post any notifications. If the permission is granted but the channel doesn't exist, the system will silently drop the notifications. Initializing it first ensures the infrastructure is ready the moment the user taps "Allow".

## Streak Logic & Data Model

Every habit tracks a `streak` (integer) and a `lastCompletedISO` timestamp. The UI dynamically reflects the user's current progress.

**ScenarioOutcomeMarked Done (Today)**`streak` increases by 1 (or is maintained if already marked). `lastCompletedISO` updates to today.**Missed Day(s**)Detected on app launch or render. If `lastCompletedISO` is older than yesterday (for daily), `streak` resets to 0.

### Core Data Structure

TypeScript

```
type Frequency =
  | { kind: 'daily'; hour: number; minute: number }
  | { kind: 'weekly'; weekdays: number[]; hour: number; minute: number };

type Habit = {
  id: string;
  name: string;
  frequency: Frequency;
  notificationIds: string[];
  streak: number;
  lastCompletedISO: string | null;
};
```

## Navigation & Architecture

The app follows a strict modular structure, keeping UI components clean and delegating logic to custom hooks and library modules.

## How to Run Locally

Because push notifications rely on native device capabilities and external push services, **Push notifications do not work in standard Expo Go**.

1. Install dependencies:

   Bash

   ```
   npm install

   ```

2. **For Local Notification Testing (Expo Go is fine):**

   Bash

   ```
   npx expo start

   ```

   Scan the QR code with your physical device. Local scheduling, streak logic, and UI will function normally.

3. **For Push Notification Testing (EAS Development Build Required):**

   You must compile a custom development build to test push capabilities.

   Bash

   ```
   npm install -g eas-cli
   eas build --profile development --platform all

   ```

   Once installed on your device, start the dev server:

   Bash

   ```
   npx expo start --dev-client

   ```

   Navigate to the Settings tab, copy your Expo Push Token, and use the [Expo Push Notification Tool](https://expo.dev/notifications) to send a test payload simulating a server event.

## Assumptions & Error Handling

- **Permissions are volatile:** The app does not assume it has notification permissions. If denied, the app will not crash; instead, it renders a "Permission Denied" UI state in settings with a direct link to the OS system settings.

- **Background vs. Foreground:** A foreground handler is explicitly configured so that notifications appearing while the user is actively using the app still drop down from the top of the screen, rather than firing silently.

- **Timezones:** Reminders and streak reset logic rely on the device's local timezone.

- **Invalid Tokens:** If a server pushes to a device that has uninstalled the app, Expo returns a `DeviceNotRegistered` error. In a production backend, this receipt would trigger the removal of the token from the database.
---
## Demo


https://github.com/user-attachments/assets/70433546-e36a-4600-a6ff-6323930fb290

