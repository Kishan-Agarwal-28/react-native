import { THEME, useTheme } from "@/lib/theme";
import * as AlertDialogPrimitive from "@rn-primitives/alert-dialog";
import * as React from "react";
import { Platform, StyleSheet, Text, View, type ViewProps } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { FullWindowOverlay as RNFullWindowOverlay } from "react-native-screens";

const isNative = Platform.OS !== "web";

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;

const FullWindowOverlay =
  Platform.OS === "ios" ? RNFullWindowOverlay : React.Fragment;

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ children, style, ...props }, ref) => {
  const { theme } = useTheme();
  const { spacing } = THEME[theme];
  return (
    <FullWindowOverlay>
      <AlertDialogPrimitive.Overlay ref={ref} {...props} asChild={isNative}>
        <Animated.View
          entering={isNative ? FadeIn.duration(200) : undefined}
          exiting={isNative ? FadeOut.duration(200) : undefined}
          style={StyleSheet.flatten([
            StyleSheet.absoluteFill,
            {
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              justifyContent: "center",
              alignItems: "center",
              padding: spacing.xl,
            },
            Platform.OS === "web" && ({ position: "fixed", zIndex: 50 } as any),
            style,
          ])}
        >
          {children}
        </Animated.View>
      </AlertDialogPrimitive.Overlay>
    </FullWindowOverlay>
  );
});
AlertDialogOverlay.displayName = "AlertDialogOverlay";

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> & {
    portalHost?: string;
  }
>(({ children, style, portalHost, ...props }, ref) => {
  const { theme } = useTheme();
  const { colors, radius, spacing } = THEME[theme];

  const contentNode = (
    <AlertDialogPrimitive.Content ref={ref} {...props} asChild={isNative}>
      <Animated.View
        entering={isNative ? FadeIn.duration(200).delay(50) : undefined}
        exiting={isNative ? FadeOut.duration(150) : undefined}
        style={StyleSheet.flatten([
          {
            backgroundColor: colors.background,
            borderRadius: radius.lg,
            padding: spacing.xl,
            width: "100%",
            maxWidth: 400,
            borderWidth: 1,
            borderColor: colors.border,
            gap: spacing.md,
            ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
              },
              android: { elevation: 5 },
              web: {
                boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 51,
              } as any,
            }),
          },
          style,
        ])}
      >
        {children}
      </Animated.View>
    </AlertDialogPrimitive.Content>
  );

  if (Platform.OS === "web") {
    return (
      <AlertDialogPortal hostName={portalHost}>
        <AlertDialogOverlay />
        {contentNode}
      </AlertDialogPortal>
    );
  }

  return (
    <AlertDialogPortal hostName={portalHost}>
      <AlertDialogOverlay>{contentNode}</AlertDialogOverlay>
    </AlertDialogPortal>
  );
});
AlertDialogContent.displayName = "AlertDialogContent";

const AlertDialogHeader = ({ style, ...props }: ViewProps) => {
  const { theme } = useTheme();
  const { spacing } = THEME[theme];
  return (
    <View style={StyleSheet.flatten([{ gap: spacing.sm }, style])} {...props} />
  );
};
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({ style, ...props }: ViewProps) => {
  const { theme } = useTheme();
  const { spacing } = THEME[theme];
  return (
    <View
      style={StyleSheet.flatten([
        {
          flexDirection: "row",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: spacing.sm,
          marginTop: spacing.sm,
          flexWrap: "wrap",
        },
        style,
      ])}
      {...props}
    />
  );
};
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ style, ...props }, ref) => {
  const { theme } = useTheme();
  const { colors, typography } = THEME[theme];
  return (
    <AlertDialogPrimitive.Title ref={ref} asChild>
      <Text
        style={StyleSheet.flatten([
          {
            fontSize: typography.lg,
            fontWeight: "600",
            color: colors.foreground,
          },
          style,
        ])}
        {...props}
      />
    </AlertDialogPrimitive.Title>
  );
});
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ style, ...props }, ref) => {
  const { theme } = useTheme();
  const { colors, typography } = THEME[theme];
  return (
    <AlertDialogPrimitive.Description ref={ref} asChild>
      <Text
        style={StyleSheet.flatten([
          {
            fontSize: typography.sm,
            color: colors.mutedForeground,
            lineHeight: typography.sm * 1.5,
          },
          style,
        ])}
        {...props}
      />
    </AlertDialogPrimitive.Description>
  );
});
AlertDialogDescription.displayName = "AlertDialogDescription";

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ style, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    style={StyleSheet.flatten([style]) as any}
    {...props}
  />
));
AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ style, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    style={StyleSheet.flatten([style]) as any}
    {...props}
  />
));
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};

export const AlertDialogPrimitiveWrapper = {
  Root: AlertDialog,
  Trigger: AlertDialogTrigger,
  Portal: AlertDialogPortal,
  Overlay: AlertDialogOverlay,
  Content: AlertDialogContent,
  Header: AlertDialogHeader,
  Footer: AlertDialogFooter,
  Title: AlertDialogTitle,
  Description: AlertDialogDescription,
  Action: AlertDialogAction,
  Cancel: AlertDialogCancel,
};
