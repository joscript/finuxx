import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

const AnimatedView = Animated.createAnimatedComponent(View);

export interface BudgetHealthStripProps {
  spent: number;
  total: number;
  currency?: string;
  onPress?: () => void;
}

export function BudgetHealthStrip({
  spent,
  total,
  currency = "₱",
  onPress,
}: BudgetHealthStripProps) {
  const progressWidth = useSharedValue(0);
  const percentage = total > 0 ? Math.min((spent / total) * 100, 100) : 0;
  const isOverLimit = percentage >= 100;
  const isNearLimit = percentage >= 80;
  const remaining = total - spent;

  const barColor = isOverLimit
    ? "#ef4444"
    : isNearLimit
      ? "#f59e0b"
      : "#22c55e";
  const statusText = isOverLimit
    ? "Over Budget"
    : isNearLimit
      ? "Near Limit"
      : "On Track";
  const statusTextClass = isOverLimit
    ? "text-red-500"
    : isNearLimit
      ? "text-amber-500"
      : "text-emerald-500";

  useEffect(() => {
    progressWidth.value = withDelay(
      300,
      withTiming(percentage, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [percentage]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  return (
    <Pressable
      onPress={onPress}
      className="mx-4 bg-white dark:bg-gray-800 rounded-[20px] px-5 py-4 active:opacity-90"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Ionicons name="wallet-outline" size={15} color="#6b7280" />
          <Text className="text-gray-600 dark:text-gray-400 text-sm font-semibold">
            Monthly Budget
          </Text>
        </View>
        <Text className={`${statusTextClass} text-xs font-bold`}>
          {statusText}
        </Text>
      </View>
      <View className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2.5">
        <AnimatedView
          style={[progressStyle, { backgroundColor: barColor }]}
          className="h-full rounded-full"
        />
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-gray-400 dark:text-gray-500 text-xs">
          {currency}
          {spent.toLocaleString()} spent
        </Text>
        <Text className="text-gray-900 dark:text-white text-xs font-semibold">
          {currency}
          {Math.max(remaining, 0).toLocaleString()} left of {currency}
          {total.toLocaleString()}
        </Text>
      </View>
    </Pressable>
  );
}
