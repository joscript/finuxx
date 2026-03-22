import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
  ActionSheetIOS,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
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
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import type {
  Goal as LocalGoal,
  GoalContribution as LocalGoalContribution,
} from "../types";
import AddContributionModal from "../components/AddContributionModal";
import EditGoalModal from "../components/EditGoalModal";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchGoalById,
  addContribution,
  updateGoal,
  deleteGoal,
  fetchGoalContributions,
} from "../store/slices/goalsSlice";
import { fetchAccounts } from "../store/slices/accountsSlice";
import { AddContributionRequest, UpdateGoalRequest } from "../api";
import type { RootStackParamList } from "../navigation";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

// ============ ANIMATED PROGRESS BAR ============
interface AnimatedProgressBarProps {
  percentage: number;
  color: string;
  height?: number;
}

function AnimatedProgressBar({
  percentage,
  color,
  height = 12,
}: AnimatedProgressBarProps) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(
      300,
      withTiming(Math.min(percentage, 100), {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      }),
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

function StatCard({
  label,
  value,
  icon,
  iconColor,
  iconBgColor,
  index,
}: StatCardProps) {
  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(200 + index * 80)}
      className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View
        className={`w-10 h-10 rounded-xl items-center justify-center mb-3 ${iconBgColor}`}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text className="text-gray-400 dark:text-gray-500 text-xs mb-1">
        {label}
      </Text>
      <Text className="text-gray-900 dark:text-white text-lg font-bold">
        {value}
      </Text>
    </Animated.View>
  );
}

// ============ CONTRIBUTION ITEM ============
interface ContributionItemProps {
  contribution: LocalGoalContribution;
  index: number;
  goalColor: string;
}

