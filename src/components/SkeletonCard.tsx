import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);

interface SkeletonCardProps {
  height?: number;
  className?: string;
}

export function SkeletonCard({ height = 120, className = '' }: SkeletonCardProps) {
  const shimmerPosition = useSharedValue(0);

  useEffect(() => {
    shimmerPosition.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmerPosition.value, [0, 1], [-200, 200]);
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View
      className={`bg-gray-100 dark:bg-gray-800 rounded-[24px] mx-5 overflow-hidden ${className}`}
      style={{ height }}
    >
      <AnimatedView
        style={shimmerStyle}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
      />
    </View>
  );
}

interface SkeletonRowProps {
  width?: string | number;
  height?: number;
  className?: string;
  delay?: number;
}

export function SkeletonRow({ width = '100%', height = 16, className = '', delay = 0 }: SkeletonRowProps) {
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
      style={{ width: typeof width === 'number' ? width : width as any, height }}
    >
      <AnimatedView
        style={shimmerStyle}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
      />
    </View>
  );
}

export function SkeletonStatItem() {
  return (
    <View 
      className="w-48 bg-white dark:bg-gray-800 rounded-[24px] p-6 mr-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <SkeletonRow width={48} height={48} className="rounded-2xl mb-5" />
      <SkeletonRow width="50%" height={10} className="mb-3 rounded-full" delay={100} />
      <SkeletonRow width="75%" height={22} className="rounded-full" delay={200} />
    </View>
  );
}

export function SkeletonBillItem() {
  return (
    <View className="flex-row items-center py-4">
      <SkeletonRow width={56} height={56} className="rounded-2xl" />
      <View className="flex-1 ml-4">
        <SkeletonRow width="70%" height={16} className="mb-2 rounded-full" delay={50} />
        <SkeletonRow width="40%" height={12} className="rounded-full" delay={100} />
      </View>
      <SkeletonRow width={70} height={22} className="rounded-full" delay={150} />
    </View>
  );
}
