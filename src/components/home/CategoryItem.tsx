import React from "react";
import { View, Text, Pressable } from "react-native";
import { useCurrency } from "../../hooks/useCurrency";

export interface CategoryItemProps {
  name: string;
  spent: number;
  budget: number;
  color: string;
  onPress?: () => void;
}

export function CategoryItem({
  name,
  spent,
  budget,
  color,
  onPress,
}: CategoryItemProps) {
  const fmt = useCurrency();
  const progress = Math.min((spent / budget) * 100, 100);
  const isOverBudget = spent > budget;
  const barColor = isOverBudget ? "#ef4444" : color;
  const remaining = budget - spent;

  return (
    <Pressable onPress={onPress} className="py-4 active:opacity-70">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View
            className="w-3 h-3 rounded-full mr-3"
            style={{ backgroundColor: barColor }}
          />
          <Text className="text-gray-900 dark:text-white text-base font-semibold">
            {name}
          </Text>
        </View>
        <Text
          className={`text-sm font-medium ${isOverBudget ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}
        >
          {isOverBudget
            ? `-${fmt(Math.abs(remaining))} over`
            : `${fmt(remaining)} left`}
        </Text>
      </View>
      <View className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <View
          className="h-full rounded-full"
          style={{
            width: `${progress}%`,
            backgroundColor: barColor,
          }}
        />
      </View>
      <View className="flex-row items-center justify-between mt-2">
        <Text className="text-gray-400 dark:text-gray-500 text-xs">
          {fmt(spent)} spent
        </Text>
        <Text className="text-gray-400 dark:text-gray-500 text-xs">
          {fmt(budget)} budget
        </Text>
      </View>
    </Pressable>
  );
}
