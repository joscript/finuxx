import React from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const MAX_EXPRESSION_LENGTH = 32;
const OPERATOR_SYMBOLS = ["+", "-", "×", "÷"] as const;

type OperatorSymbol = (typeof OPERATOR_SYMBOLS)[number];

type KeyConfig = {
  label: string;
  flex?: number;
  variant?: "digit" | "operator" | "action" | "equals";
};

const KEY_ROWS: KeyConfig[][] = [
  [
    { label: "7" },
    { label: "8" },
    { label: "9" },
    { label: "÷", variant: "operator" },
  ],
  [
    { label: "4" },
    { label: "5" },
    { label: "6" },
    { label: "×", variant: "operator" },
  ],
  [
    { label: "1" },
    { label: "2" },
    { label: "3" },
    { label: "-", variant: "operator" },
  ],
  [
    { label: "." },
    { label: "0" },
    { label: "⌫", variant: "action" },
    { label: "+", variant: "operator" },
  ],
  [
    { label: "C", flex: 2, variant: "action" },
    { label: "=", flex: 2, variant: "equals" },
  ],
];

const isOperator = (value: string) =>
  OPERATOR_SYMBOLS.includes(value as OperatorSymbol);

const normalizeExpression = (expression: string) =>
  expression.replace(/×/g, "*").replace(/÷/g, "/");

const formatResult = (value: number) => {
  if (!Number.isFinite(value)) {
    return null;
  }

  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded)
    ? rounded.toString()
    : rounded
        .toFixed(2)
        .replace(/\.00$/, "")
        .replace(/(\.\d*[1-9])0+$/, "$1");
};

export function evaluateCalculatorExpression(expression: string) {
  const trimmedExpression = expression.trim();

  if (!trimmedExpression) {
    return {
      isValid: false,
      result: null,
      error: null,
      normalizedResult: "",
    };
  }

  const normalizedExpression = normalizeExpression(trimmedExpression);
  const tokens: Array<number | string> = [];
  let currentNumber = "";

  for (const character of normalizedExpression) {
    if (/\d/.test(character)) {
      currentNumber += character;
      continue;
    }

    if (character === ".") {
      if (currentNumber.includes(".")) {
        return {
          isValid: false,
          result: null,
          error: "Invalid calculation",
          normalizedResult: "",
        };
      }
      currentNumber = currentNumber ? `${currentNumber}.` : "0.";
      continue;
    }

    if (!["+", "-", "*", "/"].includes(character)) {
      return {
        isValid: false,
        result: null,
        error: "Invalid calculation",
        normalizedResult: "",
      };
    }

    if (!currentNumber) {
      return {
        isValid: false,
        result: null,
        error: "Invalid calculation",
        normalizedResult: "",
      };
    }

    tokens.push(Number(currentNumber), character);
    currentNumber = "";
  }

  if (!currentNumber) {
    return {
      isValid: false,
      result: null,
      error: "Complete the calculation",
      normalizedResult: "",
    };
  }

  tokens.push(Number(currentNumber));

  const firstPass: Array<number | string> = [tokens[0]];
  for (let index = 1; index < tokens.length; index += 2) {
    const operator = tokens[index] as string;
    const nextValue = tokens[index + 1] as number;

    if (operator === "*" || operator === "/") {
      const currentValue = firstPass[firstPass.length - 1] as number;
      if (operator === "/" && nextValue === 0) {
        return {
          isValid: false,
          result: null,
          error: "Cannot divide by zero",
          normalizedResult: "",
        };
      }

      firstPass[firstPass.length - 1] =
        operator === "*" ? currentValue * nextValue : currentValue / nextValue;
      continue;
    }

    firstPass.push(operator, nextValue);
  }

  let total = firstPass[0] as number;
  for (let index = 1; index < firstPass.length; index += 2) {
    const operator = firstPass[index] as string;
    const nextValue = firstPass[index + 1] as number;
    total = operator === "+" ? total + nextValue : total - nextValue;
  }

  const normalizedResult = formatResult(total);
  if (normalizedResult === null) {
    return {
      isValid: false,
      result: null,
      error: "Invalid calculation",
      normalizedResult: "",
    };
  }

  return {
    isValid: true,
    result: total,
    error: null,
    normalizedResult,
  };
}

