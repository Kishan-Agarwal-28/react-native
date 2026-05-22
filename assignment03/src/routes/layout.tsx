import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "@/src/screens/(tabs)/home";
import { useTheme } from "@/lib/theme_context";
import { THEME } from "@/lib/constants";
import { ThemeToggle } from "@/components/theme-toggle";
import { View, Text, Pressable } from "react-native";
import EvilIcons from "@expo/vector-icons/build/EvilIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useNavigation } from "@react-navigation/native";
import CartIcon from "@/components/cart-icon";
import Avatar from "@/components/avatar";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import OrdersLayout from "@/src/screens/(tabs)/orders/layout";
import { SearchLayout } from "@/src/screens/(tabs)/search/layout";
import ProfileLayout from "@/src/screens/(tabs)/profile/layout";
import { RestaurantDetail } from "@/src/screens/restaurant/index";
import { Cart } from "@/src/screens/(tabs)/orders/cart";
import { useRestaurant } from "@/lib/restaurant_context";
import { useApp } from "@/lib/app_context";

const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  const { theme } = useTheme();
  const { cartCount } = useRestaurant();
  const { location, user } = useApp();
  const navigation =
    useNavigation<MainStackScreenProps<"Tabs">["navigation"]>();

  const locationLabel = location?.label ?? "Select location";

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: THEME[theme].bg,
          borderTopColor: THEME[theme].border,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 0,
          },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 10,
        },
        headerStyle: {
          backgroundColor: THEME[theme].bg,
          borderBottomColor: THEME[theme].border,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 0,
          },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 10,
          borderBottomWidth: 1,
        },
        tabBarActiveTintColor: THEME[theme].tabActive,
        tabBarInactiveTintColor: THEME[theme].tabInactive,
        headerTitleStyle: {
          color: THEME[theme].text1,
          fontWeight: "bold",
        },
        headerRight() {
          return (
            <View style={{ flexDirection: "row", gap: 8, marginRight: 16 }}>
              <ThemeToggle />
              <CartIcon
                count={cartCount}
                onPress={() => navigation.navigate("Cart")}
              />
              <Avatar
                name={user?.name ?? "Guest"}
                picture={user?.avatar}
                onPress={() =>
                  navigation.navigate("Tabs", { screen: "Profile" })
                }
              />
            </View>
          );
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          headerTitle() {
            const rootNavigation = navigation.getParent();
            return (
              <Pressable
                style={{
                  flexDirection: "column",
                  gap: 4,
                  alignItems: "center",
                  marginBottom: 12,
                }}
                onPress={() => {
                  (rootNavigation as any)?.navigate("Location");
                }}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <EvilIcons
                    name="location"
                    size={24}
                    color={THEME[theme].accent}
                  />
                  <Text
                    style={{
                      color: THEME[theme].text2,
                      fontSize: 12,
                    }}
                  >
                    Deliver to
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "baseline",
                    gap: 4,
                  }}
                >
                  <Text
                    style={{
                      color: THEME[theme].text1,
                      fontWeight: "bold",
                      fontSize: 16,
                    }}
                  >
                    {locationLabel}
                  </Text>
                  <AntDesign
                    name="down"
                    size={12}
                    color={THEME[theme].accent}
                  />
                </View>
              </Pressable>
            );
          },
          tabBarIcon({ color }) {
            return (
              <MaterialCommunityIcons name="home" size={24} color={color} />
            );
          },
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchLayout}
        options={{
          headerShown: false,
          tabBarIcon({ color }) {
            return (
              <MaterialCommunityIcons name="magnify" size={24} color={color} />
            );
          },
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersLayout}
        options={{
          headerShown: false,
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarIcon({ color }) {
            return (
              <MaterialCommunityIcons
                name="cart-outline"
                size={24}
                color={color}
              />
            );
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileLayout}
        options={{
          headerShown: false,
          tabBarIcon({ color }) {
            return (
              <MaterialCommunityIcons name="account" size={24} color={color} />
            );
          },
        }}
      />
    </Tab.Navigator>
  );
};

export const MainLayout = () => (
  <MainStack.Navigator screenOptions={{ headerShown: false }}>
    <MainStack.Screen name="Tabs" component={MainTabs} />
    <MainStack.Screen name="Restaurant" component={RestaurantDetail} />
    <MainStack.Screen name="Cart" component={Cart} />
  </MainStack.Navigator>
);
