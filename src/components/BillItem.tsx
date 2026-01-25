import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type IconName = keyof typeof Ionicons.glyphMap;

interface BillItemProps {
  name: string;
  date: string;
  amount: string;
  icon: IconName;
  iconColor?: string;
  iconBgColor?: string;
  isPaid?: boolean;
  onPress?: () => void;
}

export function BillItem({
  name,
  date,
  amount,
  icon,
  iconColor = '#3b82f6',
  iconBgColor = 'bg-primary-100 dark:bg-primary-500/20',
  isPaid = false,
  onPress,
}: BillItemProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      className="flex-row items-center py-4"
    >
      <View className={`w-14 h-14 ${iconBgColor} rounded-2xl items-center justify-center`}>
        <Ionicons name={icon} size={26} color={iconColor} />
      </View>
      <View className="flex-1 ml-4">
        <Text className={`text-gray-900 dark:text-white text-base font-semibold ${isPaid ? 'line-through opacity-50' : ''}`}>
          {name}
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Due {date}
        </Text>
      </View>
      <View className="items-end">
        <Text className={`text-gray-900 dark:text-white text-lg font-bold ${isPaid ? 'line-through opacity-50' : ''}`}>
          {amount}
        </Text>
        {isPaid && (
          <View className="flex-row items-center mt-1">
            <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
            <Text className="text-success-500 text-xs font-medium ml-1">Paid</Text>
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
}
