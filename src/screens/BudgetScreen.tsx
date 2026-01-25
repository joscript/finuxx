import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, FlatList, Modal, Dimensions, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============ MOCK DATA ============
const MOCK_BUDGET_DATA = {
  totalBudget: 45000,
  totalSpent: 28750,
  period: 'monthly' as const,
};

const INITIAL_CATEGORIES = [
  {
    id: '1',
    name: 'Food & Dining',
    icon: 'restaurant-outline',
    spent: 8200,
    budget: 10000,
    color: '#22c55e',
    iconBgColor: 'bg-emerald-100 dark:bg-emerald-500/20',
  },
  {
    id: '2',
    name: 'Transportation',
    icon: 'car-outline',
    spent: 4800,
    budget: 5000,
    color: '#f59e0b',
    iconBgColor: 'bg-amber-100 dark:bg-amber-500/20',
  },
  {
    id: '3',
    name: 'Shopping',
    icon: 'bag-outline',
    spent: 7500,
    budget: 6000,
    color: '#ef4444',
    iconBgColor: 'bg-red-100 dark:bg-red-500/20',
  },
  {
    id: '4',
    name: 'Entertainment',
    icon: 'game-controller-outline',
    spent: 2400,
    budget: 4000,
    color: '#8b5cf6',
    iconBgColor: 'bg-violet-100 dark:bg-violet-500/20',
  },
  {
    id: '5',
    name: 'Bills & Utilities',
    icon: 'receipt-outline',
    spent: 3850,
    budget: 8000,
    color: '#3b82f6',
    iconBgColor: 'bg-blue-100 dark:bg-blue-500/20',
  },
  {
    id: '6',
    name: 'Healthcare',
    icon: 'medkit-outline',
    spent: 1200,
    budget: 3000,
    color: '#ec4899',
    iconBgColor: 'bg-pink-100 dark:bg-pink-500/20',
  },
  {
    id: '7',
    name: 'Education',
    icon: 'school-outline',
    spent: 800,
    budget: 5000,
    color: '#06b6d4',
    iconBgColor: 'bg-cyan-100 dark:bg-cyan-500/20',
  },
  {
    id: '8',
    name: 'Personal Care',
    icon: 'sparkles-outline',
    spent: 0,
    budget: 4000,
    color: '#a855f7',
    iconBgColor: 'bg-purple-100 dark:bg-purple-500/20',
  },
];

// Available categories for adding new budgets
const AVAILABLE_CATEGORIES = [
  { name: 'Food & Dining', icon: 'restaurant-outline', color: '#22c55e', iconBgColor: 'bg-emerald-100 dark:bg-emerald-500/20' },
  { name: 'Transportation', icon: 'car-outline', color: '#f59e0b', iconBgColor: 'bg-amber-100 dark:bg-amber-500/20' },
  { name: 'Shopping', icon: 'bag-outline', color: '#ef4444', iconBgColor: 'bg-red-100 dark:bg-red-500/20' },
  { name: 'Entertainment', icon: 'game-controller-outline', color: '#8b5cf6', iconBgColor: 'bg-violet-100 dark:bg-violet-500/20' },
  { name: 'Bills & Utilities', icon: 'receipt-outline', color: '#3b82f6', iconBgColor: 'bg-blue-100 dark:bg-blue-500/20' },
  { name: 'Healthcare', icon: 'medkit-outline', color: '#ec4899', iconBgColor: 'bg-pink-100 dark:bg-pink-500/20' },
  { name: 'Education', icon: 'school-outline', color: '#06b6d4', iconBgColor: 'bg-cyan-100 dark:bg-cyan-500/20' },
  { name: 'Personal Care', icon: 'sparkles-outline', color: '#a855f7', iconBgColor: 'bg-purple-100 dark:bg-purple-500/20' },
  { name: 'Groceries', icon: 'cart-outline', color: '#10b981', iconBgColor: 'bg-green-100 dark:bg-green-500/20' },
  { name: 'Subscriptions', icon: 'card-outline', color: '#6366f1', iconBgColor: 'bg-indigo-100 dark:bg-indigo-500/20' },
  { name: 'Travel', icon: 'airplane-outline', color: '#0ea5e9', iconBgColor: 'bg-sky-100 dark:bg-sky-500/20' },
  { name: 'Gifts', icon: 'gift-outline', color: '#f43f5e', iconBgColor: 'bg-rose-100 dark:bg-rose-500/20' },
  { name: 'Savings', icon: 'wallet-outline', color: '#14b8a6', iconBgColor: 'bg-teal-100 dark:bg-teal-500/20' },
  { name: 'Other', icon: 'ellipsis-horizontal-outline', color: '#6b7280', iconBgColor: 'bg-gray-100 dark:bg-gray-500/20' },
];

