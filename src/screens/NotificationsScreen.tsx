import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  FadeInDown,
  FadeIn,
  SlideInRight,
  FadeOut,
  Layout,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ============ TYPES ============
type NotificationType = 'alert' | 'bill' | 'ai' | 'system';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBgColor: string;
}

type FilterType = 'all' | 'alerts' | 'bills' | 'ai' | 'system';

interface FilterTabItem {
  id: FilterType;
  label: string;
}

// ============ MOCK DATA ============
const FILTER_TABS: FilterTabItem[] = [
  { id: 'all', label: 'All' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'bills', label: 'Bills' },
  { id: 'ai', label: 'AI Coach' },
  { id: 'system', label: 'System' },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'alert',
    title: 'Budget Limit Warning',
    message: 'You\'ve spent 85% of your Food budget this month. Consider slowing down.',
    timestamp: '2 min ago',
    isRead: false,
    icon: 'warning-outline',
    iconColor: '#f59e0b',
    iconBgColor: 'bg-amber-100 dark:bg-amber-500/20',
  },
  {
    id: '2',
    type: 'bill',
    title: 'Netflix Due Tomorrow',
    message: 'Your Netflix subscription of ₱549 is due on Jan 28.',
    timestamp: '1 hour ago',
    isRead: false,
    icon: 'calendar-outline',
    iconColor: '#e50914',
    iconBgColor: 'bg-red-100 dark:bg-red-500/20',
  },
  {
    id: '3',
    type: 'ai',
    title: 'Spending Pattern Detected',
    message: 'I noticed you spend 40% more on weekends. Want tips to balance it?',
    timestamp: '3 hours ago',
    isRead: false,
    icon: 'sparkles',
    iconColor: '#8b5cf6',
    iconBgColor: 'bg-violet-100 dark:bg-violet-500/20',
  },
  {
    id: '4',
    type: 'alert',
    title: 'Unusual Spending Alert',
    message: 'A transaction of ₱5,500 at SM Mall is higher than your usual spending.',
    timestamp: '5 hours ago',
    isRead: true,
    icon: 'alert-circle-outline',
    iconColor: '#ef4444',
    iconBgColor: 'bg-red-100 dark:bg-red-500/20',
  },
  {
    id: '5',
    type: 'system',
    title: 'Low Balance Warning',
    message: 'Your BDO Savings account balance is below ₱5,000.',
    timestamp: 'Yesterday',
    isRead: true,
    icon: 'wallet-outline',
    iconColor: '#3b82f6',
    iconBgColor: 'bg-blue-100 dark:bg-blue-500/20',
  },
  {
    id: '6',
    type: 'ai',
    title: 'Weekly Summary Ready',
    message: 'Your weekly spending report is ready. You saved ₱2,500 this week! 🎉',
    timestamp: 'Yesterday',
    isRead: true,
    icon: 'bar-chart-outline',
    iconColor: '#22c55e',
    iconBgColor: 'bg-emerald-100 dark:bg-emerald-500/20',
  },
  {
    id: '7',
    type: 'bill',
    title: 'Electric Bill Reminder',
    message: 'Your Meralco bill of ₱2,450 is due in 5 days.',
    timestamp: '2 days ago',
    isRead: true,
    icon: 'flash-outline',
    iconColor: '#f59e0b',
    iconBgColor: 'bg-amber-100 dark:bg-amber-500/20',
  },
  {
    id: '8',
    type: 'system',
    title: 'App Update Available',
    message: 'A new version of Finuxx is available with exciting new features.',
    timestamp: '3 days ago',
    isRead: true,
    icon: 'download-outline',
    iconColor: '#6366f1',
    iconBgColor: 'bg-indigo-100 dark:bg-indigo-500/20',
  },
];

