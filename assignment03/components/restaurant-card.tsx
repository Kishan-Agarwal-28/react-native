// components/restaurant-card.tsx
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitleGroup,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/card";
import { THEME } from "@/lib/constants";
import { useTheme } from "@/lib/theme_context";
import { Image, Text, View } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState } from "react";

type RestaurantCardProps = {
  image: string;
  name: string;
  rating: number;
  deliveryTime: string;
  cuisines: string[];
  location: string;
  promo?: string;
};

const RestaurantCard = ({
  image,
  name,
  rating,
  deliveryTime,
  cuisines,
  location,
  promo,
}: RestaurantCardProps) => {
  const { theme } = useTheme();
  const [hasLoadError, setHasLoadError] = useState(false);
  return (
    <Card style={{ padding: 0, gap: 0, margin: 16 }}>
      <View style={{ position: "relative" }}>
        <Image
          source={{
            uri: hasLoadError
              ? "https://placehold.co/600x400.png?text=No+Image+Available"
              : image,
          }}
          style={{ width: "100%", height: 180, borderRadius: 0 }}
          resizeMode="cover"
          onError={() => {
            setHasLoadError(true);
          }}
        />
        {promo && (
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "rgba(0,0,0,0.45)",
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 15,
                fontWeight: "800",
                letterSpacing: 0.3,
              }}
            >
              {promo}
            </Text>
          </View>
        )}
      </View>

      <View style={{ padding: 12, gap: 4 }}>
        <CardTitle>{name}</CardTitle>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <AntDesign name="star" size={14} color={THEME[theme].ratingColor} />
          <Text
            style={{
              color: THEME[theme].text1,
              fontSize: 13,
              fontWeight: "600",
            }}
          >
            {rating}
          </Text>
          <Text style={{ color: THEME[theme].text2, fontSize: 13 }}>•</Text>
          <MaterialCommunityIcons
            name="clock-outline"
            size={13}
            color={THEME[theme].text2}
          />
          <Text style={{ color: THEME[theme].text2, fontSize: 13 }}>
            {deliveryTime}
          </Text>
        </View>

        <CardDescription>{cuisines.join(", ")}</CardDescription>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={13}
            color={THEME[theme].text3}
          />
          <Text style={{ color: THEME[theme].text3, fontSize: 12 }}>
            {location}
          </Text>
        </View>
      </View>
    </Card>
  );
};

export default RestaurantCard;
