import Badge from "@/components/badge";
import Button from "@/components/button";
import { Card } from "@/components/card";
import Separator from "@/components/seperator";
import { THEME } from "@/lib/constants";
import { useTheme } from "@/lib/theme_context";
import useStyles from "@/lib/use-styles";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Tracking Bar ─────────────────────────────────────────────────────────────

const STEPS = ["Confirmed", "Preparing", "On the way", "Delivered"];

const TrackingBar = ({ currentStep }: { currentStep: number }) => {
  const { theme } = useTheme();
  return (
    <View style={{ marginVertical: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {STEPS.map((_, i) => {
          const isActive = i <= currentStep;
          const isLast = i === STEPS.length - 1;
          return (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "center",
                flex: isLast ? 0 : 1,
              }}
            >
              {/* Dot */}
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: isActive
                    ? THEME[theme].trackingActive
                    : THEME[theme].trackingInactive,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {isActive && i < currentStep && (
                  <MaterialCommunityIcons name="check" size={11} color="#fff" />
                )}
              </View>
              {/* Line */}
              {!isLast && (
                <View
                  style={{
                    flex: 1,
                    height: 2,
                    backgroundColor:
                      i < currentStep
                        ? THEME[theme].trackingActive
                        : THEME[theme].trackingInactive,
                  }}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

// ─── Active Order Card ────────────────────────────────────────────────────────

const ActiveOrderCard = () => {
  const { theme } = useTheme();
  return (
    <Card
      style={{
        borderColor: THEME[theme].accent,
        borderWidth: 1.5,
        backgroundColor: THEME[theme].accent + "0D",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <View>
          <Text
            style={{
              color: THEME[theme].text1,
              fontSize: 18,
              fontWeight: "700",
            }}
          >
            Burger Palace
          </Text>
          <Text
            style={{ color: THEME[theme].text2, fontSize: 13, marginTop: 2 }}
          >
            2 items · $24.08
          </Text>
        </View>
        <Badge label="On the way" variant="default" />
      </View>

      <TrackingBar currentStep={2} />

      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <MaterialCommunityIcons
          name="clock-fast"
          size={16}
          color={THEME[theme].accent}
        />
        <Text
          style={{
            color: THEME[theme].accent,
            fontSize: 14,
            fontWeight: "600",
          }}
        >
          Arriving in ~15 minutes
        </Text>
      </View>
    </Card>
  );
};

// ─── Past Order Card ──────────────────────────────────────────────────────────

type PastOrder = {
  id: string;
  restaurant: string;
  items: number;
  total: string;
  date: string;
  status: "delivered" | "cancelled";
  rated: boolean;
};

const PastOrderCard = ({ order }: { order: PastOrder }) => {
  const { theme } = useTheme();
  const isDelivered = order.status === "delivered";

  return (
    <Card style={{ gap: 12 }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <View>
          <Text
            style={{
              color: THEME[theme].text1,
              fontSize: 16,
              fontWeight: "700",
            }}
          >
            {order.restaurant}
          </Text>
          <Text
            style={{ color: THEME[theme].text2, fontSize: 13, marginTop: 2 }}
          >
            {order.items} items · {order.total} · {order.date}
          </Text>
        </View>
        <Badge
          label={isDelivered ? "Delivered" : "Cancelled"}
          variant="secondary"
          style={{
            backgroundColor: isDelivered
              ? THEME[theme].statusDeliveredBg
              : THEME[theme].statusCancelledBg,
          }}
          textStyle={{
            color: isDelivered
              ? THEME[theme].statusDelivered
              : THEME[theme].statusCancelled,
          }}
        />
      </View>

      {/* Actions */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Button
          title="Reorder"
          variant="outline"
          containerStyle={{ flex: 1 }}
          buttonStyle={{ height: 40 }}
        />
        {isDelivered && !order.rated && (
          <Button
            title="Rate"
            variant="ghost"
            containerStyle={{ flex: 1 }}
            buttonStyle={{ height: 40 }}
          />
        )}
      </View>
    </Card>
  );
};

// ─── Orders Screen ────────────────────────────────────────────────────────────

const PAST_ORDERS: PastOrder[] = [
  {
    id: "1",
    restaurant: "Mama's Pizzeria",
    items: 3,
    total: "$32.50",
    date: "May 14",
    status: "delivered",
    rated: false,
  },
  {
    id: "2",
    restaurant: "Noodle House",
    items: 2,
    total: "$19.99",
    date: "May 10",
    status: "delivered",
    rated: true,
  },
  {
    id: "3",
    restaurant: "Taco Town",
    items: 4,
    total: "$28.40",
    date: "May 3",
    status: "cancelled",
    rated: false,
  },
];

export const Orders = () => {
  const { theme } = useTheme();
  const styles = useStyles((theme) => ({
    outer: { flex: 1, backgroundColor: THEME[theme].bg },
    content: { paddingHorizontal: 16, gap: 12, paddingBottom: 32 },
    section_label: {
      color: THEME[theme].text2,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1,
      textTransform: "uppercase",
      paddingHorizontal: 4,
    },
  }));

  return (
    <SafeAreaView style={styles.outer} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Active */}
          <ActiveOrderCard />

          {/* Past */}
          <Text style={styles.section_label}>Past Orders</Text>
          {PAST_ORDERS.map((o) => (
            <PastOrderCard key={o.id} order={o} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