type CategoryType = typeof INITIAL_CATEGORIES[0];

// ============ SKELETON SHIMMER COMPONENT ============
interface SkeletonShimmerProps {
  width?: number | string;
  height?: number;
  className?: string;
  delay?: number;
}

function SkeletonShimmer({ width = '100%', height = 16, className = '', delay = 0 }: SkeletonShimmerProps) {
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
    const translateX = interpolate(shimmerPosition.value, [0, 1], [-100, 100]);
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View
      className={`bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden ${className}`}
      style={{ width: typeof width === 'number' ? width : width as any, height }}
    >
      <AnimatedView
        style={shimmerStyle}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
      />
    </View>
  );
}

// ============ SKELETON BUDGET CARD ============
function SkeletonBudgetCard() {
  return (
    <View
      className="bg-white dark:bg-gray-800 rounded-[28px] mx-5 p-7"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
      }}
    >
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-1">
          <SkeletonShimmer width={100} height={12} className="mb-2 rounded-full" />
          <SkeletonShimmer width={150} height={28} className="rounded-full" delay={50} />
        </View>
        <SkeletonShimmer width={80} height={80} className="rounded-full" delay={100} />
      </View>
      <SkeletonShimmer width="100%" height={12} className="rounded-full mb-4" delay={150} />
      <View className="flex-row justify-between">
        <SkeletonShimmer width={80} height={14} className="rounded-full" delay={200} />
        <SkeletonShimmer width={80} height={14} className="rounded-full" delay={250} />
      </View>
    </View>
  );
}

// ============ SKELETON CATEGORY ITEM ============
function SkeletonCategoryItem({ delay = 0 }: { delay?: number }) {
  return (
    <View
      className="bg-white dark:bg-gray-800 rounded-[24px] mx-5 p-5 mb-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View className="flex-row items-center">
        <SkeletonShimmer width={52} height={52} className="rounded-2xl" delay={delay} />
        <View className="flex-1 ml-4">
          <SkeletonShimmer width="60%" height={16} className="mb-2 rounded-full" delay={delay + 50} />
          <SkeletonShimmer width="100%" height={10} className="rounded-full mb-2" delay={delay + 100} />
          <View className="flex-row justify-between">
            <SkeletonShimmer width="40%" height={12} className="rounded-full" delay={delay + 150} />
            <SkeletonShimmer width={40} height={20} className="rounded-full" delay={delay + 200} />
          </View>
        </View>
      </View>
    </View>
  );
}

// ============ CIRCULAR PROGRESS COMPONENT ============
interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  bgColor?: string;
}

