import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
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
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import {
  BalanceCard,
  BudgetProgressCard,
  StatItem,
  CoachCard,
  BillItem,
  NetWorthCard,
  SkeletonCard,
  SkeletonStatItem,
  SkeletonBillItem,
} from '../components';
import { RootStackParamList } from '../navigation';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAccounts } from '../store/slices/accountsSlice';
import { fetchCurrentBudget } from '../store/slices/budgetsSlice';
import { fetchBills } from '../store/slices/billsSlice';
import { fetchTransactionSummary } from '../store/slices/transactionsSlice';

type HomeScreenNavigationProp = NavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ============ CONSTANTS ============
// Default avatar for users without profile picture
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=random';

// ============ HELPER FUNCTIONS ============
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// ============ HEADER COMPONENT ============
interface HeaderProps {
  userName: string;
  avatarUrl: string;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  onSettingsPress?: () => void;
}

function Header({ userName, avatarUrl, onNotificationPress, onProfilePress, onSettingsPress }: HeaderProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      className="flex-row items-center justify-between px-5 py-4"
    >
      <View className="flex-row items-center flex-1">
        <AnimatedPressable
          onPress={onProfilePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={animatedStyle}
        >
          <Image
            source={{ uri: avatarUrl }}
            className="w-14 h-14 rounded-full bg-gray-100"
          />
        </AnimatedPressable>
        <View className="ml-4 flex-1">
          <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            {getGreeting()}
          </Text>
          <Text className="text-gray-900 dark:text-white text-2xl font-bold tracking-tight">
            {userName}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={onNotificationPress}
          className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center active:bg-gray-200 dark:active:bg-gray-700"
        >
          <Ionicons name="notifications-outline" size={24} color="#374151" />
          {/* Notification Badge */}
          <View className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-gray-900" />
        </Pressable>
        <Pressable
          onPress={onSettingsPress}
          className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center active:bg-gray-200 dark:active:bg-gray-700"
        >
          <Ionicons name="menu-outline" size={24} color="#374151" />
        </Pressable>
      </View>
    </Animated.View>
  );
}

// ============ SECTION HEADER COMPONENT ============
interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

