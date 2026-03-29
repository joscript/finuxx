import React from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface QuickAction {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  iconColor: string;
  bgClass: string;
  shadowColor: string;
}

function ActionButton({
  icon,
  label,
  onPress,
  iconColor,
  bgClass,
  shadowColor,
}: QuickAction) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.9);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      style={style}
      className="items-center w-24"
    >
      <View
        className={`w-12 h-12 ${bgClass} rounded-2xl items-center justify-center mb-2`}
        style={{
          shadowColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.18,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text className="text-gray-600 dark:text-gray-400 text-xs font-semibold text-center">
        {label}
      </Text>
    </AnimatedPressable>
  );
}

export interface QuickActionsRowProps {
  onTransactions: () => void;
  onGoals: () => void;
  onReports: () => void;
  onBills: () => void;
}

export function QuickActionsRow({
  onTransactions,
  onGoals,
  onReports,
  onBills,
}: QuickActionsRowProps) {
  const actions: QuickAction[] = [
    {
      icon: "swap-horizontal-outline",
      label: "Transactions",
      onPress: onTransactions,
      iconColor: "#3b82f6",
      bgClass: "bg-blue-50 dark:bg-blue-500/20",
      shadowColor: "#3b82f6",
    },
    {
      icon: "flag-outline",
      label: "Goals",
      onPress: onGoals,
      iconColor: "#8b5cf6",
      bgClass: "bg-violet-50 dark:bg-violet-500/20",
      shadowColor: "#8b5cf6",
    },
    {
      icon: "bar-chart-outline",
      label: "Reports",
      onPress: onReports,
      iconColor: "#22c55e",
      bgClass: "bg-emerald-50 dark:bg-emerald-500/20",
      shadowColor: "#22c55e",
    },
    {
      icon: "receipt-outline",
      label: "Bills",
      onPress: onBills,
      iconColor: "#f59e0b",
      bgClass: "bg-amber-50 dark:bg-amber-500/20",
      shadowColor: "#f59e0b",
    },
  ];

  return (
    <View className="flex-row justify-around px-4">
      {actions.map((action) => (
        <ActionButton key={action.label} {...action} />
      ))}
    </View>
  );
}
