import Feather from "@expo/vector-icons/Feather";
import Fontisto from "@expo/vector-icons/Fontisto";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
const index = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView
        style={{ flex: 1, alignContent: "center", justifyContent: "center" }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.top}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={{ width: 80, height: 80 }}
            />
            <Text style={styles.topText}>Sign In</Text>
            <Text style={styles.topSubText}>
              Let's experience the joy Of telecare Al,
            </Text>
          </View>
          <View
            style={{
              justifyContent: "center",
              marginVertical: 20,
              width: "100%",
            }}
          >
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <View
                style={{
                  ...styles.emailInput,
                  borderColor: !emailFocused ? "#000" : "#13c058",
                }}
              >
                <Fontisto name="email" size={24} color="black" />
                <TextInput
                  placeholder="test@gmail.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={setEmail}
                  value={email}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View
                style={{
                  ...styles.emailInput,
                  borderColor: !passwordFocused ? "#000" : "#13c058",
                }}
              >
                <Fontisto name="locked" size={24} color="black" />
                <TextInput
                  placeholder="Enter your Password..."
                  secureTextEntry={!showPassword}
                  onChangeText={setPassword}
                  value={password}
                  style={{ flex: 1 }}
                  hitSlop={10}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <Pressable onPress={() => setShowPassword((prev) => !prev)}>
                  {showPassword ? (
                    <Feather name="eye" size={24} color="black" />
                  ) : (
                    <Feather name="eye-off" size={24} color="black" />
                  )}
                </Pressable>
              </View>
            </View>
            <Pressable style={({pressed})=>({...styles.button,
              transform:[
                {
                  scale:pressed?0.95:1
                }
              ]
            })}>
              <Text style={styles.buttonText}>Sign In</Text>
              <AntDesign name="arrow-right" size={16} color="white" />
            </Pressable>
          </View>
          <View style={styles.providerList}>
            <View style={styles.provider}>
              <Feather name="facebook" size={24} color="black" />
            </View>
            <View style={styles.provider}>
              <AntDesign name="google" size={24} color="black" />
            </View>
            <View style={styles.provider}>
              <Entypo name="instagram" size={24} color="black" />
            </View>
          </View>
          <View style={styles.bottom}>
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                alignItems: "center",
                width: "100%",
                justifyContent: "center",
              }}
            >
              <Text style={styles.bottomText}>Don't have an account?</Text>
              <Text style={styles.bottomButtonText}>Sign Up</Text>
            </View>
            <Text style={styles.bottomButtonText}>Forgot Your Password?</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default index;

const styles = StyleSheet.create({
  top: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginVertical: 20,
  },
  topText: {
    fontWeight: "bold",
    color: "#000",
    fontSize: 36,
  },
  topSubText: {
    color: "#000",
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "bold",
  },
  emailInput: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    borderColor: "#000",
    borderWidth: 1.5,
    borderRadius: 15,
    width: "100%",
    paddingInline: 12,
    paddingVertical: 5,
  },
  button: {
    width: "100%",
    backgroundColor: "#13c058",
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  providerList: {
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  provider: {
    width: 50,
    height: 50,
    borderRadius: 15,
    borderColor: "#000",
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  bottom: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginVertical: 20,
  },
  bottomText: {
    fontWeight: "bold",
    color: "#000",
  },
  bottomButtonText: {
    color: "#13c058",
    fontSize: 16,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
