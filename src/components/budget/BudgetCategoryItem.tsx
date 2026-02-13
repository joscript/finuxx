import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInUp,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedProgressBar } from './AnimatedProgressBar';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface BudgetCategoryItemProps {
  id: string;
  name: string;
  icon: string;
  spent: number;
  budget: number;
  color: string;
  iconBgColor: string;
  index: number;
  onPress?: () => void;
}

export function BudgetCategoryItem({
  id,
  name,
  icon,
  spent,
  budget,
  color,
  iconBgColor,
  index,
  onPress,
}: BudgetCategoryItemProps) {
  const scale = useSharedValue(1);
  const percentage = (spent / budget) * 100;
  const isNearLimit = percentage >= 80 && percentage < 100;
  const isOverLimit = percentage >= 100;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const getProgressColor = () => {
    if (isOverLimit) return '#ef4444';
    if (isNearLimit) return '#f59e0b';
    return color;
  };

  const getPercentageBgColor = () => {
    if (isOverLimit) return 'bg-red-100 dark:bg-red-500/20';
    if (isNearLimit) return 'bg-amber-100 dark:bg-amber-500/20';
    return 'bg-gray-100 dark:bg-gray-700';
  };

  const getPercentageTextColor = () => {
    if (isOverLimit) return 'text-red-600 dark:text-red-400';
    if (isNearLimit) return 'text-amber-600 dark:text-amber-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <Animated.View entering={FadeInUp.duration(400).delay(100 + index * 80)}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          animatedStyle,
          {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          },
        ]}
        className="bg-white dark:bg-gray-800 rounded-[24px] mx-5 p-5 mb-4"
      >
        <View className="flex-row items-center">
          {/* Icon */}
          <View className={`${iconBgColor} w-[52px] h-[52px] rounded-2xl items-center justify-center`}>
            <Ionicons name={icon as any} size={24} color={color} />
          </View>

          {/* Content */}
          <View className="flex-1 ml-4">
            {/* Name and Alert */}
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center flex-1">
                <Text className="text-gray-900 dark:text-white text-base font-semibold">
                  {name}
                </Text>
                {(isNearLimit || isOverLimit) && (
                  <Ionicons
                    name="alert-circle"
                    size={16}
                    color={isOverLimit ? '#ef4444' : '#f59e0b'}
                    style={{ marginLeft: 6 }}
                  />
                )}
              </View>
            </View>

            {/* Progress Bar */}
            <AnimatedProgressBar
              percentage={percentage}
              color={getProgressColor()}
              delay={200 + index * 80}
            />

            {/* Amount and Percentage */}
            <View className="flex-row items-center justify-between mt-2">
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                ₱{spent.toLocaleString()} / ₱{budget.toLocaleString()}
              </Text>
              <View className={`${getPercentageBgColor()} rounded-full px-2.5 py-1`}>
                <Text className={`${getPercentageTextColor()} text-xs font-bold`}>
                  {Math.round(percentage)}%
                </Text>
              </View>
            </View>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}
