import React, { useEffect } from "react";
import { View, Text, Pressable, Image } from "react-native";
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
  onPress: () => void;
  onNotificationPress?: () => void;
  onSettingsPress?: () => void;
}

export function AICoachInsightHeader({
  userName,
  avatarUrl,
  insight,
  onPress,
  onNotificationPress,
  onSettingsPress,
}: AICoachInsightHeaderProps) {
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
          <Image
            source={{ uri: avatarUrl }}
            className="w-11 h-11 rounded-full bg-gray-200"
          />
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
            <Ionicons name="notifications-outline" size={20} color="#374151" />
            <View className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-gray-900" />
          </Pressable>
          <Pressable
            onPress={onSettingsPress}
            className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center active:bg-gray-200 dark:active:bg-gray-700"
          >
            <Ionicons name="menu-outline" size={20} color="#374151" />
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
          },
        ]}
        className="rounded-[28px] overflow-hidden"
      >
        <View className="bg-gray-900 p-6">
          {/* Ambient glow blobs */}
          <Animated.View
            style={glowStyle}
            className="absolute -top-8 -right-8 w-48 h-48 bg-primary-600/40 rounded-full"
          />
          <Animated.View
            style={glowStyle}
            className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary-400/30 rounded-full"
          />

          {/* Header row: label + live dot */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <Animated.View
                style={iconStyle}
                className="w-9 h-9 bg-primary-500/25 rounded-xl items-center justify-center"
              >
                <Ionicons name="sparkles" size={18} color="#a78bfa" />
              </Animated.View>
              <Text className="text-primary-400 text-xs font-bold tracking-widest uppercase">
                AI Insight
              </Text>
            </View>
          </View>

          {/* Insight message */}
          <Text className="text-white text-[15px] font-medium leading-relaxed mb-5">
            {insight}
          </Text>

          {/* CTA row */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center bg-primary-500/20 rounded-full px-4 py-2 gap-2">
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={14}
                color="#a78bfa"
              />
              <Text className="text-primary-300 text-xs font-bold">
                Chat with AI Coach
              </Text>
            </View>
            <View className="w-9 h-9 bg-white/10 rounded-full items-center justify-center">
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </View>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}
