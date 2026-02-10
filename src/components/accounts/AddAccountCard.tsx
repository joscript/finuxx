import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AddAccountCardProps {
  onPress?: () => void;
}

export function AddAccountCard({ onPress }: AddAccountCardProps) {
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
      className="bg-white dark:bg-gray-800 rounded-[20px] p-5 mx-5 mb-6 border-2 border-dashed border-gray-200 dark:border-gray-700"
    >
      <View className="flex-row items-center justify-center">
        <View className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center mr-4">
          <Ionicons name="add" size={28} color="#111827" />
        </View>
        <View>
          <Text className="text-gray-900 dark:text-white text-base font-bold">
            Connect New Account
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            Link your bank or e-wallet
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}
