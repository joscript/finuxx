import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from "react-native-reanimated";

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface BalanceCardProps {
  balance: string;
  assets: number;
  liabilities: number;
  currency?: string;
  percentageChange?: number;
  onPress?: () => void;
}

export function BalanceCard({
  balance,
  assets,
  liabilities,
  currency = "₱",
  percentageChange,
  onPress,
}: BalanceCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(1);
  const progressWidth = useSharedValue(0);

  const totalWealth = assets + liabilities;
  const assetPercentage =
    totalWealth > 0 ? Math.min((assets / totalWealth) * 100, 100) : 0;

  const badgeLabel =
    percentageChange !== undefined
      ? `${percentageChange >= 0 ? "+" : ""}${percentageChange.toFixed(1)}%`
      : null;
  const badgeBg =
    percentageChange !== undefined && percentageChange >= 0
      ? "bg-emerald-500/15"
      : "bg-danger-500/15";
  const badgeTextColor =
    percentageChange !== undefined && percentageChange >= 0
      ? "text-emerald-400"
      : "text-danger-400";

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
    translateY.value = withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
    progressWidth.value = withDelay(
      300,
      withTiming(assetPercentage, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [assetPercentage]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
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
      style={[
        animatedStyle,
        {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 24,
          elevation: 12,
        },
      ]}
      className="bg-white dark:bg-gray-800 rounded-[28px] p-4 flex-1"
    >
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-gray-500 dark:text-gray-400 text-xs font-medium">
          Balance
        </Text>
        {badgeLabel !== null && (
          <View className={`${badgeBg} rounded-full px-2.5 py-1`}>
            <Text className={`${badgeTextColor} text-[10px] font-bold`}>
              {badgeLabel}
            </Text>
          </View>
        )}
      </View>
      <View className="flex-row items-baseline flex-wrap">
        <Text className="text-gray-400 text-lg font-medium mr-1">
          {currency}
        </Text>
        <Text
          className="text-gray-900 dark:text-white text-3xl font-bold tracking-tight"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
        >
          {balance}
        </Text>
      </View>
      <Text className="text-gray-500 text-xs mt-3">vs last month</Text>

      {/* Divider */}
      <View className="h-px bg-gray-100 dark:bg-gray-700 my-3" />

      {/* Assets / Liabilities Bar */}
      <View className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
        <AnimatedView
          style={progressStyle}
          className="h-full bg-primary-500 rounded-full"
        />
      </View>

      <View className="gap-0.5">
        <Text className="text-gray-500 dark:text-gray-400 text-[11px]">
          {currency}
          {assets.toLocaleString()} assets
        </Text>
        <Text className="text-gray-400 dark:text-gray-500 text-[11px]">
          {currency}
          {liabilities.toLocaleString()} liabilities
        </Text>
      </View>
    </AnimatedPressable>
  );
}
