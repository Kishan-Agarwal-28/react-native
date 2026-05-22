import { Card } from "@/components/card";
import Separator from "@/components/seperator";
import { THEME } from "@/lib/constants";
import { useTheme } from "@/lib/theme_context";
import useStyles from "@/lib/use-styles";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

type SettingsRowProps = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  description?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  isLast?: boolean;
};

const SettingsRow = ({
  icon,
  label,
  description,
  onPress,
  right,
  isLast,
}: SettingsRowProps) => {
  const { theme } = useTheme();
  return (
    <>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 14,
          gap: 14,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: THEME[theme].accentBg,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons
            name={icon}
            size={18}
            color={THEME[theme].accent}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: THEME[theme].text1,
              fontSize: 15,
              fontWeight: "500",
            }}
          >
            {label}
          </Text>
          {description && (
            <Text
              style={{
                color: THEME[theme].text2,
                fontSize: 12,
                marginTop: 1,
              }}
            >
              {description}
            </Text>
          )}
        </View>
        {right ?? (
          <MaterialCommunityIcons
            name="chevron-right"
            size={18}
            color={THEME[theme].text3}
          />
        )}
      </TouchableOpacity>
      {!isLast && <Separator orientation="horizontal" spacing={0} />}
    </>
  );
};

const SectionLabel = ({ label }: { label: string }) => {
  const { theme } = useTheme();
  return (
    <Text
      style={{
        color: THEME[theme].text2,
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1,
        textTransform: "uppercase",
        marginBottom: 8,
        marginTop: 4,
        paddingHorizontal: 4,
      }}
    >
      {label}
    </Text>
  );
};

export const Settings = () => {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [promoEmails, setPromoEmails] = useState(false);
  const [locationServices, setLocationServices] = useState(true);

  const styles = useStyles((theme) => ({
    outer: { flex: 1, backgroundColor: THEME[theme].bg },
    content: { paddingHorizontal: 16, gap: 8, paddingBottom: 32 },
  }));

  return (
    <SafeAreaView style={styles.outer} edges={["bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <SectionLabel label="Account" />
          <Card style={{ padding: 0 }}>
            <View style={{ paddingHorizontal: 16 }}>
              <SettingsRow
                icon="account-outline"
                label="Edit Profile"
                description="Update your name and photo"
                onPress={() => {}}
              />
              <SettingsRow
                icon="lock-outline"
                label="Change Password"
                description="Last changed 3 months ago"
                onPress={() => {}}
              />
              <SettingsRow
                icon="map-marker-outline"
                label="Saved Addresses"
                description="2 addresses saved"
                onPress={() => {}}
                isLast
              />
            </View>
          </Card>

          <SectionLabel label="Preferences" />
          <Card style={{ padding: 0 }}>
            <View style={{ paddingHorizontal: 16 }}>
              <SettingsRow
                icon="bell-outline"
                label="Push Notifications"
                description="Order updates and offers"
                right={
                  <Switch
                    value={notifications}
                    onValueChange={setNotifications}
                    trackColor={{
                      false: THEME[theme].border,
                      true: THEME[theme].accent,
                    }}
                    thumbColor="#fff"
                  />
                }
              />
              <SettingsRow
                icon="email-outline"
                label="Promo Emails"
                description="Deals and new restaurants"
                right={
                  <Switch
                    value={promoEmails}
                    onValueChange={setPromoEmails}
                    trackColor={{
                      false: THEME[theme].border,
                      true: THEME[theme].accent,
                    }}
                    thumbColor="#fff"
                  />
                }
              />
              <SettingsRow
                icon="crosshairs-gps"
                label="Location Services"
                description="Used for delivery accuracy"
                right={
                  <Switch
                    value={locationServices}
                    onValueChange={setLocationServices}
                    trackColor={{
                      false: THEME[theme].border,
                      true: THEME[theme].accent,
                    }}
                    thumbColor="#fff"
                  />
                }
                isLast
              />
            </View>
          </Card>

          <SectionLabel label="General" />
          <Card style={{ padding: 0 }}>
            <View style={{ paddingHorizontal: 16 }}>
              <SettingsRow
                icon="translate"
                label="Language"
                description="English"
                onPress={() => {}}
              />
              <SettingsRow
                icon="currency-usd"
                label="Currency"
                description="USD — US Dollar"
                onPress={() => {}}
              />
              <SettingsRow
                icon="shield-outline"
                label="Privacy Policy"
                onPress={() => {}}
              />
              <SettingsRow
                icon="file-document-outline"
                label="Terms of Service"
                onPress={() => {}}
                isLast
              />
            </View>
          </Card>

          <SectionLabel label="Danger Zone" />
          <Card style={{ padding: 0 }}>
            <View style={{ paddingHorizontal: 16 }}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 14,
                  gap: 14,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: THEME[theme].destructiveBg,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name="account-remove-outline"
                    size={18}
                    color={THEME[theme].destructive}
                  />
                </View>
                <Text
                  style={{
                    flex: 1,
                    color: THEME[theme].destructive,
                    fontSize: 15,
                    fontWeight: "500",
                  }}
                >
                  Delete Account
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
