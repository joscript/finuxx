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
import { Ionicons } from "@expo/vector-icons";

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface NetWorthHeroCardProps {
  assets: number;
  liabilities: number;
  currency?: string;
  percentageChange?: number;
  isVisible?: boolean;
  onVisibilityToggle?: (value: boolean) => void;
  onPress?: () => void;
}

export function NetWorthHeroCard({
  assets,
  liabilities,
  currency = "₱",
  percentageChange,
  isVisible = true,
  onVisibilityToggle,
  onPress,
}: NetWorthHeroCardProps) {
  const scale = useSharedValue(1);
  const assetsWidth = useSharedValue(0);
  const liabilitiesWidth = useSharedValue(0);

  const netWorth = assets - liabilities;
  const total = assets + liabilities;
  const assetsPercentage =
    total > 0 ? Math.min((assets / total) * 100, 100) : 50;
  const liabilitiesPercentage =
    total > 0 ? Math.min((liabilities / total) * 100, 100) : 50;
  const isPositive = netWorth >= 0;

  useEffect(() => {
    assetsWidth.value = withDelay(
      300,
      withTiming(assetsPercentage, {
        duration: 900,
        easing: Easing.out(Easing.cubic),
      }),
    );
    liabilitiesWidth.value = withDelay(
      400,
      withTiming(liabilitiesPercentage, {
        duration: 900,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [assetsPercentage, liabilitiesPercentage]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const assetsBarStyle = useAnimatedStyle(() => ({
    width: `${assetsWidth.value}%`,
  }));

  const liabilitiesBarStyle = useAnimatedStyle(() => ({
    width: `${liabilitiesWidth.value}%`,
  }));

  const maskedAmount = "••••••";

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.98);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      style={[
        containerStyle,
        {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 24,
          elevation: 12,
        },
      ]}
      className="bg-white dark:bg-gray-800 rounded-[28px] mx-4 p-6"
    >
      {/* Header row */}
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          Net Worth
        </Text>
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onVisibilityToggle?.(!isVisible);
            }}
            onPressIn={(event) => event.stopPropagation()}
            onPressOut={(event) => event.stopPropagation()}
            className="w-8 h-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700"
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={isVisible ? "Hide net worth" : "Show net worth"}
          >
            <Ionicons
              name={isVisible ? "eye-outline" : "eye-off-outline"}
              size={16}
              color="#9ca3af"
            />
          </Pressable>
          {percentageChange !== undefined && (
            <View
              className={`flex-row items-center rounded-full px-2.5 py-1 ${
                percentageChange >= 0 ? "bg-emerald-500/15" : "bg-red-500/15"
              }`}
            >
              <Ionicons
                name={percentageChange >= 0 ? "arrow-up" : "arrow-down"}
                size={10}
                color={percentageChange >= 0 ? "#22c55e" : "#ef4444"}
              />
              <Text
                className={`text-[11px] font-bold ml-0.5 ${
                  percentageChange >= 0 ? "text-emerald-500" : "text-red-500"
                }`}
              >
                {Math.abs(percentageChange).toFixed(1)}%
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Big net worth number */}
      <View className="flex-row items-baseline mb-5">
        <Text className="text-gray-400 text-xl font-medium mr-1">
          {currency}
        </Text>
        <Text
          className={`text-4xl font-bold tracking-tight ${
            isPositive ? "text-gray-900 dark:text-white" : "text-red-500"
          }`}
          adjustsFontSizeToFit
          numberOfLines={1}
          minimumFontScale={0.7}
        >
          {isVisible ? Math.abs(netWorth).toLocaleString() : maskedAmount}
        </Text>
      </View>

      {/* Assets & liabilities dual bar */}
      <View className="flex-row h-2.5 rounded-full overflow-hidden mb-4 bg-gray-100 dark:bg-gray-700">
        <AnimatedView
          style={assetsBarStyle}
          className="h-full bg-emerald-500 rounded-l-full"
        />
        <AnimatedView
          style={liabilitiesBarStyle}
          className="h-full bg-red-400 rounded-r-full"
        />
      </View>

      {/* Breakdown row */}
      <View className="flex-row justify-between">
        <View className="flex-row items-center">
          <View className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-2" />
          <View>
            <Text className="text-gray-400 dark:text-gray-500 text-[11px] uppercase tracking-wider font-medium">
              Assets
            </Text>
            <Text className="text-gray-900 dark:text-white text-base font-bold mt-0.5">
              {currency}
              {isVisible ? assets.toLocaleString() : maskedAmount}
            </Text>
          </View>
        </View>
        <View className="w-px bg-gray-100 dark:bg-gray-700" />
        <View className="flex-row items-center">
          <View className="w-2.5 h-2.5 bg-red-400 rounded-full mr-2" />
          <View>
            <Text className="text-gray-400 dark:text-gray-500 text-[11px] uppercase tracking-wider font-medium">
              Liabilities
            </Text>
            <Text className="text-gray-900 dark:text-white text-base font-bold mt-0.5">
              {currency}
              {isVisible ? liabilities.toLocaleString() : maskedAmount}
            </Text>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}
