import React from 'react';
import { View } from 'react-native';
import { SkeletonRow } from '../SkeletonCard';

// Skeleton for Budget Summary Card
export function BudgetSkeletonSummaryCard() {
  return (
    <View
      className="bg-white dark:bg-gray-800 rounded-[28px] mx-5 p-7"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
      }}
    >
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-1">
          <SkeletonRow width={100} height={12} className="mb-2 rounded-full" />
          <SkeletonRow width={150} height={28} className="rounded-full" delay={50} />
        </View>
        <SkeletonRow width={80} height={80} className="rounded-full" delay={100} />
      </View>
      <SkeletonRow width="100%" height={12} className="rounded-full mb-4" delay={150} />
      <View className="flex-row justify-between">
        <SkeletonRow width={80} height={14} className="rounded-full" delay={200} />
        <SkeletonRow width={80} height={14} className="rounded-full" delay={250} />
      </View>
    </View>
  );
}

// Skeleton for Budget Category Item
export function BudgetSkeletonCategoryItem({ delay = 0 }: { delay?: number }) {
  return (
    <View
      className="bg-white dark:bg-gray-800 rounded-[24px] mx-5 p-5 mb-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View className="flex-row items-center">
        <SkeletonRow width={52} height={52} className="rounded-2xl" delay={delay} />
        <View className="flex-1 ml-4">
          <SkeletonRow width="60%" height={16} className="mb-2 rounded-full" delay={delay + 50} />
          <SkeletonRow width="100%" height={10} className="rounded-full mb-2" delay={delay + 100} />
          <View className="flex-row justify-between">
            <SkeletonRow width="40%" height={12} className="rounded-full" delay={delay + 150} />
            <SkeletonRow width={40} height={20} className="rounded-full" delay={delay + 200} />
          </View>
        </View>
      </View>
    </View>
  );
}

// Full Skeleton Loading State for Budget Screen
export function BudgetSkeletonLoading() {
  return (
    <View className="flex-1">
      {/* Header Skeleton */}
      <View className="px-5 py-6">
        <SkeletonRow width={120} height={32} className="rounded-full mb-2" />
        <SkeletonRow width={180} height={16} className="rounded-full" delay={50} />
      </View>

      {/* Toggle Skeleton */}
      <View className="mx-5 mb-6">
        <SkeletonRow width="100%" height={44} className="rounded-full" delay={100} />
      </View>

      {/* Summary Card Skeleton */}
      <BudgetSkeletonSummaryCard />

      {/* Section Header Skeleton */}
      <View className="px-5 mt-8 mb-4">
        <SkeletonRow width={140} height={22} className="rounded-full" delay={200} />
      </View>

      {/* Category Skeletons */}
      <BudgetSkeletonCategoryItem delay={250} />
      <BudgetSkeletonCategoryItem delay={350} />
      <BudgetSkeletonCategoryItem delay={450} />
      <BudgetSkeletonCategoryItem delay={550} />
    </View>
  );
}
