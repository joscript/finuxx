import React, { useEffect } from "react";
import { View, Text, Pressable, Image, useColorScheme } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  FadeIn,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
}

export function AICoachInsightHeader({
  userName,
  avatarUrl,
  insight,
  budgetHealthColor = "good",
  onPress,
  onNotificationPress,
  onSettingsPress,
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

  const cardScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.35);
  const iconScale = useSharedValue(1);
  const dotOpacity = useSharedValue(1);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.65, { duration: 2200 }),
        withTiming(0.35, { duration: 2200 }),
      ),
      -1,
      true,
    );
    iconScale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 1400 }),
        withTiming(1, { duration: 1400 }),
      ),
      -1,
      true,
    );
    dotOpacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 900 }),
        withTiming(1, { duration: 900 }),
      ),
      -1,
      true,
    );
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  return (
    <Animated.View entering={FadeIn.duration(500)} className="px-4 pt-3 pb-1">
      {/* Top row: avatar + greeting + action buttons */}
      <View className="flex-row items-center justify-between mb-4 px-1">
        <View className="flex-row items-center flex-1">
          <View
            style={{
              borderWidth: 2,
              borderColor: avatarRingColor,
              borderRadius: 9999,
              padding: 2,
            }}
          >
            <Image
              source={{ uri: avatarUrl }}
              className="w-10 h-10 rounded-full bg-gray-200"
            />
          </View>
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

      {/* AI Coach Insight Card */}
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => {
          cardScale.value = withSpring(0.97);
        }}
        onPressOut={() => {
          cardScale.value = withSpring(1);
        }}
        style={[
          cardStyle,
          {
            shadowColor: "#7c3aed",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 28,
            elevation: 12,
            borderWidth: 1,
            borderColor: "rgba(139, 92, 246, 0.2)",
          },
        ]}
        className="rounded-[28px] overflow-hidden"
      >
        <View className="bg-[#0d0d1a] p-6">
          {/* Ambient glow blobs */}
          <Animated.View
            style={glowStyle}
            className="absolute -top-8 -right-8 w-48 h-48 bg-violet-600/35 rounded-full"
          />
          <Animated.View
            style={glowStyle}
            className="absolute -bottom-6 -left-6 w-32 h-32 bg-violet-400/20 rounded-full"
          />

          {/* Header row: label + live dot */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <Animated.View
                style={iconStyle}
                className="w-9 h-9 bg-violet-500/25 rounded-xl items-center justify-center"
              >
                <Ionicons name="sparkles" size={18} color="#a78bfa" />
              </Animated.View>
              <Text className="text-violet-400 text-xs font-bold tracking-widest uppercase">
                AI Insight
              </Text>
              <Animated.View
                style={dotStyle}
                className="w-2 h-2 bg-emerald-400 rounded-full"
              />
            </View>
          </View>

          {/* Insight message */}
          <Text
            className="text-white text-[15px] font-medium leading-relaxed mb-4"
            numberOfLines={3}
            ellipsizeMode="tail"
          >
            {insight}
          </Text>

          {/* CTA row */}
          <View
            className="flex-row items-center justify-between rounded-2xl px-4 py-3"
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.10)",
            }}
          >
            <View className="flex-row items-center gap-2">
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={14}
                color="#a78bfa"
              />
              <Text className="text-violet-300 text-xs font-bold">
                Chat with AI Coach
              </Text>
            </View>
            <View className="w-7 h-7 bg-white/10 rounded-full items-center justify-center">
              <Ionicons name="arrow-forward" size={14} color="#fff" />
            </View>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}
