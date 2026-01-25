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

interface BudgetProgressCardProps {
  spent: number;
  total: number;
  currency?: string;
  onPress?: () => void;
}

export function BudgetProgressCard({
  spent,
  total,
  currency = '₱',
  onPress,
}: BudgetProgressCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(1);
  const progressWidth = useSharedValue(0);

  const percentage = Math.min((spent / total) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isOverLimit = percentage >= 100;

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
    progressWidth.value = withDelay(
      300,
      withTiming(percentage, { duration: 800, easing: Easing.out(Easing.cubic) })
    );
  }, [percentage]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const getStatusColor = () => {
    if (isOverLimit) return 'bg-danger-500';
    if (isNearLimit) return 'bg-warning-500';
    return 'bg-success-500';
  };

  const getStatusText = () => {
    if (isOverLimit) return 'Over Budget';
    if (isNearLimit) return 'Near Limit';
    return 'On Track';
  };

  const getStatusBgColor = () => {
    if (isOverLimit) return 'bg-danger-100 dark:bg-danger-500/20';
    if (isNearLimit) return 'bg-warning-100 dark:bg-warning-500/20';
    return 'bg-success-100 dark:bg-success-500/20';
  };

  const getStatusTextColor = () => {
    if (isOverLimit) return 'text-danger-600 dark:text-danger-500';
    if (isNearLimit) return 'text-warning-600 dark:text-warning-500';
    return 'text-success-600 dark:text-success-500';
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
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          elevation: 6,
        },
      ]}
      className="bg-white dark:bg-gray-800 rounded-[28px] p-7 mx-5"
    >
      <View className="flex-row justify-between items-center mb-6">
        <View className="flex-1">
          <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
            Monthly Budget
          </Text>
          <Text className="text-gray-900 dark:text-white text-2xl font-bold tracking-tight">
            {currency}{(total - spent).toLocaleString()} left
          </Text>
        </View>
        <View className="flex-row items-center">
          <View className={`${getStatusBgColor()} rounded-full px-3.5 py-1.5 mr-2`}>
            <Text className={`${getStatusTextColor()} text-xs font-bold`}>
              {getStatusText()}
            </Text>
          </View>
          <View className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full items-center justify-center">
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
        <AnimatedView
          style={progressStyle}
          className={`h-full ${getStatusColor()} rounded-full`}
        />
      </View>

      <View className="flex-row justify-between items-center">
        <Text className="text-gray-500 dark:text-gray-400 text-sm">
          {currency}{spent.toLocaleString()} spent
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-sm">
          {currency}{total.toLocaleString()} budget
        </Text>
      </View>
    </AnimatedPressable>
  );
}
