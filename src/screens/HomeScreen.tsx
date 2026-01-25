import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ============ MOCK DATA ============
const MOCK_USER = {
  name: 'Josua',
  avatar: 'https://scontent.fcrk2-4.fna.fbcdn.net/v/t39.30808-1/452520623_2513715905502570_4656031386816113501_n.jpg?stp=dst-jpg_s480x480_tt6&_nc_cat=100&ccb=1-7&_nc_sid=1d2534&_nc_eui2=AeGzE2cW0JEmTuJamWkgltViRljU-CF6-HRGWNT4IXr4dG8CyY8oJBi11-umFwf6Ztd8LzqcTFa-5ee6auZPHHol&_nc_ohc=aRWyNVYfE7gQ7kNvwFM9N6f&_nc_oc=Admqkd1vIqSrNaHHPKtVqxgWikKZH_T4hjFR-3tPJehAfVM7T3MPQZZhPe_AKTmk-kQ&_nc_zt=24&_nc_ht=scontent.fcrk2-4.fna&_nc_gid=fLcKi5C2AEiRB1fqbuGtzQ&oh=00_Afocb2ycTPpEx7ZhvCwcRoVe7qV2-S44QQHz5hy_SAG8jg&oe=697B49F6',
};

const MOCK_BALANCE = '48,250.00';

const MOCK_BUDGET = {
  spent: 12500,
  total: 20000,
};

const MOCK_STATS = {
  todaySpending: '₱850',
  monthIncome: '₱35,000',
  savings: '₱8,500',
};

const MOCK_BILLS = [
  {
    id: '1',
    name: 'Netflix Subscription',
    date: 'Jan 28, 2026',
    amount: '₱549',
    icon: 'tv-outline' as const,
    iconColor: '#e50914',
    iconBgColor: 'bg-red-100 dark:bg-red-500/20',
  },
  {
    id: '2',
    name: 'Electric Bill',
    date: 'Feb 1, 2026',
    amount: '₱2,450',
    icon: 'flash-outline' as const,
    iconColor: '#f59e0b',
    iconBgColor: 'bg-amber-100 dark:bg-amber-500/20',
  },
  {
    id: '3',
    name: 'Internet (PLDT)',
    date: 'Feb 5, 2026',
    amount: '₱1,699',
    icon: 'wifi-outline' as const,
    iconColor: '#3b82f6',
    iconBgColor: 'bg-blue-100 dark:bg-blue-500/20',
  },
];

const MOCK_NET_WORTH = {
  assets: 125000,
  liabilities: 45000,
};

const MOCK_CATEGORIES = [
  {
    id: '1',
    name: 'Food',
    spent: 450,
    budget: 600,
    color: '#22c55e',
  },
  {
    id: '2',
    name: 'Transport',
    spent: 180,
    budget: 200,
    color: '#22c55e',
  },
  {
    id: '3',
    name: 'Shopping',
    spent: 520,
    budget: 400,
    color: '#ef4444',
  },
  {
    id: '4',
    name: 'Entertainment',
    spent: 120,
    budget: 300,
    color: '#22c55e',
  },
];

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
}

function Header({ userName, avatarUrl, onNotificationPress, onProfilePress }: HeaderProps) {
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
      <Pressable
        onPress={onNotificationPress}
        className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center active:bg-gray-200 dark:active:bg-gray-700"
      >
        <Ionicons name="notifications-outline" size={24} color="#374151" />
        {/* Notification Badge */}
        <View className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-gray-900" />
      </Pressable>
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

// ============ MAIN HOME SCREEN ============
export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Press handlers
  const handleBalancePress = () => {
    console.log('Balance card pressed');
  };

  const handleBudgetPress = () => {
    console.log('Budget card pressed');
  };

  const handleStatPress = (statName: string) => {
    console.log(`Stat pressed: ${statName}`);
  };

  const handleCoachPress = () => {
    console.log('AI Coach pressed');
  };

  const handleBillPress = (billId: string) => {
    console.log(`Bill pressed: ${billId}`);
  };

  const handleNetWorthPress = () => {
    console.log('Net worth card pressed');
  };

  const handleNotificationPress = () => {
    console.log('Notifications pressed');
  };

  const handleProfilePress = () => {
    console.log('Profile pressed');
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
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <SkeletonLoading />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header Section */}
        <Header
          userName={MOCK_USER.name}
          avatarUrl={MOCK_USER.avatar}
          onNotificationPress={handleNotificationPress}
          onProfilePress={handleProfilePress}
        />

        {/* Balance Card Section */}
        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <BalanceCard
            balance={MOCK_BALANCE}
            onPress={handleBalancePress}
          />
        </Animated.View>

        {/* Budget Progress Section */}
        <Animated.View entering={FadeInDown.duration(500).delay(200)} className="mt-5">
          <BudgetProgressCard
            spent={MOCK_BUDGET.spent}
            total={MOCK_BUDGET.total}
            onPress={handleBudgetPress}
          />
        </Animated.View>

        {/* Quick Stats Row - Horizontal Scroll */}
        <Animated.View entering={FadeInDown.duration(500).delay(300)} className="mt-6">
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
        </Animated.View>

        {/* AI Coach CTA Card */}
        <Animated.View entering={FadeInDown.duration(500).delay(400)} className="mt-4">
          <CoachCard onPress={handleCoachPress} />
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
            {MOCK_CATEGORIES.map((category, index) => (
              <View key={category.id}>
                <CategoryItem
                  name={category.name}
                  spent={category.spent}
                  budget={category.budget}
                  color={category.color}
                  onPress={() => handleCategoryPress(category.id)}
                />
                {index < MOCK_CATEGORIES.length - 1 && (
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
            {MOCK_BILLS.map((bill, index) => (
              <View key={bill.id}>
                <BillItem
                  name={bill.name}
                  date={bill.date}
                  amount={bill.amount}
                  icon={bill.icon}
                  iconColor={bill.iconColor}
                  iconBgColor={bill.iconBgColor}
                  onPress={() => handleBillPress(bill.id)}
                />
                {index < MOCK_BILLS.length - 1 && (
                  <View className="h-px bg-gray-100 dark:bg-gray-700 ml-[76px]" />
                )}
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Net Worth Card */}
        <Animated.View entering={FadeInDown.duration(500).delay(700)} className="mt-8">
          <SectionHeader title="Net Worth" />
          <NetWorthCard
            assets={MOCK_NET_WORTH.assets}
            liabilities={MOCK_NET_WORTH.liabilities}
            onPress={handleNetWorthPress}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
