import OnBoarding from "../";
import { View, Text } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { THEME } from "@/lib/constants";
import { useTheme } from "@/lib/theme_context";
import useStyles from "@/lib/use-styles";
import Button from "@/components/button";
import AntDesign from "@expo/vector-icons/AntDesign";

const Feature1 = ({ navigation }: OnboardingStackScreenProps<"feat1">) => {
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
            name="rocket-launch"
            size={52}
            color={THEME[theme].accent}
          />
        </View>
        <Text style={styles.heading}>Food at your{"\n"}doorstep, fast.</Text>
        <Text style={styles.subheading}>
          Discover hundreds of restaurants and get your favorite meals delivered
          in minutes.
        </Text>
      </View>
      <Button
        title="Get Started"
        containerStyle={{
          marginTop: 16,
        }}
        buttonStyle={{
          flexDirection: "row-reverse",
          gap: 12,
          paddingHorizontal: 12,
        }}
        onPress={() => {
          navigation.navigate("feat2");
        }}
      >
        <AntDesign name="arrow-right" size={16} color={THEME[theme].text4} />
      </Button>
    </OnBoarding>
  );
};

export default Feature1;
