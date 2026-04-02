import React, { useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import {
  BillItem,
  AICoachInsightHeader,
  AICoachInsightCard,
  SectionHeader,
  CategoryItem,
  HomeSkeletonLoading,
  FloatingChatButton,
  NetWorthHeroCard,
  QuickActionsRow,
  BudgetHealthStrip,
} from "../components";
import { RootStackParamList } from "../navigation";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useCurrency, useCurrencySymbol } from "../hooks/useCurrency";
import { fetchAccounts } from "../store/slices/accountsSlice";
import { fetchCurrentBudget } from "../store/slices/budgetsSlice";
import { fetchBills } from "../store/slices/billsSlice";
import { fetchTransactionSummary } from "../store/slices/transactionsSlice";
import { fetchGoals } from "../store/slices/goalsSlice";
import { fetchSettings, updateSettings } from "../store/slices/settingsSlice";

type HomeScreenNavigationProp = NavigationProp<RootStackParamList>;

// ============ CONSTANTS ============
// Default avatar for users without profile picture
const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?name=User&background=random";

// ============ LOCAL COMPONENTS ============
interface StatGridCardProps {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBgClass: string;
}

function StatGridCard({
  title,
  value,
  icon,
  iconColor,
  iconBgClass,
}: StatGridCardProps) {
  return (
    <View
      className="flex-1 bg-white dark:bg-gray-800 rounded-[20px] p-4"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <View
        className={`w-9 h-9 ${iconBgClass} rounded-xl items-center justify-center mb-3`}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text
        className="text-gray-900 dark:text-white text-lg font-bold"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {value}
      </Text>
      <Text className="text-gray-500 dark:text-gray-400 text-xs font-medium mt-0.5">
        {title}
      </Text>
    </View>
  );
}

// ============ HELPER FUNCTIONS ============
function getCoachInsight(
  userName: string,
  budgetSpent: number,
  budgetTotal: number,
  currencySymbol: string,
): string {
  if (budgetTotal === 0) {
    return `Welcome back, ${userName}! Set up your monthly budget so I can give you personalized financial guidance.`;
  }
  const pct = Math.round((budgetSpent / budgetTotal) * 100);
  const remaining = `${currencySymbol}${(budgetTotal - budgetSpent).toLocaleString()}`;
  if (pct >= 100) {
    return `${userName}, you've exceeded your monthly budget. Let's review your spending together and get back on track.`;
  }
  if (pct >= 80) {
    return `Heads up, ${userName}! You've used ${pct}% of your monthly budget — only ${remaining} left. Let's keep it tight.`;
  }
  if (pct >= 50) {
    return `Good progress, ${userName}! You're halfway through your budget with ${remaining} remaining. You're on a good pace.`;
  }
  return `Great start, ${userName}! You've only spent ${pct}% of your monthly budget. Keep it going strong!`;
}

