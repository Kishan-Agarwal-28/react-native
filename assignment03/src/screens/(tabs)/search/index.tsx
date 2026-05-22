import { THEME } from "@/lib/constants";
import { useApp } from "@/lib/app_context";
import { useRestaurant } from "@/lib/restaurant_context";
import { useTheme } from "@/lib/theme_context";
import useStyles from "@/lib/use-styles";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RestaurantCard from "@/components/restaurant-card";
import { CATEGORIES } from "@/lib/data";
import { useMemo, useState, useEffect } from "react";
import Input from "@/components/input";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { CategoryCard } from "@/components/category-card";
import { useNavigation, useRoute } from "@react-navigation/native";

const SectionHeader = ({
  title,
  onSeeAll,
}: {
  title: string;
  onSeeAll?: () => void;
}) => {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
      }}
    >
      <Text
        style={{
          color: THEME[theme].text2,
          fontSize: 12,
          fontWeight: "700",
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        {title}
      </Text>
      {onSeeAll && (
        <Pressable onPress={onSeeAll} hitSlop={15}>
          <Text
            style={{
              color: THEME[theme].accent,
              fontSize: 13,
              fontWeight: "600",
            }}
          >
            See all
          </Text>
        </Pressable>
      )}
    </View>
  );
};

const Search = ({ navigation }: SearchStackScreenProps<"Search">) => {
  const { theme } = useTheme();
  const { location } = useApp();
  const { restaurants } = useRestaurant();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const route = useRoute<SearchStackScreenProps<"Search">["route"]>();
  const rootNavigation =
    useNavigation<MainStackScreenProps<"Tabs">["navigation"]>();

  const TRENDING = useMemo(() => {
    return [...restaurants].sort(() => 0.5 - Math.random()).slice(0, 3);
  }, [restaurants]);

  const NEARBY = useMemo(() => {
    return [...restaurants].sort(() => 0.5 - Math.random()).slice(3, 6);
  }, [restaurants]);

  useEffect(() => {
    if (route.params?.category) {
      setActiveCategory(route.params.category);
      setQuery("");
    }
  }, [route.params?.category]);

  const filteredRestaurants = useMemo(() => {
    const q = query.trim().toLowerCase();
    const category = activeCategory?.toLowerCase() ?? "";

    return restaurants.filter((restaurant) => {
      const matchesQuery =
        q.length === 0 ||
        restaurant.name.toLowerCase().includes(q) ||
        restaurant.cuisines.some((cuisine: string) =>
          cuisine.toLowerCase().includes(q),
        ) ||
        restaurant.location.toLowerCase().includes(q);

      const matchesCategory =
        !category ||
        category === "all" ||
        restaurant.cuisines.some(
          (cuisine: string) => cuisine.toLowerCase() === category,
        );

      return matchesQuery && matchesCategory;
    });
  }, [restaurants, query, activeCategory]);

  const locationLabel = location?.label ?? "Select location";

  const styles = useStyles((theme) => ({
    outer: {
      flex: 1,
      backgroundColor: THEME[theme].bg,
    },
    location_row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 16,
      marginBottom: 20,
    },
    location_text: {
      color: THEME[theme].text1,
      fontSize: 14,
      fontWeight: "600",
    },
    content: {
      paddingHorizontal: 16,
      gap: 28,
      paddingBottom: 32,
    },
    category_grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    category_row: {
      flexDirection: "row",
      gap: 10,
      width: "100%",
    },
    trending_list: {
      gap: 12,
    },
  }));

  return (
    <SafeAreaView style={styles.outer} edges={["top"]}>
      <Input
        placeholder="Search for restaurants and food"
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          if (text.length > 0) {
            setActiveCategory(null);
          }
        }}
        leftIcon={
          <EvilIcons name="search" size={22} color={THEME[theme].text3} />
        }
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Pressable
            style={styles.location_row}
            onPress={() => rootNavigation.getParent()?.navigate("Location")}
          >
            <EvilIcons name="location" size={20} color={THEME[theme].accent} />
            <Text style={styles.location_text}>{locationLabel}</Text>
          </Pressable>

          {(query.length > 0 || activeCategory) && (
            <View>
              <SectionHeader
                title={
                  activeCategory
                    ? `Results · ${activeCategory}`
                    : "Search Results"
                }
                onSeeAll={
                  activeCategory
                    ? () => setActiveCategory(null)
                    : query.length > 0
                      ? () => setQuery("")
                      : undefined
                }
              />
              <View style={styles.trending_list}>
                {filteredRestaurants.length === 0 ? (
                  <Text
                    style={{
                      color: THEME[theme].text2,
                      fontSize: 13,
                      paddingVertical: 8,
                    }}
                  >
                    No restaurants match your search.
                  </Text>
                ) : (
                  filteredRestaurants.map((restaurant) => (
                    <TouchableOpacity
                      key={restaurant.id}
                      activeOpacity={0.9}
                      onPress={() =>
                        rootNavigation.navigate("Restaurant", {
                          id: restaurant.id,
                        })
                      }
                    >
                      <RestaurantCard {...restaurant} />
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>
          )}

          {query.length === 0 && !activeCategory && (
            <>
              <View>
                <SectionHeader
                  title="Browse Categories"
                  onSeeAll={() => {
                    navigation.navigate("Categories");
                  }}
                />
                <View style={styles.category_grid}>
                  <View style={styles.category_row}>
                    {CATEGORIES.slice(0, 2).map((cat) => (
                      <CategoryCard
                        key={cat.id}
                        category={cat}
                        onPress={() => setActiveCategory(cat.name)}
                      />
                    ))}
                  </View>
                  <View style={styles.category_row}>
                    {CATEGORIES.slice(2, 4).map((cat) => (
                      <CategoryCard
                        key={cat.id}
                        category={cat}
                        onPress={() => setActiveCategory(cat.name)}
                      />
                    ))}
                  </View>
                </View>
              </View>
              <View>
                <SectionHeader title="Trending Now" />
                <View style={styles.trending_list}>
                  {TRENDING.map((restaurant) => (
                    <TouchableOpacity
                      key={restaurant.id}
                      activeOpacity={0.9}
                      onPress={() =>
                        rootNavigation.navigate("Restaurant", {
                          id: restaurant.id,
                        })
                      }
                    >
                      <RestaurantCard {...restaurant} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View>
                <SectionHeader title="Near You" />
                <View style={styles.trending_list}>
                  {NEARBY.map((restaurant) => (
                    <TouchableOpacity
                      key={restaurant.id}
                      activeOpacity={0.9}
                      onPress={() =>
                        rootNavigation.navigate("Restaurant", {
                          id: restaurant.id,
                        })
                      }
                    >
                      <RestaurantCard {...restaurant} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Search;
