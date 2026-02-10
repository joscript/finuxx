import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Account as ApiAccount, AccountType as ApiAccountType } from '../../api';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Extended account for UI (adds UI-specific fields)
export interface UIAccount extends ApiAccount {
  iconBgColor?: string;
}

// Helper function to get account type label
const getAccountTypeLabel = (type: ApiAccountType): string => {
  const labels: Record<ApiAccountType, string> = {
    checking: 'Checking',
    savings: 'Savings',
    credit: 'Credit Card',
    investment: 'Investment',
    wallet: 'E-Wallet',
    loan: 'Loan',
  };
  return labels[type];
};

// Helper function to format time ago
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

interface AccountItemProps {
  account: UIAccount;
  index: number;
  onPress?: () => void;
}

export function AccountItem({ account, index, onPress }: AccountItemProps) {
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
  const lastUpdated = account.updatedAt ? new Date(account.updatedAt) : new Date();
  const syncStatus = formatTimeAgo(lastUpdated);
  const isRecentSync = (new Date().getTime() - lastUpdated.getTime()) < 300000; // 5 mins

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
          <View 
            className={`w-14 h-14 rounded-2xl items-center justify-center ${account.iconBgColor?.startsWith('#') ? '' : account.iconBgColor || 'bg-gray-100 dark:bg-gray-700'}`}
            style={account.iconBgColor?.startsWith('#') ? { backgroundColor: account.iconBgColor } : undefined}
          >
            <Ionicons name={(account.icon as keyof typeof Ionicons.glyphMap) || 'wallet'} size={26} color={account.iconColor || '#6b7280'} />
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
              {isLiability ? '-' : ''}{account.currency}{parseFloat(account.balance).toLocaleString()}
            </Text>
            {/* <Text className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
              {account.currency}
            </Text> */}
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}
