import { createDrawerNavigator } from "@react-navigation/drawer";
import Profile from ".";
import DrawerContent from "./drawer-content";
import { THEME } from "@/lib/constants";
import { useTheme } from "@/lib/theme_context";
import { View } from "react-native";
import { ThemeToggle } from "@/components/theme-toggle";
import { Settings } from "./settings";
import { Help } from "./help";
import { Payment } from "../orders/payments";

type ProfileDrawerParamList = {
  Profile: undefined;
  Settings: undefined;
  Help: undefined;
  Payment: undefined;
};

const Drawer = createDrawerNavigator<ProfileDrawerParamList>();

export default function ProfileLayout() {
  const { theme } = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: THEME[theme].drawerBg,
          borderRightColor: THEME[theme].border,
          borderRightWidth: 1,
          width: 280,
        },
        headerStyle: {
          backgroundColor: THEME[theme].bg,
        },
        headerTitleStyle: {
          color: THEME[theme].text1,
          fontWeight: "bold",
        },
        headerTintColor: THEME[theme].text1,
        headerBackButtonDisplayMode: "minimal",
        headerRight: () => (
          <View style={{ flexDirection: "row", gap: 8, marginRight: 16 }}>
            <ThemeToggle />
          </View>
        ),
        headerTitle: "Discover",
      }}
    >
      <Drawer.Screen name="Profile" component={Profile} />
      <Drawer.Screen name="Settings" component={Settings} />
      <Drawer.Screen name="Help" component={Help} />
      <Drawer.Screen name="Payment" component={Payment} />
    </Drawer.Navigator>
  );
}
