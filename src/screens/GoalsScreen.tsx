import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  Modal,
  Dimensions,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { Goal, GoalContribution } from '../types';
import AddContributionModal from '../components/AddContributionModal';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============ MOCK DATA ============
const MOCK_GOALS: Goal[] = [
  {
    id: '1',
    name: 'Travel to Japan',
    emoji: '✈️',
    targetAmount: 80000,
    currentAmount: 52000,
    deadline: 'Apr 2026',
    monthsLeft: 3,
    monthlyContribution: 9500,
    color: '#3b82f6',
    iconBgColor: 'bg-blue-100 dark:bg-blue-500/20',
    contributions: [
      { id: 'c1', goalId: '1', accountId: '1', accountName: 'BDO Savings', amount: 10000, date: new Date('2025-11-15') },
      { id: 'c2', goalId: '1', accountId: '3', accountName: 'GCash', amount: 5000, date: new Date('2025-12-01') },
      { id: 'c3', goalId: '1', accountId: '1', accountName: 'BDO Savings', amount: 9500, date: new Date('2025-12-15') },
      { id: 'c4', goalId: '1', accountId: '1', accountName: 'BDO Savings', amount: 9500, date: new Date('2026-01-15') },
    ],
  },
  {
    id: '2',
    name: 'Emergency Fund',
    emoji: '🛡️',
    targetAmount: 150000,
    currentAmount: 95000,
    deadline: 'Jul 2026',
    monthsLeft: 6,
    monthlyContribution: 9200,
    color: '#22c55e',
    iconBgColor: 'bg-emerald-100 dark:bg-emerald-500/20',
    contributions: [],
  },
  {
    id: '3',
    name: 'New MacBook Pro',
    emoji: '💻',
    targetAmount: 120000,
    currentAmount: 45000,
    deadline: 'Oct 2026',
    monthsLeft: 9,
    monthlyContribution: 8400,
    color: '#8b5cf6',
    iconBgColor: 'bg-violet-100 dark:bg-violet-500/20',
    contributions: [],
  },
  {
    id: '4',
    name: 'Wedding Fund',
    emoji: '💍',
    targetAmount: 500000,
    currentAmount: 125000,
    deadline: 'Dec 2027',
    monthsLeft: 23,
    monthlyContribution: 16350,
    color: '#ec4899',
    iconBgColor: 'bg-pink-100 dark:bg-pink-500/20',
    contributions: [],
  },
  {
    id: '5',
    name: 'Car Down Payment',
    emoji: '🚗',
    targetAmount: 200000,
    currentAmount: 68000,
    deadline: 'Mar 2027',
    monthsLeft: 14,
    monthlyContribution: 9450,
    color: '#f59e0b',
    iconBgColor: 'bg-amber-100 dark:bg-amber-500/20',
    contributions: [],
  },
];

const MOCK_AI_SUGGESTIONS = [
  {
    id: '1',
    text: 'Add ₱500/month to reach your Japan trip goal 2 weeks sooner.',
    icon: 'trending-up-outline',
    action: 'Adjust',
  },
  {
    id: '2',
    text: 'Pause your ₱549 Netflix subscription to boost savings by ₱6,588/year.',
    icon: 'pause-circle-outline',
    action: 'Review',
  },
];

// ============ SKELETON SHIMMER COMPONENT ============
interface SkeletonShimmerProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
  delay?: number;
}

function SkeletonShimmer({
  width = '100%',
  height = 16,
  borderRadius = 8,
  className = '',
  delay = 0,
}: SkeletonShimmerProps) {
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0, { duration: 1000 })
        ),
        -1,
        false
      )
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmerValue.value, [0, 1], [0.3, 0.7], Extrapolation.CLAMP),
  }));

  return (
    <AnimatedView
      style={[
        animatedStyle,
        {
          width: typeof width === 'number' ? width : undefined,
          height,
          borderRadius,
        },
        typeof width === 'string' ? { flex: 1 } : {},
      ]}
      className={`bg-gray-200 dark:bg-gray-700 ${className}`}
    />
  );
}

