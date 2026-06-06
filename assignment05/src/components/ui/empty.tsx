import { THEME, useTheme } from "@/lib/theme";
import { forwardRef } from "react";
import { Text, View, type TextProps, type ViewProps } from "react-native";
type EmptyProps = ViewProps;
export const Empty = forwardRef<View, EmptyProps>(({ style, ...rest }, ref) => {
  const { theme } = useTheme();
  const { spacing } = THEME[theme];
  return (
    <View
      ref={ref}
      {...rest}
      style={[
        {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: spacing.xl,
        },
        style,
      ]}
    />
  );
});
Empty.displayName = "Empty";
type EmptyHeaderProps = ViewProps;
export const EmptyHeader = forwardRef<View, EmptyHeaderProps>(
  ({ style, ...rest }, ref) => {
    const { theme } = useTheme();
    const { spacing } = THEME[theme];
    return (
      <View
        ref={ref}
        {...rest}
        style={[
          {
            alignItems: "center",
            gap: spacing.sm,
            marginBottom: spacing.md,
          },
          style,
        ]}
      />
    );
  },
);
EmptyHeader.displayName = "EmptyHeader";
type EmptyMediaVariant = "icon" | "image";
type EmptyMediaProps = {
  variant?: EmptyMediaVariant;
} & ViewProps;
export const EmptyMedia = forwardRef<View, EmptyMediaProps>(
  ({ variant = "icon", style, ...rest }, ref) => {
    const { theme } = useTheme();
    const { colors, radius, spacing } = THEME[theme];
    return (
      <View
        ref={ref}
        {...rest}
        style={[
          {
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing.md,
          },
          variant === "icon" && {
            width: 64,
            height: 64,
            backgroundColor: colors.muted,
            borderRadius: radius.full,
          },
          style,
        ]}
      />
    );
  },
);
EmptyMedia.displayName = "EmptyMedia";
type EmptyTitleProps = TextProps;
export const EmptyTitle = forwardRef<Text, EmptyTitleProps>(
  ({ style, ...rest }, ref) => {
    const { theme } = useTheme();
    const { colors, typography } = THEME[theme];
    return (
      <Text
        ref={ref}
        accessibilityRole="header"
        {...rest}
        style={[
          {
            color: colors.foreground,
            fontSize: typography.xl,
            fontWeight: "600",
            textAlign: "center",
          },
          style,
        ]}
      />
    );
  },
);
EmptyTitle.displayName = "EmptyTitle";
type EmptyDescriptionProps = TextProps;
export const EmptyDescription = forwardRef<Text, EmptyDescriptionProps>(
  ({ style, ...rest }, ref) => {
    const { theme } = useTheme();
    const { colors, typography } = THEME[theme];
    return (
      <Text
        ref={ref}
        {...rest}
        style={[
          {
            color: colors.mutedForeground,
            fontSize: typography.sm,
            textAlign: "center",
            lineHeight: typography.sm * 1.5,
            maxWidth: 280,
          },
          style,
        ]}
      />
    );
  },
);
EmptyDescription.displayName = "EmptyDescription";
type EmptyContentProps = ViewProps;
export const EmptyContent = forwardRef<View, EmptyContentProps>(
  ({ style, ...rest }, ref) => {
    const { theme } = useTheme();
    const { spacing } = THEME[theme];
    return (
      <View
        ref={ref}
        {...rest}
        style={[
          {
            alignItems: "center",
            width: "100%",
            gap: spacing.sm,
          },
          style,
        ]}
      />
    );
  },
);
EmptyContent.displayName = "EmptyContent";
