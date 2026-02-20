import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';

interface SkeletonTransactionRowProps {
  delay?: number;
}

export default function SkeletonTransactionRow({ delay = 0 }: SkeletonTransactionRowProps) {
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
    <View className="flex-row items-center py-4 px-4">
      {/* Icon Skeleton */}
      <View className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <Animated.View
          style={shimmerStyle}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        />
      </View>

      {/* Content Skeleton */}
      <View className="flex-1 ml-4">
        <View className="w-32 h-4 rounded-full bg-gray-200 dark:bg-gray-700 mb-2 overflow-hidden">
          <Animated.View
            style={shimmerStyle}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </View>
        <View className="w-20 h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <Animated.View
            style={shimmerStyle}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </View>
      </View>

      {/* Amount Skeleton */}
      <View className="w-20 h-5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <Animated.View
          style={shimmerStyle}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        />
      </View>
    </View>
  );
}