const getLastNumberToken = (expression: string) => {
  const tokens = expression.split(/[+\-×÷]/);
  return tokens[tokens.length - 1] ?? "";
};

const appendInput = (expression: string, key: string) => {
  if (expression.length >= MAX_EXPRESSION_LENGTH) {
    return expression;
  }

  if (/^\d$/.test(key)) {
    if (expression === "0") {
      return key;
    }

    const lastToken = getLastNumberToken(expression);
    if (lastToken === "0") {
      return `${expression.slice(0, -1)}${key}`;
    }

    return `${expression}${key}`;
  }

  if (key === ".") {
    const lastCharacter = expression.slice(-1);
    const lastToken = getLastNumberToken(expression);

    if (lastToken.includes(".")) {
      return expression;
    }

    if (!expression || isOperator(lastCharacter)) {
      return `${expression}0.`;
    }

    return `${expression}.`;
  }

  if (isOperator(key)) {
    if (!expression) {
      return expression;
    }

    const lastCharacter = expression.slice(-1);
    if (isOperator(lastCharacter) || lastCharacter === ".") {
      return expression;
    }

    return `${expression}${key}`;
  }

  return expression;
};

interface CalculatorButtonProps {
  button: KeyConfig;
  onPress: (key: string) => void;
}

function CalculatorButton({ button, onPress }: CalculatorButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.93, { damping: 16, stiffness: 280 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 16, stiffness: 280 });
  };

  const variant = button.variant ?? "digit";
  const className =
    variant === "operator"
      ? "bg-blue-50 dark:bg-blue-500/20"
      : variant === "action"
        ? "bg-rose-50 dark:bg-rose-500/10"
        : variant === "equals"
          ? "bg-gray-900 dark:bg-white"
          : "bg-white dark:bg-gray-700";
  const textClassName =
    variant === "operator"
      ? "text-blue-600 dark:text-blue-300"
      : variant === "action"
        ? "text-rose-500 dark:text-rose-300"
        : variant === "equals"
          ? "text-white dark:text-gray-900"
          : "text-gray-900 dark:text-white";

  return (
    <AnimatedPressable
      onPress={() => onPress(button.label)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        animatedStyle,
        {
          flex: button.flex ?? 1,
          minHeight: 56,
        },
      ]}
      className={`mx-1 my-1 rounded-2xl items-center justify-center ${className}`}
    >
      {button.label === "⌫" ? (
        <Ionicons name="backspace-outline" size={22} color="#f43f5e" />
      ) : (
        <Text className={`text-xl font-semibold ${textClassName}`}>
          {button.label}
        </Text>
      )}
    </AnimatedPressable>
  );
}

interface CalculatorKeypadProps {
  expression: string;
  onChangeExpression: (value: string) => void;
}

export default function CalculatorKeypad({
  expression,
  onChangeExpression,
}: CalculatorKeypadProps) {
  const handleKeyPress = (key: string) => {
    if (key === "⌫") {
      onChangeExpression(expression.slice(0, -1));
      return;
    }

    if (key === "C") {
      onChangeExpression("");
      return;
    }

    if (key === "=") {
      const evaluation = evaluateCalculatorExpression(expression);
      if (evaluation.isValid) {
        onChangeExpression(evaluation.normalizedResult);
      }
      return;
    }

    onChangeExpression(appendInput(expression, key));
  };

  return (
    <View className="border-t border-gray-200 bg-gray-50 px-3 pt-3 pb-4 dark:border-gray-700 dark:bg-gray-900">
      {KEY_ROWS.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row">
          {row.map((button) => (
            <CalculatorButton
              key={button.label}
              button={button}
              onPress={handleKeyPress}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
