import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface AICoachInsightCardProps {
  insight: string;
  onPress: () => void;
}

export function AICoachInsightCard({
  insight,
  onPress,
}: AICoachInsightCardProps) {
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
        <View className="flex-row items-center gap-2 mb-4">
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
  );
}
