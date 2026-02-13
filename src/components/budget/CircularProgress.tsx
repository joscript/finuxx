import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  bgColor?: string;
}

export function CircularProgress({
  percentage,
  size = 80,
  strokeWidth = 8,
  color,
  bgColor = '#e5e7eb',
}: CircularProgressProps) {
  const progress = useSharedValue(0);
  const displayPercentage = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      300,
      withTiming(percentage / 100, { duration: 1000, easing: Easing.out(Easing.cubic) })
    );
    displayPercentage.value = withDelay(
      300,
      withTiming(percentage, { duration: 1000, easing: Easing.out(Easing.cubic) })
    );
  }, [percentage]);

  const animatedRotation = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 360}deg` }],
  }));

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      {/* Background Circle */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: bgColor,
        }}
        className="dark:border-gray-700"
      />
      
      {/* Progress indicator - using rotating half circle technique */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          transform: [{ rotate: '-90deg' }],
        }}
      >
        <AnimatedView
          style={[
            animatedRotation,
            {
              position: 'absolute',
              width: size,
              height: size,
            },
          ]}
        >
          <View
            style={{
              position: 'absolute',
              width: size,
              height: size / 2,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: strokeWidth,
                borderColor: color,
                borderBottomColor: 'transparent',
                borderRightColor: 'transparent',
              }}
            />
          </View>
        </AnimatedView>
      </View>

      {/* Center percentage text */}
      <Text className="text-gray-900 dark:text-white text-lg font-bold">
        {Math.round(percentage)}%
      </Text>
    </View>
  );
}
