import { THEME, useTheme } from "@/lib/theme";
import * as React from "react";
import { View, Text, type ViewProps, type TextProps } from "react-native";
type FieldContextValue = {
  id: string;
  error?: string;
  orientation: "vertical" | "horizontal";
};
const FieldContext = React.createContext<FieldContextValue | null>(null);
const useField = () => {
  const ctx = React.useContext(FieldContext);
  if (!ctx) throw new Error("Field components must be used within <Field>");
  return ctx;
};
const FieldSet = ({ style, ...props }: ViewProps) => (
  <View style={[{ gap: 16 }, style]} {...props} />
);
const FieldLegend = ({ style, ...props }: TextProps) => {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        {
          fontSize: 18,
          fontWeight: "700",
          color: THEME[theme].colors.foreground,
        },
        style,
      ]}
      {...props}
    />
  );
};
const FieldGroup = ({ style, ...props }: ViewProps) => (
  <View style={[{ gap: 24 }, style]} {...props} />
);
type FieldProps = ViewProps & {
  orientation?: "vertical" | "horizontal";
  error?: string;
};
const Field = ({
  orientation = "vertical",
  error,
  style,
  children,
  ...props
}: FieldProps) => {
  const { theme } = useTheme();
  const id = React.useId();
  return (
    <FieldContext.Provider value={{ id, error, orientation }}>
      <View
        style={[
          {
            flexDirection: orientation === "horizontal" ? "row" : "column",
            alignItems: orientation === "horizontal" ? "center" : "stretch",
            gap: orientation === "horizontal" ? 12 : 8,
          },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    </FieldContext.Provider>
  );
};
const FieldLabel = ({ style, ...props }: TextProps) => {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        {
          fontSize: 14,
          fontWeight: "500",
          color: THEME[theme].colors.foreground,
        },
        style,
      ]}
      {...props}
    />
  );
};
const FieldDescription = ({ style, ...props }: TextProps) => {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        { fontSize: 12, color: THEME[theme].colors.mutedForeground },
        style,
      ]}
      {...props}
    />
  );
};
const FieldError = ({ style, ...props }: TextProps) => {
  const { error } = useField();
  const { theme } = useTheme();
  if (!error) return null;
  return (
    <Text
      style={[{ fontSize: 12, color: THEME[theme].colors.destructive }, style]}
      {...props}
    >
      {error}
    </Text>
  );
};
const FieldSeparator = ({ style, ...props }: ViewProps) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        { height: 1, backgroundColor: THEME[theme].colors.border },
        style,
      ]}
      {...props}
    />
  );
};
export {
  FieldSet,
  FieldLegend,
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldSeparator,
};
