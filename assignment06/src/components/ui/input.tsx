import { THEME, useTheme } from "@/lib/theme";
import useStyles from "@/lib/use-styles";
import { forwardRef, useState } from "react";
import {
  type InputModeOptions,
  type KeyboardTypeOptions,
  Pressable,
  type StyleProp,
  Text,
  TextInput,
  type TextInputProps,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
type InputVariant = "default" | "ghost" | "destructive";
type InputProps = {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  variant?: InputVariant;
  disabled?: boolean;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  secureTextEntry?: boolean;
  inputMode?: InputModeOptions;
  keyboardType?: KeyboardTypeOptions;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  multiline?: boolean;
  numberOfLines?: number;
} & Omit<
  TextInputProps,
  "style" | "value" | "onChangeText" | "placeholder" | "multiline"
>;
const TIMING_CONFIG = {
  duration: 200,
  easing: Easing.inOut(Easing.ease),
};
const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      placeholder,
      value,
      onChangeText,
      variant = "default",
      disabled = false,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconPress,
      secureTextEntry,
      inputMode,
      keyboardType,
      containerStyle,
      inputStyle,
      labelStyle,
      multiline = false,
      numberOfLines = 1,
      accessibilityLabel,
      accessibilityHint,
      accessibilityState,
      ...rest
    },
    ref,
  ) => {
    const { theme } = useTheme();
    const [_isFocused, setIsFocused] = useState(false);
    const focusProgress = useSharedValue(0);
    const styles = useStyles((t) => ({
      container: {
        width: "100%",
        marginBottom: THEME[t].spacing.xl,
        opacity: disabled ? 0.5 : 1,
      },
      label: {
        color: THEME[t].colors.foreground,
        fontSize: 12,
        fontWeight: "600" as const,
        marginBottom: THEME[t].spacing.sm,
        marginLeft: 2,
        textTransform: "uppercase" as const,
        letterSpacing: 0.6,
      },
      inputWrapper: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        borderWidth: 1,
        borderRadius: THEME[t].radius.lg,
        paddingHorizontal: THEME[t].spacing.md,
        backgroundColor:
          variant === "ghost" ? "transparent" : THEME[t].colors.muted,
        minHeight: multiline ? numberOfLines * 44 : 50,
      },
      input: {
        flex: 1,
        fontSize: THEME[t].typography.base,
        color: THEME[t].colors.foreground,
        paddingVertical: THEME[t].spacing.md,
      },
      iconLeft: { marginRight: THEME[t].spacing.sm + 2 },
      iconRight: { marginLeft: THEME[t].spacing.sm + 2 },
      hint: {
        fontSize: THEME[t].typography.xs,
        color: THEME[t].colors.mutedForeground,
        marginTop: THEME[t].spacing.xs + 2,
        marginLeft: 2,
      },
      error: {
        fontSize: THEME[t].typography.xs,
        color: THEME[t].colors.destructive,
        marginTop: THEME[t].spacing.xs + 2,
        marginLeft: 2,
      },
    }));
    const getBorderColors = () => {
      if (error) {
        return {
          normal: THEME[theme].colors.destructive + "60",
          focused: THEME[theme].colors.destructive,
        };
      }
      switch (variant) {
        case "ghost":
          return { normal: "transparent", focused: THEME[theme].colors.ring };
        case "destructive":
          return {
            normal: THEME[theme].colors.destructive + "60",
            focused: THEME[theme].colors.destructive,
          };
        default:
          return {
            normal: THEME[theme].colors.border,
            focused: THEME[theme].colors.ring,
          };
      }
    };
    const { normal, focused } = getBorderColors();
    const animatedWrapperStyle = useAnimatedStyle(() => ({
      borderColor: interpolateColor(
        focusProgress.value,
        [0, 1],
        [normal, focused],
      ),
    }));
    const handleFocus = () => {
      setIsFocused(true);
      focusProgress.value = withTiming(1, TIMING_CONFIG);
    };
    const handleBlur = () => {
      setIsFocused(false);
      focusProgress.value = withTiming(0, TIMING_CONFIG);
    };
    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text
            style={[styles.label, labelStyle]}
            importantForAccessibility="no"
            accessibilityElementsHidden
          >
            {label}
          </Text>
        )}

        <Animated.View style={[styles.inputWrapper, animatedWrapperStyle]}>
          {leftIcon && (
            <View
              style={styles.iconLeft}
              importantForAccessibility="no"
              accessibilityElementsHidden
            >
              {leftIcon}
            </View>
          )}

          <AnimatedTextInput
            ref={ref}
            style={[
              styles.input,
              multiline && { textAlignVertical: "top" },
              inputStyle,
            ]}
            placeholder={placeholder}
            placeholderTextColor={THEME[theme].colors.mutedForeground}
            cursorColor={THEME[theme].colors.ring}
            selectionColor={THEME[theme].colors.secondary}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={!disabled}
            secureTextEntry={secureTextEntry}
            inputMode={inputMode}
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={multiline ? numberOfLines : undefined}
            accessibilityLabel={accessibilityLabel ?? label}
            accessibilityHint={
              error
                ? `Error: ${error}${accessibilityHint ? `. ${accessibilityHint}` : ""}`
                : (accessibilityHint ?? hint)
            }
            accessibilityState={{
              disabled,
              ...accessibilityState,
            }}
            {...rest}
          />

          {rightIcon && (
            <Pressable
              onPress={onRightIconPress}
              style={styles.iconRight}
              disabled={!onRightIconPress}
              accessibilityRole={onRightIconPress ? "button" : "none"}
              importantForAccessibility={onRightIconPress ? "yes" : "no"}
              accessibilityElementsHidden={!onRightIconPress}
            >
              {rightIcon}
            </Pressable>
          )}
        </Animated.View>

        {error && (
          <Text
            style={styles.error}
            importantForAccessibility="no"
            accessibilityElementsHidden
          >
            {error}
          </Text>
        )}
        {!error && hint && (
          <Text
            style={styles.hint}
            importantForAccessibility="no"
            accessibilityElementsHidden
          >
            {hint}
          </Text>
        )}
      </View>
    );
  },
);
Input.displayName = "Input";
export default Input;