function ContributionItem({
  contribution,
  index,
  goalColor,
}: ContributionItemProps) {
  const formattedDate = new Date(contribution.date).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );

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
            {contribution.accountName || "Unknown"}
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
  const route = useRoute<RouteProp<RootStackParamList, "GoalDetail">>();
  const goalId = route.params?.goalId || "";

  // Redux
  const dispatch = useAppDispatch();
  const {
    selectedGoal: apiGoal,
    isLoading,
    contributions: apiContributions,
    contributionsPagination,
  } = useAppSelector((state) => state.goals);
  const { accounts } = useAppSelector((state) => state.accounts);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch goal and accounts on mount
  useEffect(() => {
    dispatch(fetchGoalById(goalId));
    dispatch(fetchAccounts());
  }, [dispatch, goalId]);

  const handleLoadMoreContributions = useCallback(() => {
    if (
      contributionsPagination &&
      contributionsPagination.page < contributionsPagination.totalPages
    ) {
      dispatch(
        fetchGoalContributions({
          goalId,
          page: contributionsPagination.page + 1,
        }),
      );
    }
  }, [dispatch, goalId, contributionsPagination]);

  // Transform API goal to local format
  const goal: LocalGoal | null = apiGoal
    ? {
        id: apiGoal.id.toString(),
        name: apiGoal.name,
        emoji: apiGoal.emoji || "🎯",
        targetAmount: parseFloat(apiGoal.targetAmount),
        currentAmount: parseFloat(apiGoal.currentAmount),
        deadline: apiGoal.deadline
          ? new Date(apiGoal.deadline).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })
          : "No deadline",
        monthsLeft: apiGoal.deadline
          ? Math.max(
              0,
              Math.ceil(
                (new Date(apiGoal.deadline).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24 * 30),
              ),
            )
          : 0,
        monthlyContribution: 0,
        color: apiGoal.color || "#3b82f6",
        iconBgColor: apiGoal.iconBgColor || "bg-blue-100 dark:bg-blue-500/20",
        contributions:
          apiGoal.contributions?.map((c) => ({
            id: c.id.toString(),
            goalId: c.goalId.toString(),
            accountId: c.accountId?.toString(),
            amount: parseFloat(c.amount),
            date: new Date(c.contributionDate),
            note: c.note,
          })) || [],
      }
    : null;

  if (isLoading || !goal) {
    return (
      <SafeAreaView
        className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center"
        edges={["top"]}
      >
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  const percentage = (goal.currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.currentAmount;
  const isOnTrack =
    goal.monthsLeft > 0
      ? remaining / goal.monthsLeft <= goal.monthlyContribution
      : true;
  const isComplete = goal.currentAmount >= goal.targetAmount;

  const handleAddContribution = async (
    contribution: Omit<LocalGoalContribution, "id">,
  ) => {
    const request: AddContributionRequest = {
      amount: contribution.amount,
      accountId: contribution.accountId || undefined,
      contributionDate: contribution.date.toISOString().split("T")[0],
      note: contribution.note,
    };

    await dispatch(addContribution({ goalId, data: request }));
    dispatch(fetchGoalById(goalId));
    setShowContributionModal(false);
  };

  const handleEditGoal = async (data: {
    name: string;
    emoji: string;
    targetAmount: number;
    deadline: string;
  }) => {
    const request: UpdateGoalRequest = {
      name: data.name,
      emoji: data.emoji,
      targetAmount: data.targetAmount,
      deadline: data.deadline,
    };
    await dispatch(updateGoal({ id: goalId, data: request }));
    dispatch(fetchGoalById(goalId));
  };

  const handleDeleteGoal = () => {
    Alert.alert(
      "Delete Goal",
      `Are you sure you want to delete "${goal.name}"? All contribution history for this goal will also be removed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await dispatch(deleteGoal(goalId));
            navigation.goBack();
          },
        },
      ],
    );
  };

  const handleEllipsisPress = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Edit Goal", "Delete Goal"],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) setShowEditModal(true);
          if (buttonIndex === 2) handleDeleteGoal();
        },
      );
    } else {
      Alert.alert("Goal Options", "", [
        { text: "Edit Goal", onPress: () => setShowEditModal(true) },
        {
          text: "Delete Goal",
          style: "destructive",
          onPress: handleDeleteGoal,
        },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  // Merge contributions from goal + paginated fetches
  const mappedApiContributions: LocalGoalContribution[] = apiContributions.map(
    (c) => ({
      id: c.id.toString(),
      goalId: c.goalId.toString(),
      accountId: c.accountId?.toString(),
      amount: parseFloat(c.amount),
      date: new Date(c.contributionDate),
      note: c.note,
    }),
  );
  const allContributions =
    mappedApiContributions.length > 0
      ? mappedApiContributions
      : goal.contributions;

  // Sort contributions by date (most recent first)
  const sortedContributions = [...allContributions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const hasMoreContributions = contributionsPagination
    ? contributionsPagination.page < contributionsPagination.totalPages
    : false;

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      edges={["top"]}
    >
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
              onPress={handleEllipsisPress}
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
              shadowColor: "#000",
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
                        ? "bg-emerald-500"
                        : isOnTrack
                          ? "bg-emerald-100 dark:bg-emerald-500/20"
                          : "bg-amber-100 dark:bg-amber-500/20"
                    }`}
                  >
                    <Ionicons
                      name={
                        isComplete
                          ? "trophy"
                          : isOnTrack
                            ? "checkmark-circle"
                            : "time"
                      }
                      size={12}
                      color={
                        isComplete
                          ? "#ffffff"
                          : isOnTrack
                            ? "#22c55e"
                            : "#f59e0b"
                      }
                    />
                    <Text
                      className={`text-xs font-bold ml-1 ${
                        isComplete
                          ? "text-white"
                          : isOnTrack
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {isComplete
                        ? "Complete!"
                        : isOnTrack
                          ? "On Track"
                          : "Behind"}
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
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            {sortedContributions.length > 0 ? (
              <>
                {sortedContributions.map((contribution, index) => (
                  <ContributionItem
                    key={contribution.id}
                    contribution={contribution}
                    index={index}
                    goalColor={goal.color}
                  />
                ))}
                {hasMoreContributions && (
                  <Pressable
                    onPress={handleLoadMoreContributions}
                    className="py-4 items-center"
                  >
                    <Text className="text-blue-500 font-semibold text-sm">
                      Load More
                    </Text>
                  </Pressable>
                )}
              </>
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
        accounts={accounts}
        onClose={() => setShowContributionModal(false)}
        onAddContribution={handleAddContribution}
      />

      {/* Edit Goal Modal */}
      <EditGoalModal
        visible={showEditModal}
        goal={goal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditGoal}
      />
    </SafeAreaView>
  );
}
