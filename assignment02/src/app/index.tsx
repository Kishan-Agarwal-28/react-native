import {
  Text,
  View,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Theme, useTheme } from "../../lib/theme_context";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { THEME } from "../../lib/constants";
import { useEffect, useMemo, useState } from "react";
import { NOTES } from "../../lib/data";
import Card from "../../components/card";
import { SafeAreaView } from "react-native-safe-area-context";
import AddNote from "../../components/add_note";
import EditNote from "../../components/edit_note";
import { useScreen } from "../../lib/screen_context";
import Header from "../../components/header";
import { useResponsive } from "../../lib/use_responsive";
import * as ScreenOrientation from "expo-screen-orientation";
type SortOrder = "desc" | "asc";

export default function Index() {
  const { theme } = useTheme();
  const [notes, setNotes] = useState(NOTES);
  const [searchNotes, setSearchNotes] = useState(NOTES);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedNote, setSelectedNote] = useState<
    (typeof NOTES)[number] | null
  >(null);

  const { fontSize, iconSize, spacing, listColumns, maxContentWidth, rScale } =
    useResponsive();

  const styles = useMemo(
    () => createStyles({ theme, fontSize, spacing, rScale }),
    [theme, fontSize, spacing, rScale],
  );

  const { screen, setScreen } = useScreen();
  const isSelectionMode = selectedIds.length > 0;

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    if (search.trim() === "") {
      setSearchNotes(notes);
    } else {
      setSearchNotes(
        notes.filter((note) =>
          note.title.toLowerCase().includes(search.toLowerCase()),
        ),
      );
    }
  }, [notes]);

  const sortedNotes = useMemo(() => {
    return [...searchNotes].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [searchNotes, sortOrder]);

  const clearSearch = () => {
    setSearch("");
    setSearchNotes(notes);
  };

  const handleSearch = () => {
    setSearchNotes(
      notes.filter((note) =>
        note.title.toLowerCase().includes(search.toLowerCase()),
      ),
    );
  };

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  const handleLongPress = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleCardPress = (item: (typeof NOTES)[number]) => {
    if (isSelectionMode) {
      setSelectedIds((prev) =>
        prev.includes(item.id)
          ? prev.filter((i) => i !== item.id)
          : [...prev, item.id],
      );
    } else {
      setSelectedNote(item);
      setScreen((s) => ({ current: "edit", previous: s.current }));
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === sortedNotes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedNotes.map((n) => n.id));
    }
  };

  const handleCancelSelection = () => setSelectedIds([]);

  const handleDeleteSelected = () => {
    setNotes((prev) => prev.filter((n) => !selectedIds.includes(n.id)));
    setSelectedIds([]);
  };

  const handleMarkDone = () => {
    setNotes((prev) =>
      prev.map((n) => (selectedIds.includes(n.id) ? { ...n, read: true } : n)),
    );
    setSelectedIds([]);
  };

  const handleMarkUndone = () => {
    setNotes((prev) =>
      prev.map((n) => (selectedIds.includes(n.id) ? { ...n, read: false } : n)),
    );
    setSelectedIds([]);
  };

  return (
    <View style={styles.container}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Header />

      {screen.current === "list" ? (
        <SafeAreaView
          style={styles.container}
          edges={["bottom", "left", "right"]}
        >
          <View style={[styles.centredColumn, { maxWidth: maxContentWidth }]}>
            <View style={styles.searchViewContainer}>
              <View style={styles.searchView}>
                <EvilIcons
                  name="search"
                  size={iconSize.md}
                  color={THEME[theme].text1}
                />
                <TextInput
                  placeholder="Search Notes ..."
                  style={styles.searchInput}
                  placeholderTextColor={THEME[theme].text2}
                  cursorColor={THEME[theme].accent}
                  value={search}
                  onChangeText={setSearch}
                  returnKeyType="search"
                  onSubmitEditing={handleSearch}
                />
                {search.length > 0 && (
                  <EvilIcons
                    name="close"
                    size={iconSize.md}
                    color={THEME[theme].text1}
                    onPress={clearSearch}
                  />
                )}
              </View>
            </View>
            <View style={styles.listHeader}>
              {isSelectionMode ? (
                <>
                  <Text
                    style={[styles.notesLength, { color: THEME[theme].accent }]}
                  >
                    {selectedIds.length} SELECTED
                  </Text>
                  <Pressable onPress={handleSelectAll} hitSlop={10}>
                    <Text
                      style={[styles.sortLabel, { color: THEME[theme].accent }]}
                    >
                      {selectedIds.length === sortedNotes.length
                        ? "Deselect All"
                        : "Select All"}
                    </Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.notesLength}>
                    {sortedNotes.length}{" "}
                    {sortedNotes.length === 1 ? "NOTE" : "NOTES"}
                  </Text>
                  <Pressable
                    onPress={toggleSort}
                    hitSlop={10}
                    style={({ pressed }) => [
                      styles.sortBtn,
                      {
                        backgroundColor: THEME[theme].inputBg,
                        opacity: pressed ? 0.6 : 1,
                      },
                    ]}
                  >
                    <AntDesign
                      name={sortOrder === "desc" ? "down" : "up"}
                      size={12}
                      color={THEME[theme].accent}
                    />
                    <Text
                      style={[styles.sortLabel, { color: THEME[theme].accent }]}
                    >
                      {sortOrder === "desc" ? "Newest" : "Oldest"}
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
            <View style={styles.listContainer}>
              <FlatList
                data={sortedNotes}
                keyExtractor={(note) => note.id}
                numColumns={listColumns}
                key={`list-${listColumns}`}
                columnWrapperStyle={
                  listColumns > 1 ? styles.columnWrapper : undefined
                }
                renderItem={({ item }) => (
                  <View style={{ flex: 1 / listColumns }}>
                    <Card
                      note={item}
                      setNotes={setNotes}
                      onPress={() => handleCardPress(item)}
                      onLongPress={() => handleLongPress(item.id)}
                      isSelected={selectedIds.includes(item.id)}
                      isSelectionMode={isSelectionMode}
                    />
                  </View>
                )}
              />
            </View>
            {!isSelectionMode && (
              <Pressable
                style={({ pressed }) => [
                  styles.addNotesButton,
                  { transform: [{ scale: pressed ? 0.95 : 1 }] },
                ]}
                onPress={() =>
                  setScreen((s) => ({ current: "add", previous: s.current }))
                }
              >
                {({ pressed }) => (
                  <EvilIcons
                    name="plus"
                    size={iconSize.xl as number}
                    color={THEME[theme].text1}
                    style={{ opacity: pressed ? 0.6 : 1 }}
                  />
                )}
              </Pressable>
            )}
            {isSelectionMode && (
              <View
                style={[
                  styles.toolbar,
                  {
                    backgroundColor: THEME[theme].cardBg,
                    borderTopColor: THEME[theme].border,
                  },
                ]}
              >
                {[
                  {
                    icon: "check-circle",
                    label: "Done",
                    action: handleMarkDone,
                    color: THEME[theme].text1,
                  },
                  {
                    icon: "close-circle",
                    label: "Undone",
                    action: handleMarkUndone,
                    color: THEME[theme].text2,
                  },
                  {
                    icon: "delete",
                    label: "Delete",
                    action: handleDeleteSelected,
                    color: THEME[theme].accent,
                  },
                  {
                    icon: "close",
                    label: "Cancel",
                    action: handleCancelSelection,
                    color: THEME[theme].text2,
                  },
                ].map((btn) => (
                  <Pressable
                    key={btn.label}
                    onPress={btn.action}
                    style={({ pressed }) => [
                      styles.toolbarBtn,
                      { opacity: pressed ? 0.6 : 1 },
                    ]}
                  >
                    <AntDesign
                      name={btn.icon as any}
                      size={iconSize.md}
                      color={btn.color}
                    />
                    <Text style={[styles.toolbarLabel, { color: btn.color }]}>
                      {btn.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </SafeAreaView>
      ) : screen.current === "add" ? (
        <AddNote setNotes={setNotes} />
      ) : screen.current === "edit" && selectedNote ? (
        <EditNote note={selectedNote} setNotes={setNotes} />
      ) : null}
    </View>
  );
}

const createStyles = ({
  theme,
  fontSize,
  spacing,
  rScale,
}: {
  theme: Theme;
  fontSize: ReturnType<typeof useResponsive>["fontSize"];
  spacing: ReturnType<typeof useResponsive>["spacing"];
  rScale: ReturnType<typeof useResponsive>["rScale"];
}) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: THEME[theme].bg,
    },
    centredColumn: {
      flex: 1,
      width: "100%",
      alignSelf: "center",
    },
    searchViewContainer: {
      flexDirection: "row",
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.sm,
      marginBottom: spacing.xs,
    },
    searchView: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      backgroundColor: THEME[theme].keyboardBg,
      width: "100%",
      borderRadius: rScale(15, 12, 20),
      paddingHorizontal: spacing.lg,
      paddingVertical: rScale(5, 4, 8),
      marginVertical: spacing.md,
    },
    searchInput: {
      flex: 1,
      color: THEME[theme].text1,
      fontSize: fontSize.lg,
    },
    listHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.xl,
      marginBottom: spacing.sm,
    },
    notesLength: {
      color: THEME[theme].text3,
      fontSize: fontSize.sm,
      fontWeight: "500",
      letterSpacing: 0.5,
    },
    sortBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm - 2,
      paddingHorizontal: spacing.md,
      paddingVertical: rScale(5, 4, 8),
      borderRadius: rScale(20, 16, 24),
    },
    sortLabel: {
      fontSize: fontSize.sm,
      fontWeight: "500",
    },
    listContainer: {
      flex: 1,
    },
    columnWrapper: {
      justifyContent: "flex-start",
    },
    addNotesButton: {
      position: "absolute",
      bottom: rScale(60, 50, 80),
      right: rScale(30, 24, 40),
      backgroundColor: THEME[theme].accent,
      padding: spacing.md - 2,
      borderRadius: 100,
      width: rScale(65, 56, 80),
      height: rScale(65, 56, 80),
      alignItems: "center",
      justifyContent: "center",
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    toolbar: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      paddingVertical: rScale(14, 12, 18),
      paddingHorizontal: spacing.sm,
      borderTopWidth: 0.5,
    },
    toolbarBtn: {
      alignItems: "center",
      gap: spacing.xs,
      flex: 1,
    },
    toolbarLabel: {
      fontSize: fontSize.xs + 1,
      fontWeight: "500",
    },
  });