// ============ SKELETON GOAL CARD ============
function SkeletonGoalCard({ delay = 0 }: { delay?: number }) {
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
      <View className="flex-row items-start">
        <SkeletonShimmer width={56} height={56} borderRadius={16} delay={delay} />
        <View className="flex-1 ml-4">
          <SkeletonShimmer width={140} height={18} borderRadius={9} delay={delay + 50} className="mb-2" />
          <SkeletonShimmer width={100} height={14} borderRadius={7} delay={delay + 100} className="mb-3" />
          <SkeletonShimmer width="100%" height={10} borderRadius={5} delay={delay + 150} className="mb-2" />
          <View className="flex-row justify-between">
            <SkeletonShimmer width={80} height={12} borderRadius={6} delay={delay + 200} />
            <SkeletonShimmer width={60} height={22} borderRadius={11} delay={delay + 250} />
          </View>
        </View>
      </View>
    </View>
  );
}

// ============ SKELETON OVERVIEW CARD ============
function SkeletonOverviewCard() {
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
          <SkeletonShimmer width={100} height={12} borderRadius={6} className="mb-2" />
          <SkeletonShimmer width={150} height={28} borderRadius={14} delay={50} />
        </View>
        <SkeletonShimmer width={80} height={80} borderRadius={40} delay={100} />
      </View>
      <View className="flex-row justify-between">
        <View>
          <SkeletonShimmer width={70} height={12} borderRadius={6} delay={150} className="mb-1" />
          <SkeletonShimmer width={50} height={20} borderRadius={10} delay={200} />
        </View>
        <View className="items-end">
          <SkeletonShimmer width={90} height={12} borderRadius={6} delay={250} className="mb-1" />
          <SkeletonShimmer width={80} height={20} borderRadius={10} delay={300} />
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
  showPercentage?: boolean;
}

function CircularProgress({
  percentage,
  size = 80,
  strokeWidth = 8,
  color,
  bgColor = '#e5e7eb',
  showPercentage = true,
}: CircularProgressProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      300,
      withTiming(percentage / 100, { duration: 1000, easing: Easing.out(Easing.cubic) })
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

      {/* Progress indicator */}
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
      {showPercentage && (
        <Text className="text-gray-900 dark:text-white text-lg font-bold">
          {Math.round(percentage)}%
        </Text>
      )}
    </View>
  );
}

// ============ ANIMATED PROGRESS BAR ============
interface AnimatedProgressBarProps {
  percentage: number;
  color: string;
  delay?: number;
  height?: number;
}

function AnimatedProgressBar({ percentage, color, delay = 0, height = 10 }: AnimatedProgressBarProps) {
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
    <View
      style={{ height }}
      className="bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"
    >
      <AnimatedView
        style={[animatedStyle, { backgroundColor: color, height }]}
        className="rounded-full"
      />
    </View>
  );
}

// ============ GOALS OVERVIEW CARD ============
interface GoalsOverviewCardProps {
  totalGoals: number;
  monthlyContribution: number;
  overallProgress: number;
  onPress?: () => void;
}

