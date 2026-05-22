import { NavigationContainer, LinkingOptions } from "@react-navigation/native";
import { RootLayout } from "@/src/routes/root";
import { ThemeProvider } from "@/lib/theme_context";
import { AppProvider } from "@/lib/app_context";
import * as Linking from "expo-linking";
const App = () => {
  const linking = {
    prefixes: [Linking.createURL("/"), "exp://127.0.0.1:8081/--/", "foodie://"],
    config: {
      initialRouteName: "Main",
      screens: {
        Main: {
          initialRouteName: "Tabs",
          screens: {
            Tabs: {
              initialRouteName: "Home",
              screens: {
                Home: "home",
                Search: "search",
                Orders: "orders",
                Profile: "profile",
              },
            },
            Restaurant: {
              path: "restaurant/:id",
              exact: true,
            },
            Cart: "cart",
          },
        },
        Auth: {
          screens: {
            Login: "login",
            Signup: "signup",
          },
        },
      },
    },
  };

  return (
    <ThemeProvider>
      <AppProvider>
        <NavigationContainer
          linking={linking as any as LinkingOptions<RootStackParamList>}
        >
          <RootLayout />
        </NavigationContainer>
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;
