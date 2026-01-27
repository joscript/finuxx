import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import type { Goal, GoalContribution } from '../types';
import AddContributionModal from '../components/AddContributionModal';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

// ============ MOCK DATA ============
// In a real app, this would come from a global state/context or be passed via navigation params
const MOCK_GOAL: Goal = {
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
    { id: 'c1', goalId: '1', accountId: '1', accountName: 'BDO Savings', amount: 10000, date: new Date('2025-11-15'), note: 'Initial deposit' },
    { id: 'c2', goalId: '1', accountId: '3', accountName: 'GCash', amount: 5000, date: new Date('2025-12-01'), note: 'Side hustle earnings' },
    { id: 'c3', goalId: '1', accountId: '1', accountName: 'BDO Savings', amount: 9500, date: new Date('2025-12-15') },
    { id: 'c4', goalId: '1', accountId: '1', accountName: 'BDO Savings', amount: 9500, date: new Date('2026-01-15') },
    { id: 'c5', goalId: '1', accountId: '4', accountName: 'Maya', amount: 8000, date: new Date('2026-01-20'), note: 'Bonus allocation' },
    { id: 'c6', goalId: '1', accountId: '1', accountName: 'BDO Savings', amount: 10000, date: new Date('2026-01-25') },
  ],
};

// ============ ANIMATED PROGRESS BAR ============
interface AnimatedProgressBarProps {
  percentage: number;
  color: string;
  height?: number;
}

function AnimatedProgressBar({ percentage, color, height = 12 }: AnimatedProgressBarProps) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(
      300,
      withTiming(Math.min(percentage, 100), { duration: 1000, easing: Easing.out(Easing.cubic) })
    );
  }, [percentage]);

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

// ============ STAT CARD ============
interface StatCardProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBgColor: string;
  index: number;
}

function StatCard({ label, value, icon, iconColor, iconBgColor, index }: StatCardProps) {
  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(200 + index * 80)}
      className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View className={`w-10 h-10 rounded-xl items-center justify-center mb-3 ${iconBgColor}`}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text className="text-gray-400 dark:text-gray-500 text-xs mb-1">{label}</Text>
      <Text className="text-gray-900 dark:text-white text-lg font-bold">{value}</Text>
    </Animated.View>
  );
}

// ============ CONTRIBUTION ITEM ============
interface ContributionItemProps {
  contribution: GoalContribution;
  index: number;
  goalColor: string;
}

function ContributionItem({ contribution, index, goalColor }: ContributionItemProps) {
  const formattedDate = new Date(contribution.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Animated.View
      entering={FadeInUp.duration(300).delay(100 + index * 50)}
      className="flex-row items-center py-4 border-b border-gray-100 dark:border-gray-800"
    >
      {/* Amount Indicator */}
      <View
        className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
        style={{ backgroundColor: `${goalColor}15` }}
      >
        <Ionicons name="add" size={24} color={goalColor} />
      </View>

      {/* Details */}
      <View className="flex-1">
        <Text className="text-gray-900 dark:text-white font-semibold">
          +₱{contribution.amount.toLocaleString()}
        </Text>
        <View className="flex-row items-center mt-1">
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            {contribution.accountName || 'Unknown'}
          </Text>
          <View className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 mx-2" />
          <Text className="text-gray-400 dark:text-gray-500 text-sm">
            {formattedDate}
          </Text>
        </View>
        {contribution.note && (
          <Text className="text-gray-400 dark:text-gray-500 text-xs mt-1 italic">
            "{contribution.note}"
          </Text>
        )}
      </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
    </Animated.View>
  );
}

