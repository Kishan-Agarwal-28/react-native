import { StyleSheet, Text, View, Pressable } from "react-native";
import { NOTES } from "../lib/data";
import { Theme, useTheme } from "../lib/theme_context";
import { useMemo } from "react";
import { THEME } from "../lib/constants";
import { formatDate } from "../lib/utils";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useResponsive } from "../lib/use_responsive";

const Card = ({
  note,
  setNotes,
  onPress,
  onLongPress,
  isSelected,
  isSelectionMode,
}: {
  note: (typeof NOTES)[number];
  setNotes: React.Dispatch<React.SetStateAction<typeof NOTES>>;
  onPress: () => void;
  onLongPress: () => void;
  isSelected: boolean;
  isSelectionMode: boolean;
}) => {
  const { theme } = useTheme();
  const { fontSize, iconSize, spacing, rScale } = useResponsive();
  const styles = useMemo(
    () => createStyles({ theme, fontSize, iconSize, spacing, rScale }),
    [theme, fontSize, iconSize, spacing, rScale],
  );

  const TAGS = ["Work", "Personal", "Travel", "Other"] as const;
  type Tag = (typeof TAGS)[number];
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
  const handlePin = () => {
    if (isSelectionMode) return;
    setNotes((prev) =>
      prev.map((n) => (n.id === note.id ? { ...n, pinned: !n.pinned } : n)),
    );
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={300}
      style={({ pressed }) => [
        styles.cardOuterContainer,
        { opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View
        style={[
          styles.cardContainer,
          note.read && styles.cardDone,
          isSelected && {
            borderColor: THEME[theme].accent,
            borderWidth: 1.5,
          },
        ]}
      >
        {isSelectionMode && (
          <View
            style={[
              styles.checkbox,
              isSelected
                ? {
                    backgroundColor: THEME[theme].accent,
                    borderColor: THEME[theme].accent,
                  }
                : { borderColor: THEME[theme].text3 },
            ]}
          >
            {isSelected && <AntDesign name="check" size={11} color="#FFF" />}
          </View>
        )}

        <View
          style={[styles.cardHeader, isSelectionMode && { paddingLeft: 28 }]}
        >
          <Text style={styles.cardTitle} numberOfLines={1}>
            {note.title}
          </Text>
          <View style={styles.cardHeaderRight}>
            {note.read && (
              <AntDesign
                name="check-circle"
                size={13}
                color={THEME[theme].text3}
              />
            )}
            <Text style={styles.cardDate}>{formatDate(note.createdAt)}</Text>
            {!isSelectionMode && (
              <Pressable
                onPress={handlePin}
                hitSlop={10}
                style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
              >
                <AntDesign
                  name="pushpin"
                  size={15}
                  color={note.pinned ? THEME[theme].accent : THEME[theme].text3}
                />
              </Pressable>
            )}
          </View>
        </View>

        <Text style={styles.cardContent} numberOfLines={5} ellipsizeMode="tail">
          {note.content}
        </Text>

        <View style={styles.cardFooter}>
          <Text
            style={[
              styles.cardTag,
              {
                backgroundColor: getTagBg(note.tag as Tag),
                color: getTagColor(note.tag as Tag),
              },
            ]}
          >
            {note.tag}
          </Text>
          {note.pinned && !isSelectionMode && (
            <Text
              style={StyleSheet.compose(styles.pinnedLabel, {
                color: THEME[theme].accent,
              })}
            >
              Pinned
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default Card;

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
}) =>
  StyleSheet.create({
    cardOuterContainer: {
      paddingHorizontal: spacing.sm,
      width: "100%",
    },
    cardContainer: {
      backgroundColor: THEME[theme].cardBg,
      borderRadius: rScale(10, 10, 16),
      padding: spacing.md,
      marginVertical: rScale(6, 4, 10),
      width: "100%",
      borderWidth: 1.5,
      borderColor: "transparent",
    },
    cardDone: {
      opacity: 0.4,
    },
    checkbox: {
      position: "absolute",
      top: spacing.md,
      left: spacing.md,
      width: rScale(20, 18, 26),
      height: rScale(20, 18, 26),
      borderRadius: rScale(10, 9, 13),
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    cardHeaderIndented: {
      paddingLeft: rScale(28, 26, 36),
    },
    cardHeaderRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      flexShrink: 0,
    },
    cardTitle: {
      color: THEME[theme].text1,
      fontSize: fontSize.xl,
      fontWeight: "600",
      padding: spacing.sm + 2,
      flex: 1,
    },
    cardDate: {
      color: THEME[theme].text2,
      fontSize: fontSize.xs,
      fontWeight: "200",
    },
    cardContent: {
      color: THEME[theme].text3,
      fontSize: fontSize.md,
      padding: spacing.sm + 2,
      minHeight: rScale(80, 60, 100),
    },
    cardFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.xs,
    },
    cardTag: {
      width: rScale(80, 70, 110),
      textAlign: "center",
      paddingVertical: rScale(5, 4, 8),
      borderRadius: rScale(8, 8, 12),
      fontSize: fontSize.sm,
    },
    pinnedLabel: {
      fontSize: fontSize.xs + 1,
      fontWeight: "500",
    },
  });
