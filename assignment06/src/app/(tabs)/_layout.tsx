import React, { useEffect } from "react";
import { View, TouchableOpacity, Dimensions, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Feather from "@expo/vector-icons/Feather";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { THEME, useTheme } from "@/lib/theme";
import useStyles from "@/lib/use-styles";

const { width } = Dimensions.get("window");
const TAB_BAR_MARGIN = 20;
const ACTUAL_WIDTH = width - TAB_BAR_MARGIN * 2;

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { theme } = useTheme();
  const colors = THEME[theme].colors;

  const styles = useStyles((_, t) => ({
    tabBarContainer: {
      position: "absolute",
      bottom: 25,
      left: TAB_BAR_MARGIN,
      right: TAB_BAR_MARGIN,
      flexDirection: "row",
      height: 70,
      borderRadius: 35,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: t.colors.border,
      backgroundColor: "transparent",
      elevation: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
    },
    tabItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1,
    },
    activePill: {
      position: "absolute",
      height: 50,
      top: 10,
      zIndex: 0,
      borderRadius: 25,
      borderWidth: 1,
      borderColor:
        theme === "dark"
          ? "rgba(255, 255, 255, 0.3)"
          : "rgba(255, 255, 255, 0.8)",
      backgroundColor:
        theme === "dark" ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.08)",
    },
    pillTint: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: t.colors.primary,
      opacity: 0.2,
      borderRadius: 25,
    },
  }));

  const TAB_WIDTH = ACTUAL_WIDTH / state.routes.length;
  const PILL_WIDTH = 80;
  const PILL_OFFSET = (TAB_WIDTH - PILL_WIDTH) / 2;

  const translateX = useSharedValue(state.index * TAB_WIDTH);

  useEffect(() => {
    translateX.value = withSpring(state.index * TAB_WIDTH, {
      damping: 20,
      stiffness: 300,
      mass: 0.8,
    });
  }, [state.index]);

  const animatedPillStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View style={styles.tabBarContainer}>
      <BlurView
        intensity={40}
        tint={theme === "dark" ? "dark" : "light"}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View
        style={[
          styles.activePill,
          { width: PILL_WIDTH, left: PILL_OFFSET },
          animatedPillStyle,
        ]}
      >
        <View style={styles.pillTint} />
      </Animated.View>

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let iconName: any = "circle";
        if (route.name === "index") iconName = "home";
        if (route.name === "progress") iconName = "bar-chart-2";
        if (route.name === "settings") iconName = "settings";

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.8}
          >
            <Feather
              name={iconName}
              size={24}
              color={isFocused ? colors.primary : colors.mutedForeground}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  const { theme } = useTheme();
  const colors = THEME[theme].colors;

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.foreground,
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="progress" options={{ title: "Progress" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
