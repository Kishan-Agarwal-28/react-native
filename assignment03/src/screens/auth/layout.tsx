import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "./login";
import Signup from "./signup";
import { THEME } from "@/lib/constants";
import { useTheme } from "@/lib/theme_context";
import { ThemeToggle } from "@/components/theme-toggle";

const AuthLayout = createNativeStackNavigator<AuthStackParamList>();

export const AuthStack = () => {
  const { theme } = useTheme();

  return (
    <AuthLayout.Navigator
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
            <>
              <ThemeToggle />
            </>
          );
        },
      }}
    >
      <AuthLayout.Screen name="Login" component={Login} />
      <AuthLayout.Screen name="Signup" component={Signup} />
    </AuthLayout.Navigator>
  );
};
