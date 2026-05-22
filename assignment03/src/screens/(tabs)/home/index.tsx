import Input from "@/components/input";
import RestaurantCard from "@/components/restaurant-card";
import { THEME } from "@/lib/constants";
import { CATEGORIES, PROMOS } from "@/lib/data";
import { useRestaurant } from "@/lib/restaurant_context";
import { useTheme } from "@/lib/theme_context";
import useStyles from "@/lib/use-styles";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  type ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
  const { theme } = useTheme();
  const { restaurants } = useRestaurant();
  const navigation =
    useNavigation<MainStackScreenProps<"Tabs">["navigation"]>();
  const HEADER_HEIGHT = 250;

  const { width } = useWindowDimensions();
  const CARD_WIDTH = width - 32;
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollYClamped = Animated.diffClamp(scrollY, 0, HEADER_HEIGHT);
  const headerTranslateY = scrollYClamped.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT],
  });
  type PromoItem = (typeof PROMOS)[number];
  const [activePromoIndex, setActivePromoIndex] = useState(0);
  const promoListRef = useRef<FlatList<PromoItem> | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activePromoIndex + 1) % PROMOS.length;
      promoListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [activePromoIndex]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const index = viewableItems[0].index;
        setActivePromoIndex(typeof index === "number" ? index : 0);
      }
    },
  ).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const styles = useStyles((theme) => ({
    outer: {
      flex: 1,
      backgroundColor: THEME[theme].bg,
    },
    headerContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      backgroundColor: THEME[theme].bg,
      paddingTop: 8,
      paddingBottom: 16,
    },
    searchWrapper: {
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    promoCard: {
      width: CARD_WIDTH,
      marginHorizontal: 16,
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      overflow: "hidden",
    },
    promoLeft: {
      flex: 1,
      gap: 6,
    },
    promoTag: {
      fontSize: 11,
      fontWeight: "600",
      letterSpacing: 1.2,
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.70)",
    },
    promoTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: "#FFFFFF",
      lineHeight: 28,
    },
    promoCode: {
      fontSize: 13,
      fontWeight: "500",
      color: "rgba(255,255,255,0.80)",
    },
    promoEmoji: {
      fontSize: 64,
      lineHeight: 72,
    },
    indicatorContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 10,
      gap: 6,
    },
    dot: {
      height: 6,
      borderRadius: 30,
      backgroundColor: THEME[theme].text3,
    },
    categoriesContainer: {
      marginTop: 16,
      gap: 8,
      marginHorizontal: 16,
    },
    categoryText: {
      color: THEME[theme].text1,
      fontSize: 12,
      fontWeight: "600",
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    categoriesItemList: {
      flexDirection: "row",
      gap: 12,
      paddingVertical: 8,
      paddingHorizontal: 12,
      alignItems: "center",
      backgroundColor: THEME[theme].pillBg,
      borderRadius: 24,
    },
    categoriesItemText: {
      color: THEME[theme].pillText,
      fontSize: 14,
    },
  }));

  return (
    <SafeAreaView style={styles.outer}>
      <Animated.View
        style={[
          styles.headerContainer,
          { transform: [{ translateY: headerTranslateY }] },
        ]}
      >
        <View style={styles.searchWrapper}>
          <Pressable
            onPress={() => {
              navigation.navigate("Tabs", { screen: "Search" });
            }}
          >
            <View pointerEvents="none">
              <Input
                placeholder="Search for restaurants and food"
                leftIcon={
                  <EvilIcons
                    name="search"
                    size={22}
                    color={THEME[theme].text3}
                  />
                }
              />
            </View>
          </Pressable>
        </View>
        <View>
          <FlatList
            ref={promoListRef}
            data={PROMOS}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            renderItem={({ item }) => (
              <View style={[styles.promoCard, { backgroundColor: item.bg }]}>
                <View style={styles.promoLeft}>
                  <Text style={styles.promoTag}>{item.tag}</Text>
                  <Text style={styles.promoTitle}>{item.title}</Text>
                  <Text style={styles.promoCode}>Use code {item.code}</Text>
                </View>
                <Text style={styles.promoEmoji}>{item.emoji}</Text>
              </View>
            )}
          />
          <View style={styles.indicatorContainer}>
            {PROMOS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: activePromoIndex === index ? 16 : 6,
                    opacity: activePromoIndex === index ? 1 : 0.4,
                    backgroundColor:
                      activePromoIndex === index
                        ? THEME[theme].accent
                        : THEME[theme].text3,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.categoriesContainer}>
          <Text style={styles.categoryText}>Categories</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToAlignment="center"
            decelerationRate="fast"
            contentContainerStyle={{
              flexDirection: "row",
              gap: 10,
              paddingVertical: 8,
              paddingHorizontal: 4,
            }}
            data={CATEGORIES}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.categoriesItemList}>
                <Text style={styles.categoriesItemText}>{item.icon}</Text>
                <Text style={styles.categoriesItemText}>{item.name}</Text>
              </View>
            )}
          />
        </View>
      </Animated.View>

      <Animated.FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT + 48 }}
        scrollIndicatorInsets={{ top: HEADER_HEIGHT }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate("Restaurant", { id: item.id })}
          >
            <RestaurantCard
              image={item.image}
              name={item.name}
              rating={item.rating}
              deliveryTime={item.deliveryTime}
              cuisines={item.cuisines}
              location={item.location}
              promo={item.promo}
            />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

export default Home;
