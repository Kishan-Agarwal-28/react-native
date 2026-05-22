import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Search from "./index";
import { View } from "react-native";
import { THEME } from "@/lib/constants";
import { useRestaurant } from "@/lib/restaurant_context";
import { useTheme } from "@/lib/theme_context";
import { ThemeToggle } from "@/components/theme-toggle";
import CartIcon from "@/components/cart-icon";
import Avatar from "@/components/avatar";
import Categories from "./categories";
import { useNavigation } from "@react-navigation/native";

const Stack = createNativeStackNavigator<SearchStackParamList>();

export const SearchLayout = () => {
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
      <Stack.Screen name="Search" component={Search} />
      <Stack.Screen name="Categories" component={Categories} />
    </Stack.Navigator>
  );
};
