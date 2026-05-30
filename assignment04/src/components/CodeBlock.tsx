import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import CodeHighlighter from "react-native-code-highlighter";
import { monokai } from "react-syntax-highlighter/dist/esm/styles/hljs";
interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const colors = useColors();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(code);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split("\n");

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.codeBackground,
          borderRadius: colors.radius,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={[styles.toolbar, { borderBottomColor: colors.border }]}>
        <View style={styles.dots}>
          <View style={[styles.dot, { backgroundColor: "#FF5F57" }]} />
          <View style={[styles.dot, { backgroundColor: "#FFBD2E" }]} />
          <View style={[styles.dot, { backgroundColor: "#28CA41" }]} />
        </View>
        <TouchableOpacity
          onPress={handleCopy}
          style={styles.copyBtn}
          activeOpacity={0.7}
        >
          <Feather
            name={copied ? "check" : "copy"}
            size={14}
            color={copied ? colors.success : colors.mutedForeground}
          />
          <Text
            style={[
              styles.copyText,
              { color: copied ? colors.success : colors.mutedForeground },
            ]}
          >
            {copied ? "Copied" : "Copy"}
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.codeContainer}>
          <View
            style={[styles.lineNumbers, { borderRightColor: colors.border }]}
          >
            {lines.map((_, i) => (
              <Text
                key={i}
                style={[styles.lineNumber, { color: colors.mutedForeground }]}
              >
                {i + 1}
              </Text>
            ))}
          </View>
          <ScrollView scrollEnabled={false}>
            <CodeHighlighter
              hljsStyle={monokai}
              containerStyle={styles.codeContainer}
              textStyle={[styles.code, { color: colors.codeForeground }]}
              language={language}
            >
              {code}
            </CodeHighlighter>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    overflow: "hidden",
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  dots: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  copyText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  codeContainer: {
    flexDirection: "row",
  },
  lineNumbers: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    alignItems: "flex-end",
    minWidth: 36,
  },
  lineNumber: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  code: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    padding: 12,
  },
});
