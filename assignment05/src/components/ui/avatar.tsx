import { THEME, useTheme } from "@/lib/theme";
import { forwardRef, useState } from "react";
import { Image, Text, View, type ViewProps } from "react-native";
export const AvatarFallback = forwardRef<View, ViewProps>(
  ({ style, children, ...rest }, ref) => {
    return (
      <View
        ref={ref}
        style={[
          {
            flex: 1,
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          },
          style,
        ]}
        {...rest}
      >
        {children}
      </View>
    );
  },
);
AvatarFallback.displayName = "AvatarFallback";
type AvatarProps = {
  name: string;
  picture?: string;
  size?: number;
  children?: React.ReactNode;
} & Omit<ViewProps, "style">;
const getInitials = (name: string) => {
  const words = name.trim().split(/\s+/);
  if (!words[0]) return "";
  return words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
};
export const Avatar = forwardRef<View, AvatarProps>(
  (
    { name, picture, size = 40, accessibilityLabel, children, ...rest },
    ref,
  ) => {
    const [error, setError] = useState<boolean>(false);
    const { theme } = useTheme();
    const { colors } = THEME[theme];
    const initials = getInitials(name);
    const fontSize = size * 0.35;
    const borderRadius = size / 2;
    const renderFallback = () => {
      if (children) {
        return children;
      }
      return (
        <Text
          style={{
            color: colors.primaryForeground,
            fontSize,
            fontWeight: "700",
            letterSpacing: 0.5,
          }}
          importantForAccessibility="no"
          accessibilityElementsHidden
        >
          {initials}
        </Text>
      );
    };
    return (
      <View
        ref={ref}
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel ?? name}
        {...rest}
        style={{
          width: size,
          height: size,
          borderRadius,
          backgroundColor: colors.primary,
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {picture && !error ? (
          <Image
            source={{ uri: picture }}
            style={{ width: size, height: size, borderRadius }}
            resizeMode="cover"
            importantForAccessibility="no"
            accessibilityElementsHidden
            accessibilityIgnoresInvertColors
            onError={() => setError(true)}
          />
        ) : (
          renderFallback()
        )}
      </View>
    );
  },
);
Avatar.displayName = "Avatar";
