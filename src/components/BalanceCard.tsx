import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface BalanceCardProps {
  balance: string;
  currency?: string;
  onPress?: () => void;
}

export function BalanceCard({ balance, currency = '₱', onPress }: BalanceCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
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
        animatedStyle,
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 24,
          elevation: 12,
        },
      ]}
      className="bg-gray-900 dark:bg-gray-800 rounded-[32px] p-8 mx-5"
    >
      <View className="flex-row items-center justify-between mb-8">
        <Text className="text-gray-400 text-base font-medium tracking-wide">
          Available Balance
        </Text>
        <View className="bg-emerald-500/15 rounded-full px-4 py-2">
          <Text className="text-emerald-400 text-xs font-bold">
            +12.5%
          </Text>
        </View>
      </View>
      <View className="flex-row items-baseline">
        <Text className="text-gray-400 text-2xl font-medium mr-2">{currency}</Text>
        <Text className="text-white text-5xl font-bold tracking-tight">
          {balance}
        </Text>
      </View>
      <Text className="text-gray-500 text-sm mt-5">
        vs last month
      </Text>
    </AnimatedPressable>
  );
}
