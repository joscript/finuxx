import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  FadeInDown,
  FadeIn,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedText = Animated.createAnimatedComponent(Text);

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============ MOCK DATA ============
type Period = 'week' | 'month' | 'year';

const MOCK_DATA: Record<Period, {
  income: number;
  expenses: number;
  savings: number;
  forecast: number;
  categories: Array<{
    id: string;
    name: string;
    amount: number;
    percent: number;
    color: string;
    icon: keyof typeof Ionicons.glyphMap;
  }>;
  chartData: number[];
  insights: Array<{
    id: string;
    text: string;
    type: 'warning' | 'tip' | 'success';
  }>;
}> = {
  week: {
    income: 8750,
    expenses: 4320,
    savings: 4430,
    forecast: 52680,
    categories: [
      { id: '1', name: 'Food & Dining', amount: 1850, percent: 42, color: '#f97316', icon: 'restaurant-outline' },
      { id: '2', name: 'Transportation', amount: 920, percent: 21, color: '#3b82f6', icon: 'car-outline' },
      { id: '3', name: 'Entertainment', amount: 650, percent: 15, color: '#a855f7', icon: 'game-controller-outline' },
      { id: '4', name: 'Shopping', amount: 580, percent: 13, color: '#ec4899', icon: 'bag-outline' },
      { id: '5', name: 'Others', amount: 320, percent: 9, color: '#6b7280', icon: 'ellipsis-horizontal-outline' },
    ],
    chartData: [3200, 4100, 2800, 5200, 3900, 4320, 3800],
    insights: [
      { id: '1', text: 'You spend 45% more on food during weekends. Consider meal prepping!', type: 'warning' },
      { id: '2', text: 'Your transportation costs are 15% lower than last week. Great job!', type: 'success' },
    ],
  },
  month: {
    income: 35000,
    expenses: 22500,
    savings: 12500,
    forecast: 60750,
    categories: [
      { id: '1', name: 'Food & Dining', amount: 7200, percent: 32, color: '#f97316', icon: 'restaurant-outline' },
      { id: '2', name: 'Bills & Utilities', amount: 5400, percent: 24, color: '#10b981', icon: 'receipt-outline' },
      { id: '3', name: 'Transportation', amount: 4050, percent: 18, color: '#3b82f6', icon: 'car-outline' },
      { id: '4', name: 'Shopping', amount: 3150, percent: 14, color: '#ec4899', icon: 'bag-outline' },
      { id: '5', name: 'Entertainment', amount: 1800, percent: 8, color: '#a855f7', icon: 'game-controller-outline' },
      { id: '6', name: 'Others', amount: 900, percent: 4, color: '#6b7280', icon: 'ellipsis-horizontal-outline' },
    ],
    chartData: [18000, 21000, 19500, 22500, 20000, 22500, 21000, 23000, 22500, 24000, 21500, 22500],
    insights: [
      { id: '1', text: 'Subscriptions are increasing your monthly cost by ₱1,200. Review unused services.', type: 'warning' },
      { id: '2', text: 'You\'re on track to save ₱12,500 this month. Keep it up!', type: 'success' },
      { id: '3', text: 'Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.', type: 'tip' },
    ],
  },
  year: {
    income: 420000,
    expenses: 285000,
    savings: 135000,
    forecast: 183250,
    categories: [
      { id: '1', name: 'Food & Dining', amount: 85500, percent: 30, color: '#f97316', icon: 'restaurant-outline' },
      { id: '2', name: 'Bills & Utilities', amount: 68400, percent: 24, color: '#10b981', icon: 'receipt-outline' },
      { id: '3', name: 'Transportation', amount: 51300, percent: 18, color: '#3b82f6', icon: 'car-outline' },
      { id: '4', name: 'Shopping', amount: 42750, percent: 15, color: '#ec4899', icon: 'bag-outline' },
      { id: '5', name: 'Entertainment', amount: 22800, percent: 8, color: '#a855f7', icon: 'game-controller-outline' },
      { id: '6', name: 'Others', amount: 14250, percent: 5, color: '#6b7280', icon: 'ellipsis-horizontal-outline' },
    ],
    chartData: [22000, 24500, 21000, 25000, 23500, 26000, 24000, 27000, 25500, 28000, 26500, 27000],
    insights: [
      { id: '1', text: 'Your annual savings rate is 32%. That\'s above the recommended 20%!', type: 'success' },
      { id: '2', text: 'December spending typically increases by 40%. Plan ahead for the holidays.', type: 'tip' },
    ],
  },
};

