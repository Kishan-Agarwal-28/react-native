import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "@/lib/theme_context";
import { AuthStack } from "@/src/screens/auth/layout";
import { StatusBar } from "expo-status-bar";
import { OnBoardingLayout } from "@/src/screens/onboarding/layout";
import LocationPicker from "@/src/screens/location";
import { MainLayout } from "@/src/routes/layout";
import { RestaurantProvider } from "@/lib/restaurant_context";
import { useApp } from "@/lib/app_context";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootLayout = () => {
  const { theme } = useTheme();
  const { isAuthenticated, location } = useApp();
  return (
    <RestaurantProvider>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      {isAuthenticated ? (
        <Stack.Navigator
          key="auth"
          screenOptions={{ headerShown: false }}
          initialRouteName={location ? "Main" : "Location"}
        >
          <Stack.Screen name="Location" component={LocationPicker} />
          <Stack.Screen name="Main" component={MainLayout} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator
          key="guest"
          screenOptions={{ headerShown: false }}
          initialRouteName="Onboarding"
        >
          <Stack.Screen name="Onboarding" component={OnBoardingLayout} />
          <Stack.Screen name="Auth" component={AuthStack} />
        </Stack.Navigator>
      )}
    </RestaurantProvider>
  );
};
