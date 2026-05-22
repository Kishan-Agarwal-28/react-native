import Avatar from "@/components/avatar";
import Separator from "@/components/seperator";
import { THEME } from "@/lib/constants";
import { useApp } from "@/lib/app_context";
import { useTheme } from "@/lib/theme_context";
import useStyles from "@/lib/use-styles";
import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from "@react-navigation/drawer";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Text, TouchableOpacity, View } from "react-native";

type DrawerItemProps = {
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  isActive?: boolean;
  isDestructive?: boolean;
  onPress: () => void;
};

const DrawerItem = ({
  label,
  icon,
  isActive = false,
  isDestructive = false,
  onPress,
}: DrawerItemProps) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: isActive
          ? THEME[theme].drawerItemActiveBg
          : "transparent",
      }}
    >
      <MaterialCommunityIcons
        name={icon}
        size={20}
        color={
          isDestructive
            ? THEME[theme].destructive
            : isActive
              ? THEME[theme].drawerItemActiveText
              : THEME[theme].drawerItemText
        }
      />
      <Text
        style={{
          fontSize: 15,
          fontWeight: isActive ? "700" : "500",
          color: isDestructive
            ? THEME[theme].destructive
            : isActive
              ? THEME[theme].drawerItemActiveText
              : THEME[theme].drawerItemText,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const DrawerContent = (props: DrawerContentComponentProps) => {
  const { theme } = useTheme();
  const { user, signOut } = useApp();
  const { state, navigation } = props;
  const activeRoute = state.routeNames[state.index];
  const tabNavigation = navigation.getParent();

  const styles = useStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: THEME[theme].drawerBg,
    },
    user_section: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      paddingHorizontal: 16,
      paddingVertical: 24,
    },
    avatar_ring: {
      width: 56,
      height: 56,
      borderRadius: 28,
      borderWidth: 2,
      borderColor: THEME[theme].accent,
      justifyContent: "center",
      alignItems: "center",
    },
    name: {
      color: THEME[theme].text1,
      fontSize: 16,
      fontWeight: "700",
    },
    email: {
      color: THEME[theme].text2,
      fontSize: 13,
      marginTop: 2,
    },
    nav_section: {
      flex: 1,
      paddingHorizontal: 8,
      gap: 4,
    },
    footer: {
      paddingHorizontal: 8,
      paddingBottom: 32,
    },
  }));

  return (
    <DrawerContentScrollView
      {...props}
      scrollEnabled={false}
      contentContainerStyle={{ flex: 1 }}
    >
      <View style={styles.container}>
        <View style={styles.user_section}>
          <View style={styles.avatar_ring}>
            <Avatar name={user?.name ?? "Guest"} size={48} />
          </View>
          <View>
            <Text style={styles.name}>{user?.name ?? "Guest"}</Text>
            <Text style={styles.email}>{user?.email ?? "guest@food.app"}</Text>
          </View>
        </View>

        <Separator orientation="horizontal" spacing={0} />

        <View style={styles.nav_section}>
          <DrawerItem
            label="My Orders"
            icon="receipt"
            isActive={activeRoute === "Profile"}
            onPress={() => tabNavigation?.navigate("Orders")}
          />
          <DrawerItem
            label="Settings"
            icon="cog-outline"
            isActive={activeRoute === "Settings"}
            onPress={() => navigation.navigate("Settings")}
          />
          <DrawerItem
            label="Help"
            icon="help-circle-outline"
            isActive={activeRoute === "Help"}
            onPress={() => navigation.navigate("Help")}
          />
          <DrawerItem
            label="Payment"
            icon="credit-card-outline"
            isActive={activeRoute === "Payment"}
            onPress={() => navigation.navigate("Payment")}
          />
        </View>

        <View style={styles.footer}>
          <Separator orientation="horizontal" spacing={12} />
          <DrawerItem
            label="Logout"
            icon="logout"
            isDestructive
            onPress={() => {
              signOut();
              navigation.closeDrawer();
            }}
          />
        </View>
      </View>
    </DrawerContentScrollView>
  );
};

export default DrawerContent;
