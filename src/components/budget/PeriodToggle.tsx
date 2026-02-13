import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);

export type BudgetPeriod = 'monthly' | 'weekly';

interface PeriodToggleProps {
  period: BudgetPeriod;
  onToggle: (period: BudgetPeriod) => void;
}

export function PeriodToggle({ period, onToggle }: PeriodToggleProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const translateX = useSharedValue(0);

  // Calculate the translation distance (half of container width minus padding)
  const indicatorWidth = containerWidth > 0 ? (containerWidth - 8) / 2 : 0;

  useEffect(() => {
    if (containerWidth > 0) {
      translateX.value = withSpring(period === 'monthly' ? 0 : indicatorWidth, { 
        damping: 15, 
        stiffness: 200 
      });
    }
  }, [period, containerWidth, indicatorWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: indicatorWidth,
  }));

  return (
    <View 
      className="flex-row bg-gray-100 dark:bg-gray-800 rounded-full p-1 mx-5"
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {/* Animated Indicator */}
      {containerWidth > 0 && (
        <AnimatedView
          style={[indicatorStyle, { position: 'absolute', top: 4, left: 4, height: 36 }]}
          className="bg-white dark:bg-gray-700 rounded-full"
        />
      )}

      <Pressable
        onPress={() => onToggle('monthly')}
        className="flex-1 py-2.5 items-center justify-center z-10"
      >
        <Text
          className={`text-sm font-semibold ${
            period === 'monthly'
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Monthly
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onToggle('weekly')}
        className="flex-1 py-2.5 items-center justify-center z-10"
      >
        <Text
          className={`text-sm font-semibold ${
            period === 'weekly'
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Weekly
        </Text>
      </Pressable>
    </View>
  );
}
