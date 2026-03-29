import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { CircularProgress } from './CircularProgress';
import { useCurrency } from '../../hooks/useCurrency';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface BudgetSummaryCardProps {
  totalBudget: number;
  totalSpent: number;
  period: 'monthly' | 'weekly';
  onPress?: () => void;
}

export function BudgetSummaryCard({ totalBudget, totalSpent, period, onPress }: BudgetSummaryCardProps) {
  const fmt = useCurrency();
  const scale = useSharedValue(1);
  const remaining = totalBudget - totalSpent;
  const percentage = (totalSpent / totalBudget) * 100;
  const isNearLimit = percentage >= 80;
  const isOverLimit = percentage >= 100;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const getStatusText = () => {
    if (isOverLimit) return 'Over Budget';
    if (isNearLimit) return 'Near Limit';
    return 'On Track';
  };

  const getStatusBgColor = () => {
    if (isOverLimit) return 'bg-red-100 dark:bg-red-500/20';
    if (isNearLimit) return 'bg-amber-100 dark:bg-amber-500/20';
    return 'bg-emerald-100 dark:bg-emerald-500/20';
  };

  const getStatusTextColor = () => {
    if (isOverLimit) return 'text-red-600 dark:text-red-400';
    if (isNearLimit) return 'text-amber-600 dark:text-amber-400';
    return 'text-emerald-600 dark:text-emerald-400';
  };

  const getProgressColor = () => {
    if (isOverLimit) return '#ef4444';
    if (isNearLimit) return '#f59e0b';
    return '#22c55e';
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
          shadowOpacity: 0.08,
          shadowRadius: 16,
          elevation: 6,
        },
      ]}
      className="bg-white dark:bg-gray-800 rounded-[28px] mx-5 p-7"
    >
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-1">
          <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
            {period === 'monthly' ? 'Monthly' : 'Weekly'} Budget
          </Text>
          <Text className="text-gray-900 dark:text-white text-3xl font-bold tracking-tight">
            {fmt(remaining)}
          </Text>
          <Text className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            remaining
          </Text>
        </View>
        <View className="items-center">
          <CircularProgress
            percentage={Math.min(percentage, 100)}
            color={getProgressColor()}
            size={80}
            strokeWidth={8}
          />
        </View>
      </View>

      {/* Status Badge */}
      <View className="flex-row items-center mb-5">
        <View className={`${getStatusBgColor()} rounded-full px-3.5 py-1.5 flex-row items-center`}>
          <Ionicons
            name={isOverLimit ? 'warning' : isNearLimit ? 'alert-circle' : 'checkmark-circle'}
            size={14}
            color={isOverLimit ? '#ef4444' : isNearLimit ? '#f59e0b' : '#22c55e'}
          />
          <Text className={`${getStatusTextColor()} text-xs font-bold ml-1.5`}>
            {getStatusText()}
          </Text>
        </View>
      </View>

      {/* Spent vs Budget Row */}
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-gray-400 dark:text-gray-500 text-xs mb-0.5">Spent</Text>
          <Text className="text-gray-900 dark:text-white text-lg font-semibold">
            {fmt(totalSpent)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-gray-400 dark:text-gray-500 text-xs mb-0.5">Total Budget</Text>
          <Text className="text-gray-900 dark:text-white text-lg font-semibold">
            {fmt(totalBudget)}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}
