import { Card } from "@/components/card";
import Separator from "@/components/seperator";
import Button from "@/components/button";
import { THEME } from "@/lib/constants";
import { useRestaurant } from "@/lib/restaurant_context";
import { useTheme } from "@/lib/theme_context";
import useStyles from "@/lib/use-styles";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMemo, useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type CartItem = {
  id: string;
  name: string;
  price: number;
  emoji: string;
  qty: number;
};

// ─── Quantity Control ─────────────────────────────────────────────────────────

const QtyControl = ({
  qty,
  onInc,
  onDec,
}: {
  qty: number;
  onInc: () => void;
  onDec: () => void;
}) => {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <TouchableOpacity
        onPress={onDec}
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: THEME[theme].qtyBtnBg,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <MaterialCommunityIcons
          name="minus"
          size={16}
          color={THEME[theme].qtyBtnText}
        />
      </TouchableOpacity>

      <Text
        style={{
          color: THEME[theme].text1,
          fontSize: 15,
          fontWeight: "700",
          minWidth: 16,
          textAlign: "center",
        }}
      >
        {qty}
      </Text>

      <TouchableOpacity
        onPress={onInc}
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: THEME[theme].qtyBtnBg,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <MaterialCommunityIcons
          name="plus"
          size={16}
          color={THEME[theme].qtyBtnText}
        />
      </TouchableOpacity>
    </View>
  );
};

// ─── Cart Item Row ────────────────────────────────────────────────────────────

const CartItemRow = ({
  item,
  onInc,
  onDec,
}: {
  item: CartItem;
  onInc: () => void;
  onDec: () => void;
}) => {
  const { theme } = useTheme();
  return (
    <Card
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        padding: 12,
      }}
    >
      {/* Emoji icon */}
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          backgroundColor: THEME[theme].logoBg,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
      </View>

      {/* Name + price */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: THEME[theme].text1,
            fontSize: 15,
            fontWeight: "600",
            flexWrap: "wrap",
          }}
        >
          {item.name}
        </Text>
        <Text
          style={{
            color: THEME[theme].accent,
            fontSize: 14,
            fontWeight: "700",
            marginTop: 2,
          }}
        >
          ${item.price.toFixed(2)}
        </Text>
      </View>

      {/* Qty */}
      <QtyControl qty={item.qty} onInc={onInc} onDec={onDec} />
    </Card>
  );
};

// ─── Summary Row ──────────────────────────────────────────────────────────────

const SummaryRow = ({
  label,
  value,
  isTotal,
}: {
  label: string;
  value: string;
  isTotal?: boolean;
}) => {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: isTotal ? THEME[theme].text1 : THEME[theme].text2,
          fontSize: isTotal ? 16 : 14,
          fontWeight: isTotal ? "700" : "400",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: isTotal ? THEME[theme].accent : THEME[theme].text1,
          fontSize: isTotal ? 16 : 14,
          fontWeight: isTotal ? "700" : "500",
        }}
      >
        {value}
      </Text>
    </View>
  );
};

// ─── Cart Screen ──────────────────────────────────────────────────────────────

const TAX_RATE = 0.105;

export const Cart = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { cart, activeRestaurantId, getRestaurantById, updateCartItem } =
    useRestaurant();
  const [promo, setPromo] = useState("");
  const [applied, setApplied] = useState(false);

  const restaurant = activeRestaurantId
    ? getRestaurantById(activeRestaurantId)
    : undefined;

  const items = useMemo<CartItem[]>(() => {
    if (!restaurant) {
      return [];
    }

    return restaurant.menu
      .flatMap((section) => section.items)
      .map((item) => ({
        ...item,
        qty: cart[item.id] ?? 0,
      }))
      .filter((item) => item.qty > 0);
  }, [cart, restaurant]);

  const updateQty = (id: string, delta: number) => {
    updateCartItem(id, delta);
  };

  const deliveryFee = restaurant?.deliveryFee ?? 0;
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const taxes = subtotal * TAX_RATE;
  const total = subtotal + deliveryFee + taxes;

  const styles = useStyles((theme) => ({
    outer: { flex: 1, backgroundColor: THEME[theme].bg },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: THEME[theme].cardBg,
      borderBottomWidth: 1,
      borderBottomColor: THEME[theme].border,
    },
    restaurant: { color: THEME[theme].text1, fontSize: 16, fontWeight: "700" },
    delivery_time: { color: THEME[theme].text2, fontSize: 13 },
    content: { padding: 16, gap: 12, paddingBottom: 120 },
    promo_container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: THEME[theme].cardBg,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: THEME[theme].accent + "55",
      paddingLeft: 14,
      overflow: "hidden",
    },
    promo_input: {
      flex: 1,
      height: 50,
      color: THEME[theme].text1,
      fontSize: 14,
    },
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      paddingBottom: 32,
      backgroundColor: THEME[theme].bg,
      borderTopWidth: 1,
      borderTopColor: THEME[theme].border,
    },
    empty: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
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

  if (!restaurant || items.length === 0) {
    return (
      <SafeAreaView style={styles.outer} edges={["top"]}>
        <View style={styles.empty}>
          <Text style={styles.empty_title}>Your cart is empty</Text>
          <Text style={styles.empty_body}>
            Add a few items from a restaurant to get started.
          </Text>
          <Button
            title="Browse restaurants"
            variant="default"
            onPress={() => navigation.goBack()}
            containerStyle={{ marginTop: 16, width: 200 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.outer} edges={["top"]}>
      {/* Restaurant header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={{ fontSize: 20 }}>{restaurant.emoji}</Text>
          <Text style={styles.restaurant}>{restaurant.name}</Text>
        </View>
        <Text style={styles.delivery_time}>{restaurant.deliveryTime}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Cart items */}
          {items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onInc={() => updateQty(item.id, 1)}
              onDec={() => updateQty(item.id, -1)}
            />
          ))}

          {/* Promo code */}
          <View style={styles.promo_container}>
            <MaterialCommunityIcons
              name="ticket-percent-outline"
              size={18}
              color={THEME[theme].text3}
            />
            <TextInput
              style={[styles.promo_input, { marginLeft: 8 }]}
              placeholder="Enter promo code..."
              placeholderTextColor={THEME[theme].text3}
              value={promo}
              onChangeText={setPromo}
              autoCapitalize="characters"
            />
            <Button
              title={applied ? "Applied ✓" : "Apply"}
              variant="default"
              onPress={() => setApplied(true)}
              disabled={promo.length === 0}
              containerStyle={{ width: 90 }}
              buttonStyle={{
                borderRadius: 0,
                height: 50,
                borderTopRightRadius: 12,
                borderBottomRightRadius: 12,
              }}
            />
          </View>

          {/* Order Summary */}
          <Card style={{ gap: 12 }}>
            <Text
              style={{
                color: THEME[theme].text1,
                fontSize: 16,
                fontWeight: "700",
                marginBottom: 4,
              }}
            >
              Order Summary
            </Text>
            <SummaryRow label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
            <SummaryRow label="Delivery" value={`$${deliveryFee.toFixed(2)}`} />
            <SummaryRow label="Taxes & fees" value={`$${taxes.toFixed(2)}`} />
            <Separator orientation="horizontal" spacing={4} />
            <SummaryRow label="Total" value={`$${total.toFixed(2)}`} isTotal />
          </Card>
        </View>
      </ScrollView>

      {/* Place order CTA */}
      <View style={styles.footer}>
        <Button
          title={`Place Order · $${total.toFixed(2)}`}
          variant="default"
          buttonStyle={{ height: 54, borderRadius: 16 }}
        />
      </View>
    </SafeAreaView>
  );
};
