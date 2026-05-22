import { THEME } from "@/lib/constants";
import { useTheme } from "@/lib/theme_context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Text, TouchableOpacity, View } from "react-native";

type CartIconProps = {
  count: number;
  size?: number;
  onPress?: () => void;
};

const CartIcon = ({ count, size = 40, onPress }: CartIconProps) => {
  const { theme } = useTheme();
  const displayCount = count > 99 ? "99+" : count;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: THEME[theme].accent,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <MaterialCommunityIcons
        name="cart-outline"
        size={size * 0.5}
        color="#fff"
      />
      {count > 0 && (
        <View
          style={{
            position: "absolute",
            top: -2,
            right: -2,
            backgroundColor: THEME[theme].bg,
            borderRadius: 99,
            minWidth: 18,
            height: 18,
            paddingHorizontal: 4,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1.5,
            borderColor: THEME[theme].accent,
          }}
        >
          <Text
            style={{
              color: THEME[theme].accent,
              fontSize: 10,
              fontWeight: "700",
              lineHeight: 12,
            }}
          >
            {displayCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CartIcon;
