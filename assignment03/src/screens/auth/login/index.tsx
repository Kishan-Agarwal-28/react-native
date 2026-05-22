import { THEME } from "@/lib/constants";
import useStyles from "@/lib/use-styles";
import { Platform, ScrollView, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "@/components/button";
import { useTheme } from "@/lib/theme_context";
import Input from "@/components/input";
import { useState } from "react";
import { KeyboardAvoidingView } from "react-native";
import Separator from "@/components/seperator";
import { useApp } from "@/lib/app_context";
const Login = ({ navigation }: AuthStackScreenProps<"Login">) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { signIn } = useApp();
  const styles = useStyles((theme) => ({
    outer: {
      flexGrow: 1,
      backgroundColor: THEME[theme].bg,
      justifyContent: "space-around",
      alignItems: "center",
      paddingBottom: insets.bottom + 32,
      minHeight: "100%",
    },
    top_container: {
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: 20,
    },
    logo_container: {
      backgroundColor: THEME[theme].logoBg,
      width: 100,
      height: 100,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    logo_text: {
      color: THEME[theme].accent,
      fontSize: 48,
      fontWeight: "bold",
    },
    top_heading: {
      color: THEME[theme].text1,
      fontSize: 32,
      fontWeight: "bold",
      textAlign: "center",
      flexWrap: "wrap",
      maxWidth: 180,
    },
    top_subheading: {
      color: THEME[theme].text2,
    },
    bottom_container: {
      width: "100%",
      paddingHorizontal: 20,
    },
    bottom_text_container: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 20,
      gap: 6,
    },
  }));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.outer}>
        <View style={styles.top_container}>
          <View style={styles.logo_container}>
            <Text style={styles.logo_text}>
              <MaterialCommunityIcons name="hamburger" size={72} />
            </Text>
          </View>
          <Text style={styles.top_heading}>Welcome Back</Text>
          <Text style={styles.top_subheading}>
            Sign in to order your favourite food
          </Text>
        </View>
        <View style={styles.bottom_container}>
          <Input
            label="Email"
            placeholder="jamie@email.com"
            inputMode="email"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Password"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Button
            variant="outline"
            title="Sign In"
            buttonStyle={{
              color: THEME[theme].text1,
              fontWeight: 900,
            }}
            onPress={() => {
              signIn({ email });
            }}
            disabled={!email}
          />
          <View style={styles.bottom_text_container}>
            <Text style={styles.top_subheading}>Don't have an account? </Text>
            <Button
              title="Sign Up"
              variant="default"
              containerStyle={{
                width: 120,
              }}
              buttonStyle={{
                paddingVertical: 8,
                paddingHorizontal: 0,
                height: "auto",
                width: "auto",
              }}
              onPress={() => {
                navigation.push("Signup");
              }}
            />
          </View>
          <View
            style={{
              marginTop: 8,
            }}
          >
            <Separator label="or continue with" orientation="horizontal" />
            <Button
              variant="outline"
              title="Sign In with Google"
              containerStyle={{
                width: "100%",
              }}
            >
              <MaterialCommunityIcons
                name="google"
                size={16}
                color={THEME[theme].accent}
              />
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
export default Login;
