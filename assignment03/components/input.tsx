import { THEME } from "@/lib/constants";
import useStyles from "@/lib/use-styles";
import { useTheme } from "@/lib/theme_context";
import { useState } from "react";
import {
  InputModeOptions,
  KeyboardTypeOptions,
  Pressable,
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
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

const Input = ({
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
  ...rest
}: InputProps) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const focusProgress = useSharedValue(0);

  const styles = useStyles((t) => ({
    container: {
      width: "100%",
      marginBottom: 20,
      opacity: disabled ? 0.5 : 1,
    },
    label: {
      color: THEME[t].text1,
      fontSize: 12,
      fontWeight: "600",
      marginBottom: 8,
      marginLeft: 2,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 14,
      backgroundColor: variant === "ghost" ? "transparent" : THEME[t].inputBg,
      minHeight: multiline ? numberOfLines * 44 : 50,
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: THEME[t].text1,
      paddingVertical: 12,
    },
    iconLeft: {
      marginRight: 10,
    },
    iconRight: {
      marginLeft: 10,
    },
    hint: {
      fontSize: 12,
      color: THEME[t].text3,
      marginTop: 6,
      marginLeft: 2,
    },
    error: {
      fontSize: 12,
      color: THEME[t].destructive,
      marginTop: 6,
      marginLeft: 2,
    },
  }));

  const getBorderColors = () => {
    if (error) {
      return {
        normal: THEME[theme].destructive + "60",
        focused: THEME[theme].destructive,
      };
    }
    switch (variant) {
      case "ghost":
        return {
          normal: "transparent",
          focused: THEME[theme].accent,
        };
      case "destructive":
        return {
          normal: THEME[theme].destructive + "60",
          focused: THEME[theme].destructive,
        };
      default:
        return {
          normal: THEME[theme].border,
          focused: THEME[theme].accent,
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
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

      <Animated.View style={[styles.inputWrapper, animatedWrapperStyle]}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        <AnimatedTextInput
          style={[
            styles.input,
            multiline && { textAlignVertical: "top" },
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={THEME[theme].text3}
          cursorColor={THEME[theme].accent}
          selectionColor={THEME[theme].accentBg}
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
          {...rest}
        />

        {rightIcon && (
          <Pressable
            onPress={onRightIconPress}
            style={styles.iconRight}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </Pressable>
        )}
      </Animated.View>

      {error && <Text style={styles.error}>{error}</Text>}
      {!error && hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
};

export default Input;