// ============ SKELETON COMPONENTS ============
interface SkeletonProps {
  width?: number | string;
  height?: number;
  className?: string;
  delay?: number;
}

function Skeleton({ width = '100%', height = 16, className = '', delay = 0 }: SkeletonProps) {
  const shimmerPosition = useSharedValue(0);

  useEffect(() => {
    shimmerPosition.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 1500, easing: Easing.linear }),
        -1,
        false
      )
    );
  }, [delay]);

  const shimmerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmerPosition.value, [0, 0.5, 1], [0.3, 0.7, 0.3]);
    return { opacity };
  });

  return (
    <Animated.View
      style={[shimmerStyle, { width: width as any, height }]}
      className={`bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`}
    />
  );
}

function SkeletonReportCard({ height = 120, delay = 0 }: { height?: number; delay?: number }) {
  return (
    <View
      className="bg-white dark:bg-gray-800 rounded-[24px] p-5 mx-5 mb-4"
      style={{
        height,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <Skeleton width={100} height={14} delay={delay} />
      <Skeleton width="60%" height={32} className="mt-3" delay={delay + 100} />
      <Skeleton width="80%" height={12} className="mt-4" delay={delay + 200} />
    </View>
  );
}

function SkeletonOverviewCards({ delay = 0 }: { delay?: number }) {
  return (
    <View className="flex-row px-5 gap-3 mb-5">
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          className="flex-1 bg-white dark:bg-gray-800 rounded-[20px] p-4"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          <Skeleton width={50} height={12} delay={delay + i * 100} />
          <Skeleton width="80%" height={24} className="mt-2" delay={delay + i * 100 + 50} />
        </View>
      ))}
    </View>
  );
}

function SkeletonChart({ delay = 0 }: { delay?: number }) {
  return (
    <View
      className="bg-white dark:bg-gray-800 rounded-[24px] p-5 mx-5 mb-5"
      style={{
        height: 240,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <View className="flex-row justify-between mb-4">
        <Skeleton width={140} height={18} delay={delay} />
        <View className="flex-row gap-3">
          <Skeleton width={60} height={14} delay={delay + 50} />
          <Skeleton width={60} height={14} delay={delay + 100} />
        </View>
      </View>
      <View className="flex-1 flex-row items-end justify-between px-2">
        {[0.4, 0.6, 0.5, 0.8, 0.65, 0.75, 0.7].map((h, i) => (
          <View key={i} className="items-center flex-1">
            <Skeleton width={20} height={120 * h} delay={delay + 150 + i * 50} className="rounded-t-lg" />
          </View>
        ))}
      </View>
    </View>
  );
}

function SkeletonCategories({ delay = 0 }: { delay?: number }) {
  return (
    <View
      className="bg-white dark:bg-gray-800 rounded-[24px] p-5 mx-5 mb-5"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <Skeleton width={140} height={18} delay={delay} className="mb-4" />
      {[0, 1, 2, 3].map((i) => (
        <View key={i} className="flex-row items-center py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
          <Skeleton width={40} height={40} delay={delay + i * 100} className="rounded-full" />
          <View className="flex-1 ml-3">
            <Skeleton width="50%" height={14} delay={delay + i * 100 + 25} />
            <Skeleton width="30%" height={10} className="mt-2" delay={delay + i * 100 + 50} />
          </View>
          <Skeleton width={60} height={16} delay={delay + i * 100 + 75} />
        </View>
      ))}
    </View>
  );
}

// ============ OVERVIEW CARD COMPONENT ============
interface OverviewCardProps {
  title: string;
  value: number;
  type: 'income' | 'expense' | 'savings';
  index: number;
}

function OverviewCard({ title, value, type, index }: OverviewCardProps) {
  const displayValue = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    opacity.value = withDelay(index * 100, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(index * 100, withSpring(0, { damping: 15 }));
    displayValue.value = withDelay(
      index * 100 + 200,
      withTiming(value, { duration: 1000, easing: Easing.out(Easing.cubic) })
    );
  }, [value, index]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const colors = {
    income: {
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      text: 'text-emerald-600 dark:text-emerald-400',
      icon: 'trending-up' as const,
      iconColor: '#10b981',
    },
    expense: {
      bg: 'bg-rose-50 dark:bg-rose-500/10',
      text: 'text-rose-600 dark:text-rose-400',
      icon: 'trending-down' as const,
      iconColor: '#f43f5e',
    },
    savings: {
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      text: 'text-blue-600 dark:text-blue-400',
      icon: 'wallet' as const,
      iconColor: '#3b82f6',
    },
  };

  const config = colors[type];

  return (
    <AnimatedPressable
      style={[
        cardStyle,
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 4,
        },
      ]}
      className={`flex-1 ${config.bg} rounded-[20px] p-4`}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-gray-500 dark:text-gray-400 text-xs font-medium">{title}</Text>
        <Ionicons name={config.icon} size={16} color={config.iconColor} />
      </View>
      <Text className={`${config.text} text-lg font-bold`}>
        ₱{value.toLocaleString()}
      </Text>
    </AnimatedPressable>
  );
}

// ============ CHART PLACEHOLDER COMPONENT ============
interface ChartPlaceholderProps {
  data: number[];
  period: Period;
}

function ChartPlaceholder({ data, period }: ChartPlaceholderProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    opacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(300, withSpring(0, { damping: 15 }));
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const maxValue = Math.max(...data);
  const labels = period === 'week' 
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : period === 'month'
    ? ['W1', 'W2', 'W3', 'W4']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const displayData = period === 'month' ? data.slice(0, 4) : data;

  return (
    <Animated.View
      style={[
        cardStyle,
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 4,
        },
      ]}
      className="bg-white dark:bg-gray-800 rounded-[24px] p-5 mx-5 mb-5"
    >
      <View className="flex-row items-center justify-between mb-5">
        <Text className="text-gray-900 dark:text-white text-lg font-bold">
          Spending Trend
        </Text>
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-gray-900 dark:bg-white mr-2" />
            <Text className="text-gray-500 dark:text-gray-400 text-xs">Expenses</Text>
          </View>
        </View>
      </View>
      
      <View className="h-40 flex-row items-end justify-between">
        {displayData.map((value, index) => {
          const height = (value / maxValue) * 120;
          return (
            <ChartBar key={index} height={height} label={labels[index]} index={index} />
          );
        })}
      </View>
    </Animated.View>
  );
}

