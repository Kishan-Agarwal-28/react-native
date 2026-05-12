import AntDesign from "@expo/vector-icons/AntDesign";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { THEME } from "../lib/constants";
import { NOTES } from "../lib/data";
import { useScreen } from "../lib/screen_context";
import { Theme, useTheme } from "../lib/theme_context";
import { useResponsive } from "../lib/use_responsive";

const TAGS = ["Work", "Personal", "Travel", "Other"] as const;
type Tag = (typeof TAGS)[number];

const EditNote = ({
  note,
  setNotes,
}: {
  note: (typeof NOTES)[number];
  setNotes: React.Dispatch<React.SetStateAction<typeof NOTES>>;
}) => {
  const { theme } = useTheme();
  const { fontSize, iconSize, spacing, maxContentWidth, rScale } =
    useResponsive();
  const styles = useMemo(
    () => createStyles({ theme, fontSize, iconSize, spacing, rScale }),
    [theme, fontSize, iconSize, spacing, rScale],
  );
  const { setScreen } = useScreen();

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [selectedTag, setSelectedTag] = useState<Tag>(note.tag as Tag);

  const hasChanged =
    title.trim() !== note.title ||
    content.trim() !== note.content ||
    selectedTag !== note.tag;

  const handleTagPress = (tag: Tag) => {
    if (!isEditing) return;
    setSelectedTag(tag);
  };

  const getTagBg = (tag: Tag) => {
    if (tag === "Work") return THEME[theme].tagWorkBg;
    if (tag === "Personal") return THEME[theme].tagPersonalBg;
    if (tag === "Travel") return THEME[theme].tagTravelBg;
    return THEME[theme].tagOtherBg;
  };

  const getTagColor = (tag: Tag) => {
    if (tag === "Work") return THEME[theme].tagWork;
    if (tag === "Personal") return THEME[theme].tagPersonal;
    if (tag === "Travel") return THEME[theme].tagTravel;
    return THEME[theme].tagOther;
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === note.id
          ? {
              ...n,
              title: title.trim(),
              content: content.trim(),
              tag: selectedTag,
            }
          : n,
      ),
    );
    setIsEditing(false);
    setScreen((s) => ({ current: "list", previous: s.current }));
  };

  const handleEditPress = () => {
    if (isEditing && hasChanged) {
      handleSave();
    } else {
      setIsEditing(true);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={[styles.innerColumn, { maxWidth: maxContentWidth }]}>
        <View style={styles.titleContainer}>
          <TextInput
            placeholder="Enter Title ..."
            style={StyleSheet.flatten([
              styles.titleInput,
              !isEditing && styles.inputDisabled,
            ])}
            placeholderTextColor={THEME[theme].text2}
            cursorColor={THEME[theme].accent}
            value={title}
            onChangeText={setTitle}
            editable={isEditing}
          />
        </View>

        <View style={styles.tagContainer}>
          {TAGS.map((tag) => (
            <Pressable
              key={tag}
              onPress={() => handleTagPress(tag)}
              style={({ pressed }) => [
                styles.tagPill,
                {
                  backgroundColor: getTagBg(tag),
                  borderWidth: selectedTag === tag ? 1.5 : 0,
                  borderColor:
                    selectedTag === tag ? getTagColor(tag) : "transparent",
                  transform: [{ scale: pressed && isEditing ? 0.95 : 1 }],
                  opacity: !isEditing && selectedTag !== tag ? 0.4 : 1,
                },
              ]}
            >
              <Text style={[styles.tagText, { color: getTagColor(tag) }]}>
                {tag}
              </Text>
              {selectedTag === tag && isEditing && (
                <Pressable
                  hitSlop={8}
                  onPress={() => setSelectedTag("Other")}
                  style={[
                    styles.closeBtn,
                    { backgroundColor: getTagColor(tag) },
                  ]}
                >
                  <AntDesign
                    name="close"
                    size={iconSize.sm - 2}
                    color={THEME[theme].text4}
                  />
                </Pressable>
              )}
            </Pressable>
          ))}
        </View>

        <TextInput
          cursorColor={THEME[theme].accent}
          multiline
          scrollEnabled
          placeholder="Start writing..."
          placeholderTextColor={THEME[theme].text3}
          style={StyleSheet.flatten([
            styles.bodyInput,
            !isEditing && styles.inputDisabled,
          ])}
          value={content}
          onChangeText={setContent}
          editable={isEditing}
        />

        <View style={styles.footer}>
          {!isEditing && (
            <Text style={[styles.hintText, { color: THEME[theme].text3 }]}>
              Tap Edit to make changes
            </Text>
          )}
          <Pressable
            onPress={handleEditPress}
            style={({ pressed }) => [
              styles.saveButton,
              {
                backgroundColor:
                  isEditing && hasChanged
                    ? THEME[theme].accent
                    : isEditing
                      ? THEME[theme].inputBg
                      : THEME[theme].accent,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.saveButtonText,
                {
                  color:
                    isEditing && !hasChanged ? THEME[theme].text2 : "#FFFFFF",
                },
              ]}
            >
              {isEditing && hasChanged
                ? "Save Changes"
                : isEditing
                  ? "Editing..."
                  : "Edit Note"}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default EditNote;

const createStyles = ({
  theme,
  fontSize,
  iconSize,
  spacing,
  rScale,
}: {
  theme: Theme;
  fontSize: ReturnType<typeof useResponsive>["fontSize"];
  iconSize: ReturnType<typeof useResponsive>["iconSize"];
  spacing: ReturnType<typeof useResponsive>["spacing"];
  rScale: ReturnType<typeof useResponsive>["rScale"];
}) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: THEME[theme].bg,
      alignItems: "center",
    },
    innerColumn: {
      flex: 1,
      width: "100%",
    },
    titleContainer: {},
    titleInput: {
      color: THEME[theme].text1,
      fontSize: fontSize.xl,
      fontWeight: "600",
      paddingHorizontal: spacing.lg,
      paddingVertical: rScale(15, 12, 20),
      borderBottomWidth: 0.5,
      borderBottomColor: THEME[theme].border,
    },
    inputDisabled: {
      opacity: 0.6,
    },
    tagContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 0.5,
      borderBottomColor: THEME[theme].border,
    },
    tagPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm - 2,
      paddingVertical: rScale(5, 4, 8),
      paddingHorizontal: rScale(11, 10, 16),
      borderRadius: rScale(20, 16, 26),
    },
    tagText: {
      fontSize: fontSize.md - 1,
      fontWeight: "500",
    },
    closeBtn: {
      width: rScale(16, 14, 22),
      height: rScale(16, 14, 22),
      borderRadius: rScale(8, 7, 11),
      alignItems: "center",
      justifyContent: "center",
    },
    bodyInput: {
      flex: 1,
      color: THEME[theme].text1,
      fontSize: fontSize.lg,
      lineHeight: rScale(24, 22, 32),
      paddingHorizontal: spacing.lg,
      paddingTop: rScale(14, 12, 18),
      textAlignVertical: "top",
    },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingVertical: rScale(14, 12, 20),
      gap: spacing.sm,
      borderTopWidth: 0.5,
      borderTopColor: THEME[theme].border,
      backgroundColor: THEME[theme].bg,
    },
    hintText: {
      fontSize: fontSize.sm,
      textAlign: "center",
    },
    saveButton: {
      borderRadius: rScale(14, 12, 18),
      paddingVertical: rScale(14, 12, 18),
      alignItems: "center",
    },
    saveButtonText: {
      fontSize: fontSize.lg,
      fontWeight: "700",
    },
  });
};
