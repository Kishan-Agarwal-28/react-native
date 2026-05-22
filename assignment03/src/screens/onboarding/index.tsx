import Button from "@/components/button";
import Separator from "@/components/seperator";
import { THEME } from "@/lib/constants";
import { useTheme } from "@/lib/theme_context";
import useStyles from "@/lib/use-styles";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useNavigation } from "@react-navigation/native";
import { View, Text } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
const OnBoarding = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const styles = useStyles((theme) => ({
    outer: {
      backgroundColor: THEME[theme].bg,
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
    },
    inner: {
      width: "100%",
      height: 400,
      padding: 16,
      borderRadius: 16,
      backgroundColor: THEME[theme].cardBg,
    },
    bottom: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 4,
      marginTop: 16,
      position: "absolute",
      bottom: 0,
      paddingBottom: insets.bottom + 16,
    },
    bottom_content: {},
    bottom_text: {
      color: THEME[theme].text1,
      fontSize: 24,
      fontWeight: "bold",
    },
    bottom_sub_text: {
      color: THEME[theme].text2,
      fontSize: 12,
    },
  }));
  return (
    <SafeAreaView style={styles.outer}>
      <View style={styles.inner}>{children}</View>
      <Button
        title="Skip"
        variant="outline"
        containerStyle={{
          marginTop: 16,
        }}
        onPress={() => {
          navigation.replace("Auth", { screen: "Login" });
        }}
      />
      <View style={styles.bottom}>
        <View style={styles.bottom_content}>
          <Text style={styles.bottom_text}>500+</Text>
          <Text style={styles.bottom_sub_text}>Restaurants</Text>
        </View>
        <Separator orientation="vertical" />
        <View style={styles.bottom_content}>
          <Text style={styles.bottom_text}>30m</Text>
          <Text style={styles.bottom_sub_text}>Average Delivery</Text>
        </View>
        <Separator orientation="vertical" />
        <View style={styles.bottom_content}>
          <Text style={styles.bottom_text}>
            4.9 <AntDesign name="star" size={20} color={THEME[theme].accent} />
          </Text>
          <Text style={styles.bottom_sub_text}>Rating</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};
export default OnBoarding;
