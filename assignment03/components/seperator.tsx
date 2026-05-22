import { THEME } from "@/lib/constants";
import useStyles from "@/lib/use-styles";
import { useTheme } from "@/lib/theme_context";
import { StyleProp, Text, View, ViewStyle } from "react-native";

type SeparatorOrientation = "horizontal" | "vertical";

type SeparatorProps = {
  orientation?: SeparatorOrientation;
  label?: string;
  thickness?: number;
  spacing?: number;
  style?: StyleProp<ViewStyle>;
};

const Separator = ({
  orientation = "horizontal",
  label,
  thickness = 1,
  spacing = 16,
  style,
}: SeparatorProps) => {
  const { theme } = useTheme();

  const styles = useStyles((theme) => ({
    horizontalContainer: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
    },
    verticalContainer: {
      flexDirection: "column",
      alignItems: "center",
      alignSelf: "stretch",
    },
    horizontalLine: {
      flex: 1,
      backgroundColor: THEME[theme].border,
    },
    verticalLine: {
      flex: 1,
      width: thickness,
      backgroundColor: THEME[theme].border,
    },
    labelWrapper: {
      paddingHorizontal: spacing,
    },
    label: {
      fontSize: 12,
      fontWeight: "500",
      color: THEME[theme].text3,
    },
  }));

  if (orientation === "vertical") {
    return (
      <View
        style={[styles.verticalContainer, { marginHorizontal: spacing }, style]}
      >
        <View style={[styles.verticalLine, { width: thickness }]} />
      </View>
    );
  }

  return (
    <View
      style={[styles.horizontalContainer, { marginVertical: spacing }, style]}
    >
      <View style={[styles.horizontalLine, { height: thickness }]} />
      {label && (
        <>
          <View style={styles.labelWrapper}>
            <Text style={styles.label}>{label}</Text>
          </View>
          <View style={[styles.horizontalLine, { height: thickness }]} />
        </>
      )}
    </View>
  );
};

export default Separator;
