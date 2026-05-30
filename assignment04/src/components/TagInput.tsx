import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const colors = useColors();
  const [input, setInput] = useState("");

  const addTag = () => {
    const trimmed = input.trim().toLowerCase().replace(/\s+/g, "-");
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  return (
    <View style={styles.container}>
      <View style={styles.tagsRow}>
        {tags.map((tag) => (
          <View
            key={tag}
            style={[
              styles.tag,
              { backgroundColor: colors.accent, borderRadius: 6 },
            ]}
          >
            <Text style={[styles.tagText, { color: colors.accentForeground }]}>
              #{tag}
            </Text>
            <TouchableOpacity
              onPress={() => removeTag(tag)}
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            >
              <Feather name="x" size={12} color={colors.accentForeground} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
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
            styles.input,
            { color: colors.foreground, fontFamily: "Inter_400Regular" },
          ]}
          value={input}
          onChangeText={setInput}
          placeholder="Add tag..."
          placeholderTextColor={colors.mutedForeground}
          autoCorrect={false}
          autoCapitalize="none"
          onSubmitEditing={addTag}
          returnKeyType="done"
        />
        <TouchableOpacity onPress={addTag} disabled={!input.trim()}>
          <Feather
            name="plus"
            size={18}
            color={input.trim() ? colors.primary : colors.mutedForeground}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  tagText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    gap: 8,
  },
  input: { flex: 1, fontSize: 14, padding: 0 },
});
