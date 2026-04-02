import React from "react";
import { View, Text, Pressable, Image, useColorScheme } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { AICoachInsightCard } from "./AICoachInsightCard";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export interface AICoachInsightHeaderProps {
  userName: string;
  avatarUrl: string;
  insight: string;
  budgetHealthColor?: "good" | "warning" | "danger";
  onPress: () => void;
  onNotificationPress?: () => void;
  onSettingsPress?: () => void;
  showInsightCard?: boolean;
}

export function AICoachInsightHeader({
  userName,
  avatarUrl,
  insight,
  budgetHealthColor = "good",
  onPress,
  onNotificationPress,
  onSettingsPress,
  showInsightCard = true,
}: AICoachInsightHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#d1d5db" : "#374151";
  const avatarRingColor =
    budgetHealthColor === "danger"
      ? "#ef4444"
      : budgetHealthColor === "warning"
        ? "#f59e0b"
        : "#22c55e";

  return (
    <Animated.View entering={FadeIn.duration(500)} className="px-4 pt-3 pb-1">
      {/* Top row: avatar + greeting + action buttons */}
      <View className="flex-row items-center justify-between mb-4 px-1">
        <View className="flex-row items-center flex-1">
          <View className="ml-3">
            <Text className="text-gray-400 dark:text-gray-500 text-xs font-medium">
              {getGreeting()}
            </Text>
            <Text className="text-gray-900 dark:text-white text-xl font-bold tracking-tight">
              {userName} 👋
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={onNotificationPress}
            className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center active:bg-gray-200 dark:active:bg-gray-700"
          >
            <Ionicons
              name="notifications-outline"
              size={20}
              color={iconColor}
            />
            <View className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-gray-900" />
          </Pressable>
          <Pressable
            onPress={onSettingsPress}
            className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center active:bg-gray-200 dark:active:bg-gray-700"
          >
            <Ionicons name="menu-outline" size={20} color={iconColor} />
          </Pressable>
        </View>
      </View>

      {showInsightCard && (
        <AICoachInsightCard insight={insight} onPress={onPress} />
      )}
    </Animated.View>
  );
}
