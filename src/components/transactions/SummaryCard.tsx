import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useCurrency } from '../../hooks/useCurrency';

interface SummaryCardProps {
  totalIncome: number;
  totalExpense: number;
}

export default function SummaryCard({ totalIncome, totalExpense }: SummaryCardProps) {
  const fmt = useCurrency();
  const netAmount = totalIncome - totalExpense;
  const isPositive = netAmount >= 0;
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4,
        },
      ]}
      className="bg-gray-900 rounded-[24px] mx-5 p-5 mb-4"
    >
      <View className="flex-row items-center justify-between">
        {/* Income */}
        <View className="flex-1 items-center">
          <View className="flex-row items-center mb-2">
            <View className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 items-center justify-center mr-2">
              <Ionicons name="arrow-down" size={14} color="#22c55e" />
            </View>
            <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              Income
            </Text>
          </View>
          <Text className="text-emerald-500 dark:text-emerald-400 text-lg font-bold">
            +{fmt(totalIncome)}
          </Text>
        </View>

        {/* Divider */}
        <View className="w-px h-12 bg-gray-200 dark:bg-gray-700" />

        {/* Expense */}
        <View className="flex-1 items-center">
          <View className="flex-row items-center mb-2">
            <View className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-500/20 items-center justify-center mr-2">
              <Ionicons name="arrow-up" size={14} color="#ef4444" />
            </View>
            <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              Expense
            </Text>
          </View>
          <Text className="text-red-500 dark:text-red-400 text-lg font-bold">
            -{fmt(totalExpense)}
          </Text>
        </View>

        {/* Divider */}
        <View className="w-px h-12 bg-gray-200 dark:bg-gray-700" />

        {/* Net */}
        <View className="flex-1 items-center">
          <View className="flex-row items-center mb-2">
            <View
              className={`w-6 h-6 rounded-full items-center justify-center mr-2 ${
                isPositive
                  ? 'bg-emerald-100 dark:bg-emerald-500/20'
                  : 'bg-red-100 dark:bg-red-500/20'
              }`}
            >
              <Ionicons
                name={isPositive ? 'trending-up' : 'trending-down'}
                size={14}
                color={isPositive ? '#22c55e' : '#ef4444'}
              />
            </View>
            <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              Net
            </Text>
          </View>
          <Text
            className={`text-lg font-bold ${
              isPositive
                ? 'text-emerald-500 dark:text-emerald-400'
                : 'text-red-500 dark:text-red-400'
            }`}
          >
            {isPositive ? '+' : ''}
            {fmt(netAmount)}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}
