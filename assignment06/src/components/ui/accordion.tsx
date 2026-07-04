import { THEME, useTheme } from "@/lib/theme";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as AccordionPrimitive from "@rn-primitives/accordion";
import * as React from "react";
import { type LayoutChangeEvent, Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
const Accordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>
>(({ children, style, ...props }, ref) => {
  return (
    <AccordionPrimitive.Root ref={ref} {...props} asChild>
      <View style={[{ width: "100%" }, style]}>{children}</View>
    </AccordionPrimitive.Root>
  );
});
Accordion.displayName = "Accordion";
const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ children, style, value, ...props }, ref) => {
  const { theme } = useTheme();
  const { colors } = THEME[theme];
  return (
    <AccordionPrimitive.Item ref={ref} value={value} {...props} asChild>
      <View
        style={[
          {
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            overflow: "hidden",
          },
          style,
        ]}
      >
        {children}
      </View>
    </AccordionPrimitive.Item>
  );
});
AccordionItem.displayName = "AccordionItem";
const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  Omit<
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>,
    "children"
  > & {
    children?: React.ReactNode;
  }
>(({ children, style, ...props }, ref) => {
  const { isExpanded, disabled } = AccordionPrimitive.useItemContext();
  const { theme } = useTheme();
  const { colors, spacing, typography } = THEME[theme];
  const progress = useDerivedValue(() =>
    isExpanded
      ? withTiming(1, { duration: 250 })
      : withTiming(0, { duration: 200 }),
  );
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 180}deg` }],
  }));
  return (
    <AccordionPrimitive.Header asChild>
      <View>
        <AccordionPrimitive.Trigger ref={ref} {...props} asChild>
          <Pressable
            style={(state) => [
              {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: spacing.md,
                gap: spacing.sm,
                opacity: state.pressed || disabled ? 0.6 : 1,
              },
              typeof style === "function" ? style(state) : style,
            ]}
          >
            <View style={{ flex: 1 }}>
              {typeof children === "string" ? (
                <Text
                  style={{
                    fontSize: typography.base,
                    fontWeight: "500",
                    color: colors.foreground,
                  }}
                >
                  {children}
                </Text>
              ) : (
                children
              )}
            </View>

            <Animated.View style={chevronStyle}>
              <AntDesign name="down" size={18} color={colors.mutedForeground} />
            </Animated.View>
          </Pressable>
        </AccordionPrimitive.Trigger>
      </View>
    </AccordionPrimitive.Header>
  );
});
AccordionTrigger.displayName = "AccordionTrigger";
const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ children, style, ...props }, ref) => {
  const { isExpanded } = AccordionPrimitive.useItemContext();
  const { theme } = useTheme();
  const { colors, spacing, typography } = THEME[theme];
  const [measuredHeight, setMeasuredHeight] = React.useState(0);
  const animatedHeight = useSharedValue(0);
  React.useEffect(() => {
    if (measuredHeight > 0) {
      animatedHeight.value = withTiming(isExpanded ? measuredHeight : 0, {
        duration: 250,
        easing: Easing.out(Easing.ease),
      });
    }
  }, [isExpanded, measuredHeight]);
  const handleLayout = React.useCallback(
    (e: LayoutChangeEvent) => {
      const h = Math.ceil(e.nativeEvent.layout.height);
      if (h > 0 && h !== measuredHeight) {
        setMeasuredHeight(h);
        if (isExpanded && measuredHeight === 0) {
          animatedHeight.value = h;
        }
      }
    },
    [measuredHeight, isExpanded],
  );
  const animStyle = useAnimatedStyle(() => ({
    height: measuredHeight === 0 ? 0 : animatedHeight.value,
    opacity:
      measuredHeight === 0
        ? 0
        : withTiming(isExpanded ? 1 : 0, { duration: 250 }),
  }));
  return (
    <AccordionPrimitive.Content ref={ref} {...props} forceMount asChild>
      <Animated.View style={[{ overflow: "hidden", width: "100%" }, animStyle]}>
        <View
          onLayout={handleLayout}
          style={[
            { paddingBottom: spacing.md },
            { position: "absolute", top: 0, width: "100%" },
            style,
          ]}
        >
          {typeof children === "string" ? (
            <Text
              style={{
                fontSize: typography.sm,
                color: colors.mutedForeground,
                lineHeight: typography.sm * 1.6,
              }}
            >
              {children}
            </Text>
          ) : (
            children
          )}
        </View>
      </Animated.View>
    </AccordionPrimitive.Content>
  );
});
AccordionContent.displayName = "AccordionContent";
export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
export const AccordionPrimitiveWrapper = {
  Root: Accordion,
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
};
