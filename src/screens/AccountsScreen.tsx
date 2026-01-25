import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, FlatList, RefreshControl, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withDelay,
  interpolate,
  Easing,
  FadeInDown,
  FadeIn,
  FadeInUp,
  SlideInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ============ TYPES ============
type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'wallet' | 'loan';
type AccountCategory = 'asset' | 'liability';

interface Account {
  id: string;
  name: string;
  type: AccountType;
  category: AccountCategory;
  balance: number;
  currency: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBgColor: string;
  lastSynced: Date;
  isSyncing?: boolean;
}

// ============ MOCK DATA ============
const MOCK_ACCOUNTS: Account[] = [
  // Assets
  {
    id: '1',
    name: 'BDO Savings',
    type: 'savings',
    category: 'asset',
    balance: 45250.0,
    currency: '₱',
    icon: 'wallet',
    iconColor: '#3b82f6',
    iconBgColor: 'bg-blue-100 dark:bg-blue-500/20',
    lastSynced: new Date(),
  },
  {
    id: '2',
    name: 'BPI Checking',
    type: 'checking',
    category: 'asset',
    balance: 12500.0,
    currency: '₱',
    icon: 'card',
    iconColor: '#10b981',
    iconBgColor: 'bg-emerald-100 dark:bg-emerald-500/20',
    lastSynced: new Date(Date.now() - 3600000),
  },
  {
    id: '3',
    name: 'GCash Wallet',
    type: 'wallet',
    category: 'asset',
    balance: 3500.0,
    currency: '₱',
    icon: 'phone-portrait',
    iconColor: '#0066ff',
    iconBgColor: 'bg-sky-100 dark:bg-sky-500/20',
    lastSynced: new Date(),
  },
  {
    id: '4',
    name: 'Maya Wallet',
    type: 'wallet',
    category: 'asset',
    balance: 1250.0,
    currency: '₱',
    icon: 'phone-portrait',
    iconColor: '#22c55e',
    iconBgColor: 'bg-green-100 dark:bg-green-500/20',
    lastSynced: new Date(Date.now() - 7200000),
  },
  {
    id: '5',
    name: 'Investment Fund',
    type: 'investment',
    category: 'asset',
    balance: 62500.0,
    currency: '₱',
    icon: 'trending-up',
    iconColor: '#8b5cf6',
    iconBgColor: 'bg-violet-100 dark:bg-violet-500/20',
    lastSynced: new Date(),
  },
  // Liabilities
  {
    id: '6',
    name: 'BDO Credit Card',
    type: 'credit',
    category: 'liability',
    balance: 15000.0,
    currency: '₱',
    icon: 'card',
    iconColor: '#ef4444',
    iconBgColor: 'bg-red-100 dark:bg-red-500/20',
    lastSynced: new Date(),
  },
  {
    id: '7',
    name: 'Home Loan',
    type: 'loan',
    category: 'liability',
    balance: 25000.0,
    currency: '₱',
    icon: 'home',
    iconColor: '#f59e0b',
    iconBgColor: 'bg-amber-100 dark:bg-amber-500/20',
    lastSynced: new Date(Date.now() - 86400000),
  },
  {
    id: '8',
    name: 'Car Loan',
    type: 'loan',
    category: 'liability',
    balance: 5000.0,
    currency: '₱',
    icon: 'car',
    iconColor: '#f97316',
    iconBgColor: 'bg-orange-100 dark:bg-orange-500/20',
    lastSynced: new Date(),
  },
];

// ============ ACCOUNT TYPE OPTIONS ============
const ACCOUNT_TYPE_OPTIONS: { type: AccountType; category: AccountCategory; label: string; icon: keyof typeof Ionicons.glyphMap; color: string; bgColor: string }[] = [
  { type: 'savings', category: 'asset', label: 'Savings', icon: 'wallet', color: '#3b82f6', bgColor: 'bg-blue-100 dark:bg-blue-500/20' },
  { type: 'checking', category: 'asset', label: 'Checking', icon: 'card', color: '#10b981', bgColor: 'bg-emerald-100 dark:bg-emerald-500/20' },
  { type: 'wallet', category: 'asset', label: 'E-Wallet', icon: 'phone-portrait', color: '#0066ff', bgColor: 'bg-sky-100 dark:bg-sky-500/20' },
  { type: 'investment', category: 'asset', label: 'Investment', icon: 'trending-up', color: '#8b5cf6', bgColor: 'bg-violet-100 dark:bg-violet-500/20' },
  { type: 'credit', category: 'liability', label: 'Credit Card', icon: 'card', color: '#ef4444', bgColor: 'bg-red-100 dark:bg-red-500/20' },
  { type: 'loan', category: 'liability', label: 'Loan', icon: 'home', color: '#f59e0b', bgColor: 'bg-amber-100 dark:bg-amber-500/20' },
];

