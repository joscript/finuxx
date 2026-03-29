import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import type { Goal } from "../types";
import { useCurrencySymbol } from "../hooks/useCurrency";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const EMOJIS = [
  "🎯",
  "✈️",
  "🏠",
  "🚗",
  "💻",
  "📱",
  "🎓",
  "💍",
  "🛡️",
  "💰",
  "🏖️",
  "🎮",
];

interface EditGoalModalProps {
  visible: boolean;
  goal: Goal | null;
  onClose: () => void;
  onSave: (data: {
    name: string;
    emoji: string;
    targetAmount: number;
    deadline: string;
  }) => void;
}

export default function EditGoalModal({
  visible,
  goal,
  onClose,
  onSave,
}: EditGoalModalProps) {
  const symbol = useCurrencySymbol();
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🎯");
  const [months, setMonths] = useState("");

  const scale = useSharedValue(1);

  // Initialize form when goal changes
  useEffect(() => {
    if (goal) {
      setGoalName(goal.name);
      setTargetAmount(goal.targetAmount.toString());
      setSelectedEmoji(goal.emoji || "🎯");
      setMonths(goal.monthsLeft > 0 ? goal.monthsLeft.toString() : "6");
    }
  }, [goal]);

  const resetForm = () => {
    setGoalName("");
    setTargetAmount("");
    setSelectedEmoji("🎯");
    setMonths("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!goalName.trim() || !targetAmount.trim() || !months.trim()) return;

    const monthsLeft = parseInt(months) || 6;
    const deadline = new Date(
      Date.now() + monthsLeft * 30 * 24 * 60 * 60 * 1000,
    )
      .toISOString()
      .split("T")[0];

    onSave({
      name: goalName.trim(),
      emoji: selectedEmoji,
      targetAmount: parseFloat(targetAmount.replace(/,/g, "")) || 0,
      deadline,
    });
    resetForm();
    onClose();
  };

  const isFormValid = goalName.trim() && targetAmount.trim() && months.trim();

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  if (!goal) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-white dark:bg-gray-900"
      >
        <SafeAreaView className="flex-1" edges={["top"]}>
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <Pressable
              onPress={handleClose}
              className="w-10 h-10 items-center justify-center"
            >
              <Ionicons name="close" size={28} color="#6b7280" />
            </Pressable>
            <Text className="text-gray-900 dark:text-white text-lg font-bold">
              Edit Goal
            </Text>
            <View className="w-10" />
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 20 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Emoji Picker */}
            <View className="mb-6">
              <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-3 uppercase tracking-wide">
                Icon
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {EMOJIS.map((emoji) => (
                  <Pressable
                    key={emoji}
                    onPress={() => setSelectedEmoji(emoji)}
                    className={`w-14 h-14 rounded-2xl items-center justify-center mr-3 ${
                      selectedEmoji === emoji
                        ? "bg-emerald-100 dark:bg-emerald-500/20 border-2 border-emerald-500"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    <Text className="text-2xl">{emoji}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Goal Name Input */}
            <View className="mb-6">
              <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2 uppercase tracking-wide">
                Goal Name
              </Text>
              <TextInput
                value={goalName}
                onChangeText={setGoalName}
                placeholder="e.g., Trip to Japan"
                placeholderTextColor="#9ca3af"
                className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-5 py-4 text-gray-900 dark:text-white text-base"
              />
            </View>

            {/* Target Amount Input */}
            <View className="mb-6">
              <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2 uppercase tracking-wide">
                Target Amount
              </Text>
              <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-2xl px-5 py-4">
                <Text className="text-gray-500 dark:text-gray-400 text-xl font-medium mr-2">
                  {symbol}
                </Text>
                <TextInput
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                  className="flex-1 text-gray-900 dark:text-white text-2xl font-bold"
                />
              </View>
            </View>

            {/* Timeline Input */}
            <View className="mb-6">
              <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2 uppercase tracking-wide">
                Timeline (months)
              </Text>
              <TextInput
                value={months}
                onChangeText={setMonths}
                placeholder="6"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-5 py-4 text-gray-900 dark:text-white text-base"
              />
            </View>

            {/* Info Card */}
            <View className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 mb-6">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={22} color="#3b82f6" />
                <View className="flex-1 ml-3">
                  <Text className="text-gray-900 dark:text-white font-semibold mb-1">
                    Update Your Goal
                  </Text>
                  <Text className="text-gray-600 dark:text-gray-400 text-sm leading-5">
                    Adjust the name, target amount, or timeline. Your saved
                    progress and contributions will remain unchanged.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View className="px-5 pb-5 pt-3 border-t border-gray-100 dark:border-gray-800">
            <AnimatedPressable
              onPress={handleSubmit}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={!isFormValid}
              style={buttonAnimatedStyle}
              className={`rounded-2xl py-5 items-center justify-center ${
                isFormValid
                  ? "bg-gray-900 dark:bg-white"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={isFormValid ? "#ffffff" : "#9ca3af"}
                />
                <Text
                  className={`text-base font-bold ml-2 ${
                    isFormValid
                      ? "text-white dark:text-gray-900"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  Save Changes
                </Text>
              </View>
            </AnimatedPressable>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
