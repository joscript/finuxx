import React, { useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import {
  BalanceCard,
  BudgetProgressCard,
  StatItem,
  CoachCard,
  BillItem,
  NetWorthCard,
  AICoachInsightHeader,
  SectionHeader,
  CategoryItem,
  HomeSkeletonLoading,
  FloatingChatButton,
} from "../components";
import { RootStackParamList } from "../navigation";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchAccounts } from "../store/slices/accountsSlice";
import { fetchCurrentBudget } from "../store/slices/budgetsSlice";
import { fetchBills } from "../store/slices/billsSlice";
import { fetchTransactionSummary } from "../store/slices/transactionsSlice";

type HomeScreenNavigationProp = NavigationProp<RootStackParamList>;

// ============ CONSTANTS ============
// Default avatar for users without profile picture
const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?name=User&background=random";

// ============ HELPER FUNCTIONS ============
function getCoachInsight(
  userName: string,
  budgetSpent: number,
  budgetTotal: number,
): string {
  if (budgetTotal === 0) {
    return `Welcome back, ${userName}! Set up your monthly budget so I can give you personalized financial guidance.`;
  }
  const pct = Math.round((budgetSpent / budgetTotal) * 100);
  const remaining = (budgetTotal - budgetSpent).toLocaleString();
  if (pct >= 100) {
    return `${userName}, you've exceeded your monthly budget. Let's review your spending together and get back on track.`;
  }
  if (pct >= 80) {
    return `Heads up, ${userName}! You've used ${pct}% of your monthly budget — only ₱${remaining} left. Let's keep it tight.`;
  }
  if (pct >= 50) {
    return `Good progress, ${userName}! You're halfway through your budget with ₱${remaining} remaining. You're on a good pace.`;
  }
  return `Great start, ${userName}! You've only spent ${pct}% of your monthly budget. Keep it going strong!`;
}

