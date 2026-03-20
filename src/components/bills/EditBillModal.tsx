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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Bill, UpdateBillRequest, BillFrequency } from "../../api";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const FREQUENCY_OPTIONS: { value: BillFrequency; label: string }[] = [
  { value: "once", label: "One-time" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

interface EditBillModalProps {
  visible: boolean;
  bill: Bill | null;
  onClose: () => void;
  onUpdateBill: (id: number, data: UpdateBillRequest) => void;
  onDeleteBill: (id: number) => void;
}

export function EditBillModal({
  visible,
  bill,
  onClose,
  onUpdateBill,
  onDeleteBill,
}: EditBillModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [frequency, setFrequency] = useState<BillFrequency>("monthly");
  const [isAutoPay, setIsAutoPay] = useState(false);
  const [reminderDays, setReminderDays] = useState("3");
  const [notes, setNotes] = useState("");

  const scale = useSharedValue(1);
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    if (bill) {
      setName(bill.name);
      setAmount(parseFloat(bill.amount).toString());
      setDueDate(bill.dueDate.split("T")[0]);
      setFrequency(bill.frequency);
      setIsAutoPay(bill.isAutoPay);
      setReminderDays(bill.reminderDays?.toString() || "3");
      setNotes(bill.notes || "");
    }
  }, [bill]);

  const handleSubmit = () => {
    if (!bill || !name.trim() || !amount.trim()) return;

    const updates: UpdateBillRequest = {
      name: name.trim(),
      amount: parseFloat(amount.replace(/,/g, "")) || 0,
      dueDate: dueDate.trim(),
      frequency,
      isAutoPay,
      reminderDays: parseInt(reminderDays, 10) || 3,
      notes: notes.trim() || undefined,
    };

    onUpdateBill(bill.id, updates);
    onClose();
  };

  const handleDelete = () => {
    if (!bill) return;
    Alert.alert(
      "Delete Bill",
      `Are you sure you want to delete "${bill.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            onDeleteBill(bill.id);
            onClose();
          },
        },
      ],
    );
  };

  const isFormValid = name.trim() && amount.trim();

  if (!bill) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <Pressable onPress={onClose} className="p-1">
              <Ionicons name="close" size={24} color="#6b7280" />
            </Pressable>
            <Text className="text-gray-900 dark:text-white text-lg font-bold">
              Edit Bill
            </Text>
            <Pressable onPress={handleDelete} className="p-1">
              <Ionicons name="trash-outline" size={22} color="#ef4444" />
            </Pressable>
          </View>

          <ScrollView
            className="flex-1 px-5 pt-6"
            showsVerticalScrollIndicator={false}
          >
            {/* Bill Name */}
            <View className="mb-5">
              <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
                Bill Name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Electricity Bill"
                placeholderTextColor="#9ca3af"
                className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-4 text-gray-900 dark:text-white text-base border border-gray-200 dark:border-gray-700"
              />
            </View>

            {/* Amount */}
            <View className="mb-5">
              <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
                Amount
              </Text>
              <View className="flex-row items-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <Text className="text-gray-500 dark:text-gray-400 text-lg font-bold pl-4">
                  ₱
                </Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                  className="flex-1 px-2 py-4 text-gray-900 dark:text-white text-base"
                />
              </View>
            </View>

            {/* Due Date */}
            <View className="mb-5">
              <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
                Due Date (YYYY-MM-DD)
              </Text>
              <TextInput
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="2026-04-01"
                placeholderTextColor="#9ca3af"
                className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-4 text-gray-900 dark:text-white text-base border border-gray-200 dark:border-gray-700"
              />
            </View>

            {/* Frequency */}
            <View className="mb-5">
              <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
                Frequency
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {FREQUENCY_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => setFrequency(opt.value)}
                    className={`px-4 py-2.5 rounded-xl ${
                      frequency === opt.value
                        ? "bg-gray-900 dark:bg-white"
                        : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        frequency === opt.value
                          ? "text-white dark:text-gray-900"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Auto-pay toggle */}
            <Pressable
              onPress={() => setIsAutoPay(!isAutoPay)}
              className="flex-row items-center justify-between bg-white dark:bg-gray-800 rounded-2xl px-4 py-4 mb-5 border border-gray-200 dark:border-gray-700"
            >
              <View className="flex-row items-center">
                <Ionicons name="sync-outline" size={20} color="#6b7280" />
                <Text className="text-gray-700 dark:text-gray-300 text-base font-medium ml-3">
                  Auto-pay
                </Text>
              </View>
              <View
                className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                  isAutoPay
                    ? "bg-gray-900 dark:bg-white border-gray-900 dark:border-white"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                {isAutoPay && (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                )}
              </View>
            </Pressable>

            {/* Reminder Days */}
            <View className="mb-5">
              <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
                Remind me (days before)
              </Text>
              <TextInput
                value={reminderDays}
                onChangeText={setReminderDays}
                keyboardType="number-pad"
                className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-4 text-gray-900 dark:text-white text-base border border-gray-200 dark:border-gray-700"
              />
            </View>

            {/* Notes */}
            <View className="mb-8">
              <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
                Notes (optional)
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Add a note..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-4 text-gray-900 dark:text-white text-base border border-gray-200 dark:border-gray-700 min-h-[80px]"
              />
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View className="px-5 pb-4 pt-2">
            <AnimatedPressable
              onPress={handleSubmit}
              disabled={!isFormValid}
              onPressIn={() => {
                scale.value = withSpring(0.96);
              }}
              onPressOut={() => {
                scale.value = withSpring(1);
              }}
              style={[
                buttonAnimatedStyle,
                {
                  shadowColor: "#111827",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: isFormValid ? 0.3 : 0,
                  shadowRadius: 16,
                  elevation: isFormValid ? 8 : 0,
                },
              ]}
              className={`rounded-2xl py-5 items-center ${
                isFormValid
                  ? "bg-gray-900 dark:bg-white"
                  : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <Text
                className={`text-lg font-bold ${
                  isFormValid
                    ? "text-white dark:text-gray-900"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Save Changes
              </Text>
            </AnimatedPressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
