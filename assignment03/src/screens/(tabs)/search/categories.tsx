import { CategoryCard } from "@/components/category-card";
import { THEME } from "@/lib/constants";
import { CATEGORIES } from "@/lib/data";
import { useTheme } from "@/lib/theme_context";
import { View, Text, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";

const Categories = () => {
  const { theme } = useTheme();
  const navigation =
    useNavigation<SearchStackScreenProps<"Categories">["navigation"]>();
  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        gap: 16,
        backgroundColor: THEME[theme].bg,
      }}
    >
      <FlatList
        data={CATEGORIES.slice(1, CATEGORIES.length)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CategoryCard
            key={item.id}
            category={item}
            onPress={() =>
              navigation.navigate("Search", { category: item.name })
            }
            style={{
              marginVertical: 8,
            }}
          />
        )}
      />
    </View>
  );
};
export default Categories;
