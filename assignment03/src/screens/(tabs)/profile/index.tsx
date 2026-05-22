import Avatar from "@/components/avatar";
import Button from "@/components/button";
import { Card, CardContent } from "@/components/card";
import Separator from "@/components/seperator";
import { THEME } from "@/lib/constants";
import { useApp } from "@/lib/app_context";
import { useTheme } from "@/lib/theme_context";
import useStyles from "@/lib/use-styles";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

type MenuItemProps = {
  title: string;
  description: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  onPress: () => void;
  variant?: "default" | "destructive";
};

const StatItem = ({ value, label }: { value: string; label: string }) => {
  const { theme } = useTheme();
  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <Text
        style={{
          color: THEME[theme].accent,
          fontSize: 22,
          fontWeight: "700",
        }}
      >
        {value}
      </Text>
      <Text style={{ color: THEME[theme].text2, fontSize: 12, marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
};

const MenuItem = ({
  title,
  description,
  icon,
  onPress,
  variant = "default",
}: MenuItemProps) => {
  const { theme } = useTheme();
  const isDestructive = variant === "destructive";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        gap: 14,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: isDestructive
            ? THEME[theme].destructiveBg
            : THEME[theme].accentBg,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={isDestructive ? THEME[theme].destructive : THEME[theme].accent}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: isDestructive
              ? THEME[theme].destructive
              : THEME[theme].text1,
            fontSize: 15,
            fontWeight: "600",
          }}
        >
          {title}
        </Text>
        <Text style={{ color: THEME[theme].text2, fontSize: 12, marginTop: 1 }}>
          {description}
        </Text>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={18}
        color={THEME[theme].text3}
      />
    </TouchableOpacity>
  );
};

const Profile = () => {
  const { theme } = useTheme();
  const { user, signOut } = useApp();
  const navigation = useNavigation<any>();
  const rootNavigation = navigation.getParent()?.getParent();

  const styles = useStyles((theme) => ({
    outer: {
      flex: 1,
      backgroundColor: THEME[theme].bg,
    },
    content: {
      paddingHorizontal: 16,
      gap: 16,
      paddingBottom: 32,
    },
    avatar_ring: {
      width: 88,
      height: 88,
      borderRadius: 44,
      borderWidth: 2.5,
      borderColor: THEME[theme].accent,
      justifyContent: "center",
      alignItems: "center",
    },
    profile_card_inner: {
      alignItems: "center",
      gap: 4,
    },
    name: {
      color: THEME[theme].text1,
      fontSize: 20,
      fontWeight: "700",
      marginTop: 8,
    },
    email: {
      color: THEME[theme].text2,
      fontSize: 13,
    },
    stats_row: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 4,
    },
    stat_divider: {
      width: 1,
      height: 32,
      backgroundColor: THEME[theme].border,
    },
  }));

  return (
    <SafeAreaView style={styles.outer} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Card>
            <CardContent style={{ alignItems: "center", gap: 0 }}>
              <View style={styles.avatar_ring}>
                <Avatar name={user?.name ?? "Guest"} size={76} />
              </View>

              <Text style={styles.name}>{user?.name ?? "Guest"}</Text>
              <Text style={styles.email}>
                {user?.email ?? "guest@food.app"}
              </Text>

              <Separator
                orientation="horizontal"
                spacing={16}
                style={{ width: "100%" }}
              />

              <View style={styles.stats_row}>
                <StatItem value={`${user?.orders ?? 0}`} label="Orders" />
                <View style={styles.stat_divider} />
                <StatItem value={`${user?.rating ?? 0}`} label="Rating" />
                <View style={styles.stat_divider} />
                <StatItem value={`${user?.points ?? 0}`} label="Points" />
              </View>
            </CardContent>
          </Card>

          <Card style={{ padding: 0 }}>
            <View style={{ paddingHorizontal: 16 }}>
              <MenuItem
                title="Saved Addresses"
                description="2 addresses saved"
                icon="map-marker-outline"
                onPress={() => rootNavigation?.navigate?.("Location")}
              />

              <Separator orientation="horizontal" spacing={0} />

              <MenuItem
                title="Payment Methods"
                description="Visa •••• 4242"
                icon="credit-card-outline"
                onPress={() => navigation.navigate("Payment")}
              />

              <Separator orientation="horizontal" spacing={0} />

              <MenuItem
                title="Notifications"
                description="On"
                icon="bell-outline"
                onPress={() => navigation.navigate("Settings")}
              />

              <Separator orientation="horizontal" spacing={0} />

              <MenuItem
                title="Sign Out"
                description="See you soon"
                icon="logout"
                onPress={signOut}
                variant="destructive"
              />
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