interface ChartBarProps {
  height: number;
  label: string;
  index: number;
}

function ChartBar({ height, label, index }: ChartBarProps) {
  const animatedHeight = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    animatedHeight.value = withDelay(400 + index * 80, withSpring(height, { damping: 12 }));
    opacity.value = withDelay(400 + index * 80, withTiming(1, { duration: 300 }));
  }, [height, index]);

  const barStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
    opacity: opacity.value,
  }));

  return (
    <View className="items-center flex-1">
      <Animated.View
        style={barStyle}
        className="w-6 bg-gray-900 dark:bg-gray-200 rounded-t-lg"
      />
      <Text className="text-gray-400 dark:text-gray-500 text-[10px] mt-2">{label}</Text>
    </View>
  );
}

// ============ CATEGORY ROW COMPONENT ============
interface CategoryRowProps {
  category: {
    id: string;
    name: string;
    amount: number;
    percent: number;
    color: string;
    icon: keyof typeof Ionicons.glyphMap;
  };
  index: number;
}

function CategoryRow({ category, index }: CategoryRowProps) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-20);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(500 + index * 100, withTiming(1, { duration: 400 }));
    translateX.value = withDelay(500 + index * 100, withSpring(0, { damping: 15 }));
    progressWidth.value = withDelay(600 + index * 100, withTiming(category.percent, { duration: 800 }));
  }, [category.percent, index]);

  const rowStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  return (
    <Animated.View
      style={rowStyle}
      className="flex-row items-center py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: `${category.color}20` }}
      >
        <Ionicons name={category.icon} size={20} color={category.color} />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-gray-900 dark:text-white text-sm font-semibold">
          {category.name}
        </Text>
        <View className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
          <Animated.View
            style={[progressStyle, { backgroundColor: category.color }]}
            className="h-full rounded-full"
          />
        </View>
      </View>
      <View className="items-end ml-3">
        <Text className="text-gray-900 dark:text-white text-sm font-bold">
          ₱{category.amount.toLocaleString()}
        </Text>
        <Text className="text-gray-400 dark:text-gray-500 text-xs">
          {category.percent}%
        </Text>
      </View>
    </Animated.View>
  );
}

// ============ FORECAST CARD COMPONENT ============
interface ForecastCardProps {
  value: number;
  currentBalance?: number;
}

