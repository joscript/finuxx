import React from 'react';
import { View } from 'react-native';
import SkeletonTransactionRow from './SkeletonTransactionRow';

export default function SkeletonLoading() {
  return (
    <View className="flex-1">
      {/* Summary Card Skeleton */}
      <View
        className="bg-gray-100 dark:bg-gray-800 rounded-[24px] mx-5 h-24 mb-4"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 4,
        }}
      />

      {/* Date Header Skeleton */}
      <View className="px-5 mb-3">
        <View className="w-24 h-4 rounded-full bg-gray-200 dark:bg-gray-700" />
      </View>

      {/* Transactions Card Skeleton */}
      <View
        className="bg-white dark:bg-gray-800 rounded-[24px] mx-5 overflow-hidden"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <SkeletonTransactionRow delay={0} />
        <View className="h-px bg-gray-100 dark:bg-gray-700 mx-4" />
        <SkeletonTransactionRow delay={100} />
        <View className="h-px bg-gray-100 dark:bg-gray-700 mx-4" />
        <SkeletonTransactionRow delay={200} />
      </View>

      {/* Date Header Skeleton */}
      <View className="px-5 mb-3 mt-6">
        <View className="w-32 h-4 rounded-full bg-gray-200 dark:bg-gray-700" />
      </View>

      {/* Transactions Card Skeleton */}
      <View
        className="bg-white dark:bg-gray-800 rounded-[24px] mx-5 overflow-hidden"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <SkeletonTransactionRow delay={300} />
        <View className="h-px bg-gray-100 dark:bg-gray-700 mx-4" />
        <SkeletonTransactionRow delay={400} />
      </View>
    </View>
  );
}
