import { THEME } from "@/lib/constants";
import { useTheme } from "@/lib/theme_context";
import { Image, Pressable, Text } from "react-native";

type AvatarProps = {
  name: string;
  picture?: string;
  size?: number;
  onPress?: () => void;
};

const getInitials = (name: string) =>
  name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

const Avatar = ({ name, picture, size = 40, onPress }: AvatarProps) => {
  const { theme } = useTheme();
  const initials = getInitials(name);
  const fontSize = size * 0.35;
  const borderRadius = size / 2;

  const containerStyle = {
    width: size,
    height: size,
    borderRadius,
    backgroundColor: THEME[theme].accent,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    overflow: "hidden" as const,
  };

  return (
    <Pressable onPress={onPress} style={containerStyle}>
      {picture ? (
        <Image
          source={{ uri: picture }}
          style={{ width: size, height: size, borderRadius }}
          resizeMode="cover"
        />
      ) : (
        <Text
          style={{
            color: "#fff",
            fontSize,
            fontWeight: "700",
            letterSpacing: 0.5,
          }}
        >
          {initials}
        </Text>
      )}
    </Pressable>
  );
};

export default Avatar;