// ============ HELPER FUNCTIONS ============
const getAccountTypeLabel = (type: AccountType): string => {
  const labels: Record<AccountType, string> = {
    checking: 'Checking',
    savings: 'Savings',
    credit: 'Credit Card',
    investment: 'Investment',
    wallet: 'E-Wallet',
    loan: 'Loan',
  };
  return labels[type];
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

// ============ SKELETON COMPONENTS ============
interface SkeletonRowProps {
  width?: string | number;
  height?: number;
  className?: string;
  delay?: number;
}

function SkeletonRow({ width = '100%', height = 16, className = '', delay = 0 }: SkeletonRowProps) {
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
      style={{ width: typeof width === 'number' ? width : (width as any), height }}
    >
      <AnimatedView
        style={shimmerStyle}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
      />
    </View>
  );
}

function SkeletonNetWorth() {
  return (
    <View
      className="bg-white dark:bg-gray-800 rounded-[28px] p-7 mx-5"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
      }}
    >
      <View className="flex-row items-center mb-3">
        <SkeletonRow width={32} height={32} className="rounded-full mr-2" />
        <SkeletonRow width={100} height={14} className="rounded-full" delay={50} />
      </View>
      <SkeletonRow width="60%" height={40} className="rounded-xl mb-6" delay={100} />
      <SkeletonRow width="100%" height={12} className="rounded-full mb-5" delay={150} />
      <View className="flex-row justify-between">
        <View className="flex-1 mr-4">
          <SkeletonRow width={60} height={12} className="rounded-full mb-2" delay={200} />
          <SkeletonRow width={100} height={20} className="rounded-full" delay={250} />
        </View>
        <View className="flex-1">
          <SkeletonRow width={70} height={12} className="rounded-full mb-2" delay={200} />
          <SkeletonRow width={90} height={20} className="rounded-full" delay={250} />
        </View>
      </View>
    </View>
  );
}

function SkeletonAccount() {
  return (
    <View
      className="bg-white dark:bg-gray-800 rounded-[20px] p-5 mx-5 mb-3"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View className="flex-row items-center">
        <SkeletonRow width={52} height={52} className="rounded-2xl" />
        <View className="flex-1 ml-4">
          <SkeletonRow width="70%" height={16} className="rounded-full mb-2" delay={50} />
          <SkeletonRow width="40%" height={12} className="rounded-full" delay={100} />
        </View>
        <View className="items-end">
          <SkeletonRow width={80} height={20} className="rounded-full mb-2" delay={100} />
          <SkeletonRow width={50} height={10} className="rounded-full" delay={150} />
        </View>
      </View>
    </View>
  );
}

// ============ HEADER COMPONENT ============
interface HeaderProps {
  isSyncing: boolean;
  onSyncPress: () => void;
}

function Header({ isSyncing, onSyncPress }: HeaderProps) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isSyncing) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      rotation.value = withTiming(0, { duration: 300 });
    }
  }, [isSyncing]);

  const syncIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      className="px-5 pt-4 pb-6"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-gray-900 dark:text-white text-3xl font-bold tracking-tight">
            Accounts & Net Worth
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-base font-medium mt-1">
            All your money in one place
          </Text>
        </View>
        <AnimatedPressable
          onPress={onSyncPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={buttonAnimatedStyle}
          className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center active:bg-gray-200 dark:active:bg-gray-700"
          disabled={isSyncing}
        >
          <AnimatedView style={syncIconStyle}>
            <Ionicons
              name="sync"
              size={22}
              color={isSyncing ? '#111827' : '#6b7280'}
            />
          </AnimatedView>
        </AnimatedPressable>
      </View>
    </Animated.View>
  );
}

