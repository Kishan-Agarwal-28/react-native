import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { fetch } from "expo/fetch";
import { useColors } from "@/hooks/useColors";
import { useDatabase } from "@/contexts/DatabaseContext";
import { LanguageBadge } from "@/components/LanguageBadge";
import Markdown from "react-native-markdown-display";
const AI_KEY_STORE = "snippetvault_openai_key";

type Mode = "explain" | "summarize" | "improve";

const MODE_CONFIG: Record<
  Mode,
  { label: string; icon: keyof typeof Feather.glyphMap; prompt: string }
> = {
  explain: {
    label: "Explain",
    icon: "book-open",
    prompt:
      "Explain this code in clear, concise language. Cover what it does, how it works, and key concepts used. Format the response with clear sections.",
  },
  summarize: {
    label: "Summarize",
    icon: "align-left",
    prompt:
      "Provide a brief 2-3 sentence summary of what this code does and its main purpose.",
  },
  improve: {
    label: "Improve",
    icon: "trending-up",
    prompt:
      "Analyze this code and suggest specific improvements for: readability, performance, best practices, and potential bugs. Be concrete and actionable.",
  },
};

export default function AIScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSnippet } = useDatabase();
  const snippet = getSnippet(id);

  const [mode, setMode] = useState<Mode>("explain");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const topPad =
    Platform.OS === "ios" ? insets.top + 8 : Platform.OS === "web" ? 67 : 16;

  const handleGenerate = async () => {
    if (!snippet) return;

    let apiKey: string | null = null;
    try {
      apiKey = await SecureStore.getItemAsync(AI_KEY_STORE);
    } catch {}
    if (!apiKey) {
      Alert.alert(
        "No API Key",
        "Please add your OpenAI API key in Settings to use AI features.",
        [
          {
            text: "Go to Settings",
            onPress: () => router.push("/(tabs)/settings"),
          },
          { text: "Cancel", style: "cancel" },
        ],
      );
      return;
    }

    setIsLoading(true);
    setResult("");

    const systemPrompt = MODE_CONFIG[mode].prompt;
    const userMessage = `Language: ${snippet.language}\n\nCode:\n\`\`\`${snippet.language}\n${snippet.code}\n\`\`\``;

    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gemini-3.5-flash",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage },
            ],
            max_tokens: 1024,
            stream: true,
          }),
        },
      );

      if (!response.ok) {
        const error = (await response.json()) as {
          error?: { message?: string };
        };
        throw new Error(error?.error?.message ?? "API request failed");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data) as {
                choices?: Array<{ delta?: { content?: string } }>;
              };
              const content = parsed?.choices?.[0]?.delta?.content;
              if (content) {
                accumulated += content;
                setResult(accumulated);
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      Alert.alert("AI Error", message);
      setResult("");
    } finally {
      setIsLoading(false);
    }
  };

  if (!snippet) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground, padding: 24 }}>
          Snippet not found.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.navBar,
          { paddingTop: topPad, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Feather name="chevron-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.foreground }]}>
          AI Explanation
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.snippetInfo,
            {
              backgroundColor: colors.card,
              borderRadius: colors.radius,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[styles.snippetTitle, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {snippet.title}
          </Text>
          <LanguageBadge language={snippet.language} small />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          MODE
        </Text>
        <View style={styles.modeRow}>
          {(Object.keys(MODE_CONFIG) as Mode[]).map((m) => {
            const cfg = MODE_CONFIG[m];
            return (
              <TouchableOpacity
                key={m}
                onPress={() => setMode(m)}
                activeOpacity={0.7}
                style={[
                  styles.modeBtn,
                  {
                    backgroundColor:
                      mode === m ? colors.primary : colors.secondary,
                    borderColor: mode === m ? colors.primary : colors.border,
                    borderRadius: colors.radius,
                  },
                ]}
              >
                <Feather
                  name={cfg.icon}
                  size={15}
                  color={
                    mode === m ? colors.primaryForeground : colors.foreground
                  }
                />
                <Text
                  style={[
                    styles.modeBtnText,
                    {
                      color:
                        mode === m
                          ? colors.primaryForeground
                          : colors.foreground,
                    },
                  ]}
                >
                  {cfg.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          onPress={handleGenerate}
          disabled={isLoading}
          style={[
            styles.generateBtn,
            {
              backgroundColor: colors.primary,
              borderRadius: colors.radius,
              opacity: isLoading ? 0.7 : 1,
            },
          ]}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.primaryForeground} size="small" />
          ) : (
            <Feather name="zap" size={18} color={colors.primaryForeground} />
          )}
          <Text
            style={[
              styles.generateBtnText,
              { color: colors.primaryForeground },
            ]}
          >
            {isLoading
              ? "Generating..."
              : `Generate ${MODE_CONFIG[mode].label}`}
          </Text>
        </TouchableOpacity>

        {result.length > 0 && (
          <View
            style={[
              styles.resultContainer,
              {
                backgroundColor: colors.card,
                borderRadius: colors.radius,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.resultHeader,
                { borderBottomColor: colors.border },
              ]}
            >
              <Feather name="zap" size={14} color={colors.primary} />
              <Text style={[styles.resultLabel, { color: colors.primary }]}>
                AI Response
              </Text>
            </View>
            <Markdown
              style={{
                body: {
                  ...styles.resultText,
                  color: colors.foreground,
                },
                code_inline: {
                  backgroundColor: colors.secondary,
                  color: colors.codeForeground,
                  padding: 4,
                  borderRadius: 4,
                },
              }}
            >
              {result}
            </Markdown>
          </View>
        )}

        {!result && !isLoading && (
          <View
            style={[
              styles.placeholder,
              {
                backgroundColor: colors.card,
                borderRadius: colors.radius,
                borderColor: colors.border,
              },
            ]}
          >
            <Feather
              name="cpu"
              size={36}
              color={colors.mutedForeground}
              style={{ marginBottom: 8 }}
            />
            <Text
              style={[styles.placeholderTitle, { color: colors.foreground }]}
            >
              Ready to analyze
            </Text>
            <Text
              style={[styles.placeholderSub, { color: colors.mutedForeground }]}
            >
              Choose a mode above and tap Generate to get an AI-powered analysis
              of your code.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  navBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  content: { padding: 16, gap: 14 },
  snippetInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 1,
  },
  snippetTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginRight: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    marginBottom: -6,
  },
  modeRow: { flexDirection: "row", gap: 8 },
  modeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderWidth: 1,
  },
  modeBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  generateBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  resultContainer: { borderWidth: 1, overflow: "hidden" },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 10,
    borderBottomWidth: 1,
  },
  resultLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  resultText: {
    padding: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  placeholder: { alignItems: "center", padding: 32, borderWidth: 1, gap: 8 },
  placeholderTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  placeholderSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 19,
  },
});
