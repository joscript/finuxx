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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { categoryService, accountService } from "../api/services";
import { Category, Account } from "../api/types";
import { useCurrencySymbol } from "../hooks/useCurrency";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ============ TYPES ============
export interface Transaction {
  accountId: string;
  type: "income" | "expense";
  amount: string;
  transactionDate: string;
  categoryId: string;
  merchant: string;
  description?: string;
  notes?: string;
  isRecurring: boolean;
}

// ============ ADD TRANSACTION MODAL ============
interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd?: (transaction: Transaction) => Promise<void>;
}

export default function AddTransactionModal({
  visible,
  onClose,
  onAdd,
}: AddTransactionModalProps) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const symbol = useCurrencySymbol();
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      setCategoriesLoading(true);
      categoryService
        .getAll()
        .then((res) => {
          if (res.success && res.data?.categories) {
            setCategories(res.data.categories);
          }
        })
        .finally(() => setCategoriesLoading(false));

      setAccountsLoading(true);
      accountService
        .getAll()
        .then((res) => {
          if (res.success && res.data?.accounts) {
            setAccounts(res.data.accounts);
          }
        })
        .finally(() => setAccountsLoading(false));
    }
  }, [visible]);

  const resetForm = () => {
    setType("expense");
    setCategory(null);
    setAccount(null);
    setMerchant("");
    setAmount("");
    setNote("");
    setIsRecurring(false);
    setShowCategoryPicker(false);
    setShowAccountPicker(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!merchant.trim() || !amount.trim() || !category || !account) {
      return;
    }

    const newTransaction: Transaction = {
      accountId: account.id.toString(),
      type,
      amount: amount.replace(/,/g, ""),
      transactionDate: new Date().toISOString().split("T")[0],
      categoryId: category.id,
      merchant: merchant.trim(),
      notes: note.trim() || undefined,
      isRecurring,
    };

    setIsSubmitting(true);
    try {
      await onAdd?.(newTransaction);
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const filteredCategories = categories.filter((cat) =>
    type === "income" ? cat.isIncomeCategory : !cat.isIncomeCategory,
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-gray-50 dark:bg-gray-900"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <Pressable onPress={handleClose} className="p-2 -ml-2">
            <Ionicons name="close" size={24} color="#6b7280" />
          </Pressable>
          <Text className="text-gray-900 dark:text-white text-lg font-bold">
            Add Transaction
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-5">
            {/* Type Toggle */}
            <View className="mb-6">
              <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-3">
                Type
              </Text>
              <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-2xl p-1">
                <Pressable
                  onPress={() => {
                    setType("expense");
                    setCategory(null);
                  }}
                  className={`flex-1 py-3 rounded-xl items-center ${
                    type === "expense" ? "bg-white dark:bg-gray-700" : ""
                  }`}
                  style={
                    type === "expense"
                      ? {
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          elevation: 2,
                        }
                      : {}
                  }
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name="arrow-up"
                      size={18}
                      color={type === "expense" ? "#ef4444" : "#9ca3af"}
                    />
                    <Text
                      className={`ml-2 font-semibold ${
                        type === "expense"
                          ? "text-red-500"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      Expense
                    </Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setType("income");
                    setCategory(null);
                  }}
                  className={`flex-1 py-3 rounded-xl items-center ${
                    type === "income" ? "bg-white dark:bg-gray-700" : ""
                  }`}
                  style={
                    type === "income"
                      ? {
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          elevation: 2,
                        }
                      : {}
                  }
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name="arrow-down"
                      size={18}
                      color={type === "income" ? "#22c55e" : "#9ca3af"}
                    />
                    <Text
                      className={`ml-2 font-semibold ${
                        type === "income"
                          ? "text-emerald-500"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      Income
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>

            {/* Amount */}
            <View className="mb-6">
              <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-3">
                Amount
              </Text>
              <View
                className="bg-white dark:bg-gray-800 rounded-2xl px-5 py-4 flex-row items-center"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <Text className="text-gray-400 text-2xl font-medium mr-2">
                  {symbol}
                </Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                  className="flex-1 text-gray-900 dark:text-white text-2xl font-bold"
                />
              </View>
            </View>

            {/* Category */}
            <View className="mb-6">
              <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-3">
                Category
              </Text>
              <Pressable
                onPress={() => {
                  setShowCategoryPicker(!showCategoryPicker);
                  setShowAccountPicker(false);
                }}
                className="bg-white dark:bg-gray-800 rounded-2xl px-5 py-4 flex-row items-center justify-between"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center">
                  {category ? (
                    <>
                      <View
                        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <Ionicons
                          name={category.icon as keyof typeof Ionicons.glyphMap}
                          size={20}
                          color={category.color}
                        />
                      </View>
                      <Text className="text-gray-900 dark:text-white text-base font-semibold">
                        {category.name}
                      </Text>
                    </>
                  ) : (
                    <Text className="text-gray-400 text-base">
                      {categoriesLoading ? "Loading..." : "Select category"}
                    </Text>
                  )}
                </View>
                <Ionicons
                  name={showCategoryPicker ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#9ca3af"
                />
              </Pressable>

              {/* Category Picker */}
              {showCategoryPicker && (
                <View
                  className="bg-white dark:bg-gray-800 rounded-2xl mt-2 overflow-hidden"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  {filteredCategories.map((cat, index) => (
                    <Pressable
                      key={cat.id}
                      onPress={() => {
                        setCategory(cat);
                        setShowCategoryPicker(false);
                      }}
                      className={`flex-row items-center px-5 py-3 ${
                        index > 0
                          ? "border-t border-gray-100 dark:border-gray-700"
                          : ""
                      } ${category?.id === cat.id ? "bg-gray-50 dark:bg-gray-700" : ""}`}
                    >
                      <View
                        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                        style={{ backgroundColor: `${cat.color}20` }}
                      >
                        <Ionicons
                          name={cat.icon as keyof typeof Ionicons.glyphMap}
                          size={20}
                          color={cat.color}
                        />
                      </View>
                      <Text className="text-gray-900 dark:text-white text-base font-medium flex-1">
                        {cat.name}
                      </Text>
                      {category?.id === cat.id && (
                        <Ionicons name="checkmark" size={20} color="#22c55e" />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Account / Wallet */}
            <View className="mb-6">
              <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-3">
                {type === "income" ? "Add to Account" : "Pay from Account"}
              </Text>
              <Pressable
                onPress={() => {
                  setShowAccountPicker(!showAccountPicker);
                  setShowCategoryPicker(false);
                }}
                className="bg-white dark:bg-gray-800 rounded-2xl px-5 py-4 flex-row items-center justify-between"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center flex-1">
                  {account ? (
                    <>
                      <View
                        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                        style={{
                          backgroundColor: account.iconBgColor ?? "#e5e7eb",
                        }}
                      >
                        <Ionicons
                          name={
                            (account.icon ??
                              "wallet-outline") as keyof typeof Ionicons.glyphMap
                          }
                          size={20}
                          color={account.iconColor ?? "#6b7280"}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 dark:text-white text-base font-semibold">
                          {account.name}
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-sm">
                          Balance: {symbol}
                          {parseFloat(account.balance).toLocaleString()}
                        </Text>
                      </View>
                    </>
                  ) : (
                    <Text className="text-gray-400 text-base">
                      {accountsLoading ? "Loading..." : "Select account"}
                    </Text>
                  )}
                </View>
                <Ionicons
                  name={showAccountPicker ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#9ca3af"
                />
              </Pressable>

              {/* Account Picker */}
              {showAccountPicker && (
                <View
                  className="bg-white dark:bg-gray-800 rounded-2xl mt-2 overflow-hidden"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  {accounts.map((acc, index) => (
                    <Pressable
                      key={acc.id}
                      onPress={() => {
                        setAccount(acc);
                        setShowAccountPicker(false);
                      }}
                      className={`flex-row items-center px-5 py-3 ${
                        index > 0
                          ? "border-t border-gray-100 dark:border-gray-700"
                          : ""
                      } ${account?.id === acc.id ? "bg-gray-50 dark:bg-gray-700" : ""}`}
                    >
                      <View
                        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                        style={{
                          backgroundColor: acc.iconBgColor ?? "#e5e7eb",
                        }}
                      >
                        <Ionicons
                          name={
                            (acc.icon ??
                              "wallet-outline") as keyof typeof Ionicons.glyphMap
                          }
                          size={20}
                          color={acc.iconColor ?? "#6b7280"}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 dark:text-white text-base font-medium">
                          {acc.name}
                        </Text>
                        <Text
                          className={`text-sm ${
                            parseFloat(acc.balance) >= 0
                              ? "text-gray-500 dark:text-gray-400"
                              : "text-red-500"
                          }`}
                        >
                          {symbol}
                          {parseFloat(acc.balance).toLocaleString()}
                        </Text>
                      </View>
                      {account?.id === acc.id && (
                        <Ionicons name="checkmark" size={20} color="#22c55e" />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Merchant / Source */}
            <View className="mb-6">
              <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-3">
                {type === "income" ? "Source" : "Merchant"}
              </Text>
              <View
                className="bg-white dark:bg-gray-800 rounded-2xl px-5 py-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <TextInput
                  value={merchant}
                  onChangeText={setMerchant}
                  placeholder={
                    type === "income" ? "e.g., Company Inc." : "e.g., Jollibee"
                  }
                  placeholderTextColor="#9ca3af"
                  className="text-gray-900 dark:text-white text-base"
                />
              </View>
            </View>

            {/* Note */}
            <View className="mb-6">
              <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-3">
                Note (optional)
              </Text>
              <View
                className="bg-white dark:bg-gray-800 rounded-2xl px-5 py-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="Add a note..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={2}
                  className="text-gray-900 dark:text-white text-base"
                  style={{ minHeight: 60, textAlignVertical: "top" }}
                />
              </View>
            </View>

            {/* Recurring Toggle */}
            <Pressable
              onPress={() => setIsRecurring(!isRecurring)}
              className="bg-white dark:bg-gray-800 rounded-2xl px-5 py-4 flex-row items-center justify-between mb-8"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 items-center justify-center mr-3">
                  <Ionicons name="repeat-outline" size={20} color="#3b82f6" />
                </View>
                <View>
                  <Text className="text-gray-900 dark:text-white text-base font-semibold">
                    Recurring
                  </Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-sm">
                    This transaction repeats
                  </Text>
                </View>
              </View>
              <View
                className={`w-12 h-7 rounded-full p-0.5 ${
                  isRecurring
                    ? "bg-emerald-500"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <View
                  className={`w-6 h-6 rounded-full bg-white ${
                    isRecurring ? "ml-auto" : ""
                  }`}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                    elevation: 2,
                  }}
                />
              </View>
            </Pressable>

            {/* Submit Button */}
            <AnimatedPressable
              onPress={handleSubmit}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={
                !merchant.trim() ||
                !amount.trim() ||
                !category ||
                !account ||
                isSubmitting
              }
              style={[
                animatedButtonStyle,
                {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                },
              ]}
              className={`py-4 rounded-2xl items-center ${
                merchant.trim() &&
                amount.trim() &&
                category &&
                account &&
                !isSubmitting
                  ? "bg-gray-900 dark:bg-white"
                  : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <Text
                className={`text-lg font-bold ${
                  merchant.trim() &&
                  amount.trim() &&
                  category &&
                  account &&
                  !isSubmitting
                    ? "text-white dark:text-gray-900"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {isSubmitting ? "Adding..." : "Add Transaction"}
              </Text>
            </AnimatedPressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
