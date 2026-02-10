import React from 'react';
import { View } from 'react-native';
import { SkeletonRow } from '../SkeletonCard';

export function AccountsSkeletonNetWorth() {
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

export function AccountsSkeletonAccount() {
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

export function AccountsSkeletonLoading() {
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
      <AccountsSkeletonNetWorth />

      {/* Assets Section Skeleton */}
      <View className="mt-8">
        <View className="flex-row items-center justify-between px-5 mb-3">
          <SkeletonRow width={80} height={24} className="rounded-lg" />
          <SkeletonRow width={90} height={24} className="rounded-full" delay={50} />
        </View>
        <AccountsSkeletonAccount />
        <AccountsSkeletonAccount />
        <AccountsSkeletonAccount />
      </View>

      {/* Liabilities Section Skeleton */}
      <View className="mt-4">
        <View className="flex-row items-center justify-between px-5 mb-3">
          <SkeletonRow width={90} height={24} className="rounded-lg" />
          <SkeletonRow width={90} height={24} className="rounded-full" delay={50} />
        </View>
        <AccountsSkeletonAccount />
        <AccountsSkeletonAccount />
      </View>
    </View>
  );
}