function ForecastCard({ value, currentBalance = 48250 }: ForecastCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const trendRotation = useSharedValue(0);

  const isPositive = value > currentBalance;
  const difference = value - currentBalance;
  const percentChange = ((difference / currentBalance) * 100).toFixed(1);

  useEffect(() => {
    opacity.value = withDelay(700, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(700, withSpring(0, { damping: 15 }));
    trendRotation.value = withDelay(900, withRepeat(
      withSequence(
        withTiming(-5, { duration: 500 }),
        withTiming(5, { duration: 500 })
      ),
      -1,
      true
    ));
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${trendRotation.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        cardStyle,
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 4,
        },
      ]}
      className="bg-gray-900 dark:bg-gray-800 rounded-[24px] p-6 mx-5 mb-5"
    >
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-blue-500/20 rounded-full items-center justify-center mr-3">
            <Ionicons name="analytics-outline" size={22} color="#3b82f6" />
          </View>
          <View>
            <Text className="text-gray-400 text-sm font-medium">Future Balance</Text>
            <Text className="text-gray-500 text-xs">In 30 days</Text>
          </View>
        </View>
        <Animated.View style={arrowStyle}>
          <Ionicons
            name={isPositive ? 'arrow-up' : 'arrow-down'}
            size={28}
            color={isPositive ? '#10b981' : '#f43f5e'}
          />
        </Animated.View>
      </View>
      <Text className="text-white text-3xl font-bold mb-2">
        ₱{value.toLocaleString()}
      </Text>
      <View className="flex-row items-center">
        <View className={`px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
          <Text className={`text-xs font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? '+' : ''}{percentChange}%
          </Text>
        </View>
        <Text className="text-gray-500 text-xs ml-2">vs current balance</Text>
      </View>
    </Animated.View>
  );
}

// ============ INSIGHT CARD COMPONENT ============
interface InsightCardProps {
  insights: Array<{
    id: string;
    text: string;
    type: 'warning' | 'tip' | 'success';
  }>;
}

function InsightCard({ insights }: InsightCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    opacity.value = withDelay(800, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(800, withSpring(0, { damping: 15 }));
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const getInsightConfig = (type: 'warning' | 'tip' | 'success') => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-amber-50 dark:bg-amber-500/10',
          border: 'border-amber-200 dark:border-amber-500/30',
          icon: 'alert-circle-outline' as const,
          iconColor: '#f59e0b',
        };
      case 'success':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-500/10',
          border: 'border-emerald-200 dark:border-emerald-500/30',
          icon: 'checkmark-circle-outline' as const,
          iconColor: '#10b981',
        };
      case 'tip':
        return {
          bg: 'bg-blue-50 dark:bg-blue-500/10',
          border: 'border-blue-200 dark:border-blue-500/30',
          icon: 'bulb-outline' as const,
          iconColor: '#3b82f6',
        };
    }
  };

  return (
    <Animated.View
      style={[
        cardStyle,
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 4,
        },
      ]}
      className="bg-white dark:bg-gray-800 rounded-[24px] p-5 mx-5 mb-5"
    >
      <View className="flex-row items-center mb-4">
        <View className="w-8 h-8 bg-purple-100 dark:bg-purple-500/20 rounded-full items-center justify-center mr-3">
          <Ionicons name="sparkles" size={18} color="#a855f7" />
        </View>
        <Text className="text-gray-900 dark:text-white text-lg font-bold">AI Insights</Text>
      </View>
      
      {insights.map((insight, index) => {
        const config = getInsightConfig(insight.type);
        return (
          <View
            key={insight.id}
            className={`${config.bg} border ${config.border} rounded-xl p-4 ${index < insights.length - 1 ? 'mb-3' : ''}`}
          >
            <View className="flex-row">
              <Ionicons name={config.icon} size={20} color={config.iconColor} />
              <Text className="text-gray-700 dark:text-gray-300 text-sm ml-3 flex-1 leading-5">
                {insight.text}
              </Text>
            </View>
          </View>
        );
      })}

      <Pressable className="mt-4 bg-gray-100 dark:bg-gray-700 rounded-xl py-3 items-center active:opacity-70">
        <Text className="text-gray-900 dark:text-white text-sm font-semibold">
          Get Personalized Tips
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ============ HEADER COMPONENT ============
interface HeaderProps {
  selectedPeriod: Period;
  onPeriodChange: (period: Period) => void;
  onFilterPress?: () => void;
}

