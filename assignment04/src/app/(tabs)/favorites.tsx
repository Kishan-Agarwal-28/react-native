import React, { useState, useMemo } from "react";
import { FlatList, Platform, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useDatabase } from "@/contexts/DatabaseContext";
import { SnippetCard } from "@/components/SnippetCard";
import { SearchBar } from "@/components/SearchBar";
import { EmptyState } from "@/components/EmptyState";

export default function FavoritesScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { snippets, toggleFavorite } = useDatabase();
  const [query, setQuery] = useState("");

  const favorites = useMemo(() => {
    const favs = snippets.filter((s) => s.isFavorite);
    if (!query.trim()) return favs;
    const q = query.toLowerCase();
    return favs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.language.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [snippets, query]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Favorites
        </Text>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search favorites..."
        />
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SnippetCard
            snippet={item}
            onPress={() => router.push(`/snippet/${item.id}`)}
            onToggleFavorite={() => toggleFavorite(item.id)}
          />
        )}
        contentContainerStyle={[
          styles.list,
          favorites.length === 0 && styles.listEmpty,
          { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 80 },
        ]}
        ListEmptyComponent={
          <EmptyState
            icon="heart"
            title={query ? "No favorites found" : "No favorites yet"}
            subtitle={
              query
                ? "Try a different search"
                : "Star snippets to find them quickly here"
            }
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  list: { padding: 16 },
  listEmpty: { flex: 1 },
});
