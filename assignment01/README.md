# Mobile Authentication UI - Assignment 01

A React Native telehealth app sign-in screen built with Expo and core React Native components.

**Design Reference:** [Osler AI Telehealth - Sign In/Sign Up UI](https://dribbble.com/shots/24783022-osler-AI-Telehealth-Telemedicine-App-Sign-In-Sign-Up-UI)

## 📋 Requirements

- ✅ React Native with Expo
- ✅ Only core React Native components (no UI libraries)
- ✅ App logo, headings, email/password inputs
- ✅ Sign In button with animation
- ✅ Social login buttons (Facebook, Google, Instagram)
- ✅ Sign up and forgot password actions
- ✅ Responsive mobile layout
- ✅ Proper spacing and typography

## 🚀 Getting Started

```bash
npm install
npx expo start
```

Press `i` for iOS, `a` for Android, or scan QR code with Expo Go.

## 🛠️ Tech Stack

- React Native + TypeScript
- Expo Vector Icons (Feather, Fontisto, AntDesign, Entypo)
- expo-image
- react-native-safe-area-context

## 📁 Project Structure

```
src/app/
├── _layout.tsx      # Navigation
└── index.tsx        # Sign-in screen
```

## 🎨 Key Features

- Input fields with focus state (green border on focus)
- Password visibility toggle
- Sign In button with press animation
- Responsive design with KeyboardAvoidingView
- Primary color: #13c058 (green)