function GoalsOverviewCard({
  totalGoals,
  monthlyContribution,
  overallProgress,
  onPress,
}: GoalsOverviewCardProps) {
  const scale = useSharedValue(1);
  const countValue = useSharedValue(0);
  const contributionValue = useSharedValue(0);

  useEffect(() => {
    countValue.value = withDelay(
      200,
      withTiming(totalGoals, { duration: 800, easing: Easing.out(Easing.cubic) })
    );
    contributionValue.value = withDelay(
      400,
      withTiming(monthlyContribution, { duration: 1000, easing: Easing.out(Easing.cubic) })
    );
  }, [totalGoals, monthlyContribution]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View entering={FadeInDown.duration(500).delay(100)}>
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
              Total Goals
            </Text>
            <Text className="text-gray-900 dark:text-white text-4xl font-bold tracking-tight">
              {totalGoals}
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              active savings goals
            </Text>
          </View>
          <CircularProgress
            percentage={overallProgress}
            color="#22c55e"
            size={80}
            strokeWidth={8}
          />
        </View>

        {/* Monthly Contribution */}
        <View className="flex-row items-center justify-between pt-5 border-t border-gray-100 dark:border-gray-700">
          <View>
            <Text className="text-gray-400 dark:text-gray-500 text-xs mb-0.5">
              Monthly Contribution
            </Text>
            <Text className="text-gray-900 dark:text-white text-xl font-bold">
              ₱{monthlyContribution.toLocaleString()}
            </Text>
          </View>
          <View className="bg-emerald-100 dark:bg-emerald-500/20 rounded-full px-3.5 py-1.5 flex-row items-center">
            <Ionicons name="trending-up" size={14} color="#22c55e" />
            <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-bold ml-1.5">
              On Track
            </Text>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

// ============ GOAL ITEM COMPONENT ============
interface GoalItemProps {
  goal: Goal;
  index: number;
  onPress?: () => void;
  onAddFunds?: () => void;
}

function GoalItem({ goal, index, onPress, onAddFunds }: GoalItemProps) {
  const scale = useSharedValue(1);
  const addFundsScale = useSharedValue(1);
  const percentage = (goal.currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.currentAmount;
  const isOnTrack = goal.monthlyContribution * goal.monthsLeft >= remaining;
  const isComplete = goal.currentAmount >= goal.targetAmount;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const addFundsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: addFundsScale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handleAddFundsPressIn = () => {
    addFundsScale.value = withSpring(0.9);
  };

  const handleAddFundsPressOut = () => {
    addFundsScale.value = withSpring(1);
  };

  const getStatusBgColor = () => {
    if (isComplete) return 'bg-emerald-500';
    return isOnTrack
      ? 'bg-emerald-100 dark:bg-emerald-500/20'
      : 'bg-amber-100 dark:bg-amber-500/20';
  };

  const getStatusTextColor = () => {
    if (isComplete) return 'text-white';
    return isOnTrack
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-amber-600 dark:text-amber-400';
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
        <View className="flex-row items-start">
          {/* Emoji Icon */}
          <View
            className={`${goal.iconBgColor} w-14 h-14 rounded-2xl items-center justify-center`}
          >
            <Text className="text-2xl">{goal.emoji}</Text>
          </View>

          {/* Content */}
          <View className="flex-1 ml-4">
            {/* Name and Timeline */}
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-gray-900 dark:text-white text-base font-semibold flex-1">
                {goal.name}
              </Text>
            </View>

            {/* Target and Timeline */}
            <View className="flex-row items-center mb-3">
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                ₱{goal.targetAmount.toLocaleString()}
              </Text>
              <View className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 mx-2" />
              <Text className="text-gray-400 dark:text-gray-500 text-sm">
                {goal.monthsLeft} month{goal.monthsLeft !== 1 ? 's' : ''} left
              </Text>
            </View>

            {/* Progress Bar */}
            <AnimatedProgressBar
              percentage={percentage}
              color={goal.color}
              delay={200 + index * 80}
            />

            {/* Amount and Status */}
            <View className="flex-row items-center justify-between mt-3">
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                ₱{goal.currentAmount.toLocaleString()} saved
              </Text>
              <View
                className={`${getStatusBgColor()} rounded-full px-2.5 py-1 flex-row items-center`}
              >
                <Ionicons
                  name={isComplete ? 'trophy' : isOnTrack ? 'checkmark-circle' : 'time'}
                  size={12}
                  color={isComplete ? '#ffffff' : isOnTrack ? '#22c55e' : '#f59e0b'}
                />
                <Text className={`${getStatusTextColor()} text-xs font-bold ml-1`}>
                  {isComplete ? 'Complete!' : isOnTrack ? 'On Track' : 'Behind'}
                </Text>
              </View>
            </View>

            {/* Add Funds Button */}
            {!isComplete && (
              <AnimatedPressable
                onPress={(e) => {
                  e.stopPropagation();
                  onAddFunds?.();
                }}
                onPressIn={handleAddFundsPressIn}
                onPressOut={handleAddFundsPressOut}
                className="mt-4 flex-row items-center justify-center py-3 rounded-xl"
                style={[
                  addFundsAnimatedStyle,
                  { backgroundColor: `${goal.color}15` },
                ]}
              >
                <Ionicons name="add-circle" size={18} color={goal.color} />
                <Text style={{ color: goal.color }} className="font-bold ml-2">
                  Add Funds
                </Text>
              </AnimatedPressable>
            )}

            {/* Contribution Count */}
            {goal.contributions.length > 0 && (
              <View className="flex-row items-center mt-3">
                <Ionicons name="receipt-outline" size={14} color="#9ca3af" />
                <Text className="text-gray-400 dark:text-gray-500 text-xs ml-1.5">
                  {goal.contributions.length} contribution{goal.contributions.length !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

// ============ SIMULATION CARD ============
interface SimulationCardProps {
  currentContribution: number;
  onContributionChange?: (value: number) => void;
}

function SimulationCard({ currentContribution, onContributionChange }: SimulationCardProps) {
  const [sliderValue, setSliderValue] = useState(currentContribution);
  const scale = useSharedValue(1);
  const monthsSaved = useSharedValue(0);

  // Calculate how many months saved based on contribution increase
  const baseMonths = 12;
  const additionalContribution = sliderValue - currentContribution;
  const weeksSaved = Math.max(0, Math.floor(additionalContribution / 250)); // ~1 week per ₱250 extra

  useEffect(() => {
    monthsSaved.value = withTiming(weeksSaved / 4, { duration: 300 });
  }, [weeksSaved]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handleSliderChange = (value: number) => {
    setSliderValue(Math.round(value));
    onContributionChange?.(Math.round(value));
  };

  return (
    <Animated.View entering={FadeInDown.duration(500).delay(400)}>
      <AnimatedPressable
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
        className="bg-white dark:bg-gray-800 rounded-[28px] mx-5 p-6"
      >
        {/* Header */}
        <View className="flex-row items-center mb-4">
          <View className="bg-violet-100 dark:bg-violet-500/20 w-10 h-10 rounded-xl items-center justify-center">
            <Ionicons name="calculator-outline" size={20} color="#8b5cf6" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-gray-900 dark:text-white text-lg font-bold">
              What if you save more?
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              Adjust your monthly contribution
            </Text>
          </View>
        </View>

        {/* Slider */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-400 dark:text-gray-500 text-sm">Monthly</Text>
            <Text className="text-gray-900 dark:text-white text-xl font-bold">
              ₱{sliderValue.toLocaleString()}
            </Text>
          </View>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={currentContribution}
            maximumValue={currentContribution * 2}
            value={sliderValue}
            onValueChange={handleSliderChange}
            minimumTrackTintColor="#8b5cf6"
            maximumTrackTintColor="#e5e7eb"
            thumbTintColor="#8b5cf6"
          />
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-400 dark:text-gray-500 text-xs">
              ₱{currentContribution.toLocaleString()}
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-xs">
              ₱{(currentContribution * 2).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Result */}
        {weeksSaved > 0 && (
          <Animated.View
            entering={FadeIn.duration(300)}
            className="bg-violet-50 dark:bg-violet-500/10 rounded-2xl p-4 flex-row items-center"
          >
            <Ionicons name="flash" size={24} color="#8b5cf6" />
            <View className="ml-3 flex-1">
              <Text className="text-violet-600 dark:text-violet-400 text-sm font-semibold">
                You could reach your goal
              </Text>
              <Text className="text-violet-800 dark:text-violet-300 text-lg font-bold">
                {weeksSaved} week{weeksSaved !== 1 ? 's' : ''} sooner!
              </Text>
            </View>
          </Animated.View>
        )}
      </AnimatedPressable>
    </Animated.View>
  );
}

// ============ AI SUGGESTION CARD ============
interface AISuggestionCardProps {
  suggestions: typeof MOCK_AI_SUGGESTIONS;
  onSuggestionPress?: (id: string) => void;
}

function AISuggestionCard({ suggestions, onSuggestionPress }: AISuggestionCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View entering={FadeInDown.duration(500).delay(500)}>
      <AnimatedPressable
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
        className="bg-gradient-to-br mx-5 rounded-[28px] overflow-hidden"
      >
        <View className="bg-emerald-500 dark:bg-emerald-600 p-6">
          {/* Header */}
          <View className="flex-row items-center mb-4">
            <View className="bg-white/20 w-10 h-10 rounded-xl items-center justify-center">
              <Ionicons name="sparkles" size={20} color="#fff" />
            </View>
            <View className="ml-3">
              <Text className="text-white text-lg font-bold">AI Coach Suggestions</Text>
              <Text className="text-emerald-100 text-sm">Personalized tips for you</Text>
            </View>
          </View>

          {/* Suggestions */}
          {suggestions.map((suggestion, index) => (
            <Animated.View
              key={suggestion.id}
              entering={FadeInUp.duration(300).delay(600 + index * 100)}
              className={`bg-white/10 rounded-2xl p-4 ${index > 0 ? 'mt-3' : ''}`}
            >
              <View className="flex-row items-start">
                <Ionicons
                  name={suggestion.icon as any}
                  size={20}
                  color="#fff"
                  style={{ marginTop: 2 }}
                />
                <Text className="text-white text-sm flex-1 ml-3 leading-5">
                  {suggestion.text}
                </Text>
              </View>
              <Pressable
                onPress={() => onSuggestionPress?.(suggestion.id)}
                className="self-end mt-3 bg-white/20 rounded-full px-4 py-2 active:bg-white/30"
              >
                <Text className="text-white text-xs font-bold">{suggestion.action}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

// ============ ADD GOAL MODAL ============
interface AddGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (goal: Partial<Goal>) => void;
}

function AddGoalModal({ visible, onClose, onAdd }: AddGoalModalProps) {
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🎯');
  const [months, setMonths] = useState('6');

  const emojis = ['🎯', '✈️', '🏠', '🚗', '💻', '📱', '🎓', '💍', '🛡️', '💰', '🏖️', '🎮'];

  const handleAdd = () => {
    if (goalName && targetAmount) {
      onAdd({
        name: goalName,
        emoji: selectedEmoji,
        targetAmount: parseInt(targetAmount.replace(/,/g, '')),
        monthsLeft: parseInt(months),
      });
      setGoalName('');
      setTargetAmount('');
      setSelectedEmoji('🎯');
      setMonths('6');
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <Pressable onPress={onClose} className="flex-1 bg-black/50 justify-end">
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="bg-white dark:bg-gray-800 rounded-t-[32px] p-6 pb-10">
              {/* Handle */}
              <View className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full self-center mb-6" />

              {/* Title */}
              <Text className="text-gray-900 dark:text-white text-2xl font-bold text-center mb-6">
                New Goal
              </Text>

              {/* Emoji Picker */}
              <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-3">
                Choose an icon
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-6"
              >
                {emojis.map((emoji) => (
                  <Pressable
                    key={emoji}
                    onPress={() => setSelectedEmoji(emoji)}
                    className={`w-14 h-14 rounded-2xl items-center justify-center mr-3 ${
                      selectedEmoji === emoji
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 border-2 border-emerald-500'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    <Text className="text-2xl">{emoji}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* Goal Name */}
              <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">
                Goal Name
              </Text>
              <TextInput
                value={goalName}
                onChangeText={setGoalName}
                placeholder="e.g., Trip to Japan"
                placeholderTextColor="#9ca3af"
                className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-4 text-gray-900 dark:text-white text-base mb-4"
              />

              {/* Target Amount */}
              <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">
                Target Amount
              </Text>
              <TextInput
                value={targetAmount}
                onChangeText={setTargetAmount}
                placeholder="₱0"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-4 text-gray-900 dark:text-white text-base mb-4"
              />

              {/* Timeline */}
              <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">
                Timeline (months)
              </Text>
              <TextInput
                value={months}
                onChangeText={setMonths}
                placeholder="6"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-4 text-gray-900 dark:text-white text-base mb-6"
              />

              {/* Add Button */}
              <Pressable
                onPress={handleAdd}
                className="bg-gray-900 dark:bg-white rounded-2xl py-4 items-center active:opacity-80"
              >
                <Text className="text-white dark:text-gray-900 text-base font-bold">
                  Create Goal
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ============ SKELETON LOADING STATE ============
function SkeletonLoading() {
  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* Header Skeleton */}
      <View className="px-5 pt-4 pb-6">
        <View className="flex-row items-center justify-between">
          <View>
            <SkeletonShimmer width={100} height={32} borderRadius={16} />
            <SkeletonShimmer width={160} height={16} borderRadius={8} className="mt-2" delay={50} />
          </View>
          <SkeletonShimmer width={44} height={44} borderRadius={22} delay={100} />
        </View>
      </View>

      {/* Overview Card Skeleton */}
      <SkeletonOverviewCard />

      {/* Goals List Skeleton */}
      <View className="mt-8 mb-4 px-5">
        <SkeletonShimmer width={100} height={20} borderRadius={10} delay={150} />
      </View>
      <SkeletonGoalCard delay={200} />
      <SkeletonGoalCard delay={280} />
      <SkeletonGoalCard delay={360} />

      {/* Simulation Card Skeleton */}
      <View className="mt-4">
        <View
          className="bg-white dark:bg-gray-800 rounded-[28px] mx-5 p-6"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 16,
            elevation: 6,
          }}
        >
          <View className="flex-row items-center mb-4">
            <SkeletonShimmer width={40} height={40} borderRadius={12} delay={440} />
            <View className="ml-3 flex-1">
              <SkeletonShimmer width={160} height={18} borderRadius={9} delay={490} />
              <SkeletonShimmer width={120} height={14} borderRadius={7} className="mt-2" delay={540} />
            </View>
          </View>
          <SkeletonShimmer width="100%" height={40} borderRadius={20} delay={590} />
        </View>
      </View>

      {/* AI Suggestion Card Skeleton */}
      <View className="mt-6 mb-8">
        <View
          className="bg-gray-200 dark:bg-gray-700 rounded-[28px] mx-5 p-6"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 16,
            elevation: 6,
          }}
        >
          <View className="flex-row items-center mb-4">
            <SkeletonShimmer width={40} height={40} borderRadius={12} delay={640} />
            <View className="ml-3 flex-1">
              <SkeletonShimmer width={140} height={18} borderRadius={9} delay={690} />
              <SkeletonShimmer width={100} height={14} borderRadius={7} className="mt-2" delay={740} />
            </View>
          </View>
          <SkeletonShimmer width="100%" height={80} borderRadius={16} delay={790} />
        </View>
      </View>
    </ScrollView>
  );
}

// ============ MAIN GOALS SCREEN ============
export default function GoalsScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [goals, setGoals] = useState<Goal[]>(MOCK_GOALS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [simulationContribution, setSimulationContribution] = useState(
    MOCK_GOALS.reduce((sum, goal) => sum + goal.monthlyContribution, 0)
  );
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Calculate totals
  const totalGoals = goals.length;
  const totalMonthlyContribution = goals.reduce(
    (sum, goal) => sum + goal.monthlyContribution,
    0
  );
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const overallProgress = (totalSaved / totalTarget) * 100;

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleAddGoal = (newGoal: Partial<Goal>) => {
    const goal: Goal = {
      id: Date.now().toString(),
      name: newGoal.name || 'New Goal',
      emoji: newGoal.emoji || '🎯',
      targetAmount: newGoal.targetAmount || 10000,
      currentAmount: 0,
      deadline: 'TBD',
      monthsLeft: newGoal.monthsLeft || 6,
      monthlyContribution: Math.ceil((newGoal.targetAmount || 10000) / (newGoal.monthsLeft || 6)),
      color: '#3b82f6',
      iconBgColor: 'bg-blue-100 dark:bg-blue-500/20',
      contributions: [],
    };
    setGoals([goal, ...goals]);
  };

  const handleGoalPress = (goalId: string) => {
    navigation.navigate('GoalDetail', { goalId });
  };

  const handleAddFunds = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowContributionModal(true);
  };

  const handleAddContribution = (contribution: Omit<GoalContribution, 'id'>) => {
    setGoals((prevGoals) =>
      prevGoals.map((goal) => {
        if (goal.id === contribution.goalId) {
          const newContribution: GoalContribution = {
            ...contribution,
            id: Date.now().toString(),
          };
          return {
            ...goal,
            currentAmount: goal.currentAmount + contribution.amount,
            contributions: [...goal.contributions, newContribution],
          };
        }
        return goal;
      })
    );
    setShowContributionModal(false);
    setSelectedGoal(null);
  };

  const handleSuggestionPress = (suggestionId: string) => {
    console.log(`Suggestion pressed: ${suggestionId}`);
  };

  const renderGoalItem = useCallback(
    ({ item, index }: { item: Goal; index: number }) => (
      <GoalItem
        goal={item}
        index={index}
        onPress={() => handleGoalPress(item.id)}
        onAddFunds={() => handleAddFunds(item)}
      />
    ),
    []
  );

  const keyExtractor = useCallback((item: Goal) => item.id, []);

  const ListHeader = () => (
    <>
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(400)}
        className="px-5 pt-4 pb-6"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Pressable
              onPress={() => navigation.goBack()}
              className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mr-3 active:bg-gray-200 dark:active:bg-gray-700"
            >
              <Ionicons name="chevron-back" size={22} color="#374151" />
            </Pressable>
            <View>
              <Text className="text-gray-900 dark:text-white text-3xl font-bold tracking-tight">
                Goals
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-base mt-1">
                Turn plans into progress
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => setShowAddModal(true)}
            className="w-12 h-12 bg-gray-900 dark:bg-white rounded-full items-center justify-center active:opacity-80"
          >
            <Ionicons name="add" size={24} color="#fff" />
          </Pressable>
        </View>
      </Animated.View>

      {/* Overview Card */}
      <GoalsOverviewCard
        totalGoals={totalGoals}
        monthlyContribution={totalMonthlyContribution}
        overallProgress={overallProgress}
      />

      {/* Goals Section Header */}
      <Animated.View
        entering={FadeIn.duration(400).delay(200)}
        className="flex-row items-center justify-between px-5 mt-8 mb-4"
      >
        <Text className="text-gray-900 dark:text-white text-xl font-bold tracking-tight">
          Your Goals
        </Text>
        <Text className="text-gray-400 dark:text-gray-500 text-sm">
          {totalGoals} active
        </Text>
      </Animated.View>
    </>
  );

  const ListFooter = () => (
    <>
      {/* Simulation Card */}
      <View className="mt-4">
        <SimulationCard
          currentContribution={totalMonthlyContribution}
          onContributionChange={setSimulationContribution}
        />
      </View>

      {/* AI Suggestions */}
      <View className="mt-6 mb-8">
        <AISuggestionCard
          suggestions={MOCK_AI_SUGGESTIONS}
          onSuggestionPress={handleSuggestionPress}
        />
      </View>
    </>
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
        data={goals}
        renderItem={renderGoalItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Add Goal Modal */}
      <AddGoalModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddGoal}
      />

      {/* Add Contribution Modal */}
      <AddContributionModal
        visible={showContributionModal}
        goal={selectedGoal}
        onClose={() => {
          setShowContributionModal(false);
          setSelectedGoal(null);
        }}
        onAddContribution={handleAddContribution}
      />
    </SafeAreaView>
  );
}
