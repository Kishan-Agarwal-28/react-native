import { Pressable, View } from "react-native";
import { useTheme } from "@/lib/theme_context";
import AntDesign from "@expo/vector-icons/AntDesign";
export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  return (
    <View
      style={{ flexDirection: "row", alignItems: "center", marginRight: 20 }}
    >
      <Pressable
        onPress={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
        hitSlop={15}
      >
        {theme === "dark" ? (
          <AntDesign name="moon" size={24} color="#f4f1eb" />
        ) : (
          <AntDesign name="sun" size={24} color="#130d03" />
        )}
      </Pressable>
    </View>
  );
};
