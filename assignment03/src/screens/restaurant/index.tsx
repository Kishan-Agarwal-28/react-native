import Separator from "@/components/seperator";
import { THEME } from "@/lib/constants";
import { useRestaurant } from "@/lib/restaurant_context";
import { useTheme } from "@/lib/theme_context";
import useStyles from "@/lib/use-styles";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { type MenuItem } from "./data";

const InfoPill = ({ label }: { label: string }) => {
  return (
    <View
      style={{
        backgroundColor: "rgba(0,0,0,0.45)",
        borderRadius: 99,
        paddingHorizontal: 12,
        paddingVertical: 6,
      }}
    >
      <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
        {label}
      </Text>
    </View>
  );
};

const MenuItemRow = ({
  item,
  qty,
  onAdd,
  isLast,
}: {
  item: MenuItem;
  qty: number;
  onAdd: () => void;
  isLast: boolean;
}) => {
  const { theme } = useTheme();
  return (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 14,
          gap: 14,
        }}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            backgroundColor: THEME[theme].logoBg,
            justifyContent: "center",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
        </View>

        <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={{
              color: THEME[theme].text1,
              fontSize: 15,
              fontWeight: "700",
            }}
          >
            {item.name}
          </Text>
          <Text
            style={{
              color: THEME[theme].text2,
              fontSize: 12,
              lineHeight: 18,
            }}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        </View>

        <View style={{ alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
          <Text
            style={{
              color: THEME[theme].accent,
              fontSize: 15,
              fontWeight: "700",
            }}
          >
            ${item.price.toFixed(2)}
          </Text>
          <TouchableOpacity
            onPress={onAdd}
            activeOpacity={0.8}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              backgroundColor:
                qty > 0 ? THEME[theme].accent : THEME[theme].qtyBtnBg,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {qty > 0 ? (
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>
                {qty}
              </Text>
            ) : (
              <MaterialCommunityIcons
                name="plus"
                size={18}
                color={THEME[theme].qtyBtnText}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {!isLast && <Separator orientation="horizontal" spacing={0} />}
    </>
  );
};

export const RestaurantDetail = () => {
  const { theme } = useTheme();
  const navigation =
    useNavigation<MainStackScreenProps<"Restaurant">["navigation"]>();
  const route = useRoute<MainStackScreenProps<"Restaurant">["route"]>();
  const { getRestaurantById, cart, cartCount, addToCart } = useRestaurant();
  const restaurant = getRestaurantById(route.params.id);

  const styles = useStyles((theme) => ({
    outer: { flex: 1, backgroundColor: THEME[theme].bg },
    hero: {
      height: 220,
      backgroundColor: THEME[theme].logoBg,
      justifyContent: "space-between",
    },
    hero_top: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      paddingTop: 8,
    },
    back_btn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    back_text: {
      color: THEME[theme].accent,
      fontSize: 15,
      fontWeight: "600",
    },
    hero_title: {
      color: THEME[theme].accent,
      fontSize: 18,
      fontWeight: "700",
    },
    hero_emoji: {
      fontSize: 80,
      textAlign: "center",
    },
    pills_row: {
      flexDirection: "row",
      gap: 8,
      padding: 12,
    },
    content: {
      paddingHorizontal: 16,
      paddingBottom: 100,
    },
    description: {
      color: THEME[theme].text2,
      fontSize: 14,
      lineHeight: 22,
      paddingVertical: 16,
    },
    section_label: {
      color: THEME[theme].text2,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 4,
      marginTop: 8,
    },
    cart_bar: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      paddingBottom: 32,
      backgroundColor: THEME[theme].bg,
    },
    cart_btn: {
      backgroundColor: THEME[theme].accent,
      borderRadius: 16,
      height: 56,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
    },
    cart_badge: {
      backgroundColor: "rgba(255,255,255,0.25)",
      borderRadius: 99,
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    cart_badge_text: {
      color: "#fff",
      fontSize: 13,
      fontWeight: "700",
    },
    cart_label: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
    },
    cart_total: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "700",
    },
    empty: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    empty_title: {
      color: THEME[theme].text1,
      fontSize: 16,
      fontWeight: "700",
    },
    empty_body: {
      color: THEME[theme].text2,
      fontSize: 13,
      marginTop: 6,
      textAlign: "center",
    },
  }));

  const cartTotal = useMemo(() => {
    if (!restaurant) {
      return 0;
    }

    return restaurant.menu
      .flatMap((section) => section.items)
      .reduce((sum, item) => sum + (cart[item.id] ?? 0) * item.price, 0);
  }, [cart, restaurant]);

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.outer} edges={["top"]}>
        <View style={styles.empty}>
          <Text style={styles.empty_title}>Restaurant not found</Text>
          <Text style={styles.empty_body}>
            Try going back and selecting a different restaurant.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginTop: 12 }}
          >
            <Text style={{ color: THEME[theme].accent, fontWeight: "600" }}>
              Go back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.outer} edges={["top"]}>
      <View style={styles.hero}>
        <View style={styles.hero_top}>
          <TouchableOpacity
            style={styles.back_btn}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={22}
              color={THEME[theme].accent}
            />
            <Text style={styles.back_text}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.hero_title}>{restaurant.name}</Text>
          <View style={{ width: 60 }} />
        </View>

        <Text style={styles.hero_emoji}>{restaurant.emoji}</Text>

        <View style={styles.pills_row}>
          <InfoPill label={`\u2B50 ${restaurant.rating}`} />
          <InfoPill label={restaurant.deliveryTime} />
          <InfoPill label={`$${restaurant.deliveryFee.toFixed(2)}`} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.description}>{restaurant.description}</Text>

          {restaurant.menu.map((section) => (
            <View key={section.id}>
              <Text style={styles.section_label}>{section.title}</Text>
              {section.items.map((item, i) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  qty={cart[item.id] ?? 0}
                  onAdd={() => addToCart(restaurant.id, item.id)}
                  isLast={i === section.items.length - 1}
                />
              ))}
              <Separator orientation="horizontal" spacing={8} />
            </View>
          ))}
        </View>
      </ScrollView>

      {cartCount > 0 && (
        <View style={styles.cart_bar}>
          <TouchableOpacity
            style={styles.cart_btn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("Cart")}
          >
            <View style={styles.cart_badge}>
              <Text style={styles.cart_badge_text}>{cartCount} items</Text>
            </View>
            <Text style={styles.cart_label}>View Cart</Text>
            <Text style={styles.cart_total}>${cartTotal.toFixed(2)}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};
