import { THEME, useTheme } from "@/lib/theme";
import React, { createContext, forwardRef, useContext } from "react";
import {
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native";
type Orientation = "horizontal" | "vertical";
type ButtonGroupContextValue = {
  orientation: Orientation;
};
type ButtonGroupItemContextValue = {
  isFirst: boolean;
  isLast: boolean;
  orientation: Orientation;
};
const ButtonGroupContext = createContext<ButtonGroupContextValue | null>(null);
const ButtonGroupItemContext =
  createContext<ButtonGroupItemContextValue | null>(null);
export type ButtonGroupItemStyles = {
  buttonStyle: ViewStyle;
  orientation: Orientation;
  isInGroup: boolean;
};
export const useButtonGroupItem = (): ButtonGroupItemStyles => {
  const group = useContext(ButtonGroupContext);
  const item = useContext(ButtonGroupItemContext);
  if (!group || !item) {
    return { buttonStyle: {}, orientation: "horizontal", isInGroup: false };
  }
  const { orientation } = group;
  const { isFirst, isLast } = item;
  const isOnly = isFirst && isLast;
  if (isOnly) {
    return { buttonStyle: {}, orientation, isInGroup: true };
  }
  const buttonStyle: ViewStyle = {};
  if (orientation === "horizontal") {
    if (isFirst) {
      buttonStyle.borderTopRightRadius = 0;
      buttonStyle.borderBottomRightRadius = 0;
    } else if (isLast) {
      buttonStyle.borderTopLeftRadius = 0;
      buttonStyle.borderBottomLeftRadius = 0;
      buttonStyle.borderLeftWidth = 0;
    } else {
      buttonStyle.borderRadius = 0;
      buttonStyle.borderLeftWidth = 0;
    }
  } else {
    if (isFirst) {
      buttonStyle.borderBottomLeftRadius = 0;
      buttonStyle.borderBottomRightRadius = 0;
    } else if (isLast) {
      buttonStyle.borderTopLeftRadius = 0;
      buttonStyle.borderTopRightRadius = 0;
      buttonStyle.borderTopWidth = 0;
    } else {
      buttonStyle.borderRadius = 0;
      buttonStyle.borderTopWidth = 0;
    }
  }
  return { buttonStyle, orientation, isInGroup: true };
};
export type ButtonGroupProps = {
  orientation?: Orientation;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
} & Omit<ViewProps, "style">;
const ButtonGroup = forwardRef<View, ButtonGroupProps>(
  ({ orientation = "horizontal", style, children, ...rest }, ref) => {
    const validChildren = React.Children.toArray(children).filter(
      React.isValidElement,
    );
    const count = validChildren.length;
    return (
      <ButtonGroupContext.Provider value={{ orientation }}>
        <View
          ref={ref}
          role="group"
          style={[
            {
              flexDirection: orientation === "horizontal" ? "row" : "column",
              width: "100%",
            },
            style,
          ]}
          {...rest}
        >
          {validChildren.map((child, index) => (
            <ButtonGroupItemContext.Provider
              key={index}
              value={{
                isFirst: index === 0,
                isLast: index === count - 1,
                orientation,
              }}
            >
              {child}
            </ButtonGroupItemContext.Provider>
          ))}
        </View>
      </ButtonGroupContext.Provider>
    );
  },
);
ButtonGroup.displayName = "ButtonGroup";
export type ButtonGroupTextProps = {
  children: React.ReactNode;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
} & Omit<ViewProps, "style">;
const ButtonGroupText = forwardRef<View, ButtonGroupTextProps>(
  ({ children, icon, style, textStyle, ...rest }, ref) => {
    const { theme } = useTheme();
    const { colors, spacing, radius, typography } = THEME[theme];
    const { buttonStyle } = useButtonGroupItem();
    return (
      <View
        ref={ref}
        accessibilityElementsHidden
        importantForAccessibility="no"
        {...rest}
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.xs,
            paddingHorizontal: spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.lg,
            backgroundColor: colors.muted,
            height: 50,
          },
          buttonStyle,
          style,
        ]}
      >
        {icon}
        {typeof children === "string" ? (
          <Text
            style={[
              {
                fontSize: typography.sm,
                fontWeight: "500",
                color: colors.mutedForeground,
              },
              textStyle,
            ]}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </View>
    );
  },
);
ButtonGroupText.displayName = "ButtonGroupText";
export type ButtonGroupSeparatorProps = {
  orientation?: Orientation;
  style?: StyleProp<ViewStyle>;
} & Omit<ViewProps, "style">;
const ButtonGroupSeparator = forwardRef<View, ButtonGroupSeparatorProps>(
  ({ orientation: orientationProp, style, ...rest }, ref) => {
    const { theme } = useTheme();
    const { colors, spacing } = THEME[theme];
    const groupCtx = useContext(ButtonGroupContext);
    const groupOrientation = groupCtx?.orientation ?? "horizontal";
    const resolvedOrientation = orientationProp ?? groupOrientation;
    const isVerticalLine = resolvedOrientation === "horizontal";
    return (
      <View
        ref={ref}
        accessibilityElementsHidden
        importantForAccessibility="no"
        {...rest}
        style={[
          isVerticalLine
            ? {
                width: 1,
                alignSelf: "stretch",
                marginVertical: spacing.xs,
                backgroundColor: colors.input,
              }
            : {
                height: 1,
                alignSelf: "stretch",
                marginHorizontal: spacing.xs,
                backgroundColor: colors.input,
              },
          style,
        ]}
      />
    );
  },
);
ButtonGroupSeparator.displayName = "ButtonGroupSeparator";
export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText };
