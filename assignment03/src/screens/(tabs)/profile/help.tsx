import { Card } from "@/components/card";
import Separator from "@/components/seperator";
import { THEME } from "@/lib/constants";
import { useTheme } from "@/lib/theme_context";
import useStyles from "@/lib/use-styles";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import Button from "@/components/button";

const FAQS = [
  {
    id: "1",
    q: "How do I track my order?",
    a: "Once your order is confirmed, go to My Orders and tap on the active order to see live tracking on the map.",
  },
  {
    id: "2",
    q: "Can I cancel my order?",
    a: "You can cancel within 2 minutes of placing the order. After that, cancellation depends on the restaurant's policy.",
  },
  {
    id: "3",
    q: "What if my order is wrong or missing items?",
    a: "Go to My Orders, select the order, and tap 'Report an issue'. We'll resolve it within 24 hours.",
  },
  {
    id: "4",
    q: "How do I get a refund?",
    a: "Approved refunds are processed within 5–7 business days to your original payment method.",
  },
  {
    id: "5",
    q: "How do I change my delivery address?",
    a: "You can change the delivery address before the restaurant accepts your order from the order confirmation screen.",
  },
];

type ContactCardProps = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  description: string;
  onPress: () => void;
};

const ContactCard = ({
  icon,
  label,
  description,
  onPress,
}: ContactCardProps) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        flex: 1,
        backgroundColor: THEME[theme].cardBg,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: THEME[theme].border,
        padding: 14,
        alignItems: "center",
        gap: 8,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: THEME[theme].accentBg,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <MaterialCommunityIcons
          name={icon}
          size={22}
          color={THEME[theme].accent}
        />
      </View>
      <Text
        style={{
          color: THEME[theme].text1,
          fontSize: 13,
          fontWeight: "600",
          textAlign: "center",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: THEME[theme].text2,
          fontSize: 11,
          textAlign: "center",
        }}
      >
        {description}
      </Text>
    </TouchableOpacity>
  );
};

const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity onPress={() => setOpen((v) => !v)} activeOpacity={0.8}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 14,
          gap: 12,
        }}
      >
        <Text
          style={{
            flex: 1,
            color: THEME[theme].text1,
            fontSize: 14,
            fontWeight: "600",
          }}
        >
          {q}
        </Text>
        <MaterialCommunityIcons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color={THEME[theme].text3}
        />
      </View>
      {open && (
        <Text
          style={{
            color: THEME[theme].text2,
            fontSize: 13,
            lineHeight: 20,
            paddingBottom: 14,
          }}
        >
          {a}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export const Help = () => {
  const { theme } = useTheme();
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
          {/* Contact options */}
          <View>
            <Text style={styles.section_label}>Contact Us</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <ContactCard
                icon="chat-outline"
                label="Live Chat"
                description="Avg. reply in 2 min"
                onPress={() => {}}
              />
              <ContactCard
                icon="phone-outline"
                label="Call Us"
                description="Mon–Fri, 9am–6pm"
                onPress={() => {}}
              />
              <ContactCard
                icon="email-outline"
                label="Email"
                description="Reply in 24h"
                onPress={() => {}}
              />
            </View>
          </View>

          {/* Quick actions */}
          <View>
            <Text style={styles.section_label}>Quick Actions</Text>
            <Card style={{ padding: 0 }}>
              <View style={{ paddingHorizontal: 16 }}>
                {[
                  { icon: "receipt-outline" as const, label: "Track my order" },
                  {
                    icon: "alert-circle-outline" as const,
                    label: "Report a problem",
                  },
                  { icon: "cash-refund" as const, label: "Request a refund" },
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
                        size={18}
                        color={THEME[theme].accent}
                      />
                      <Text
                        style={{
                          flex: 1,
                          color: THEME[theme].text1,
                          fontSize: 15,
                          fontWeight: "500",
                        }}
                      >
                        {item.label}
                      </Text>
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

          {/* FAQ */}
          <View>
            <Text style={styles.section_label}>FAQ</Text>
            <Card style={{ padding: 0 }}>
              <View style={{ paddingHorizontal: 16 }}>
                {FAQS.map((faq, i) => (
                  <View key={faq.id}>
                    <FaqItem q={faq.q} a={faq.a} />
                    {i < FAQS.length - 1 && (
                      <Separator orientation="horizontal" spacing={0} />
                    )}
                  </View>
                ))}
              </View>
            </Card>
          </View>

          {/* App version */}
          <Text
            style={{
              color: THEME[theme].text3,
              fontSize: 12,
              textAlign: "center",
            }}
          >
            Version 1.0.0 · Build 42
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