function Header({ selectedPeriod, onPeriodChange, onFilterPress }: HeaderProps) {
  const periods: Period[] = ['week', 'month', 'year'];

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      className="px-5 pt-4 pb-5"
    >
      <View className="flex-row items-center justify-between mb-5">
        <Text className="text-gray-900 dark:text-white text-3xl font-bold tracking-tight">
          Reports
        </Text>
        <Pressable
          onPress={onFilterPress}
          className="w-11 h-11 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center active:bg-gray-200 dark:active:bg-gray-700"
        >
          <Ionicons name="filter-outline" size={22} color="#6b7280" />
        </Pressable>
      </View>
      
      <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-2xl p-1">
        {periods.map((period) => {
          const isSelected = selectedPeriod === period;
          return (
            <Pressable
              key={period}
              onPress={() => onPeriodChange(period)}
              className={`flex-1 py-3 rounded-xl items-center ${
                isSelected ? 'bg-gray-900 dark:bg-gray-600' : ''
              }`}
            >
              <Text
                className={`text-sm font-semibold capitalize ${
                  isSelected
                    ? 'text-white'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {period}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

// ============ CATEGORY BREAKDOWN SECTION ============
interface CategoryBreakdownProps {
  categories: Array<{
    id: string;
    name: string;
    amount: number;
    percent: number;
    color: string;
    icon: keyof typeof Ionicons.glyphMap;
  }>;
}

function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    opacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(400, withSpring(0, { damping: 15 }));
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        cardStyle,
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 4,
        },
      ]}
      className="bg-white dark:bg-gray-800 rounded-[24px] p-5 mx-5 mb-5"
    >
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-gray-900 dark:text-white text-lg font-bold">
          Category Breakdown
        </Text>
        <Pressable className="active:opacity-60">
          <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium underline">
            See All
          </Text>
        </Pressable>
      </View>
      
      {categories.slice(0, 5).map((category, index) => (
        <CategoryRow key={category.id} category={category} index={index} />
      ))}
    </Animated.View>
  );
}

// ============ SKELETON LOADING STATE ============
function SkeletonLoading() {
  return (
    <View className="flex-1">
      {/* Header Skeleton */}
      <View className="px-5 pt-4 pb-5">
        <View className="flex-row items-center justify-between mb-5">
          <Skeleton width={120} height={32} />
          <Skeleton width={44} height={44} className="rounded-full" />
        </View>
        <Skeleton width="100%" height={48} className="rounded-2xl" delay={100} />
      </View>

      {/* Overview Cards Skeleton */}
      <SkeletonOverviewCards delay={200} />

      {/* Chart Skeleton */}
      <SkeletonChart delay={300} />

      {/* Categories Skeleton */}
      <SkeletonCategories delay={400} />

      {/* Forecast Skeleton */}
      <SkeletonReportCard height={150} delay={500} />

      {/* Insights Skeleton */}
      <SkeletonReportCard height={200} delay={600} />
    </View>
  );
}

// ============ MAIN REPORTS SCREEN ============
export default function ReportsScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Reset loading when period changes
  const handlePeriodChange = useCallback((period: Period) => {
    setIsLoading(true);
    setSelectedPeriod(period);
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  const handleFilterPress = () => {
    console.log('Filter pressed');
  };

  const currentData = MOCK_DATA[selectedPeriod];

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {isLoading ? (
          <SkeletonLoading />
        ) : (
          <>
            {/* Header with Period Selector */}
            <Header
              selectedPeriod={selectedPeriod}
              onPeriodChange={handlePeriodChange}
              onFilterPress={handleFilterPress}
            />

            {/* Overview Cards */}
            <View className="flex-row px-5 gap-3 mb-5">
              <OverviewCard
                title="Income"
                value={currentData.income}
                type="income"
                index={0}
              />
              <OverviewCard
                title="Expenses"
                value={currentData.expenses}
                type="expense"
                index={1}
              />
              <OverviewCard
                title="Savings"
                value={currentData.savings}
                type="savings"
                index={2}
              />
            </View>

            {/* Spending Trend Chart */}
            <ChartPlaceholder data={currentData.chartData} period={selectedPeriod} />

            {/* Category Breakdown */}
            <CategoryBreakdown categories={currentData.categories} />

            {/* Forecast Card */}
            <ForecastCard value={currentData.forecast} />

            {/* AI Insights */}
            <InsightCard insights={currentData.insights} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
