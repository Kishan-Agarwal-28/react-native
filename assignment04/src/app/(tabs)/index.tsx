import React, { useState, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useDatabase } from "@/contexts/DatabaseContext";
import { SnippetCard } from "@/components/SnippetCard";
import { SearchBar } from "@/components/SearchBar";
import { EmptyState } from "@/components/EmptyState";

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { snippets, isLoading, toggleFavorite, searchSnippets } = useDatabase();
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => searchSnippets(query),
    [query, searchSnippets],
  );

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
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Snippets
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/snippet/create")}
            style={[
              styles.addBtn,
              { backgroundColor: colors.primary, borderRadius: colors.radius },
            ]}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={18} color={colors.primaryForeground} />
          </TouchableOpacity>
        </View>
        <SearchBar value={query} onChangeText={setQuery} />
        <Text style={[styles.countText, { color: colors.mutedForeground }]}>
          {filtered.length} {filtered.length === 1 ? "snippet" : "snippets"}
          {query ? ` for "${query}"` : ""}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
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
            filtered.length === 0 && styles.listEmpty,
            {
              paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 80,
            },
          ]}
          ListEmptyComponent={
            <EmptyState
              icon="code"
              title={query ? "No snippets found" : "No snippets yet"}
              subtitle={
                query
                  ? "Try a different search term"
                  : "Tap + to create your first code snippet"
              }
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
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
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  addBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  list: { padding: 16 },
  listEmpty: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
