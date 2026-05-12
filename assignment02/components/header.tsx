import AntDesign from "@expo/vector-icons/AntDesign";
import { useMemo } from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { THEME } from "../lib/constants";
import { useScreen } from "../lib/screen_context";
import { Theme, useTheme } from "../lib/theme_context";
import { useResponsive } from "../lib/use_responsive";
const Header = () => {
  const { theme, setTheme } = useTheme();
  const { screen, setScreen } = useScreen();
  const {
    fontSize,
    spacing,
    headerHeight,
    maxContentWidth,
    rScale,
    isLandscape,
  } = useResponsive();
  const headerMinHeight = isLandscape ? rScale(64, 56, 72) : headerHeight;
  const headerTitleSize = isLandscape ? fontSize.xl : fontSize.hero;
  const styles = useMemo(
    () =>
      createStyles({
        theme,
        spacing,
        headerHeight: headerMinHeight,
        headerTitleSize,
      }),
    [theme, spacing, headerMinHeight, headerTitleSize],
  );
  const insets = useSafeAreaInsets();
  return (
    <ImageBackground
      source={require("@/assets/images/header.jpg")}
      resizeMode="cover"
      style={styles.image}
    >
      <View
        style={{
          ...styles.headerContainer,
          paddingTop: insets.top,
        }}
      >
        <View style={[styles.innerRow, { maxWidth: maxContentWidth }]}>
          <View style={styles.headerLeft}>
            {screen.current !== "list" && (
              <Pressable
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.5 : 1,
                  },
                  {
                    marginRight: 20,
                  },
                ]}
                hitSlop={15}
                onPress={() =>
                  setScreen((screen) => ({
                    current: screen.previous ?? "list",
                    previous: screen.current,
                  }))
                }
              >
                <AntDesign
                  name="left"
                  size={16}
                  color={THEME[theme].text1}
                  onPress={() =>
                    setScreen((screen) => ({
                      current: screen.previous ?? "list",
                      previous: screen.current,
                    }))
                  }
                />
              </Pressable>
            )}
            <Text style={styles.headerTitle}>
              {screen.current === "list"
                ? "Notes"
                : screen.current === "add"
                  ? "Add Note"
                  : "Edit Note"}
            </Text>
          </View>
          <Pressable
            onPress={() =>
              setTheme((prev) => (prev === "dark" ? "light" : "dark"))
            }
            hitSlop={15}
          >
            {theme === "dark" ? (
              <AntDesign name="moon" size={24} color="#f4f1eb" />
            ) : (
              <AntDesign name="sun" size={24} color="#130d03" />
            )}
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
};
export default Header;
const createStyles = ({
  theme,
  spacing,
  headerHeight,
  headerTitleSize,
}: {
  theme: Theme;
  spacing: ReturnType<typeof useResponsive>["spacing"];
  headerHeight: number;
  headerTitleSize: number;
}) =>
  StyleSheet.create({
    image: {},
    headerContainer: {
      borderBottomWidth: 1,
      borderBottomColor: THEME[theme].border,
      width: "100%",
      alignItems: "center",
      minHeight: headerHeight,
    },
    innerRow: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing.xl,
      flex: 1,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: spacing.md,
    },
    backBtn: {
      marginRight: spacing.sm,
    },
    headerTitle: {
      color: THEME[theme].text1,
      fontWeight: "900",
      fontSize: headerTitleSize,
    },
  });
