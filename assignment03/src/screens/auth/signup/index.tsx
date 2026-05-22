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

const Signup = ({ navigation }: AuthStackScreenProps<"Signup">) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { signUp } = useApp();
  const styles = useStyles((theme) => ({
    outer: {
      flexGrow: 1,
      backgroundColor: THEME[theme].bg,
      justifyContent: "center",
      alignItems: "center",
      paddingBottom: insets.bottom,
      paddingTop: 16,
      gap: 16,
    },
    top_container: {
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 20,
    },
    logo_container: {
      backgroundColor: THEME[theme].logoBg,
      width: 56,
      height: 56,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      flexShrink: 0,
    },
    top_text_container: {
      flexDirection: "column",
      gap: 2,
      flexShrink: 1,
    },
    top_heading: {
      color: THEME[theme].text1,
      fontSize: 22,
      fontWeight: "bold",
    },
    top_subheading: {
      color: THEME[theme].text2,
      fontSize: 12,
    },
    bottom_container: {
      width: "100%",
      paddingHorizontal: 20,
    },
    bottom_text_container: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 8,
      gap: 6,
    },
  }));

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView
        contentContainerStyle={styles.outer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.top_container}>
          <View style={styles.logo_container}>
            <MaterialCommunityIcons
              name="hamburger"
              size={36}
              color={THEME[theme].accent}
            />
          </View>
          <View style={styles.top_text_container}>
            <Text style={styles.top_heading}>Create Account</Text>
            <Text style={styles.top_subheading}>
              Sign up to order your favourite food
            </Text>
          </View>
        </View>

        <View style={styles.bottom_container}>
          <Input
            label="Full Name"
            placeholder="Jamie Oliver"
            inputMode="text"
            value={name}
            onChangeText={setName}
          />
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
          <Input
            label="Confirm Password"
            placeholder="••••••••"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <Button
            variant="outline"
            title="Sign Up"
            buttonStyle={{ color: THEME[theme].text1, fontWeight: 900 }}
            onPress={() => {
              signUp({ name, email });
            }}
            disabled={!name || !email || !password || !confirmPassword}
          />
          <View style={styles.bottom_text_container}>
            <Text style={styles.top_subheading}>Already have an account?</Text>
            <Button
              title="Sign In"
              variant="default"
              containerStyle={{ width: 120 }}
              buttonStyle={{
                paddingVertical: 8,
                paddingHorizontal: 0,
                height: "auto",
                width: "auto",
              }}
              onPress={() => navigation.pop()}
            />
          </View>
          <View style={{ marginTop: 4 }}>
            <Separator label="or continue with" orientation="horizontal" />
            <Button
              variant="outline"
              title="Sign Up with Google"
              containerStyle={{ width: "100%" }}
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

export default Signup;
