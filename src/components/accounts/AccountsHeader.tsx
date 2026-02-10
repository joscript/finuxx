import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AccountsHeaderProps {
  isSyncing: boolean;
  onSyncPress: () => void;
}

export function AccountsHeader({ isSyncing, onSyncPress }: AccountsHeaderProps) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isSyncing) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      rotation.value = withTiming(0, { duration: 300 });
    }
  }, [isSyncing]);

  const syncIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      className="px-5 pt-4 pb-6"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-gray-900 dark:text-white text-3xl font-bold tracking-tight">
            Accounts & Net Worth
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-base font-medium mt-1">
            All your money in one place
          </Text>
        </View>
        <AnimatedPressable
          onPress={onSyncPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={buttonAnimatedStyle}
          className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center active:bg-gray-200 dark:active:bg-gray-700"
          disabled={isSyncing}
        >
          <AnimatedView style={syncIconStyle}>
            <Ionicons
              name="sync"
              size={22}
              color={isSyncing ? '#111827' : '#6b7280'}
            />
          </AnimatedView>
        </AnimatedPressable>
      </View>
    </Animated.View>
  );
}
