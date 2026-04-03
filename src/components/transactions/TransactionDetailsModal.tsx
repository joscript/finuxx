import React from "react";
import { View, Text, Pressable, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Transaction } from "./types";
import { useCurrency } from "../../hooks/useCurrency";

interface TransactionDetailsModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
}

function getTypeLabel(transaction: Transaction): string {
  if (transaction.type === "transfer") {
    return transaction.transferDirection === "in"
      ? "Transfer In"
      : "Transfer Out";
  }

  return transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);
}

function formatDisplayDate(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function TransactionDetailsModal({
  visible,
  transaction,
  onClose,
}: TransactionDetailsModalProps) {
  const fmt = useCurrency();

  if (!transaction) {
    return null;
  }

  const isTransfer = transaction.type === "transfer";
  const isPositiveAmount =
    transaction.type === "income" ||
    (isTransfer && transaction.transferDirection === "in");

  const transferFromAccount =
    transaction.sourceAccountName ||
    (transaction.transferDirection === "in"
      ? transaction.relatedAccountName
      : transaction.accountName);
  const transferToAccount =
    transaction.destinationAccountName ||
    (transaction.transferDirection === "out"
      ? transaction.relatedAccountName
      : transaction.accountName);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <Pressable onPress={onClose} className="p-2 -ml-2">
            <Ionicons name="close" size={24} color="#6b7280" />
          </Pressable>
          <Text className="text-gray-900 dark:text-white text-lg font-bold">
            Transaction Details
          </Text>
          <View className="w-8" />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-5">
            <View
              className="bg-white dark:bg-gray-800 rounded-3xl p-5 mb-5"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.06,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              <View className="flex-row items-center mb-4">
                <View
                  className="w-14 h-14 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: `${transaction.categoryColor}20` }}
                >
                  <Ionicons
                    name={transaction.categoryIcon}
                    size={24}
                    color={transaction.categoryColor}
                  />
                </View>
                <View className="ml-4 flex-1">
                  <Text
                    className="text-gray-900 dark:text-white text-xl font-bold"
                    numberOfLines={2}
                  >
                    {transaction.merchant}
                  </Text>
                  <Text className="text-gray-500 dark:text-gray-400 mt-1">
                    {getTypeLabel(transaction)}
                  </Text>
                </View>
              </View>

              <Text
                className={`text-3xl font-bold ${
                  isTransfer
                    ? "text-sky-600 dark:text-sky-400"
                    : transaction.type === "income"
                      ? "text-emerald-500 dark:text-emerald-400"
                      : "text-gray-900 dark:text-white"
                }`}
              >
                {isPositiveAmount ? "+" : "-"}
                {fmt(transaction.amount)}
              </Text>
            </View>

            <View
              className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
                elevation: 2,
              }}
            >
              <View className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <Text className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-1">
                  Category
                </Text>
                <Text className="text-gray-900 dark:text-white text-base font-semibold">
                  {transaction.category}
                </Text>
              </View>

              <View className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <Text className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-1">
                  Date
                </Text>
                <Text className="text-gray-900 dark:text-white text-base font-semibold">
                  {formatDisplayDate(transaction.date)}
                </Text>
              </View>

              {isTransfer && transferFromAccount && (
                <View className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                  <Text className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-1">
                    From
                  </Text>
                  <Text className="text-gray-900 dark:text-white text-base font-semibold">
                    {transferFromAccount}
                  </Text>
                </View>
              )}

              {isTransfer && transferToAccount && (
                <View
                  className={`px-5 py-4 ${transaction.note ? "border-b border-gray-100 dark:border-gray-700" : ""}`}
                >
                  <Text className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-1">
                    To
                  </Text>
                  <Text className="text-gray-900 dark:text-white text-base font-semibold">
                    {transferToAccount}
                  </Text>
                </View>
              )}

              {transaction.note && (
                <View className="px-5 py-4">
                  <Text className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-1">
                    Notes
                  </Text>
                  <Text className="text-gray-900 dark:text-white text-base leading-6">
                    {transaction.note}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
