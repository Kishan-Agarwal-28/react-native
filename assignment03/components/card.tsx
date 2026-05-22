import { THEME } from "@/lib/constants";
import { useTheme } from "@/lib/theme_context";
import { View, Text, type ViewStyle, type TextStyle } from "react-native";

type CardSize = "default" | "sm";

type CardProps = {
  children: React.ReactNode;
  size?: CardSize;
  style?: ViewStyle;
};

type CardSectionProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

type CardTitleProps = {
  children: React.ReactNode;
  style?: TextStyle;
};

type CardDescriptionProps = {
  children: React.ReactNode;
  style?: TextStyle;
};

export const Card = ({ children, size = "default", style }: CardProps) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: THEME[theme].cardBg,
          borderRadius: size === "sm" ? 12 : 16,
          borderWidth: 1,
          borderColor: THEME[theme].border,
          overflow: "hidden",
          padding: size === "sm" ? 12 : 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export const CardHeader = ({ children, style }: CardSectionProps) => (
  <View
    style={[
      {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
        gap: 8,
      },
      style,
    ]}
  >
    {children}
  </View>
);

export const CardTitle = ({ children, style }: CardTitleProps) => {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        {
          color: THEME[theme].text1,
          fontSize: 16,
          fontWeight: "700",
          flexShrink: 1,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

export const CardDescription = ({ children, style }: CardDescriptionProps) => {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        {
          color: THEME[theme].text2,
          fontSize: 13,
          lineHeight: 18,
          marginTop: 2,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

export const CardTitleGroup = ({ children, style }: CardSectionProps) => (
  <View style={[{ flex: 1, gap: 2 }, style]}>{children}</View>
);

export const CardAction = ({ children, style }: CardSectionProps) => (
  <View style={[{ flexShrink: 0 }, style]}>{children}</View>
);

export const CardContent = ({ children, style }: CardSectionProps) => (
  <View style={[{ gap: 8 }, style]}>{children}</View>
);

export const CardFooter = ({ children, style }: CardSectionProps) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 8,
          marginTop: 12,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: THEME[theme].border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
