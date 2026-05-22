import OnBoarding from "../";
import { View, Text } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { THEME } from "@/lib/constants";
import { useTheme } from "@/lib/theme_context";
import useStyles from "@/lib/use-styles";

const Feature2 = () => {
  const { theme } = useTheme();
  const styles = useStyles((theme) => ({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 16,
    },
    icon_container: {
      width: 96,
      height: 96,
      borderRadius: 24,
      backgroundColor: THEME[theme].logoBg,
      justifyContent: "center",
      alignItems: "center",
    },
    heading: {
      color: THEME[theme].text1,
      fontSize: 24,
      fontWeight: "bold",
      textAlign: "center",
    },
    subheading: {
      color: THEME[theme].text2,
      fontSize: 13,
      textAlign: "center",
      lineHeight: 20,
      paddingHorizontal: 8,
    },
  }));

  return (
    <OnBoarding>
      <View style={styles.container}>
        <View style={styles.icon_container}>
          <MaterialCommunityIcons
            name="hamburger"
            size={52}
            color={THEME[theme].accent}
          />
        </View>
        <Text style={styles.heading}>
          Thousands of dishes,{"\n"}one tap away.
        </Text>
        <Text style={styles.subheading}>
          Browse by cuisine, restaurant, or craving — filtered and personalised
          just for you.
        </Text>
      </View>
    </OnBoarding>
  );
};

export default Feature2;
