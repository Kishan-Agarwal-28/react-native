// components/badge.tsx
import { THEME } from "@/lib/constants";
import { useTheme } from "@/lib/theme_context";
import {
  Text,
  View,
  type ViewStyle,
  type TextStyle,
  type StyleProp,
} from "react-native";

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost";

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const Badge = ({
  label,
  variant = "default",
  icon,
  style,
  textStyle,
}: BadgeProps) => {
  const { theme } = useTheme();
  const t = THEME[theme];

  const variantStyles: Record<
    BadgeVariant,
    { container: ViewStyle; text: TextStyle }
  > = {
    default: {
      container: {
        backgroundColor: t.accent,
        borderColor: "transparent",
      },
      text: {
        color: "#fff",
      },
    },
    secondary: {
      container: {
        backgroundColor: t.accentBg,
        borderColor: "transparent",
      },
      text: {
        color: t.accent,
      },
    },
    destructive: {
      container: {
        backgroundColor: t.destructiveBg,
        borderColor: "transparent",
      },
      text: {
        color: t.destructive,
      },
    },
    outline: {
      container: {
        backgroundColor: "transparent",
        borderColor: t.border,
      },
      text: {
        color: t.text1,
      },
    },
    ghost: {
      container: {
        backgroundColor: t.inputBg,
        borderColor: "transparent",
      },
      text: {
        color: t.text2,
      },
    },
  };

  const { container, text } = variantStyles[variant];

  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          alignSelf: "flex-start",
          gap: 4,
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 999,
          borderWidth: 1,
        },
        container,
        style,
      ]}
    >
      {icon}
      <Text
        style={[
          {
            fontSize: 12,
            fontWeight: "600",
            letterSpacing: 0.1,
          },
          text,
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

export default Badge;
