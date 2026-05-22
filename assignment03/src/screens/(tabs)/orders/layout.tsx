import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Orders } from ".";
import { Cart } from "./cart";
import { Payment } from "./payments";
import { THEME } from "@/lib/constants";
import { useTheme } from "@/lib/theme_context";
import { ThemeToggle } from "@/components/theme-toggle";
import { View } from "react-native";
import CartIcon from "@/components/cart-icon";
import { useRestaurant } from "@/lib/restaurant_context";
import Avatar from "@/components/avatar";
import { useNavigation } from "@react-navigation/native";

const Stack = createNativeStackNavigator();

export default function OrdersLayout() {
  const { theme } = useTheme();
  const { cartCount } = useRestaurant();
  const navigation =
    useNavigation<MainStackScreenProps<"Tabs">["navigation"]>();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: THEME[theme].bg,
        },
        headerTitleStyle: {
          color: THEME[theme].text1,
          fontWeight: "bold",
        },
        headerTintColor: THEME[theme].text1,
        headerBackButtonDisplayMode: "minimal",
        headerRight() {
          return (
            <View style={{ flexDirection: "row", gap: 8, marginRight: 16 }}>
              <ThemeToggle />
              <CartIcon
                count={cartCount}
                onPress={() => navigation.navigate("Cart")}
              />
              <Avatar name={"user"} picture={"https://picsum.photos/200"} />
            </View>
          );
        },
        headerTitle: "Discover",
      }}
    >
      <Stack.Screen
        name="Orders"
        component={Orders}
        options={{
          headerTitle: "My Orders",
        }}
      />
      <Stack.Screen
        name="Cart"
        component={Cart}
        options={{
          headerTitle: "My Cart",
        }}
      />
      <Stack.Screen name="Payment" component={Payment} />
    </Stack.Navigator>
  );
}
