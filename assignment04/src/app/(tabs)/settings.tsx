import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/contexts/ThemeContext";

const AI_KEY_STORE = "snippetvault_openai_key";

type ThemeOption = "system" | "light" | "dark";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { themeMode, setThemeMode } = useTheme();
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    SecureStore.getItemAsync(AI_KEY_STORE)
      .then((val) => {
        if (val) {
          setApiKey(val);
          setKeySaved(true);
        }
      })
      .catch(() => {});
  }, []);

  const saveApiKey = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      Alert.alert("Error", "Please enter an API key");
      return;
    }
    try {
      await SecureStore.setItemAsync(AI_KEY_STORE, trimmed);
    } catch {
      /* web fallback – key used in-memory */
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setKeySaved(true);
    Alert.alert("Saved", "API key saved securely");
  };

  const clearApiKey = async () => {
    Alert.alert("Clear API Key", "Remove your stored API key?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          try {
            await SecureStore.deleteItemAsync(AI_KEY_STORE);
          } catch {}
          setApiKey("");
          setKeySaved(false);
        },
      },
    ]);
  };

  const themeOptions: {
    value: ThemeOption;
    label: string;
    icon: keyof typeof Feather.glyphMap;
  }[] = [
    { value: "system", label: "System", icon: "monitor" },
    { value: "light", label: "Light", icon: "sun" },
    { value: "dark", label: "Dark", icon: "moon" },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: topPad + 12,
        paddingBottom: bottomPad + 80,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerPad}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Settings
        </Text>
      </View>

      <Section title="Appearance" colors={colors}>
        <View style={styles.themeOptions}>
          {themeOptions.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={async () => {
                await setThemeMode(opt.value);
                Haptics.selectionAsync();
              }}
              activeOpacity={0.7}
              style={[
                styles.themeOption,
                {
                  backgroundColor:
                    themeMode === opt.value ? colors.primary : colors.secondary,
                  borderRadius: colors.radius,
                  borderColor:
                    themeMode === opt.value ? colors.primary : colors.border,
                },
              ]}
            >
              <Feather
                name={opt.icon}
                size={16}
                color={
                  themeMode === opt.value
                    ? colors.primaryForeground
                    : colors.foreground
                }
              />
              <Text
                style={[
                  styles.themeLabel,
                  {
                    color:
                      themeMode === opt.value
                        ? colors.primaryForeground
                        : colors.foreground,
                  },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Section>

      <Section title="AI Integration" colors={colors}>
        <Text style={[styles.description, { color: colors.mutedForeground }]}>
          Enter your GEMINI API key to enable AI-powered code explanations. Your
          key is stored securely on-device using SecureStore.
        </Text>
        <View
          style={[
            styles.inputRow,
            {
              borderColor: colors.border,
              backgroundColor: colors.secondary,
              borderRadius: colors.radius,
            },
          ]}
        >
          <TextInput
            style={[
              styles.keyInput,
              { color: colors.foreground, fontFamily: "Inter_400Regular" },
            ]}
            value={apiKey}
            onChangeText={(t) => {
              setApiKey(t);
              setKeySaved(false);
            }}
            placeholder="sk-..."
            placeholderTextColor={colors.mutedForeground}
            secureTextEntry={!showKey}
            autoCorrect={false}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowKey(!showKey)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather
              name={showKey ? "eye-off" : "eye"}
              size={16}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.keyActions}>
          <TouchableOpacity
            onPress={saveApiKey}
            style={[
              styles.saveBtn,
              { backgroundColor: colors.primary, borderRadius: colors.radius },
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.saveBtnText, { color: colors.primaryForeground }]}
            >
              {keySaved ? "Update Key" : "Save Key"}
            </Text>
          </TouchableOpacity>
          {keySaved && (
            <TouchableOpacity
              onPress={clearApiKey}
              style={[
                styles.clearBtn,
                { borderRadius: colors.radius, borderColor: colors.border },
              ]}
            >
              <Text
                style={[styles.clearBtnText, { color: colors.destructive }]}
              >
                Clear
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {keySaved && (
          <View
            style={[
              styles.savedBadge,
              { backgroundColor: colors.successBackground, borderRadius: 6 },
            ]}
          >
            <Feather name="shield" size={14} color={colors.success} />
            <Text style={[styles.savedText, { color: colors.success }]}>
              API key saved securely
            </Text>
          </View>
        )}
      </Section>

      <Section title="Storage" colors={colors}>
        <SettingRow
          icon="database"
          label="Snippets Database"
          value="SQLite (local)"
          colors={colors}
        />
        <SettingRow
          icon="hard-drive"
          label="File Storage"
          value="Expo FileSystem"
          colors={colors}
        />
        <SettingRow
          icon="lock"
          label="Secrets"
          value="SecureStore"
          colors={colors}
        />
        <SettingRow
          icon="sliders"
          label="Preferences"
          value="AsyncStorage"
          colors={colors}
        />
      </Section>

      <Section title="About" colors={colors}>
        <SettingRow
          icon="code"
          label="SnippetVault"
          value="v1.0.0"
          colors={colors}
        />
        <SettingRow
          icon="wifi-off"
          label="Mode"
          value="Offline-first"
          colors={colors}
        />
      </Section>
    </ScrollView>
  );
}

function Section({
  title,
  children,
  colors,
}: {
  title: string;
  children: React.ReactNode;
  colors: any;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
        {title.toUpperCase()}
      </Text>
      <View
        style={[
          styles.sectionBody,
          {
            backgroundColor: colors.card,
            borderRadius: colors.radius,
            borderColor: colors.border,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  value,
  colors,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  colors: any;
}) {
  return (
    <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
      <View style={styles.settingLeft}>
        <Feather name={icon} size={16} color={colors.mutedForeground} />
        <Text style={[styles.settingLabel, { color: colors.foreground }]}>
          {label}
        </Text>
      </View>
      <Text style={[styles.settingValue, { color: colors.mutedForeground }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerPad: { paddingHorizontal: 16, marginBottom: 8 },
  headerTitle: { fontSize: 28, fontFamily: "Inter_700Bold" },
  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  sectionBody: { borderWidth: 1, overflow: "hidden", padding: 16, gap: 12 },
  themeOptions: { flexDirection: "row", gap: 8 },
  themeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderWidth: 1,
  },
  themeLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  description: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    gap: 8,
  },
  keyInput: { flex: 1, fontSize: 14, padding: 0 },
  keyActions: { flexDirection: "row", gap: 8 },
  saveBtn: { flex: 1, paddingVertical: 12, alignItems: "center" },
  saveBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  clearBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  clearBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  savedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 10,
  },
  savedText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  settingLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  settingValue: { fontSize: 13, fontFamily: "Inter_400Regular" },
});
