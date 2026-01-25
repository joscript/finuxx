import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type IconName = keyof typeof Ionicons.glyphMap;

interface StatItemProps {
  title: string;
  value: string;
  icon: IconName;
  iconColor?: string;
  iconBgColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  onPress?: () => void;
}

export function StatItem({
  title,
  value,
  icon,
  iconColor = '#3b82f6',
  iconBgColor = 'bg-primary-100 dark:bg-primary-500/20',
  trend,
  trendValue,
  onPress,
}: StatItemProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-success-500';
    if (trend === 'down') return 'text-danger-500';
    return 'text-gray-500';
  };

  const getTrendIcon = (): IconName => {
    if (trend === 'up') return 'arrow-up';
    if (trend === 'down') return 'arrow-down';
    return 'remove';
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
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 4,
        },
      ]}
      className="w-48 bg-white dark:bg-gray-800 rounded-[24px] p-6 mr-4"
    >
      <View className={`w-12 h-12 ${iconBgColor} rounded-2xl items-center justify-center mb-5`}>
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      <Text className="text-gray-500 dark:text-gray-400 text-xs font-semibold mb-2 tracking-wider uppercase">
        {title}
      </Text>
      <View className="flex-row items-center justify-between">
        <Text className="text-gray-900 dark:text-white text-xl font-bold">
          {value}
        </Text>
        {trend && trendValue && (
          <View className="flex-row items-center bg-gray-100 dark:bg-gray-700 rounded-full px-2.5 py-1">
            <Ionicons name={getTrendIcon()} size={10} color={trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#6b7280'} />
            <Text className={`${getTrendColor()} text-xs font-bold ml-1`}>
              {trendValue}
            </Text>
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
}
