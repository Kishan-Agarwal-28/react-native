import {
  View,
  Text,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useMemo } from "react";
import { THEME } from "@/lib/constants";
import { useApp } from "@/lib/app_context";
import { useTheme } from "@/lib/theme_context";
import useStyles from "@/lib/use-styles";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Button from "@/components/button";
import { CITIES } from "@/lib/data";

type City = (typeof CITIES)[number];

const LocationPicker = ({ navigation }: LocationScreenProps) => {
  const { theme } = useTheme();
  const { setLocation } = useApp();
  const [search, setSearch] = useState("");
  const [pincode, setPincode] = useState("");
  const [selected, setSelected] = useState<City | null>(null);
  const [mode, setMode] = useState<"city" | "pincode">("city");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.pincode.includes(q),
    );
  }, [search]);

  const styles = useStyles((theme) => ({
    outer: {
      flex: 1,
      backgroundColor: THEME[theme].bg,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12,
    },
    heading: {
      color: THEME[theme].text1,
      fontSize: 26,
      fontWeight: "bold",
      marginBottom: 4,
    },
    subheading: {
      color: THEME[theme].text2,
      fontSize: 13,
    },
    toggle_row: {
      flexDirection: "row",
      marginHorizontal: 20,
      marginBottom: 16,
      backgroundColor: THEME[theme].cardBg,
      borderRadius: 10,
      padding: 4,
    },
    toggle_btn: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: "center",
    },
    toggle_btn_active: {
      backgroundColor: THEME[theme].accent,
    },
    toggle_text: {
      fontSize: 13,
      fontWeight: "600",
      color: THEME[theme].text2,
    },
    toggle_text_active: {
      color: "#fff",
    },
    search_container: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 20,
      marginBottom: 12,
      backgroundColor: THEME[theme].cardBg,
      borderRadius: 12,
      paddingHorizontal: 12,
      gap: 8,
    },
    search_input: {
      flex: 1,
      height: 44,
      color: THEME[theme].text1,
      fontSize: 14,
    },
    pincode_container: {
      marginHorizontal: 20,
      marginBottom: 16,
      backgroundColor: THEME[theme].cardBg,
      borderRadius: 12,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    pincode_input: {
      flex: 1,
      height: 48,
      color: THEME[theme].text1,
      fontSize: 16,
      fontWeight: "600",
      letterSpacing: 4,
    },
    list_label: {
      color: THEME[theme].text2,
      fontSize: 11,
      fontWeight: "600",
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginHorizontal: 20,
      marginBottom: 8,
    },
    city_item: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 20,
      gap: 12,
    },
    city_item_selected: {
      backgroundColor: THEME[theme].cardBg,
    },
    city_icon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: THEME[theme].cardBg,
      justifyContent: "center",
      alignItems: "center",
    },
    city_icon_selected: {
      backgroundColor: THEME[theme].accent + "22",
    },
    city_name: {
      flex: 1,
      color: THEME[theme].text1,
      fontSize: 15,
      fontWeight: "500",
    },
    city_state: {
      color: THEME[theme].text2,
      fontSize: 12,
    },
    city_check: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: THEME[theme].accent,
      justifyContent: "center",
      alignItems: "center",
    },
    separator: {
      height: 1,
      backgroundColor: THEME[theme].border,
      marginLeft: 72,
    },
    footer: {
      padding: 20,
      paddingBottom: 32,
    },
    empty: {
      alignItems: "center",
      paddingVertical: 40,
      gap: 8,
    },
    empty_text: {
      color: THEME[theme].text2,
      fontSize: 14,
    },
  }));

  const isReady = selected !== null || pincode.length >= 4;

  return (
    <SafeAreaView style={styles.outer}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <Text style={styles.heading}>Where are you?</Text>
          <Text style={styles.subheading}>
            We'll show you restaurants near you
          </Text>
        </View>
        <View style={styles.toggle_row}>
          <Pressable
            style={[
              styles.toggle_btn,
              mode === "city" && styles.toggle_btn_active,
            ]}
            onPress={() => {
              setMode("city");
              setPincode("");
            }}
          >
            <Text
              style={[
                styles.toggle_text,
                mode === "city" && styles.toggle_text_active,
              ]}
            >
              City
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.toggle_btn,
              mode === "pincode" && styles.toggle_btn_active,
            ]}
            onPress={() => {
              setMode("pincode");
              setSelected(null);
              setSearch("");
            }}
          >
            <Text
              style={[
                styles.toggle_text,
                mode === "pincode" && styles.toggle_text_active,
              ]}
            >
              Pincode
            </Text>
          </Pressable>
        </View>

        {mode === "city" ? (
          <>
            <View style={styles.search_container}>
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color={THEME[theme].text2}
              />
              <TextInput
                style={styles.search_input}
                placeholder="Search city or state..."
                placeholderTextColor={THEME[theme].text2}
                value={search}
                onChangeText={(t) => {
                  setSearch(t);
                  setSelected(null);
                }}
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch("")}>
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={18}
                    color={THEME[theme].text2}
                  />
                </Pressable>
              )}
            </View>

            <Text style={styles.list_label}>
              {search ? "Results" : "Popular cities"}
            </Text>

            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => {
                const isSelected = selected?.id === item.id;
                return (
                  <Pressable
                    style={[
                      styles.city_item,
                      isSelected && styles.city_item_selected,
                    ]}
                    onPress={() => setSelected(isSelected ? null : item)}
                  >
                    <View
                      style={[
                        styles.city_icon,
                        isSelected && styles.city_icon_selected,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="city-variant-outline"
                        size={20}
                        color={
                          isSelected ? THEME[theme].accent : THEME[theme].text2
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.city_name}>{item.name}</Text>
                      <Text style={styles.city_state}>{item.state}</Text>
                    </View>
                    {isSelected && (
                      <View style={styles.city_check}>
                        <MaterialCommunityIcons
                          name="check"
                          size={14}
                          color="#fff"
                        />
                      </View>
                    )}
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <MaterialCommunityIcons
                    name="map-search-outline"
                    size={40}
                    color={THEME[theme].text2}
                  />
                  <Text style={styles.empty_text}>No cities found</Text>
                </View>
              }
            />
          </>
        ) : (
          <View style={{ paddingHorizontal: 0 }}>
            <View style={styles.pincode_container}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={20}
                color={THEME[theme].text2}
              />
              <TextInput
                style={styles.pincode_input}
                placeholder="Enter pincode"
                placeholderTextColor={THEME[theme].text2}
                value={pincode}
                onChangeText={setPincode}
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
          </View>
        )}
        <View style={styles.footer}>
          <Button
            title={
              selected
                ? `Continue with ${selected.name}`
                : pincode.length == 6
                  ? `Continue with ${pincode}`
                  : "Select a location"
            }
            variant="outline"
            disabled={!isReady}
            onPress={() => {
              if (!isReady) {
                return;
              }

              if (selected) {
                setLocation({
                  mode: "city",
                  city: selected,
                  label: `${selected.name}, ${selected.state}`,
                });
              } else {
                setLocation({
                  mode: "pincode",
                  pincode,
                  label: pincode,
                });
              }

              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.replace("Main", {
                  screen: "Tabs",
                  params: { screen: "Home" },
                });
              }
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LocationPicker;
