import { THEME, useTheme } from "@/lib/theme";
import { Feather } from "@expo/vector-icons";
import * as React from "react";
import { View } from "react-native";
import { Toaster as SonnerToaster, toast } from "react-native-sonner";
type ToastVariant = "success" | "error" | "warning" | "info";
const iconConfig = {
  warning: { name: "alert-circle", bg: "#FCEFA1" },
  success: { name: "check-circle", bg: "#BEE2C8" },
  error: { name: "x-octagon", bg: "#F4C2C7" },
  info: { name: "info", bg: "#B3DFF0" },
} as const;
const ToastIconBubble = ({ variant }: { variant: ToastVariant }) => {
  const { name, bg } = iconConfig[variant];
  return (
    <View
      style={{
        backgroundColor: bg,
        height: 32,
        width: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 4,
      }}
    >
      <Feather name={name} size={16} color="#333333" />
    </View>
  );
};
type CustomToasterProps = React.ComponentPropsWithoutRef<
  typeof SonnerToaster
> & {
  stack?: boolean;
};
const Toaster = ({
  stack = true,
  visibleToasts,
  ...props
}: CustomToasterProps) => {
  const { theme } = useTheme();
  const { colors, typography, radius } = THEME[theme];
  const resolvedVisibleToasts = !stack ? 1 : (visibleToasts ?? 3);
  const darkText = { color: "#333333" };
  return (
    <SonnerToaster
      theme={theme === "dark" ? "dark" : "light"}
      visibleToasts={resolvedVisibleToasts}
      icons={{
        success: <ToastIconBubble variant="success" />,
        error: <ToastIconBubble variant="error" />,
        warning: <ToastIconBubble variant="warning" />,
        info: <ToastIconBubble variant="info" />,
      }}
      toastStyles={{
        container: {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.md,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
          padding: 16,
        },
        title: {
          color: colors.foreground,
          fontSize: typography.sm,
          fontWeight: "600",
        },
        description: {
          color: colors.mutedForeground,
          fontSize: typography.sm,
          opacity: 0.9,
        },
        actionButton: {
          backgroundColor: colors.primary,
          borderRadius: radius.md,
        },
        actionButtonText: {
          color: colors.primaryForeground,
          fontWeight: "500",
          fontSize: typography.sm,
        },
        cancelButton: {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
        },
        cancelButtonText: {
          color: colors.foreground,
          fontWeight: "500",
          fontSize: typography.sm,
        },
      }}
      variantStyles={{
        success: {
          container: { backgroundColor: "#D0E6D3", borderColor: "#B2D8B7" },
          title: darkText,
          description: darkText,
          cancelButton: { borderColor: "#B2D8B7" },
          cancelButtonText: darkText,
        },
        error: {
          container: { backgroundColor: "#F8D7DA", borderColor: "#F5C6CB" },
          title: darkText,
          description: darkText,
          cancelButton: { borderColor: "#F5C6CB" },
          cancelButtonText: darkText,
        },
        warning: {
          container: { backgroundColor: "#FFFACD", borderColor: "#FFEB8E" },
          title: darkText,
          description: darkText,
          cancelButton: { borderColor: "#FFEB8E" },
          cancelButtonText: darkText,
        },
        info: {
          container: { backgroundColor: "#ADD8E6", borderColor: "#87CEEB" },
          title: darkText,
          description: darkText,
          cancelButton: { borderColor: "#87CEEB" },
          cancelButtonText: darkText,
        },
      }}
      {...props}
    />
  );
};
export { Toaster, toast };
