# Notes App UI - Assignment 02

A React Native notes app UI built with Expo and core components. This assignment focuses on list and editor layouts, theme handling, and responsive design for a realistic notes experience.

**Design Reference:** Self-designed clean notes UI

## Requirements

- React Native with Expo
- Only core React Native components (no UI libraries)
- Two UI screens (list and editor)
- Dark/light theme handling
- Responsive layout for phones and tablets

## Screens

### View 1 - Notes Listing

- FlatList-based notes grid (1-3 columns depending on screen size)
- Search input with clear icon and submit action
- Sort toggle (Newest/Oldest) with pinned items prioritized
- Note cards with title, preview, tag, pin state, and timestamp
- Long-press multi-select with toolbar actions (Done, Undone, Delete, Cancel)
- Floating add note button

### View 2 - Note Editor

- Title input and multiline body input
- Tag pills with color-coded categories
- KeyboardAvoidingView to keep inputs visible
- ImageBackground header with back button and theme toggle
- Save/Edit button with state (Edit Note, Editing..., Save Changes)

## Theme and Responsiveness

- Theme initialized using useColorScheme() and toggled via header icon
- Dynamic spacing and typography with useWindowDimensions() + useResponsive
- Max content width and multi-column layout for tablets and large tablets

## Styling Rules

- Styles defined via StyleSheet.create()
- StyleSheet.compose() for pinned label styling
- StyleSheet.flatten() for disabled input styles

## Components and Hooks Used

**Core Components**
View, Text, FlatList, TextInput, Pressable, KeyboardAvoidingView, ImageBackground, SafeAreaView, StatusBar

**Hooks**
useState, useEffect, useMemo, useColorScheme, useWindowDimensions, useSafeAreaInsets

**Custom Hooks/Context**
useTheme, useScreen, useResponsive

## Tech Stack

- React Native + TypeScript
- Expo Vector Icons (AntDesign, EvilIcons)
- expo-status-bar
- react-native-safe-area-context

## Getting Started

```bash
npm install
npx expo start
```

## Project Structure

```
src/app/
   _layout.tsx      # Navigation
   index.tsx        # Notes list + screen state
components/
   add_note.tsx     # Add note editor
   edit_note.tsx    # Edit note editor
   card.tsx         # Note card
   header.tsx       # Image header + theme toggle
lib/
   constants.ts     # Theme tokens
   data.ts          # Seed notes
   screen_context.tsx
   theme_context.tsx
   use_responsive.ts
   utils.ts         # Date formatting
assets/images/
   header.jpg
```

## Key Features

- Tag-based notes with color-coded pills
- Pin/unpin notes and pinned label
- Multi-select with batch actions (Done/Undone/Delete)
- Theme-aware colors and typography scale
- Floating action button for adding notes

## Submission

- GitHub repository: https://github.com/Kishan-Agarwal-28/react-native/tree/main/assignment02
- demo video 

https://github.com/user-attachments/assets/37adf572-3588-4417-a9d0-07b6414cffae


- Additional improvements: multi-select toolbar, pinned notes, tag pills, responsive grid