// ============ HELPER FUNCTIONS ============
function getTypeBadge(type: NotificationType): { label: string; color: string; bgColor: string } {
  switch (type) {
    case 'alert':
      return { label: 'Alert', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-500/20' };
    case 'bill':
      return { label: 'Bill', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-500/20' };
    case 'ai':
      return { label: 'AI Coach', color: 'text-violet-600 dark:text-violet-400', bgColor: 'bg-violet-100 dark:bg-violet-500/20' };
    case 'system':
      return { label: 'System', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-500/20' };
    default:
      return { label: 'Info', color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-700' };
  }
}

function filterNotifications(notifications: Notification[], filter: FilterType): Notification[] {
  if (filter === 'all') return notifications;
  const typeMap: Record<FilterType, NotificationType | null> = {
    all: null,
    alerts: 'alert',
    bills: 'bill',
    ai: 'ai',
    system: 'system',
  };
  return notifications.filter((n) => n.type === typeMap[filter]);
}

// ============ SKELETON NOTIFICATION ROW ============
function SkeletonNotificationRow() {
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.ease }),
        withTiming(0, { duration: 1000, easing: Easing.ease })
      ),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmerValue.value, [0, 1], [0.3, 0.7]),
  }));

  return (
    <View className="flex-row items-start p-4 mx-5 mb-3 bg-white dark:bg-gray-800 rounded-2xl">
      {/* Icon Skeleton */}
      <Animated.View
        style={shimmerStyle}
        className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-gray-700"
      />
      <View className="flex-1 ml-4">
        {/* Title Skeleton */}
        <Animated.View
          style={shimmerStyle}
          className="w-3/4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 mb-2"
        />
        {/* Message Skeleton */}
        <Animated.View
          style={shimmerStyle}
          className="w-full h-3 rounded-full bg-gray-200 dark:bg-gray-700 mb-1"
        />
        <Animated.View
          style={shimmerStyle}
          className="w-2/3 h-3 rounded-full bg-gray-200 dark:bg-gray-700 mb-3"
        />
        {/* Bottom Row Skeleton */}
        <View className="flex-row items-center justify-between">
          <Animated.View
            style={shimmerStyle}
            className="w-16 h-5 rounded-full bg-gray-200 dark:bg-gray-700"
          />
          <Animated.View
            style={shimmerStyle}
            className="w-20 h-3 rounded-full bg-gray-200 dark:bg-gray-700"
          />
        </View>
      </View>
    </View>
  );
}

// ============ SKELETON LOADING ============
function SkeletonLoading() {
  return (
    <View className="flex-1 pt-4">
      {[1, 2, 3, 4, 5].map((item) => (
        <SkeletonNotificationRow key={item} />
      ))}
    </View>
  );
}

// ============ FILTER TAB ============
interface FilterTabProps {
  tab: FilterTabItem;
  isActive: boolean;
  onPress: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
}

function FilterTab({ tab, isActive, onPress, onLayout }: FilterTabProps) {
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
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLayout={onLayout}
      style={animatedStyle}
      className="px-4 py-3"
    >
      <Text
        className={`text-sm font-semibold ${
          isActive
            ? 'text-gray-900 dark:text-white'
            : 'text-gray-400 dark:text-gray-500'
        }`}
      >
        {tab.label}
      </Text>
    </AnimatedPressable>
  );
}

