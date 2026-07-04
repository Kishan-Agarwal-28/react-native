import { THEME } from "@/lib/theme";
import useStyles from "@/lib/use-styles";
import { forwardRef } from "react";
import { StyleProp, Text, View, ViewStyle, type ViewProps } from "react-native";
type SeparatorProps = {
  thickness?: number;
  spacing?: number;
  style?: StyleProp<ViewStyle>;
} & (
  | {
      orientation?: "horizontal";
      label?: string;
    }
  | {
      orientation: "vertical";
      label?: never;
    }
) &
  Omit<ViewProps, "style">;
const Separator = forwardRef<View, SeparatorProps>(
  (
    {
      orientation = "horizontal",
      label,
      thickness = 1,
      spacing: spacingProp = 16,
      style,
      accessibilityRole: _accessibilityRole,
      importantForAccessibility: _ifa,
      accessibilityElementsHidden: _aeh,
      ...rest
    },
    ref,
  ) => {
    const styles = useStyles((t) => ({
      horizontalContainer: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        width: "100%" as const,
      },
      verticalContainer: {
        flexDirection: "column" as const,
        alignItems: "center" as const,
        alignSelf: "stretch" as const,
      },
      line: {
        flex: 1,
        backgroundColor: THEME[t].colors.border,
      },
      labelWrapper: {
        paddingHorizontal: spacingProp,
      },
      labelText: {
        fontSize: 12,
        fontWeight: "500" as const,
        color: THEME[t].colors.mutedForeground,
      },
    }));
    const isDecorative = !label;
    const a11yProps = isDecorative
      ? ({
          accessibilityRole: "none" as const,
          importantForAccessibility: "no-hide-descendants" as const,
          accessibilityElementsHidden: true,
        } as const)
      : ({
          role: "separator" as const,
          accessibilityLabel: label,
        } as const);
    if (orientation === "vertical") {
      return (
        <View
          ref={ref}
          {...a11yProps}
          {...rest}
          style={[
            styles.verticalContainer,
            { marginHorizontal: spacingProp },
            style,
          ]}
        >
          <View style={[styles.line, { width: thickness }]} />
        </View>
      );
    }
    return (
      <View
        ref={ref}
        {...a11yProps}
        {...rest}
        style={[
          styles.horizontalContainer,
          { marginVertical: spacingProp },
          style,
        ]}
      >
        <View style={[styles.line, { height: thickness }]} />
        {label && (
          <>
            <View style={styles.labelWrapper}>
              <Text style={styles.labelText}>{label}</Text>
            </View>
            <View style={[styles.line, { height: thickness }]} />
          </>
        )}
      </View>
    );
  },
);
Separator.displayName = "Separator";
export default Separator;