function SectionHeader({ title, actionLabel, onActionPress }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-5 mb-4">
      <Text className="text-gray-900 dark:text-white text-xl font-bold tracking-tight">
        {title}
      </Text>
      {actionLabel && (
        <Pressable 
          onPress={onActionPress}
          className="active:opacity-60"
        >
          <Text className="text-gray-900 dark:text-white text-sm font-semibold underline">
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

// ============ CATEGORY ITEM COMPONENT ============
interface CategoryItemProps {
  name: string;
  spent: number;
  budget: number;
  color: string;
  onPress?: () => void;
}

function CategoryItem({ name, spent, budget, color, onPress }: CategoryItemProps) {
  const progress = Math.min((spent / budget) * 100, 100);
  const isOverBudget = spent > budget;
  const barColor = isOverBudget ? '#ef4444' : color;
  const remaining = budget - spent;

  return (
    <Pressable onPress={onPress} className="py-4 active:opacity-70">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View 
            className="w-3 h-3 rounded-full mr-3"
            style={{ backgroundColor: barColor }}
          />
          <Text className="text-gray-900 dark:text-white text-base font-semibold">
            {name}
          </Text>
        </View>
        <Text className={`text-sm font-medium ${isOverBudget ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
          {isOverBudget ? `-₱${Math.abs(remaining).toLocaleString()} over` : `₱${remaining.toLocaleString()} left`}
        </Text>
      </View>
      <View className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <View
          className="h-full rounded-full"
          style={{
            width: `${progress}%`,
            backgroundColor: barColor,
          }}
        />
      </View>
      <View className="flex-row items-center justify-between mt-2">
        <Text className="text-gray-400 dark:text-gray-500 text-xs">
          ₱{spent.toLocaleString()} spent
        </Text>
        <Text className="text-gray-400 dark:text-gray-500 text-xs">
          ₱{budget.toLocaleString()} budget
        </Text>
      </View>
    </Pressable>
  );
}

// ============ SKELETON LOADING STATE ============
function SkeletonLoading() {
  return (
    <View className="flex-1">
      {/* Header Skeleton */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <View className="flex-row items-center">
          <View className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800" />
          <View className="ml-4">
            <View className="w-20 h-3 rounded-full bg-gray-100 dark:bg-gray-800 mb-2" />
            <View className="w-28 h-6 rounded-full bg-gray-100 dark:bg-gray-800" />
          </View>
        </View>
        <View className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800" />
      </View>

      {/* Balance Card Skeleton */}
      <SkeletonCard height={180} className="mt-2" />

      {/* Budget Card Skeleton */}
      <SkeletonCard height={130} className="mt-5" />

      {/* Stats Row Skeleton */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 4 }}
        className="mt-5"
      >
        <SkeletonStatItem />
        <View className="w-3" />
        <SkeletonStatItem />
        <View className="w-3" />
        <SkeletonStatItem />
      </ScrollView>

      {/* Coach Card Skeleton */}
      <SkeletonCard height={100} className="mt-5" />

      {/* Bills Skeleton */}
      <View className="px-5 mt-8">
        <View className="w-36 h-6 rounded-full bg-gray-100 dark:bg-gray-800 mb-4" />
        <View className="bg-white dark:bg-gray-800 rounded-[24px] p-5">
          <SkeletonBillItem />
          <SkeletonBillItem />
          <SkeletonBillItem />
        </View>
      </View>

      {/* Net Worth Skeleton */}
      <SkeletonCard height={200} className="mt-5 mb-8" />
    </View>
  );
}

// ============ FLOATING CHAT BUTTON ============
interface FloatingChatButtonProps {
  onPress: () => void;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const BUTTON_SIZE = 56;
const MARGIN = 20;

function FloatingChatButton({ onPress }: FloatingChatButtonProps) {
  const translateX = useSharedValue(SCREEN_WIDTH - BUTTON_SIZE - MARGIN);
  const translateY = useSharedValue(SCREEN_HEIGHT - BUTTON_SIZE - 140);
  const contextX = useSharedValue(0);
  const contextY = useSharedValue(0);
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);
  const isDragging = useSharedValue(false);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1500 }),
        withTiming(0.4, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      contextX.value = translateX.value;
      contextY.value = translateY.value;
      isDragging.value = true;
      scale.value = withSpring(1.1);
    })
    .onUpdate((event) => {
      const newX = contextX.value + event.translationX;
      const newY = contextY.value + event.translationY;
      translateX.value = Math.max(MARGIN, Math.min(newX, SCREEN_WIDTH - BUTTON_SIZE - MARGIN));
      translateY.value = Math.max(MARGIN + 60, Math.min(newY, SCREEN_HEIGHT - BUTTON_SIZE - 100));
    })
    .onEnd(() => {
      isDragging.value = false;
      scale.value = withSpring(1);
      const snapToRight = translateX.value > (SCREEN_WIDTH - BUTTON_SIZE) / 2;
      translateX.value = withSpring(
        snapToRight ? SCREEN_WIDTH - BUTTON_SIZE - MARGIN : MARGIN,
        { damping: 15, stiffness: 150 }
      );
    });

  const tapGesture = Gesture.Tap()
    .onStart(() => {
      scale.value = withSpring(0.9);
    })
    .onEnd(() => {
      scale.value = withSpring(1);
      runOnJS(onPress)();
    });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: isDragging.value ? 0.8 : glowOpacity.value,
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        entering={FadeIn.duration(400).delay(800)}
        style={[
          buttonStyle,
          {
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: 999,
          },
        ]}
      >
        <Animated.View
          style={glowStyle}
          className="absolute -inset-2 bg-gray-900 rounded-full"
        />
        <View
          style={{
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 10,
          }}
          className="bg-gray-900 rounded-full items-center justify-center"
        >
          <Ionicons name="sparkles" size={24} color="#fff" />
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

// ============ MAIN HOME SCREEN ============
export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const dispatch = useAppDispatch();
  
  // Redux state selectors
  const { user } = useAppSelector((state) => state.auth);
  const { accounts, totals, isLoading: accountsLoading } = useAppSelector((state) => state.accounts);
  const { currentBudget, isLoading: budgetLoading } = useAppSelector((state) => state.budgets);
  const { bills, isLoading: billsLoading } = useAppSelector((state) => state.bills);
  const { summary: transactionSummary, isLoading: summaryLoading } = useAppSelector((state) => state.transactions);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchCurrentBudget());
    dispatch(fetchBills({ upcoming: true }));
    dispatch(fetchTransactionSummary());
  }, [dispatch]);

  const isLoading = accountsLoading || budgetLoading || billsLoading || summaryLoading;

  // Derive data from Redux state with fallbacks
  const userName = user?.name?.split(' ')[0] || 'User';
  const userAvatar = DEFAULT_AVATAR;
  
  const balance = totals?.netWorth?.toLocaleString() || '0.00';
  const totalAssets = totals?.totalAssets || 0;
  const totalLiabilities = totals?.totalLiabilities || 0;
  
  const budgetSpent = currentBudget?.totalSpent || 0;
  const budgetTotal = parseFloat(currentBudget?.totalAmount || '0');
  
  const todaySpending = `₱${transactionSummary?.totalExpenses?.toLocaleString() || '0'}`;
  const monthIncome = `₱${transactionSummary?.totalIncome?.toLocaleString() || '0'}`;
  const savings = `₱${transactionSummary?.netFlow?.toLocaleString() || '0'}`;

  const upcomingBills = bills?.slice(0, 3) || [];
  
  // Derive categories from budget data
  const budgetCategories = (currentBudget?.categories || []).slice(0, 4).map((cat: any) => {
    const spent = parseFloat(cat.spentAmount || '0');
    const budget = parseFloat(cat.allocatedAmount || '0');
    return {
      id: cat.id.toString(),
      name: cat.category?.name || 'Category',
      spent,
      budget,
      color: spent > budget ? '#ef4444' : '#22c55e',
    };
  });

  // Press handlers
  const handleBalancePress = () => {
    navigation.navigate('Accounts' as never);
  };

  const handleBudgetPress = () => {
    navigation.navigate('Budget');
  };

  const handleStatPress = (statName: string) => {
    console.log(`Stat pressed: ${statName}`);
  };

  const handleCoachPress = () => {
    navigation.navigate('Coach');
  };

  const handleGoalsPress = () => {
    navigation.navigate('Goals');
  };

  const handleBillPress = (billId: string) => {
    console.log(`Bill pressed: ${billId}`);
  };

  const handleNetWorthPress = () => {
    console.log('Net worth card pressed');
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notifications');
  };

  const handleProfilePress = () => {
    console.log('Profile pressed');
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  const handleViewAllBills = () => {
    console.log('View all bills pressed');
  };

  const handleCategoryPress = (categoryId: string) => {
    console.log(`Category pressed: ${categoryId}`);
  };

  const handleViewAllCategories = () => {
    console.log('View all categories pressed');
  };

  if (isLoading) {
    return (
      <View className="flex-1">
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            <SkeletonLoading />
          </ScrollView>
        </SafeAreaView>
        <FloatingChatButton onPress={handleCoachPress} />
      </View>
    );
  }

  return (
    <View className="flex-1">
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
          >
        {/* Header Section */}
        <Header
          userName={userName}
          avatarUrl={userAvatar}
          onNotificationPress={handleNotificationPress}
          onProfilePress={handleProfilePress}
          onSettingsPress={handleSettingsPress}
        />

        {/* Balance Card Section */}
        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <BalanceCard
            balance={balance}
            onPress={handleBalancePress}
          />
        </Animated.View>

        {/* Budget Progress Section */}
        <Animated.View entering={FadeInDown.duration(500).delay(200)} className="mt-5">
          <BudgetProgressCard
            spent={budgetSpent}
            total={budgetTotal}
            onPress={handleBudgetPress}
          />
        </Animated.View>

        {/* Quick Stats Row - Horizontal Scroll */}
        {/* <Animated.View entering={FadeInDown.duration(500).delay(300)} className="mt-6">
          <SectionHeader title="Quick Stats" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 8, paddingBottom: 12, paddingTop: 8 }}
          >
            <StatItem
              title="Today"
              value={MOCK_STATS.todaySpending}
              icon="wallet-outline"
              iconColor="#ef4444"
              iconBgColor="bg-red-50 dark:bg-red-500/20"
              trend="up"
              trendValue="15%"
              onPress={() => handleStatPress('todaySpending')}
            />
            <StatItem
              title="This Month"
              value={MOCK_STATS.monthIncome}
              icon="trending-up-outline"
              iconColor="#22c55e"
              iconBgColor="bg-emerald-50 dark:bg-emerald-500/20"
              trend="up"
              trendValue="8%"
              onPress={() => handleStatPress('monthIncome')}
            />
            <StatItem
              title="Savings"
              value={MOCK_STATS.savings}
              icon="pie-chart-outline"
              iconColor="#8b5cf6"
              iconBgColor="bg-violet-50 dark:bg-violet-500/20"
              trend="up"
              trendValue="12%"
              onPress={() => handleStatPress('savings')}
            />
          </ScrollView>
        </Animated.View> */}

        {/* AI Coach CTA Card */}
        {/* <Animated.View entering={FadeInDown.duration(500).delay(400)} className="mt-4">
          <CoachCard onPress={handleCoachPress} />
        </Animated.View> */}

        {/* Goals Card */}
        <Animated.View entering={FadeInDown.duration(500).delay(450)} className="mt-4">
          <Pressable
            onPress={handleGoalsPress}
            className="mx-5 rounded-[28px] overflow-hidden active:opacity-90"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 16,
              elevation: 6,
            }}
          >
            <View className="bg-gradient-to-br bg-violet-500 dark:bg-violet-600 p-6">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="bg-white/20 w-12 h-12 rounded-2xl items-center justify-center">
                    <Ionicons name="flag" size={24} color="#fff" />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-white text-lg font-bold">Goals & Planning</Text>
                    <Text className="text-violet-100 text-sm mt-0.5">Track your savings goals</Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <View className="bg-white/20 rounded-full px-3 py-1.5 mr-3">
                    <Text className="text-white text-xs font-bold">5 Active</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#fff" />
                </View>
              </View>
              {/* Mini Progress Indicators */}
              <View className="flex-row mt-4 gap-2">
                <View className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <View className="h-full bg-white rounded-full" style={{ width: '65%' }} />
                </View>
                <View className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <View className="h-full bg-white rounded-full" style={{ width: '63%' }} />
                </View>
                <View className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <View className="h-full bg-white rounded-full" style={{ width: '38%' }} />
                </View>
              </View>
            </View>
          </Pressable>
        </Animated.View>

        {/* Top Categories Section */}
        <Animated.View entering={FadeInDown.duration(500).delay(500)} className="mt-8">
          <SectionHeader
            title="Top Categories"
            actionLabel="See all"
            onActionPress={handleViewAllCategories}
          />
          <View 
            className="bg-white dark:bg-gray-800 rounded-[28px] mx-5 px-6 py-2"
            style={{
              shadowColor: '#000',
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

        {/* Upcoming Bills Section */}
        <Animated.View entering={FadeInDown.duration(500).delay(600)} className="mt-8">
          <SectionHeader
            title="Upcoming Bills"
            actionLabel="See all"
            onActionPress={handleViewAllBills}
          />
          <View 
            className="bg-white dark:bg-gray-800 rounded-[28px] mx-5 px-6 py-2"
            style={{
              shadowColor: '#000',
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
                    date={new Date(bill.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                <Text className="text-gray-400 dark:text-gray-500">No upcoming bills</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Net Worth Card */}
        <Animated.View entering={FadeInDown.duration(500).delay(700)} className="mt-8">
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