// ============ NOTIFICATION ITEM ============
interface NotificationItemProps {
  notification: Notification;
  index: number;
  onPress: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationItem({ notification, index, onPress, onDelete }: NotificationItemProps) {
  const scale = useSharedValue(1);
  const badge = getTypeBadge(notification.type);

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
    <Animated.View
      entering={FadeInDown.duration(400).delay(index * 50)}
      layout={Layout.springify()}
    >
      <AnimatedPressable
        onPress={() => onPress(notification.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          animatedStyle,
          {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: notification.isRead ? 0.04 : 0.08,
            shadowRadius: 8,
            elevation: notification.isRead ? 2 : 4,
          },
        ]}
        className={`flex-row items-start p-4 mx-5 mb-3 rounded-2xl ${
          notification.isRead
            ? 'bg-white dark:bg-gray-800'
            : 'bg-white dark:bg-gray-800 border-l-4 border-gray-900 dark:border-white'
        }`}
      >
        {/* Icon */}
        <View className={`w-12 h-12 rounded-2xl items-center justify-center ${notification.iconBgColor}`}>
          <Ionicons name={notification.icon} size={24} color={notification.iconColor} />
        </View>

        {/* Content */}
        <View className="flex-1 ml-4">
          <View className="flex-row items-start justify-between mb-1">
            <Text
              className={`text-base font-bold flex-1 mr-2 ${
                notification.isRead
                  ? 'text-gray-700 dark:text-gray-300'
                  : 'text-gray-900 dark:text-white'
              }`}
              numberOfLines={1}
            >
              {notification.title}
            </Text>
            {!notification.isRead && (
              <View className="w-2.5 h-2.5 rounded-full bg-gray-900 dark:bg-white mt-1.5" />
            )}
          </View>

          <Text
            className={`text-sm mb-3 leading-5 ${
              notification.isRead
                ? 'text-gray-400 dark:text-gray-500'
                : 'text-gray-600 dark:text-gray-400'
            }`}
            numberOfLines={2}
          >
            {notification.message}
          </Text>

          {/* Bottom Row */}
          <View className="flex-row items-center justify-between">
            <View className={`px-2.5 py-1 rounded-full ${badge.bgColor}`}>
              <Text className={`text-xs font-semibold ${badge.color}`}>
                {badge.label}
              </Text>
            </View>
            <Text className="text-xs text-gray-400 dark:text-gray-500">
              {notification.timestamp}
            </Text>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

// ============ EMPTY STATE ============
function EmptyState() {
  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      className="flex-1 items-center justify-center px-10 py-20"
    >
      {/* Illustration Placeholder */}
      <View className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-6">
        <Ionicons name="notifications-off-outline" size={56} color="#9ca3af" />
      </View>

      <Text className="text-gray-900 dark:text-white text-xl font-bold text-center mb-2">
        You're all caught up 🎉
      </Text>
      <Text className="text-gray-500 dark:text-gray-400 text-base text-center leading-6">
        No new notifications. We'll let you know when something important happens.
      </Text>
    </Animated.View>
  );
}

// ============ HEADER ============
interface HeaderProps {
  onBack: () => void;
  onClearAll: () => void;
  hasNotifications: boolean;
}

function Header({ onBack, onClearAll, hasNotifications }: HeaderProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      className="flex-row items-center justify-between px-5 py-4"
    >
      <View className="flex-row items-center">
        <Pressable
          onPress={onBack}
          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mr-3 active:bg-gray-200 dark:active:bg-gray-700"
        >
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </Pressable>
        <Text className="text-gray-900 dark:text-white text-2xl font-bold tracking-tight">
          Notifications
        </Text>
      </View>

      {hasNotifications && (
        <Pressable
          onPress={onClearAll}
          className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700"
        >
          <Text className="text-gray-600 dark:text-gray-400 text-sm font-semibold">
            Clear all
          </Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

// ============ FILTER TABS BAR ============
interface FilterTabsBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

function FilterTabsBar({ activeFilter, onFilterChange }: FilterTabsBarProps) {
  const [tabMeasurements, setTabMeasurements] = useState<
    Record<string, { x: number; width: number }>
  >({});
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  const handleTabLayout = (tabId: string, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setTabMeasurements((prev) => ({
      ...prev,
      [tabId]: { x, width },
    }));
  };

  useEffect(() => {
    const measurement = tabMeasurements[activeFilter];
    if (measurement) {
      indicatorX.value = withSpring(measurement.x, { damping: 15, stiffness: 150 });
      indicatorWidth.value = withSpring(measurement.width, { damping: 15, stiffness: 150 });
    }
  }, [activeFilter, tabMeasurements]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
  }));

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(100)} className="mx-5 mb-4">
      <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 relative">
        {/* Animated Indicator */}
        <Animated.View
          style={indicatorStyle}
          className="absolute top-1 bottom-1 bg-white dark:bg-gray-700 rounded-xl"
        />

        {/* Tabs */}
        {FILTER_TABS.map((tab) => (
          <FilterTab
            key={tab.id}
            tab={tab}
            isActive={activeFilter === tab.id}
            onPress={() => onFilterChange(tab.id)}
            onLayout={(e) => handleTabLayout(tab.id, e)}
          />
        ))}
      </View>
    </Animated.View>
  );
}

// ============ MAIN NOTIFICATIONS SCREEN ============
export default function NotificationsScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const navigation = useNavigation();

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const filteredNotifications = filterNotifications(notifications, activeFilter);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleNotificationPress = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  }, []);

  const handleDeleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  const renderNotification = useCallback(
    ({ item, index }: { item: Notification; index: number }) => (
      <NotificationItem
        notification={item}
        index={index}
        onPress={handleNotificationPress}
        onDelete={handleDeleteNotification}
      />
    ),
    [handleNotificationPress, handleDeleteNotification]
  );

  const keyExtractor = useCallback((item: Notification) => item.id, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
      {/* Header */}
      <Header
        onBack={handleBack}
        onClearAll={handleClearAll}
        hasNotifications={notifications.length > 0}
      />

      {/* Filter Tabs */}
      {!isLoading && <FilterTabsBar activeFilter={activeFilter} onFilterChange={handleFilterChange} />}

      {/* Content */}
      {isLoading ? (
        <SkeletonLoading />
      ) : filteredNotifications.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotification}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
        />
      )}
    </SafeAreaView>
  );
}
