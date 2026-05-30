import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useDatabase } from "@/contexts/DatabaseContext";
import { TagInput } from "@/components/TagInput";

const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "rust",
  "go",
  "java",
  "kotlin",
  "swift",
  "cpp",
  "c",
  "csharp",
  "ruby",
  "php",
  "html",
  "css",
  "bash",
  "sql",
  "json",
  "yaml",
  "markdown",
  "plaintext",
];

export default function CreateSnippetScreen() {
  const colors = useColors();
  const router = useRouter();
  const { createSnippet } = useDatabase();

  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [tags, setTags] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isValid = title.trim().length > 0 && code.trim().length > 0;

  const handleSave = async () => {
    if (!isValid) {
      Alert.alert("Required", "Title and code are required.");
      return;
    }
    setIsSaving(true);
    try {
      await createSnippet({
        title: title.trim(),
        code,
        language,
        tags,
        isFavorite,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Alert.alert("Error", "Failed to save snippet.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.navBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Feather name="x" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.foreground }]}>
          New Snippet
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!isValid || isSaving}
          style={[
            styles.saveBtn,
            {
              backgroundColor: isValid ? colors.primary : colors.muted,
              borderRadius: colors.radius,
            },
          ]}
        >
          <Text
            style={[
              styles.saveBtnText,
              {
                color: isValid
                  ? colors.primaryForeground
                  : colors.mutedForeground,
              },
            ]}
          >
            {isSaving ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.form}
          showsVerticalScrollIndicator={false}
        >
          <FieldLabel label="Title *" colors={colors} />
          <TextInput
            style={[
              styles.textInput,
              {
                color: colors.foreground,
                borderColor: colors.border,
                backgroundColor: colors.secondary,
                borderRadius: colors.radius,
                fontFamily: "Inter_400Regular",
              },
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Debounce hook"
            placeholderTextColor={colors.mutedForeground}
            autoFocus
          />

          <FieldLabel label="Language" colors={colors} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.langScroll}
            contentContainerStyle={styles.langRow}
          >
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang}
                onPress={() => setLanguage(lang)}
                style={[
                  styles.langChip,
                  {
                    backgroundColor:
                      language === lang ? colors.primary : colors.secondary,
                    borderColor:
                      language === lang ? colors.primary : colors.border,
                    borderRadius: 20,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.langText,
                    {
                      color:
                        language === lang
                          ? colors.primaryForeground
                          : colors.foreground,
                    },
                  ]}
                >
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FieldLabel label="Code *" colors={colors} />
          <TextInput
            style={[
              styles.codeInput,
              {
                color: colors.codeForeground,
                borderColor: colors.border,
                backgroundColor: colors.codeBackground,
                borderRadius: colors.radius,
                fontFamily: "Inter_400Regular",
              },
            ]}
            value={code}
            onChangeText={setCode}
            placeholder={"// Paste your code here"}
            placeholderTextColor={colors.mutedForeground}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            textAlignVertical="top"
          />

          <FieldLabel label="Tags" colors={colors} />
          <TagInput tags={tags} onChange={setTags} />

          <TouchableOpacity
            onPress={() => {
              setIsFavorite(!isFavorite);
              Haptics.selectionAsync();
            }}
            style={[
              styles.favoriteRow,
              {
                borderColor: colors.border,
                backgroundColor: colors.card,
                borderRadius: colors.radius,
              },
            ]}
          >
            <Feather
              name="heart"
              size={18}
              color={isFavorite ? colors.destructive : colors.mutedForeground}
            />
            <Text style={[styles.favoriteText, { color: colors.foreground }]}>
              Mark as favorite
            </Text>
            <View
              style={[
                styles.toggle,
                {
                  backgroundColor: isFavorite ? colors.primary : colors.muted,
                  borderRadius: 12,
                },
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  {
                    backgroundColor: colors.primaryForeground,
                    transform: [{ translateX: isFavorite ? 14 : 0 }],
                  },
                ]}
              />
            </View>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function FieldLabel({ label, colors }: { label: string; colors: any }) {
  return (
    <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    paddingTop: Platform.OS === "ios" ? 60 : 12,
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8 },
  saveBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  form: { padding: 16, gap: 8, paddingBottom: 60 },
  fieldLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
    marginTop: 8,
  },
  textInput: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  langScroll: { marginHorizontal: -16 },
  langRow: { paddingHorizontal: 16, gap: 8, paddingVertical: 4 },
  langChip: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
  langText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  codeInput: {
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    minHeight: 180,
    lineHeight: 20,
  },
  favoriteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderWidth: 1,
    marginTop: 8,
  },
  favoriteText: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  toggle: { width: 36, height: 22, padding: 2 },
  toggleThumb: { width: 18, height: 18, borderRadius: 9 },
});
