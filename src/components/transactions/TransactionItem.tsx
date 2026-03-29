import React from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
  Layout,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Transaction } from "./types";
import { useCurrency } from "../../hooks/useCurrency";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TransactionItemProps {
  transaction: Transaction;
  index: number;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function TransactionItem({
  transaction,
  index,
  onPress,
  onEdit,
  onDelete,
}: TransactionItemProps) {
  const fmt = useCurrency();
  const scale = useSharedValue(1);
  const isIncome = transaction.type === "income";

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
    <Animated.View
      entering={FadeInDown.delay(index * 50)
        .duration(400)
        .springify()}
      layout={Layout.springify()}
    >
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
        className="flex-row items-center py-4 px-4 active:bg-gray-50 dark:active:bg-gray-700/50"
      >
        {/* Category Icon */}
        <View
          className="w-12 h-12 rounded-2xl items-center justify-center"
          style={{ backgroundColor: `${transaction.categoryColor}20` }}
        >
          <Ionicons
            name={transaction.categoryIcon}
            size={22}
            color={transaction.categoryColor}
          />
        </View>

        {/* Content */}
        <View className="flex-1 ml-4">
          <View className="flex-row items-center">
            <Text
              className="text-gray-900 dark:text-white text-base font-semibold"
              numberOfLines={1}
            >
              {transaction.merchant}
            </Text>
            {transaction.isRecurring && (
              <View className="ml-2 bg-blue-100 dark:bg-blue-500/20 px-2 py-0.5 rounded-full">
                <Text className="text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                  RECURRING
                </Text>
              </View>
            )}
            {transaction.hasReceipt && (
              <Ionicons
                name="document-text-outline"
                size={14}
                color="#9ca3af"
                style={{ marginLeft: 6 }}
              />
            )}
          </View>
          <View className="flex-row items-center mt-1">
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              {transaction.category}
            </Text>
            {transaction.note && (
              <Text
                className="text-gray-400 dark:text-gray-500 text-sm ml-2"
                numberOfLines={1}
              >
                • {transaction.note}
              </Text>
            )}
          </View>
        </View>

        {/* Amount */}
        <Text
          className={`text-base font-bold ${
            isIncome
              ? "text-emerald-500 dark:text-emerald-400"
              : "text-gray-900 dark:text-white"
          }`}
        >
          {isIncome ? "+" : "-"}
          {fmt(transaction.amount)}
        </Text>
      </AnimatedPressable>
    </Animated.View>
  );
}
