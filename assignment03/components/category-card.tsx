import { THEME } from "@/lib/constants";
import { CATEGORIES } from "@/lib/data";
import { useTheme } from "@/lib/theme_context";
import { Pressable, View, Text, ViewStyle } from "react-native";

export const CategoryCard = ({
  category,
  onPress,
  style,
}: {
  category: (typeof CATEGORIES)[0];
  onPress: () => void;
  style?: ViewStyle;
}) => {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: THEME[theme].cardBg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: THEME[theme].border,
        padding: 14,
        gap: 24,
        ...style,
      }}
    >
      <Text style={{ fontSize: 32 }}>{category.icon}</Text>
      <View style={{ gap: 2 }}>
        <Text
          style={{
            color: THEME[theme].text1,
            fontSize: 15,
            fontWeight: "700",
          }}
        >
          {category.name}
        </Text>
      </View>
    </Pressable>
  );
};
