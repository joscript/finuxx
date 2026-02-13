import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);

interface AnimatedProgressBarProps {
  percentage: number;
  color: string;
  delay?: number;
}

export function AnimatedProgressBar({ percentage, color, delay = 0 }: AnimatedProgressBarProps) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(
      delay,
      withTiming(Math.min(percentage, 100), { duration: 800, easing: Easing.out(Easing.cubic) })
    );
  }, [percentage, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
      <AnimatedView
        style={[animatedStyle, { backgroundColor: color }]}
        className="h-full rounded-full"
      />
    </View>
  );
}
