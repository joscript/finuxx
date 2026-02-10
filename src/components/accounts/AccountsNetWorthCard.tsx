import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AccountsNetWorthCardProps {
  assets: number;
  liabilities: number;
  currency?: string;
  trend?: number;
  onPress?: () => void;
}

export function AccountsNetWorthCard({
  assets,
  liabilities,
  currency = '₱',
  trend = 5.2,
  onPress,
}: AccountsNetWorthCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(1);
  const assetsWidth = useSharedValue(0);
  const liabilitiesWidth = useSharedValue(0);

  const netWorth = assets - liabilities;
  const total = assets + liabilities;
  const assetsPercentage = total > 0 ? (assets / total) * 100 : 50;
  const liabilitiesPercentage = total > 0 ? (liabilities / total) * 100 : 50;

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
    assetsWidth.value = withDelay(
      400,
      withTiming(assetsPercentage, { duration: 800, easing: Easing.out(Easing.cubic) })
    );
    liabilitiesWidth.value = withDelay(
      500,
      withTiming(liabilitiesPercentage, { duration: 800, easing: Easing.out(Easing.cubic) })
    );
  }, [assetsPercentage, liabilitiesPercentage]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const assetsBarStyle = useAnimatedStyle(() => ({
    width: `${assetsWidth.value}%`,
  }));

  const liabilitiesBarStyle = useAnimatedStyle(() => ({
    width: `${liabilitiesWidth.value}%`,
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
        containerStyle,
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 20,
          elevation: 8,
        },
      ]}
      className="bg-gray-900 dark:bg-gray-800 rounded-[28px] p-7 mx-5"
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center">
          <View className={`w-8 h-8 rounded-full items-center justify-center mr-2 ${netWorth >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
            <Ionicons
              name={netWorth >= 0 ? 'trending-up' : 'trending-down'}
              size={16}
              color={netWorth >= 0 ? '#10b981' : '#ef4444'}
            />
          </View>
          <Text className="text-gray-400 text-sm font-medium">Net Worth</Text>
        </View>
        <View className={`px-3 py-1.5 rounded-full ${trend >= 0 ? 'bg-emerald-500/15' : 'bg-red-500/15'}`}>
          <Text className={`text-xs font-bold ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </Text>
        </View>
      </View>

      {/* Net Worth Value */}
      <View className="flex-row items-baseline mb-6">
        <Text className="text-gray-400 text-2xl font-medium mr-2">{currency}</Text>
        <Text className={`text-5xl font-bold tracking-tight ${netWorth >= 0 ? 'text-white' : 'text-red-400'}`}>
          {netWorth < 0 ? '-' : ''}{Math.abs(netWorth).toLocaleString()}
        </Text>
      </View>

      {/* Assets & Liabilities Bar */}
      <View className="flex-row h-3 rounded-full overflow-hidden mb-5 bg-gray-700">
        <AnimatedView
          style={assetsBarStyle}
          className="h-full bg-emerald-500 rounded-l-full"
        />
        <AnimatedView
          style={liabilitiesBarStyle}
          className="h-full bg-red-400 rounded-r-full"
        />
      </View>

      {/* Stats Row */}
      <View className="flex-row justify-between">
        <View className="flex-1 mr-4">
          <View className="flex-row items-center mb-2">
            <View className="w-3 h-3 bg-emerald-500 rounded-full mr-2" />
            <Text className="text-gray-400 text-xs font-medium uppercase tracking-wide">Assets</Text>
          </View>
          <Text className="text-white text-xl font-bold">
            {currency}{assets.toLocaleString()}
          </Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <View className="w-3 h-3 bg-red-400 rounded-full mr-2" />
            <Text className="text-gray-400 text-xs font-medium uppercase tracking-wide">Liabilities</Text>
          </View>
          <Text className="text-white text-xl font-bold">
            {currency}{liabilities.toLocaleString()}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}
