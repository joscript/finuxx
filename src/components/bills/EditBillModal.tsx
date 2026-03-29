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
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Bill, UpdateBillRequest, BillRecurrence } from "../../api";
import { useCurrencySymbol } from "../../hooks/useCurrency";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const RECURRENCE_OPTIONS: { value: BillRecurrence; label: string }[] = [
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
  onUpdateBill: (id: string, data: UpdateBillRequest) => void;
  onDeleteBill: (id: string) => void;
}

export function EditBillModal({
  visible,
  bill,
  onClose,
  onUpdateBill,
  onDeleteBill,
}: EditBillModalProps) {
  const symbol = useCurrencySymbol();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [recurrence, setRecurrence] = useState<BillRecurrence>("monthly");
  const [isAutoPay, setIsAutoPay] = useState(false);
  const [reminderDaysBefore, setReminderDaysBefore] = useState("3");
  const [notes, setNotes] = useState("");

  const scale = useSharedValue(1);
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    if (bill) {
      setName(bill.name);
      setAmount(parseFloat(bill.amount).toString());
      setDueDate(new Date(bill.dueDate));
      setRecurrence(bill.recurrence);
      setIsAutoPay(bill.isAutoPay);
      setReminderDaysBefore(bill.reminderDaysBefore?.toString() || "3");
      setNotes(bill.notes || "");
    }
  }, [bill]);

  const handleSubmit = () => {
    if (!bill || !name.trim() || !amount.trim()) return;

    const formattedDate = dueDate.toISOString().split("T")[0];

    const updates: UpdateBillRequest = {
      name: name.trim(),
      amount: parseFloat(amount.replace(/,/g, "")) || 0,
      dueDate: formattedDate,
      recurrence,
      isAutoPay,
      reminderDaysBefore: parseInt(reminderDaysBefore, 10) || 3,
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

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

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
                  {symbol}
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
                Due Date
              </Text>
              <Pressable
                onPress={() => setShowDatePicker(!showDatePicker)}
                className={`bg-white dark:bg-gray-800 rounded-2xl px-4 py-4 border flex-row items-center justify-between ${
                  showDatePicker
                    ? "border-blue-400 dark:border-blue-500"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <View className="flex-row items-center">
                  <View
                    className={`w-9 h-9 rounded-xl items-center justify-center mr-3 ${
                      showDatePicker
                        ? "bg-blue-100 dark:bg-blue-900/30"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color={showDatePicker ? "#3b82f6" : "#6b7280"}
                    />
                  </View>
                  <View>
                    <Text className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">
                      Due Date
                    </Text>
                    <Text className="text-gray-900 dark:text-white text-base font-medium">
                      {dueDate.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name={showDatePicker ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={showDatePicker ? "#3b82f6" : "#9ca3af"}
                />
              </Pressable>
              {showDatePicker && (
                <View
                  className="mt-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <DateTimePicker
                    value={dueDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "inline" : "default"}
                    onChange={onDateChange}
                    accentColor="#3b82f6"
                  />
                  {Platform.OS === "ios" && (
                    <View className="border-t border-gray-100 dark:border-gray-700 px-4 py-3 items-end">
                      <Pressable
                        onPress={() => setShowDatePicker(false)}
                        className="bg-blue-500 rounded-xl px-5 py-2.5"
                      >
                        <Text className="text-white text-sm font-semibold">
                          Done
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Frequency */}
            <View className="mb-5">
              <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
                Frequency
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {RECURRENCE_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => setRecurrence(opt.value)}
                    className={`px-4 py-2.5 rounded-xl ${
                      recurrence === opt.value
                        ? "bg-gray-900 dark:bg-white"
                        : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        recurrence === opt.value
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
                value={reminderDaysBefore}
                onChangeText={setReminderDaysBefore}
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
