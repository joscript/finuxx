import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AddBudgetCardProps {
  onPress?: () => void;
}

export function AddBudgetCard({ onPress }: AddBudgetCardProps) {
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

  return (
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
      className="bg-white dark:bg-gray-800 rounded-[24px] mx-5 p-5 mb-4 border-2 border-dashed border-gray-200 dark:border-gray-700"
    >
      <View className="flex-row items-center justify-center">
        <View className="bg-gray-100 dark:bg-gray-700 w-12 h-12 rounded-full items-center justify-center mr-4">
          <Ionicons name="add" size={24} color="#6b7280" />
        </View>
        <Text className="text-gray-500 dark:text-gray-400 text-base font-semibold">
          Add Category Budget
        </Text>
      </View>
    </AnimatedPressable>
  );
}
