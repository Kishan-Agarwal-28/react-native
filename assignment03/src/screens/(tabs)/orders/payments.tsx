import { Card } from "@/components/card";
import Separator from "@/components/seperator";
import Button from "@/components/button";
import { THEME } from "@/lib/constants";
import { useTheme } from "@/lib/theme_context";
import useStyles from "@/lib/use-styles";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

type PaymentMethod = {
  id: string;
  type: "visa" | "mastercard" | "amex";
  last4: string;
  expiry: string;
  isDefault: boolean;
};

const CARD_ICONS: Record<
  PaymentMethod["type"],
  React.ComponentProps<typeof MaterialCommunityIcons>["name"]
> = {
  visa: "credit-card-outline",
  mastercard: "credit-card-outline",
  amex: "credit-card-outline",
};

const CARD_COLORS: Record<PaymentMethod["type"], string> = {
  visa: "#1A1F71",
  mastercard: "#EB001B",
  amex: "#2E77BC",
};

const METHODS: PaymentMethod[] = [
  { id: "1", type: "visa", last4: "4242", expiry: "12/26", isDefault: true },
  {
    id: "2",
    type: "mastercard",
    last4: "8891",
    expiry: "08/25",
    isDefault: false,
  },
  { id: "3", type: "amex", last4: "1234", expiry: "03/27", isDefault: false },
];

const PaymentCard = ({
  method,
  isSelected,
  onSelect,
  onDelete,
}: {
  method: PaymentMethod;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity onPress={onSelect} activeOpacity={0.75}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 14,
          gap: 14,
        }}
      >
        {/* Card icon */}
        <View
          style={{
            width: 44,
            height: 30,
            borderRadius: 6,
            backgroundColor: CARD_COLORS[method.type] + "22",
            borderWidth: 1,
            borderColor: CARD_COLORS[method.type] + "44",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons
            name={CARD_ICONS[method.type]}
            size={18}
            color={CARD_COLORS[method.type]}
          />
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text
              style={{
                color: THEME[theme].text1,
                fontSize: 15,
                fontWeight: "600",
                textTransform: "capitalize",
              }}
            >
              {method.type} •••• {method.last4}
            </Text>
            {method.isDefault && (
              <View
                style={{
                  backgroundColor: THEME[theme].accentBg,
                  borderRadius: 99,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}
              >
                <Text
                  style={{
                    color: THEME[theme].accent,
                    fontSize: 10,
                    fontWeight: "700",
                  }}
                >
                  Default
                </Text>
              </View>
            )}
          </View>
          <Text
            style={{ color: THEME[theme].text2, fontSize: 12, marginTop: 2 }}
          >
            Expires {method.expiry}
          </Text>
        </View>

        {/* Selected indicator */}
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: isSelected ? THEME[theme].accent : THEME[theme].border,
            backgroundColor: isSelected ? THEME[theme].accent : "transparent",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {isSelected && (
            <MaterialCommunityIcons name="check" size={12} color="#fff" />
          )}
        </View>

        {/* Delete */}
        <TouchableOpacity onPress={onDelete} hitSlop={8}>
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={18}
            color={THEME[theme].destructive}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export const Payment = () => {
  const { theme } = useTheme();
  const [selected, setSelected] = useState("1");
  const [methods, setMethods] = useState(METHODS);

  const styles = useStyles((theme) => ({
    outer: { flex: 1, backgroundColor: THEME[theme].bg },
    content: {
      paddingHorizontal: 16,
      gap: 20,
      paddingBottom: 32,
      paddingTop: 8,
    },
    section_label: {
      color: THEME[theme].text2,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 8,
      paddingHorizontal: 4,
    },
  }));

  return (
    <SafeAreaView style={styles.outer} edges={["bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Saved cards */}
          <View>
            <Text style={styles.section_label}>Saved Cards</Text>
            <Card style={{ padding: 0 }}>
              <View style={{ paddingHorizontal: 16 }}>
                {methods.map((m, i) => (
                  <View key={m.id}>
                    <PaymentCard
                      method={m}
                      isSelected={selected === m.id}
                      onSelect={() => setSelected(m.id)}
                      onDelete={() =>
                        setMethods((prev) => prev.filter((p) => p.id !== m.id))
                      }
                    />
                    {i < methods.length - 1 && (
                      <Separator orientation="horizontal" spacing={0} />
                    )}
                  </View>
                ))}
              </View>
            </Card>
          </View>

          {/* Add new card */}
          <Button title="Add New Card" variant="outline" onPress={() => {}}>
            <MaterialCommunityIcons
              name="plus"
              size={18}
              color={THEME[theme].accent}
            />
          </Button>

          {/* Other payment methods */}
          <View>
            <Text style={styles.section_label}>Other Methods</Text>
            <Card style={{ padding: 0 }}>
              <View style={{ paddingHorizontal: 16 }}>
                {[
                  {
                    icon: "credit-card-outline" as const,
                    label: "PayPal",
                    description: "Connected",
                  },
                  {
                    icon: "apple" as const,
                    label: "Apple Pay",
                    description: "Not set up",
                  },
                  {
                    icon: "google" as const,
                    label: "Google Pay",
                    description: "Not set up",
                  },
                ].map((item, i, arr) => (
                  <View key={item.label}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 14,
                        gap: 14,
                      }}
                    >
                      <MaterialCommunityIcons
                        name={item.icon}
                        size={22}
                        color={THEME[theme].text1}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: THEME[theme].text1,
                            fontSize: 15,
                            fontWeight: "500",
                          }}
                        >
                          {item.label}
                        </Text>
                        <Text
                          style={{ color: THEME[theme].text2, fontSize: 12 }}
                        >
                          {item.description}
                        </Text>
                      </View>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={18}
                        color={THEME[theme].text3}
                      />
                    </TouchableOpacity>
                    {i < arr.length - 1 && (
                      <Separator orientation="horizontal" spacing={0} />
                    )}
                  </View>
                ))}
              </View>
            </Card>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
