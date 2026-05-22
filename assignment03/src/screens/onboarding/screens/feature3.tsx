import OnBoarding from "../";
import { View, Text } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { THEME } from "@/lib/constants";
import { useTheme } from "@/lib/theme_context";
import useStyles from "@/lib/use-styles";
import { useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";

const Feature3 = ({ navigation }: OnboardingStackScreenProps<"feat3">) => {
  const { theme } = useTheme();
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        navigation.replace("Auth", { screen: "Login" });
      }, 1000);

      return () => {
        clearTimeout(timer);
      };
    }, [navigation]),
  );
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
            name="map-marker-radius"
            size={52}
            color={THEME[theme].accent}
          />
        </View>
        <Text style={styles.heading}>Track your order{"\n"}in real time.</Text>
        <Text style={styles.subheading}>
          Watch your food travel from the kitchen to your door, live on the map.
        </Text>
      </View>
    </OnBoarding>
  );
};

export default Feature3;
