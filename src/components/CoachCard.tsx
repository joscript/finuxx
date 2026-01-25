import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

interface CoachCardProps {
  onPress?: () => void;
}

export function CoachCard({ onPress }: CoachCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(1);
  const iconScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
    
    // Subtle pulsing glow effect
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500 }),
        withTiming(0.5, { duration: 1500 })
      ),
      -1,
      true
    );

    // Subtle icon bounce
    iconScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        containerStyle,
        {
          shadowColor: '#7c3aed',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.2,
          shadowRadius: 20,
          elevation: 8,
        },
      ]}
      className="mx-5 rounded-[28px] overflow-hidden"
    >
      <View className="bg-gray-900 dark:bg-gray-800 p-7">
        <View className="flex-row items-center">
          <View className="relative">
            <AnimatedView
              style={glowStyle}
              className="absolute -inset-3 bg-violet-500/30 rounded-full"
            />
            <AnimatedView
              style={iconAnimatedStyle}
              className="w-14 h-14 bg-violet-500/20 rounded-2xl items-center justify-center"
            >
              <Ionicons name="sparkles" size={26} color="#a78bfa" />
            </AnimatedView>
          </View>
          <View className="flex-1 ml-5">
            <Text className="text-white text-lg font-bold tracking-tight mb-1">
              Ask your AI Coach
            </Text>
            <Text className="text-gray-400 text-sm">
              Get personalized financial advice
            </Text>
          </View>
          <View className="w-10 h-10 bg-white/10 rounded-full items-center justify-center">
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}