// ============ MAIN HOME SCREEN ============
export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const dispatch = useAppDispatch();

  // Redux state selectors
  const { user } = useAppSelector((state) => state.auth);
  const {
    accounts,
    totals,
    isLoading: accountsLoading,
  } = useAppSelector((state) => state.accounts);
  const { currentBudget, isLoading: budgetLoading } = useAppSelector(
    (state) => state.budgets,
  );
  const { bills, isLoading: billsLoading } = useAppSelector(
    (state) => state.bills,
  );
  const { summary: transactionSummary, isLoading: summaryLoading } =
    useAppSelector((state) => state.transactions);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchCurrentBudget());
    dispatch(fetchBills({ upcoming: true }));
    dispatch(fetchTransactionSummary());
  }, [dispatch]);

  const isLoading =
    accountsLoading || budgetLoading || billsLoading || summaryLoading;

  // Derive data from Redux state with fallbacks
  const userName = user?.name?.split(" ")[0] || "User";
  const userAvatar = DEFAULT_AVATAR;

  const balance = totals?.netWorth?.toLocaleString() || "0.00";
  const totalAssets = totals?.totalAssets || 0;
  const totalLiabilities = totals?.totalLiabilities || 0;

  const budgetSpent = currentBudget?.totalSpent || 0;
  const budgetTotal = parseFloat(currentBudget?.totalAmount || "0");

  const todaySpending = `₱${transactionSummary?.totalExpenses?.toLocaleString() || "0"}`;
  const monthIncome = `₱${transactionSummary?.totalIncome?.toLocaleString() || "0"}`;
  const savings = `₱${transactionSummary?.netFlow?.toLocaleString() || "0"}`;

  const upcomingBills = bills?.slice(0, 3) || [];

  // Derive categories from budget data
  const budgetCategories = (currentBudget?.categories || [])
    .slice(0, 4)
    .map((cat: any) => {
      const spent = parseFloat(cat.spentAmount || "0");
      const budget = parseFloat(cat.allocatedAmount || "0");
      return {
        id: cat.id.toString(),
        name: cat.category?.name || "Category",
        spent,
        budget,
        color: spent > budget ? "#ef4444" : "#22c55e",
      };
    });

  // Press handlers
  const handleBalancePress = () => {
    navigation.navigate("Accounts" as never);
  };

  const handleBudgetPress = () => {
    navigation.navigate("Budget");
  };

  const handleStatPress = (statName: string) => {
    console.log(`Stat pressed: ${statName}`);
  };

  const handleCoachPress = () => {
    navigation.navigate("Coach");
  };

  const handleGoalsPress = () => {
    navigation.navigate("Goals");
  };

  const handleBillPress = (billId: string) => {
    console.log(`Bill pressed: ${billId}`);
  };

  const handleNetWorthPress = () => {
    console.log("Net worth card pressed");
  };

  const handleNotificationPress = () => {
    navigation.navigate("Notifications");
  };

  const handleProfilePress = () => {
    console.log("Profile pressed");
  };

  const handleSettingsPress = () => {
    navigation.navigate("Settings");
  };

  const handleViewAllBills = () => {
    navigation.navigate("Bills");
  };

  const handleCategoryPress = (categoryId: string) => {
    console.log(`Category pressed: ${categoryId}`);
  };

  const handleViewAllCategories = () => {
    console.log("View all categories pressed");
  };

  if (isLoading) {
    return (
      <View className="flex-1">
        <SafeAreaView
          className="flex-1 bg-white dark:bg-gray-900"
          edges={["top"]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            <HomeSkeletonLoading />
          </ScrollView>
        </SafeAreaView>
        <FloatingChatButton onPress={handleCoachPress} />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <SafeAreaView
        className="flex-1 bg-white dark:bg-gray-900"
        edges={["top"]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {/* AI Coach Insight Header */}
          <AICoachInsightHeader
            userName={userName}
            avatarUrl={userAvatar}
            insight={getCoachInsight(userName, budgetSpent, budgetTotal)}
            onPress={handleCoachPress}
            onNotificationPress={handleNotificationPress}
            onSettingsPress={handleSettingsPress}
          />

          <View className="flex-row items-stretch justify-between px-4 pb-3 gap-2.5 mt-6">
            {/* Balance Card */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(100)}
              className="flex-1"
            >
              <BalanceCard balance={balance} onPress={handleBalancePress} />
            </Animated.View>
            {/* Budget Progress Card */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(200)}
              className="flex-1"
            >
              <BudgetProgressCard
                spent={budgetSpent}
                total={budgetTotal}
                onPress={handleBudgetPress}
              />
            </Animated.View>
          </View>

          {/* Quick Stats Row - Horizontal Scroll */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(300)}
            className="mt-6"
          >
            <SectionHeader title="Quick Stats" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingLeft: 20,
                paddingRight: 8,
                paddingBottom: 12,
                paddingTop: 8,
              }}
            >
              <StatItem
                title="Today"
                value={todaySpending}
                icon="wallet-outline"
                iconColor="#8b5cf6"
                iconBgColor="bg-red-50 dark:bg-red-500/20"
                trend="up"
                trendValue="15%"
                onPress={() => handleStatPress("todaySpending")}
              />
              <StatItem
                title="This Month"
                value={monthIncome}
                icon="trending-up-outline"
                iconColor="#22c55e"
                iconBgColor="bg-emerald-50 dark:bg-emerald-500/20"
                trend="up"
                trendValue="8%"
                onPress={() => handleStatPress("monthIncome")}
              />
              <StatItem
                title="Savings"
                value={savings}
                icon="pie-chart-outline"
                iconColor="#8b5cf6"
                iconBgColor="bg-violet-50 dark:bg-violet-500/20"
                trend="up"
                trendValue="12%"
                onPress={() => handleStatPress("savings")}
              />
            </ScrollView>
          </Animated.View>

          {/* AI Coach CTA Card */}
          {/* <Animated.View entering={FadeInDown.duration(500).delay(400)} className="mt-4">
          <CoachCard onPress={handleCoachPress} />
        </Animated.View> */}

          {/* Goals Card */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(450)}
            className="mt-4"
          >
            <Pressable
              onPress={handleGoalsPress}
              className="mx-5 rounded-[28px] overflow-hidden active:opacity-90"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 16,
                elevation: 6,
              }}
            >
              <View className="bg-primary-500 dark:bg-primary-600 p-6">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="bg-white/20 w-12 h-12 rounded-2xl items-center justify-center">
                      <Ionicons name="flag" size={24} color="#fff" />
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="text-white text-lg font-bold">
                        Goals & Planning
                      </Text>
                      <Text className="text-primary-100 text-sm mt-0.5">
                        Track your savings goals
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center">
                    <View className="bg-white/20 rounded-full px-3 py-1.5 mr-3">
                      <Text className="text-white text-xs font-bold">
                        5 Active
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#fff" />
                  </View>
                </View>
                {/* Mini Progress Indicators */}
                <View className="flex-row mt-4 gap-2">
                  <View className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-white rounded-full"
                      style={{ width: "65%" }}
                    />
                  </View>
                  <View className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-white rounded-full"
                      style={{ width: "63%" }}
                    />
                  </View>
                  <View className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-white rounded-full"
                      style={{ width: "38%" }}
                    />
                  </View>
                </View>
              </View>
            </Pressable>
          </Animated.View>

          {/* Upcoming Bills Section */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(600)}
            className="mt-8"
          >
            <SectionHeader
              title="Upcoming Bills"
              actionLabel="See all"
              onActionPress={handleViewAllBills}
            />
            <View
              className="bg-white dark:bg-gray-800 rounded-[28px] mx-5 px-6 py-2"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 16,
                elevation: 6,
              }}
            >
              {upcomingBills.length > 0 ? (
                upcomingBills.map((bill, index) => (
                  <View key={bill.id}>
                    <BillItem
                      name={bill.name}
                      date={new Date(bill.dueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      amount={`₱${parseFloat(bill.amount).toLocaleString()}`}
                      icon="receipt-outline"
                      iconColor="#3b82f6"
                      iconBgColor="bg-blue-100 dark:bg-blue-500/20"
                      onPress={() => handleBillPress(bill.id.toString())}
                    />
                    {index < upcomingBills.length - 1 && (
                      <View className="h-px bg-gray-100 dark:bg-gray-700 ml-[76px]" />
                    )}
                  </View>
                ))
              ) : (
                <View className="py-8 items-center">
                  <Text className="text-gray-400 dark:text-gray-500">
                    No upcoming bills
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Top Categories Section */}
          {budgetCategories.length > 0 && (
            <Animated.View
              entering={FadeInDown.duration(500).delay(500)}
              className="mt-8"
            >
              <SectionHeader
                title="Top Categories"
                actionLabel="See all"
                onActionPress={handleViewAllCategories}
              />
              <View
                className="bg-white dark:bg-gray-800 rounded-[28px] mx-5 px-6 py-2"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 16,
                  elevation: 6,
                }}
              >
                {budgetCategories.map((category, index) => (
                  <View key={category.id}>
                    <CategoryItem
                      name={category.name}
                      spent={category.spent}
                      budget={category.budget}
                      color={category.color}
                      onPress={() => handleCategoryPress(category.id)}
                    />
                    {index < budgetCategories.length - 1 && (
                      <View className="h-px bg-gray-100 dark:bg-gray-700" />
                    )}
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Net Worth Card */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(700)}
            className="mt-8"
          >
            <SectionHeader title="Net Worth" />
            <NetWorthCard
              assets={totalAssets}
              liabilities={totalLiabilities}
              onPress={handleNetWorthPress}
            />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      {/* Floating Chat Button */}
      <FloatingChatButton onPress={handleCoachPress} />
    </View>
  );
}
