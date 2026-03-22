import React from "react";
import { View, ScrollView } from "react-native";
import {
  SkeletonCard,
  SkeletonStatItem,
  SkeletonBillItem,
} from "../SkeletonCard";

export function HomeSkeletonLoading() {
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