// ============ NET WORTH CARD COMPONENT ============
interface NetWorthCardProps {
  assets: number;
  liabilities: number;
  currency?: string;
  trend?: number;
  onPress?: () => void;
}

function NetWorthCard({
  assets,
  liabilities,
  currency = '₱',
  trend = 5.2,
  onPress,
}: NetWorthCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(1);
  const assetsWidth = useSharedValue(0);
  const liabilitiesWidth = useSharedValue(0);

  const netWorth = assets - liabilities;
  const total = assets + liabilities;
  const assetsPercentage = total > 0 ? (assets / total) * 100 : 50;
  const liabilitiesPercentage = total > 0 ? (liabilities / total) * 100 : 50;

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
    assetsWidth.value = withDelay(
      400,
      withTiming(assetsPercentage, { duration: 800, easing: Easing.out(Easing.cubic) })
    );
    liabilitiesWidth.value = withDelay(
      500,
      withTiming(liabilitiesPercentage, { duration: 800, easing: Easing.out(Easing.cubic) })
    );
  }, [assetsPercentage, liabilitiesPercentage]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const assetsBarStyle = useAnimatedStyle(() => ({
    width: `${assetsWidth.value}%`,
  }));

  const liabilitiesBarStyle = useAnimatedStyle(() => ({
    width: `${liabilitiesWidth.value}%`,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
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
        containerStyle,
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 20,
          elevation: 8,
        },
      ]}
      className="bg-gray-900 dark:bg-gray-800 rounded-[28px] p-7 mx-5"
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center">
          <View className={`w-8 h-8 rounded-full items-center justify-center mr-2 ${netWorth >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
            <Ionicons
              name={netWorth >= 0 ? 'trending-up' : 'trending-down'}
              size={16}
              color={netWorth >= 0 ? '#10b981' : '#ef4444'}
            />
          </View>
          <Text className="text-gray-400 text-sm font-medium">Net Worth</Text>
        </View>
        <View className={`px-3 py-1.5 rounded-full ${trend >= 0 ? 'bg-emerald-500/15' : 'bg-red-500/15'}`}>
          <Text className={`text-xs font-bold ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </Text>
        </View>
      </View>

      {/* Net Worth Value */}
      <View className="flex-row items-baseline mb-6">
        <Text className="text-gray-400 text-2xl font-medium mr-2">{currency}</Text>
        <Text className={`text-5xl font-bold tracking-tight ${netWorth >= 0 ? 'text-white' : 'text-red-400'}`}>
          {netWorth < 0 ? '-' : ''}{Math.abs(netWorth).toLocaleString()}
        </Text>
      </View>

      {/* Assets & Liabilities Bar */}
      <View className="flex-row h-3 rounded-full overflow-hidden mb-5 bg-gray-700">
        <AnimatedView
          style={assetsBarStyle}
          className="h-full bg-emerald-500 rounded-l-full"
        />
        <AnimatedView
          style={liabilitiesBarStyle}
          className="h-full bg-red-400 rounded-r-full"
        />
      </View>

      {/* Stats Row */}
      <View className="flex-row justify-between">
        <View className="flex-1 mr-4">
          <View className="flex-row items-center mb-2">
            <View className="w-3 h-3 bg-emerald-500 rounded-full mr-2" />
            <Text className="text-gray-400 text-xs font-medium uppercase tracking-wide">Assets</Text>
          </View>
          <Text className="text-white text-xl font-bold">
            {currency}{assets.toLocaleString()}
          </Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <View className="w-3 h-3 bg-red-400 rounded-full mr-2" />
            <Text className="text-gray-400 text-xs font-medium uppercase tracking-wide">Liabilities</Text>
          </View>
          <Text className="text-white text-xl font-bold">
            {currency}{liabilities.toLocaleString()}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

// ============ ACCOUNT ITEM COMPONENT ============
interface AccountItemProps {
  account: Account;
  index: number;
  onPress?: () => void;
}

function AccountItem({ account, index, onPress }: AccountItemProps) {
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

  const isLiability = account.category === 'liability';
  const syncStatus = formatTimeAgo(account.lastSynced);
  const isRecentSync = (new Date().getTime() - account.lastSynced.getTime()) < 300000; // 5 mins

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(index * 80)}>
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
        className="bg-white dark:bg-gray-800 rounded-[20px] p-5 mx-5 mb-3"
      >
        <View className="flex-row items-center">
          {/* Icon */}
          <View className={`w-14 h-14 rounded-2xl items-center justify-center ${account.iconBgColor}`}>
            <Ionicons name={account.icon} size={26} color={account.iconColor} />
          </View>

          {/* Account Info */}
          <View className="flex-1 ml-4">
            <View className="flex-row items-center">
              <Text className="text-gray-900 dark:text-white text-base font-bold flex-shrink" numberOfLines={1}>
                {account.name}
              </Text>
              {/* Sync Status Dot */}
              <View
                className={`w-2 h-2 rounded-full ml-2 ${isRecentSync ? 'bg-emerald-500' : 'bg-amber-500'}`}
              />
            </View>
            <View className="flex-row items-center mt-1">
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                {getAccountTypeLabel(account.type)}
              </Text>
              <Text className="text-gray-300 dark:text-gray-600 mx-2">•</Text>
              <Text className="text-gray-400 dark:text-gray-500 text-xs">
                {syncStatus}
              </Text>
            </View>
          </View>

          {/* Balance */}
          <View className="items-end">
            <Text className={`text-lg font-bold ${isLiability ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
              {isLiability ? '-' : ''}{account.currency}{account.balance.toLocaleString()}
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
              {account.currency}
            </Text>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

// ============ ADD ACCOUNT CARD COMPONENT ============
interface AddAccountCardProps {
  onPress?: () => void;
}

function AddAccountCard({ onPress }: AddAccountCardProps) {
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
      className="bg-white dark:bg-gray-800 rounded-[20px] p-5 mx-5 mb-6 border-2 border-dashed border-gray-200 dark:border-gray-700"
    >
      <View className="flex-row items-center justify-center">
        <View className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center mr-4">
          <Ionicons name="add" size={28} color="#111827" />
        </View>
        <View>
          <Text className="text-gray-900 dark:text-white text-base font-bold">
            Connect New Account
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            Link your bank or e-wallet
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

// ============ SECTION HEADER COMPONENT ============
interface SectionHeaderProps {
  title: string;
  count?: number;
}

function SectionHeader({ title, count }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-5 mb-3 mt-6">
      <Text className="text-gray-900 dark:text-white text-xl font-bold tracking-tight">
        {title}
      </Text>
      {count !== undefined && (
        <View className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            {count} accounts
          </Text>
        </View>
      )}
    </View>
  );
}

// ============ ADD ACCOUNT MODAL COMPONENT ============
interface AddAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onAddAccount: (account: Omit<Account, 'id' | 'lastSynced' | 'isSyncing'>) => void;
}

function AddAccountModal({ visible, onClose, onAddAccount }: AddAccountModalProps) {
  const [accountName, setAccountName] = useState('');
  const [selectedType, setSelectedType] = useState<typeof ACCOUNT_TYPE_OPTIONS[0] | null>(null);
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState('₱');

  const scale = useSharedValue(1);

  const resetForm = () => {
    setAccountName('');
    setSelectedType(null);
    setBalance('');
    setCurrency('₱');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!accountName.trim() || !selectedType || !balance.trim()) {
      return;
    }

    const newAccount: Omit<Account, 'id' | 'lastSynced' | 'isSyncing'> = {
      name: accountName.trim(),
      type: selectedType.type,
      category: selectedType.category,
      balance: parseFloat(balance.replace(/,/g, '')) || 0,
      currency,
      icon: selectedType.icon,
      iconColor: selectedType.color,
      iconBgColor: selectedType.bgColor,
    };

    onAddAccount(newAccount);
    resetForm();
    onClose();
  };

  const isFormValid = accountName.trim() && selectedType && balance.trim();

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-white dark:bg-gray-900"
      >
        <SafeAreaView className="flex-1" edges={['top']}>
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <Pressable onPress={handleClose} className="w-10 h-10 items-center justify-center">
              <Ionicons name="close" size={28} color="#6b7280" />
            </Pressable>
            <Text className="text-gray-900 dark:text-white text-lg font-bold">
              Connect Account
            </Text>
            <View className="w-10" />
          </View>

          <ScrollView 
            className="flex-1" 
            contentContainerStyle={{ padding: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Account Name Input */}
            <View className="mb-6">
              <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2 uppercase tracking-wide">
                Account Name
              </Text>
              <TextInput
                value={accountName}
                onChangeText={setAccountName}
                placeholder="e.g., BDO Savings"
                placeholderTextColor="#9ca3af"
                className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-5 py-4 text-gray-900 dark:text-white text-base"
              />
            </View>

            {/* Account Type Selection */}
            <View className="mb-6">
              <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-3 uppercase tracking-wide">
                Account Type
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {ACCOUNT_TYPE_OPTIONS.map((option) => {
                  const isSelected = selectedType?.type === option.type;
                  return (
                    <Pressable
                      key={option.type}
                      onPress={() => setSelectedType(option)}
                      className={`flex-row items-center px-4 py-3 rounded-2xl border-2 ${
                        isSelected 
                          ? 'border-gray-900 bg-gray-100 dark:border-white dark:bg-gray-800' 
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <View 
                        className={`w-8 h-8 rounded-full items-center justify-center mr-2 ${option.bgColor}`}
                      >
                        <Ionicons name={option.icon} size={16} color={option.color} />
                      </View>
                      <Text className={`font-semibold ${
                        isSelected 
                          ? 'text-gray-900 dark:text-white' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {option.label}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={18} color="#111827" style={{ marginLeft: 6 }} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Balance Input */}
            <View className="mb-6">
              <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2 uppercase tracking-wide">
                Current Balance
              </Text>
              <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-2xl px-5 py-4">
                <Text className="text-gray-500 dark:text-gray-400 text-xl font-medium mr-2">
                  {currency}
                </Text>
                <TextInput
                  value={balance}
                  onChangeText={setBalance}
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                  className="flex-1 text-gray-900 dark:text-white text-2xl font-bold"
                />
              </View>
            </View>

            {/* Currency Selector */}
            <View className="mb-8">
              <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-3 uppercase tracking-wide">
                Currency
              </Text>
              <View className="flex-row gap-3">
                {['₱', '$', '€', '¥'].map((curr) => (
                  <Pressable
                    key={curr}
                    onPress={() => setCurrency(curr)}
                    className={`w-14 h-14 rounded-2xl items-center justify-center border-2 ${
                      currency === curr 
                        ? 'border-gray-900 bg-gray-100 dark:border-white dark:bg-gray-800' 
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <Text className={`text-2xl font-bold ${
                      currency === curr 
                        ? 'text-gray-900 dark:text-white' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {curr}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Info Card */}
            <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 mb-6">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={22} color="#111827" />
                <View className="flex-1 ml-3">
                  <Text className="text-gray-900 dark:text-white font-semibold mb-1">
                    Manual Account
                  </Text>
                  <Text className="text-gray-600 dark:text-gray-400 text-sm leading-5">
                    This account will be added manually. You'll need to update the balance yourself to keep it accurate.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View className="px-5 pb-5 pt-3 border-t border-gray-100 dark:border-gray-800">
            <AnimatedPressable
              onPress={handleSubmit}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={!isFormValid}
              style={buttonAnimatedStyle}
              className={`rounded-2xl py-5 items-center justify-center ${
                isFormValid 
                  ? 'bg-gray-900' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <View className="flex-row items-center">
                <Ionicons 
                  name="add-circle" 
                  size={22} 
                  color={isFormValid ? '#ffffff' : '#9ca3af'} 
                />
                <Text className={`text-base font-bold ml-2 ${
                  isFormValid 
                    ? 'text-white' 
                    : 'text-gray-400 dark:text-gray-500'
                }`}>
                  Add Account
                </Text>
              </View>
            </AnimatedPressable>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ============ SKELETON LOADING STATE ============
function SkeletonLoading() {
  return (
    <View className="flex-1">
      {/* Header Skeleton */}
      <View className="px-5 pt-4 pb-6">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <SkeletonRow width="80%" height={32} className="rounded-xl mb-2" />
            <SkeletonRow width="60%" height={16} className="rounded-lg" delay={50} />
          </View>
          <View className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800" />
        </View>
      </View>

      {/* Net Worth Card Skeleton */}
      <SkeletonNetWorth />

      {/* Assets Section Skeleton */}
      <View className="mt-8">
        <View className="flex-row items-center justify-between px-5 mb-3">
          <SkeletonRow width={80} height={24} className="rounded-lg" />
          <SkeletonRow width={90} height={24} className="rounded-full" delay={50} />
        </View>
        <SkeletonAccount />
        <SkeletonAccount />
        <SkeletonAccount />
      </View>

      {/* Liabilities Section Skeleton */}
      <View className="mt-4">
        <View className="flex-row items-center justify-between px-5 mb-3">
          <SkeletonRow width={90} height={24} className="rounded-lg" />
          <SkeletonRow width={90} height={24} className="rounded-full" delay={50} />
        </View>
        <SkeletonAccount />
        <SkeletonAccount />
      </View>
    </View>
  );
}

// ============ MAIN ACCOUNTS SCREEN ============
export default function AccountsScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>(MOCK_ACCOUNTS);

  // Calculate totals
  const assets = accounts
    .filter((a) => a.category === 'asset')
    .reduce((sum, a) => sum + a.balance, 0);

  const liabilities = accounts
    .filter((a) => a.category === 'liability')
    .reduce((sum, a) => sum + a.balance, 0);

  const assetAccounts = accounts.filter((a) => a.category === 'asset');
  const liabilityAccounts = accounts.filter((a) => a.category === 'liability');

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Handlers
  const handleSync = useCallback(() => {
    if (isSyncing) return;
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 2000);
  }, [isSyncing]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    handleSync();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  }, [handleSync]);

  const handleNetWorthPress = () => {
    console.log('Net worth pressed');
  };

  const handleAccountPress = (accountId: string) => {
    console.log(`Account pressed: ${accountId}`);
  };

  const handleAddAccount = () => {
    setShowAddModal(true);
  };

  const handleAddNewAccount = (newAccountData: Omit<Account, 'id' | 'lastSynced' | 'isSyncing'>) => {
    const newAccount: Account = {
      ...newAccountData,
      id: `${Date.now()}`,
      lastSynced: new Date(),
    };
    setAccounts((prev) => [...prev, newAccount]);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
        <SkeletonLoading />
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <>
      {/* Header */}
      <Header isSyncing={isSyncing} onSyncPress={handleSync} />

      {/* Net Worth Card */}
      <Animated.View entering={FadeInDown.duration(500).delay(100)}>
        <NetWorthCard
          assets={assets}
          liabilities={liabilities}
          trend={5.2}
          onPress={handleNetWorthPress}
        />
      </Animated.View>

      {/* Assets Section */}
      <Animated.View entering={FadeInDown.duration(500).delay(200)}>
        <SectionHeader title="Assets" count={assetAccounts.length} />
      </Animated.View>
    </>
  );

  const renderFooter = () => (
    <>
      {/* Liabilities Section */}
      <Animated.View entering={FadeInDown.duration(500).delay(300)}>
        <SectionHeader title="Liabilities" count={liabilityAccounts.length} />
      </Animated.View>
      {liabilityAccounts.map((account, index) => (
        <AccountItem
          key={account.id}
          account={account}
          index={index + assetAccounts.length}
          onPress={() => handleAccountPress(account.id)}
        />
      ))}

      {/* Add Account CTA */}
      <Animated.View entering={FadeInDown.duration(500).delay(400)} className="mt-6">
        <AddAccountCard onPress={handleAddAccount} />
      </Animated.View>
    </>
  );

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
      <FlatList
        data={assetAccounts}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <AccountItem
            account={item}
            index={index}
            onPress={() => handleAccountPress(item.id)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#111827"
            colors={['#111827']}
          />
        }
      />

      {/* Add Account Modal */}
      <AddAccountModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddAccount={handleAddNewAccount}
      />
    </SafeAreaView>
  );
}