function CircularProgress({
  percentage,
  size = 80,
  strokeWidth = 8,
  color,
  bgColor = '#e5e7eb',
}: CircularProgressProps) {
  const progress = useSharedValue(0);
  const displayPercentage = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      300,
      withTiming(percentage / 100, { duration: 1000, easing: Easing.out(Easing.cubic) })
    );
    displayPercentage.value = withDelay(
      300,
      withTiming(percentage, { duration: 1000, easing: Easing.out(Easing.cubic) })
    );
  }, [percentage]);

  const animatedRotation = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 360}deg` }],
  }));

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      {/* Background Circle */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: bgColor,
        }}
        className="dark:border-gray-700"
      />
      
      {/* Progress indicator - using rotating half circle technique */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          transform: [{ rotate: '-90deg' }],
        }}
      >
        <AnimatedView
          style={[
            animatedRotation,
            {
              position: 'absolute',
              width: size,
              height: size,
            },
          ]}
        >
          <View
            style={{
              position: 'absolute',
              width: size,
              height: size / 2,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: strokeWidth,
                borderColor: color,
                borderBottomColor: 'transparent',
                borderRightColor: 'transparent',
              }}
            />
          </View>
        </AnimatedView>
      </View>

      {/* Center percentage text */}
      <Text className="text-gray-900 dark:text-white text-lg font-bold">
        {Math.round(percentage)}%
      </Text>
    </View>
  );
}

// ============ ANIMATED PROGRESS BAR ============
interface AnimatedProgressBarProps {
  percentage: number;
  color: string;
  delay?: number;
}

function AnimatedProgressBar({ percentage, color, delay = 0 }: AnimatedProgressBarProps) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(
      delay,
      withTiming(Math.min(percentage, 100), { duration: 800, easing: Easing.out(Easing.cubic) })
    );
  }, [percentage, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
      <AnimatedView
        style={[animatedStyle, { backgroundColor: color }]}
        className="h-full rounded-full"
      />
    </View>
  );
}

// ============ BUDGET SUMMARY CARD ============
interface BudgetSummaryCardProps {
  totalBudget: number;
  totalSpent: number;
  period: 'monthly' | 'weekly';
  onPress?: () => void;
}

function BudgetSummaryCard({ totalBudget, totalSpent, period, onPress }: BudgetSummaryCardProps) {
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
            ₱{remaining.toLocaleString()}
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
            ₱{totalSpent.toLocaleString()}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-gray-400 dark:text-gray-500 text-xs mb-0.5">Total Budget</Text>
          <Text className="text-gray-900 dark:text-white text-lg font-semibold">
            ₱{totalBudget.toLocaleString()}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

// ============ BUDGET CATEGORY ITEM ============
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

function BudgetCategoryItem({
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

// ============ ADD BUDGET CARD ============
interface AddBudgetCardProps {
  onPress?: () => void;
}

function AddBudgetCard({ onPress }: AddBudgetCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
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
        animatedStyle,
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 3,
        },
      ]}
      className="bg-white dark:bg-gray-800 rounded-[24px] mx-5 p-5 mb-4 border-2 border-dashed border-gray-200 dark:border-gray-700"
    >
      <View className="flex-row items-center justify-center">
        <View className="bg-gray-100 dark:bg-gray-700 w-12 h-12 rounded-full items-center justify-center mr-4">
          <Ionicons name="add" size={24} color="#6b7280" />
        </View>
        <Text className="text-gray-500 dark:text-gray-400 text-base font-semibold">
          Add Category Budget
        </Text>
      </View>
    </AnimatedPressable>
  );
}

// ============ PERIOD TOGGLE ============
interface PeriodToggleProps {
  period: 'monthly' | 'weekly';
  onToggle: (period: 'monthly' | 'weekly') => void;
}

function PeriodToggle({ period, onToggle }: PeriodToggleProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const translateX = useSharedValue(0);

  // Calculate the translation distance (half of container width minus padding)
  const indicatorWidth = containerWidth > 0 ? (containerWidth - 8) / 2 : 0;

  useEffect(() => {
    if (containerWidth > 0) {
      translateX.value = withSpring(period === 'monthly' ? 0 : indicatorWidth, { 
        damping: 15, 
        stiffness: 200 
      });
    }
  }, [period, containerWidth, indicatorWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: indicatorWidth,
  }));

  return (
    <View 
      className="flex-row bg-gray-100 dark:bg-gray-800 rounded-full p-1 mx-5"
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {/* Animated Indicator */}
      {containerWidth > 0 && (
        <AnimatedView
          style={[indicatorStyle, { position: 'absolute', top: 4, left: 4, height: 36 }]}
          className="bg-white dark:bg-gray-700 rounded-full"
        />
      )}

      <Pressable
        onPress={() => onToggle('monthly')}
        className="flex-1 py-2.5 items-center justify-center z-10"
      >
        <Text
          className={`text-sm font-semibold ${
            period === 'monthly'
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Monthly
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onToggle('weekly')}
        className="flex-1 py-2.5 items-center justify-center z-10"
      >
        <Text
          className={`text-sm font-semibold ${
            period === 'weekly'
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Weekly
        </Text>
      </Pressable>
    </View>
  );
}

// ============ EDIT BUDGET MODAL ============
interface EditBudgetModalProps {
  visible: boolean;
  category: CategoryType | null;
  onClose: () => void;
  onSave: (categoryId: string, newBudget: number) => void;
  onDelete: (categoryId: string) => void;
}

function EditBudgetModal({ visible, category, onClose, onSave, onDelete }: EditBudgetModalProps) {
  const [budgetAmount, setBudgetAmount] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (category) {
      setBudgetAmount(category.budget.toString());
    }
    setShowDeleteConfirm(false);
  }, [category, visible]);

  const handleSave = () => {
    const amount = parseFloat(budgetAmount.replace(/,/g, ''));
    if (!isNaN(amount) && amount > 0 && category) {
      onSave(category.id, amount);
      onClose();
    }
  };

  const handleDelete = () => {
    if (category) {
      onDelete(category.id);
      onClose();
    }
  };

  const formatInput = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    if (numericValue) {
      const formatted = parseInt(numericValue, 10).toLocaleString();
      setBudgetAmount(formatted);
    } else {
      setBudgetAmount('');
    }
  };

  if (!category) return null;

  const percentage = category.budget > 0 ? (category.spent / category.budget) * 100 : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <Pressable
          onPress={onClose}
          className="flex-1 bg-black/50 justify-end"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-t-[32px] px-6 pt-4 pb-10"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.15,
              shadowRadius: 24,
              elevation: 10,
            }}
          >
            {/* Handle Bar */}
            <View className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full self-center mb-6" />

            {/* Header */}
            <View className="flex-row items-center mb-6">
              <View className={`${category.iconBgColor} w-14 h-14 rounded-2xl items-center justify-center`}>
                <Ionicons name={category.icon as any} size={26} color={category.color} />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-gray-900 dark:text-white text-xl font-bold">
                  {category.name}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  ₱{category.spent.toLocaleString()} spent ({Math.round(percentage)}% used)
                </Text>
              </View>
            </View>

            {/* Budget Input */}
            <View className="mb-6">
              <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">
                Monthly Budget
              </Text>
              <View className="flex-row items-center bg-gray-100 dark:bg-gray-700 rounded-2xl px-5 py-4">
                <Text className="text-gray-900 dark:text-white text-2xl font-bold mr-2">₱</Text>
                <TextInput
                  value={budgetAmount}
                  onChangeText={formatInput}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  className="flex-1 text-gray-900 dark:text-white text-2xl font-bold"
                />
              </View>
            </View>

            {/* Quick Amount Buttons */}
            <View className="flex-row flex-wrap gap-2 mb-6">
              {[1000, 2500, 5000, 10000, 15000, 20000].map((amount) => (
                <Pressable
                  key={amount}
                  onPress={() => setBudgetAmount(amount.toLocaleString())}
                  className="bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 active:bg-gray-200 dark:active:bg-gray-600"
                >
                  <Text className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                    ₱{amount.toLocaleString()}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Delete Confirmation */}
            {showDeleteConfirm ? (
              <View className="bg-red-50 dark:bg-red-500/10 rounded-2xl p-4 mb-4">
                <Text className="text-red-600 dark:text-red-400 text-sm font-medium text-center mb-3">
                  Are you sure you want to delete this budget?
                </Text>
                <View className="flex-row gap-3">
                  <Pressable
                    onPress={() => setShowDeleteConfirm(false)}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-xl py-3 items-center active:opacity-80"
                  >
                    <Text className="text-gray-700 dark:text-gray-300 text-base font-semibold">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleDelete}
                    className="flex-1 bg-red-500 rounded-xl py-3 items-center active:opacity-80"
                  >
                    <Text className="text-white text-base font-semibold">Delete</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => setShowDeleteConfirm(true)}
                className="flex-row items-center justify-center py-3 mb-4"
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
                <Text className="text-red-500 text-sm font-medium ml-2">Delete Budget</Text>
              </Pressable>
            )}

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <Pressable
                onPress={onClose}
                className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-2xl py-4 items-center active:opacity-80"
              >
                <Text className="text-gray-700 dark:text-gray-300 text-base font-bold">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                className="flex-1 bg-gray-900 dark:bg-white rounded-2xl py-4 items-center active:opacity-80"
              >
                <Text className="text-white dark:text-gray-900 text-base font-bold">Save Changes</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ============ ADD BUDGET MODAL ============
interface AddBudgetModalProps {
  visible: boolean;
  existingCategories: string[];
  onClose: () => void;
  onAdd: (category: { name: string; icon: string; color: string; iconBgColor: string; budget: number }) => void;
}

function AddBudgetModal({ visible, existingCategories, onClose, onAdd }: AddBudgetModalProps) {
  const [step, setStep] = useState<'category' | 'amount'>('category');
  const [selectedCategory, setSelectedCategory] = useState<typeof AVAILABLE_CATEGORIES[0] | null>(null);
  const [budgetAmount, setBudgetAmount] = useState('');

  useEffect(() => {
    if (visible) {
      setStep('category');
      setSelectedCategory(null);
      setBudgetAmount('');
    }
  }, [visible]);

  const availableToAdd = AVAILABLE_CATEGORIES.filter(
    (cat) => !existingCategories.includes(cat.name)
  );

  const handleCategorySelect = (category: typeof AVAILABLE_CATEGORIES[0]) => {
    setSelectedCategory(category);
    setStep('amount');
  };

  const handleAdd = () => {
    const amount = parseFloat(budgetAmount.replace(/,/g, ''));
    if (!isNaN(amount) && amount > 0 && selectedCategory) {
      onAdd({
        ...selectedCategory,
        budget: amount,
      });
      onClose();
    }
  };

  const formatInput = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    if (numericValue) {
      const formatted = parseInt(numericValue, 10).toLocaleString();
      setBudgetAmount(formatted);
    } else {
      setBudgetAmount('');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <Pressable
          onPress={onClose}
          className="flex-1 bg-black/50 justify-end"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-t-[32px] px-6 pt-4 pb-10 max-h-[85%]"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.15,
              shadowRadius: 24,
              elevation: 10,
            }}
          >
            {/* Handle Bar */}
            <View className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full self-center mb-6" />

            {step === 'category' ? (
              <>
                {/* Category Selection Header */}
                <View className="mb-6">
                  <Text className="text-gray-900 dark:text-white text-xl font-bold">
                    Add New Budget
                  </Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Select a category for your budget
                  </Text>
                </View>

                {/* Category Grid */}
                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  className="max-h-[400px]"
                >
                  <View className="flex-row flex-wrap">
                    {availableToAdd.map((category) => (
                      <Pressable
                        key={category.name}
                        onPress={() => handleCategorySelect(category)}
                        className="w-[48%] bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 mb-3 mr-[4%] active:opacity-70"
                        style={{ marginRight: availableToAdd.indexOf(category) % 2 === 0 ? '4%' : 0 }}
                      >
                        <View className={`${category.iconBgColor} w-12 h-12 rounded-xl items-center justify-center mb-3`}>
                          <Ionicons name={category.icon as any} size={24} color={category.color} />
                        </View>
                        <Text className="text-gray-900 dark:text-white text-sm font-semibold">
                          {category.name}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  {availableToAdd.length === 0 && (
                    <View className="items-center py-10">
                      <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
                      <Text className="text-gray-500 dark:text-gray-400 text-base mt-3 text-center">
                        All categories have budgets!
                      </Text>
                    </View>
                  )}
                </ScrollView>

                {/* Cancel Button */}
                <Pressable
                  onPress={onClose}
                  className="bg-gray-100 dark:bg-gray-700 rounded-2xl py-4 items-center mt-4 active:opacity-80"
                >
                  <Text className="text-gray-700 dark:text-gray-300 text-base font-bold">Cancel</Text>
                </Pressable>
              </>
            ) : (
              <>
                {/* Amount Step Header */}
                <Pressable
                  onPress={() => setStep('category')}
                  className="flex-row items-center mb-6"
                >
                  <Ionicons name="chevron-back" size={24} color="#6b7280" />
                  <Text className="text-gray-500 dark:text-gray-400 text-sm ml-1">Back</Text>
                </Pressable>

                {/* Selected Category */}
                <View className="flex-row items-center mb-6">
                  <View className={`${selectedCategory?.iconBgColor} w-14 h-14 rounded-2xl items-center justify-center`}>
                    <Ionicons name={selectedCategory?.icon as any} size={26} color={selectedCategory?.color} />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-gray-900 dark:text-white text-xl font-bold">
                      {selectedCategory?.name}
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                      Set your monthly budget
                    </Text>
                  </View>
                </View>

                {/* Budget Input */}
                <View className="mb-6">
                  <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">
                    Monthly Budget
                  </Text>
                  <View className="flex-row items-center bg-gray-100 dark:bg-gray-700 rounded-2xl px-5 py-4">
                    <Text className="text-gray-900 dark:text-white text-2xl font-bold mr-2">₱</Text>
                    <TextInput
                      value={budgetAmount}
                      onChangeText={formatInput}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#9ca3af"
                      autoFocus
                      className="flex-1 text-gray-900 dark:text-white text-2xl font-bold"
                    />
                  </View>
                </View>

                {/* Quick Amount Buttons */}
                <View className="flex-row flex-wrap gap-2 mb-6">
                  {[1000, 2500, 5000, 10000, 15000, 20000].map((amount) => (
                    <Pressable
                      key={amount}
                      onPress={() => setBudgetAmount(amount.toLocaleString())}
                      className="bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 active:bg-gray-200 dark:active:bg-gray-600"
                    >
                      <Text className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                        ₱{amount.toLocaleString()}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-3">
                  <Pressable
                    onPress={onClose}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-2xl py-4 items-center active:opacity-80"
                  >
                    <Text className="text-gray-700 dark:text-gray-300 text-base font-bold">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleAdd}
                    disabled={!budgetAmount}
                    className={`flex-1 rounded-2xl py-4 items-center active:opacity-80 ${
                      budgetAmount ? 'bg-gray-900 dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <Text className={`text-base font-bold ${
                      budgetAmount ? 'text-white dark:text-gray-900' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      Add Budget
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ============ SKELETON LOADING STATE ============
function SkeletonLoading() {
  return (
    <View className="flex-1">
      {/* Header Skeleton */}
      <View className="px-5 py-6">
        <SkeletonShimmer width={120} height={32} className="rounded-full mb-2" />
        <SkeletonShimmer width={180} height={16} className="rounded-full" delay={50} />
      </View>

      {/* Toggle Skeleton */}
      <View className="mx-5 mb-6">
        <SkeletonShimmer width="100%" height={44} className="rounded-full" delay={100} />
      </View>

      {/* Summary Card Skeleton */}
      <SkeletonBudgetCard />

      {/* Section Header Skeleton */}
      <View className="px-5 mt-8 mb-4">
        <SkeletonShimmer width={140} height={22} className="rounded-full" delay={200} />
      </View>

      {/* Category Skeletons */}
      <SkeletonCategoryItem delay={250} />
      <SkeletonCategoryItem delay={350} />
      <SkeletonCategoryItem delay={450} />
      <SkeletonCategoryItem delay={550} />
    </View>
  );
}

// ============ MAIN BUDGET SCREEN ============
export default function BudgetScreen() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'monthly' | 'weekly'>('monthly');
  const [categories, setCategories] = useState<CategoryType[]>(INITIAL_CATEGORIES);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Calculate totals from categories
  const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);

  // Get budget data based on period
  const getBudgetData = useCallback(() => {
    if (period === 'weekly') {
      return {
        totalBudget: Math.round(totalBudget / 4),
        totalSpent: Math.round(totalSpent / 4),
        categories: categories.map((cat) => ({
          ...cat,
          budget: Math.round(cat.budget / 4),
          spent: Math.round(cat.spent / 4),
        })),
      };
    }
    return {
      totalBudget,
      totalSpent,
      categories,
    };
  }, [period, categories, totalBudget, totalSpent]);

  const budgetData = getBudgetData();

  const handlePeriodToggle = (newPeriod: 'monthly' | 'weekly') => {
    setPeriod(newPeriod);
  };

  const handleCategoryPress = (category: CategoryType) => {
    setSelectedCategory(category);
    setEditModalVisible(true);
  };

  const handleAddCategory = () => {
    setAddModalVisible(true);
  };

  const handleSaveBudget = (categoryId: string, newBudget: number) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, budget: newBudget } : cat
      )
    );
  };

  const handleDeleteBudget = (categoryId: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
  };

  const handleAddNewBudget = (newCategory: { name: string; icon: string; color: string; iconBgColor: string; budget: number }) => {
    const newId = (Math.max(...categories.map((c) => parseInt(c.id, 10))) + 1).toString();
    setCategories((prev) => [
      ...prev,
      {
        id: newId,
        name: newCategory.name,
        icon: newCategory.icon,
        color: newCategory.color,
        iconBgColor: newCategory.iconBgColor,
        budget: newCategory.budget,
        spent: 0,
      },
    ]);
  };

  const handleSummaryPress = () => {
    console.log('Summary card pressed');
  };

  const renderCategoryItem = useCallback(
    ({ item, index }: { item: CategoryType; index: number }) => (
      <BudgetCategoryItem
        key={item.id}
        id={item.id}
        name={item.name}
        icon={item.icon}
        spent={item.spent}
        budget={item.budget}
        color={item.color}
        iconBgColor={item.iconBgColor}
        index={index}
        onPress={() => handleCategoryPress(item)}
      />
    ),
    []
  );

  const ListHeaderComponent = useCallback(
    () => (
      <>
        {/* Header with Back Button */}
        <Animated.View entering={FadeIn.duration(400)} className="px-5 py-6">
          <View className="flex-row items-center mb-2">
            <Pressable
              onPress={() => navigation.goBack()}
              className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mr-3 active:bg-gray-200 dark:active:bg-gray-700"
            >
              <Ionicons name="chevron-back" size={22} color="#374151" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-gray-900 dark:text-white text-3xl font-bold tracking-tight">
                Budgets
              </Text>
            </View>
          </View>
          <Text className="text-gray-500 dark:text-gray-400 text-base ml-[52px]">
            {period === 'monthly' ? 'Stay on track this month' : 'Stay on track this week'}
          </Text>
        </Animated.View>

        {/* Period Toggle */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} className="mb-6">
          <PeriodToggle period={period} onToggle={handlePeriodToggle} />
        </Animated.View>

        {/* Budget Summary Card */}
        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
          <BudgetSummaryCard
            totalBudget={budgetData.totalBudget}
            totalSpent={budgetData.totalSpent}
            period={period}
            onPress={handleSummaryPress}
          />
        </Animated.View>

        {/* Section Header */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(300)}
          className="flex-row items-center justify-between px-5 mt-8 mb-4"
        >
          <Text className="text-gray-900 dark:text-white text-xl font-bold tracking-tight">
            Categories
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            {budgetData.categories.length} active
          </Text>
        </Animated.View>
      </>
    ),
    [period, budgetData.totalBudget, budgetData.totalSpent, budgetData.categories.length]
  );

  const ListFooterComponent = useCallback(
    () => (
      <Animated.View entering={FadeInUp.duration(400).delay(100 + budgetData.categories.length * 80)}>
        <AddBudgetCard onPress={handleAddCategory} />
        <View className="h-8" />
      </Animated.View>
    ),
    [budgetData.categories.length]
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
        <SkeletonLoading />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
      <FlatList
        data={budgetData.categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      />

      {/* Edit Budget Modal */}
      <EditBudgetModal
        visible={editModalVisible}
        category={selectedCategory}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveBudget}
        onDelete={handleDeleteBudget}
      />

      {/* Add Budget Modal */}
      <AddBudgetModal
        visible={addModalVisible}
        existingCategories={categories.map((c) => c.name)}
        onClose={() => setAddModalVisible(false)}
        onAdd={handleAddNewBudget}
      />
    </SafeAreaView>
  );
}