// ============ MAIN GOAL DETAIL SCREEN ============
export default function GoalDetailScreen() {
  const navigation = useNavigation();
  const [goal, setGoal] = useState<Goal>(MOCK_GOAL);
  const [showContributionModal, setShowContributionModal] = useState(false);

  const percentage = (goal.currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.currentAmount;
  const isOnTrack = goal.monthlyContribution * goal.monthsLeft >= remaining;
  const isComplete = goal.currentAmount >= goal.targetAmount;

  const handleAddContribution = (contribution: Omit<GoalContribution, 'id'>) => {
    const newContribution: GoalContribution = {
      ...contribution,
      id: Date.now().toString(),
    };
    setGoal((prev) => ({
      ...prev,
      currentAmount: prev.currentAmount + contribution.amount,
      contributions: [newContribution, ...prev.contributions],
    }));
    setShowContributionModal(false);
  };

  // Sort contributions by date (most recent first)
  const sortedContributions = [...goal.contributions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View
          entering={FadeIn.duration(400)}
          className="px-5 pt-4 pb-6"
        >
          <View className="flex-row items-center justify-between mb-6">
            <Pressable
              onPress={() => navigation.goBack()}
              className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center active:bg-gray-200 dark:active:bg-gray-700"
            >
              <Ionicons name="chevron-back" size={22} color="#374151" />
            </Pressable>
            <Pressable
              className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center active:bg-gray-200 dark:active:bg-gray-700"
            >
              <Ionicons name="ellipsis-horizontal" size={22} color="#374151" />
            </Pressable>
          </View>

          {/* Goal Header Card */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(100)}
            className="bg-white dark:bg-gray-800 rounded-[28px] p-6"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 16,
              elevation: 6,
            }}
          >
            {/* Emoji and Title */}
            <View className="flex-row items-center mb-4">
              <View
                className={`${goal.iconBgColor} w-16 h-16 rounded-2xl items-center justify-center`}
              >
                <Text className="text-3xl">{goal.emoji}</Text>
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-gray-900 dark:text-white text-xl font-bold">
                  {goal.name}
                </Text>
                <View className="flex-row items-center mt-1">
                  <View
                    className={`rounded-full px-2.5 py-1 flex-row items-center ${
                      isComplete
                        ? 'bg-emerald-500'
                        : isOnTrack
                        ? 'bg-emerald-100 dark:bg-emerald-500/20'
                        : 'bg-amber-100 dark:bg-amber-500/20'
                    }`}
                  >
                    <Ionicons
                      name={isComplete ? 'trophy' : isOnTrack ? 'checkmark-circle' : 'time'}
                      size={12}
                      color={isComplete ? '#ffffff' : isOnTrack ? '#22c55e' : '#f59e0b'}
                    />
                    <Text
                      className={`text-xs font-bold ml-1 ${
                        isComplete
                          ? 'text-white'
                          : isOnTrack
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {isComplete ? 'Complete!' : isOnTrack ? 'On Track' : 'Behind'}
                    </Text>
                  </View>
                  <Text className="text-gray-400 dark:text-gray-500 text-sm ml-3">
                    {goal.deadline}
                  </Text>
                </View>
              </View>
            </View>

            {/* Amount Display */}
            <View className="mb-4">
              <View className="flex-row items-baseline">
                <Text className="text-gray-400 text-lg mr-1">₱</Text>
                <Text className="text-gray-900 dark:text-white text-4xl font-bold">
                  {goal.currentAmount.toLocaleString()}
                </Text>
                <Text className="text-gray-400 dark:text-gray-500 text-lg ml-2">
                  / ₱{goal.targetAmount.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <AnimatedProgressBar percentage={percentage} color={goal.color} />

            {/* Progress Stats */}
            <View className="flex-row justify-between mt-4">
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                {Math.round(percentage)}% complete
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                ₱{remaining.toLocaleString()} to go
              </Text>
            </View>

            {/* Add Funds Button */}
            {!isComplete && (
              <Pressable
                onPress={() => setShowContributionModal(true)}
                className="mt-6 flex-row items-center justify-center py-4 rounded-2xl"
                style={{ backgroundColor: goal.color }}
              >
                <Ionicons name="add-circle" size={22} color="#ffffff" />
                <Text className="text-white font-bold text-base ml-2">
                  Add Funds
                </Text>
              </Pressable>
            )}
          </Animated.View>
        </Animated.View>

        {/* Stats Row */}
        <View className="flex-row gap-3 px-5 mb-6">
          <StatCard
            label="Monthly Target"
            value={`₱${goal.monthlyContribution.toLocaleString()}`}
            icon="calendar"
            iconColor="#3b82f6"
            iconBgColor="bg-blue-100 dark:bg-blue-500/20"
            index={0}
          />
          <StatCard
            label="Time Left"
            value={`${goal.monthsLeft} months`}
            icon="time"
            iconColor="#8b5cf6"
            iconBgColor="bg-violet-100 dark:bg-violet-500/20"
            index={1}
          />
        </View>

        <View className="flex-row gap-3 px-5 mb-6">
          <StatCard
            label="Contributions"
            value={goal.contributions.length.toString()}
            icon="receipt"
            iconColor="#22c55e"
            iconBgColor="bg-emerald-100 dark:bg-emerald-500/20"
            index={2}
          />
          <StatCard
            label="Avg per Contribution"
            value={`₱${goal.contributions.length > 0 ? Math.round(goal.currentAmount / goal.contributions.length).toLocaleString() : 0}`}
            icon="stats-chart"
            iconColor="#f59e0b"
            iconBgColor="bg-amber-100 dark:bg-amber-500/20"
            index={3}
          />
        </View>

        {/* Contribution History */}
        <View className="px-5 mb-8">
          <Animated.View
            entering={FadeIn.duration(400).delay(400)}
            className="flex-row items-center justify-between mb-4"
          >
            <Text className="text-gray-900 dark:text-white text-xl font-bold">
              Contribution History
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-sm">
              {goal.contributions.length} total
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(500).delay(450)}
            className="bg-white dark:bg-gray-800 rounded-[24px] px-5"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            {sortedContributions.length > 0 ? (
              sortedContributions.map((contribution, index) => (
                <ContributionItem
                  key={contribution.id}
                  contribution={contribution}
                  index={index}
                  goalColor={goal.color}
                />
              ))
            ) : (
              <View className="py-10 items-center">
                <Ionicons name="wallet-outline" size={48} color="#9ca3af" />
                <Text className="text-gray-400 dark:text-gray-500 text-base mt-3">
                  No contributions yet
                </Text>
                <Text className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                  Tap "Add Funds" to get started!
                </Text>
              </View>
            )}
          </Animated.View>
        </View>
      </ScrollView>

      {/* Add Contribution Modal */}
      <AddContributionModal
        visible={showContributionModal}
        goal={goal}
        onClose={() => setShowContributionModal(false)}
        onAddContribution={handleAddContribution}
      />
    </SafeAreaView>
  );
}