// ============ MAIN HOME SCREEN ============
export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const fmt = useCurrency();
  const currencySymbol = useCurrencySymbol();

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
  const { goals, isLoading: goalsLoading } = useAppSelector(
    (state) => state.goals,
  );
  const { settings: appSettings } = useAppSelector((state) => state.settings);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchCurrentBudget());
    dispatch(fetchBills({ upcoming: true }));
    dispatch(fetchTransactionSummary());
    dispatch(fetchGoals());
    dispatch(fetchSettings());
  }, [dispatch]);

  const isLoading =
    accountsLoading ||
    budgetLoading ||
    billsLoading ||
    summaryLoading ||
    goalsLoading;

  // Derive data from Redux state with fallbacks
  const userName = user?.name?.split(" ")[0] || "User";
  const userAvatar = DEFAULT_AVATAR;

  const totalAssets = totals?.totalAssets || 0;
  const totalLiabilities = totals?.totalLiabilities || 0;

  const budgetSpent = currentBudget?.totalSpent || 0;
  const budgetTotal = parseFloat(currentBudget?.totalAmount || "0");

  const monthlyExpenses = fmt(transactionSummary?.totalExpenses || 0);
  const monthIncome = fmt(transactionSummary?.totalIncome || 0);
  const savings = fmt(transactionSummary?.netFlow || 0);

  const activeGoals = goals.filter(
    (g) => parseFloat(g.currentAmount) < parseFloat(g.targetAmount),
  );
  const goalProgresses = activeGoals
    .slice(0, 3)
    .map((g) =>
      Math.min(
        (parseFloat(g.currentAmount) / parseFloat(g.targetAmount)) * 100,
        100,
      ),
    );
  const goalsAbove60 = activeGoals.filter(
    (g) =>
      (parseFloat(g.currentAmount) / parseFloat(g.targetAmount)) * 100 >= 60,
  ).length;

  const percentageChange =
    transactionSummary?.totalIncome && transactionSummary.totalIncome > 0
      ? parseFloat(
          (
            (transactionSummary.netFlow / transactionSummary.totalIncome) *
            100
          ).toFixed(1),
        )
      : undefined;

  const upcomingBills = bills?.slice(0, 3) || [];

  const budgetHealthColor: "good" | "warning" | "danger" =
    budgetTotal === 0
      ? "good"
      : budgetSpent / budgetTotal >= 1
        ? "danger"
        : budgetSpent / budgetTotal >= 0.8
          ? "warning"
          : "good";
  const isNetWorthVisible = !(appSettings?.hideNetWorth ?? false);

  // Derive categories from budget data
  const budgetCategories = (currentBudget?.categories || [])
    .slice(0, 4)
    .map((cat: any) => {
      const spent = cat.spent || 0;
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

  const handleCoachPress = () => {
    navigation.navigate("Coach");
  };

  const handleGoalsPress = () => {
    navigation.navigate("Goals");
  };

  const handleBillPress = (billId: string) => {
    console.log(`Bill pressed: ${billId}`);
  };

  const handleNotificationPress = () => {
    navigation.navigate("Notifications");
  };

  const handleSettingsPress = () => {
    navigation.navigate("Settings");
  };

  const handleViewAllBills = () => {
    navigation.navigate("Bills");
  };

  const handleCategoryPress = (_categoryId: string) => {
    navigation.navigate("Budget");
  };

  const handleViewAllCategories = () => {
    navigation.navigate("Budget");
  };

  const handleTransactionsPress = () => {
    navigation.navigate("Transactions" as never);
  };

  const handleReportsPress = () => {
    navigation.navigate("Reports" as never);
  };

  const handleNetWorthVisibilityToggle = (visible: boolean) => {
    dispatch(updateSettings({ hideNetWorth: !visible }));
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
          {/* Compact Header — greeting + avatar + notification/menu */}
          <AICoachInsightHeader
            userName={userName}
            avatarUrl={userAvatar}
            insight={getCoachInsight(
              userName,
              budgetSpent,
              budgetTotal,
              currencySymbol,
            )}
            budgetHealthColor={budgetHealthColor}
            onPress={handleCoachPress}
            onNotificationPress={handleNotificationPress}
            onSettingsPress={handleSettingsPress}
            showInsightCard={false}
          />

          {/* Net Worth Hero Card */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(50)}
            className="mt-4"
          >
            <NetWorthHeroCard
              assets={totalAssets}
              liabilities={totalLiabilities}
              currency={currencySymbol}
              percentageChange={percentageChange}
              isVisible={isNetWorthVisible}
              onVisibilityToggle={handleNetWorthVisibilityToggle}
              onPress={handleBalancePress}
            />
          </Animated.View>

          {/* Quick Actions Row */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(100)}
            className="mt-6"
          >
            <QuickActionsRow
              onTransactions={handleTransactionsPress}
              onGoals={handleGoalsPress}
              onReports={handleReportsPress}
              onBills={() => navigation.navigate("Bills" as never)}
            />
          </Animated.View>

          {/* Quick Stats — always-visible 3-column grid */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(150)}
            className="mt-6"
          >
            <SectionHeader title="This Month" />
            <View className="flex-row px-4 gap-3">
              <StatGridCard
                title="Spent"
                value={monthlyExpenses}
                icon="wallet-outline"
                iconColor="#ef4444"
                iconBgClass="bg-red-50 dark:bg-red-500/20"
              />
              <StatGridCard
                title="Income"
                value={monthIncome}
                icon="trending-up-outline"
                iconColor="#22c55e"
                iconBgClass="bg-emerald-50 dark:bg-emerald-500/20"
              />
              <StatGridCard
                title="Saved"
                value={savings}
                icon="pie-chart-outline"
                iconColor="#8b5cf6"
                iconBgClass="bg-violet-50 dark:bg-violet-500/20"
              />
            </View>
          </Animated.View>

          {/* Budget Health Strip */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(200)}
            className="mt-4"
          >
            <BudgetHealthStrip
              spent={budgetSpent}
              total={budgetTotal}
              currency={currencySymbol}
              onPress={handleBudgetPress}
            />
          </Animated.View>

          {/* AI Coach Insight Card — moved below key metrics */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(250)}
            className="mt-6 px-4"
          >
            <AICoachInsightCard
              insight={getCoachInsight(
                userName,
                budgetSpent,
                budgetTotal,
                currencySymbol,
              )}
              onPress={handleCoachPress}
            />
          </Animated.View>

          {/* Upcoming Bills Section */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(350)}
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
                      amount={fmt(parseFloat(bill.amount))}
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
              entering={FadeInDown.duration(500).delay(450)}
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

          {/* Goals — compact list style */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(550)}
            className="mt-8"
          >
            <SectionHeader
              title="Goals"
              actionLabel="See all"
              onActionPress={handleGoalsPress}
            />
            <Pressable
              onPress={handleGoalsPress}
              className="mx-5 bg-white dark:bg-gray-800 rounded-[28px] px-6 py-4 active:opacity-90"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 16,
                elevation: 6,
              }}
            >
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className="bg-violet-100 dark:bg-violet-500/20 w-9 h-9 rounded-xl items-center justify-center mr-3">
                    <Ionicons name="flag-outline" size={18} color="#8b5cf6" />
                  </View>
                  <Text className="text-gray-900 dark:text-white text-base font-semibold">
                    {activeGoals.length > 0
                      ? `${activeGoals.length} Active Goal${
                          activeGoals.length === 1 ? "" : "s"
                        }`
                      : "No active goals"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
              </View>
              {goalProgresses.length > 0 ? (
                <>
                  <View className="flex-row gap-2">
                    {goalProgresses.map((pct, i) => (
                      <View
                        key={i}
                        className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"
                      >
                        <View
                          className="h-full bg-violet-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </View>
                    ))}
                  </View>
                  <Text className="text-gray-400 dark:text-gray-500 text-xs mt-2.5">
                    {goalsAbove60 > 0
                      ? `${goalsAbove60} goal${
                          goalsAbove60 === 1 ? "" : "s"
                        } above 60% complete`
                      : "Keep going — you're making progress!"}
                  </Text>
                </>
              ) : (
                <Text className="text-gray-400 dark:text-gray-500 text-sm">
                  Tap to set your first savings goal
                </Text>
              )}
            </Pressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      {/* Floating Chat Button */}
      <FloatingChatButton onPress={handleCoachPress} />
    </View>
  );
}
