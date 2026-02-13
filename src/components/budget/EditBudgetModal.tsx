import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UIBudgetCategory } from './types';
import { QUICK_AMOUNT_OPTIONS } from './constants';

interface EditBudgetModalProps {
  visible: boolean;
  category: UIBudgetCategory | null;
  onClose: () => void;
  onSave: (categoryId: string, newBudget: number, apiCategoryId?: string) => void;
  onDelete: (categoryId: string, apiCategoryId?: string) => void;
  isLoading?: boolean;
}

export function EditBudgetModal({ visible, category, onClose, onSave, onDelete, isLoading = false }: EditBudgetModalProps) {
  const [budgetAmount, setBudgetAmount] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (category) {
      setBudgetAmount(category.budget.toString());
    }
    setShowDeleteConfirm(false);
  }, [category, visible]);

  const handleSave = () => {
    const amount = parseFloat(budgetAmount.replace(/,/g, ''));
    if (!isNaN(amount) && amount > 0 && category) {
      onSave(category.id, amount, category.categoryId);
    }
  };

  const handleDelete = () => {
    if (category) {
      onDelete(category.id, category.categoryId);
    }
  };

  const formatInput = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    if (numericValue) {
      const formatted = parseInt(numericValue, 10).toLocaleString();
      setBudgetAmount(formatted);
    } else {
      setBudgetAmount('');
    }
  };

  if (!category) return null;

  const percentage = category.budget > 0 ? (category.spent / category.budget) * 100 : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <Pressable
          onPress={onClose}
          className="flex-1 bg-black/50 justify-end"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-t-[32px] px-6 pt-4 pb-10"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.15,
              shadowRadius: 24,
              elevation: 10,
            }}
          >
            {/* Handle Bar */}
            <View className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full self-center mb-6" />

            {/* Header */}
            <View className="flex-row items-center mb-6">
              <View className={`${category.iconBgColor} w-14 h-14 rounded-2xl items-center justify-center`}>
                <Ionicons name={category.icon as any} size={26} color={category.color} />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-gray-900 dark:text-white text-xl font-bold">
                  {category.name}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  ₱{category.spent.toLocaleString()} spent ({Math.round(percentage)}% used)
                </Text>
              </View>
            </View>

            {/* Budget Input */}
            <View className="mb-6">
              <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">
                Monthly Budget
              </Text>
              <View className="flex-row items-center bg-gray-100 dark:bg-gray-700 rounded-2xl px-5 py-4">
                <Text className="text-gray-900 dark:text-white text-2xl font-bold mr-2">₱</Text>
                <TextInput
                  value={budgetAmount}
                  onChangeText={formatInput}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  className="flex-1 text-gray-900 dark:text-white text-2xl font-bold"
                />
              </View>
            </View>

            {/* Quick Amount Buttons */}
            <View className="flex-row flex-wrap gap-2 mb-6">
              {QUICK_AMOUNT_OPTIONS.map((amount) => (
                <Pressable
                  key={amount}
                  onPress={() => setBudgetAmount(amount.toLocaleString())}
                  className="bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 active:bg-gray-200 dark:active:bg-gray-600"
                >
                  <Text className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                    ₱{amount.toLocaleString()}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Delete Confirmation */}
            {showDeleteConfirm ? (
              <View className="bg-red-50 dark:bg-red-500/10 rounded-2xl p-4 mb-4">
                <Text className="text-red-600 dark:text-red-400 text-sm font-medium text-center mb-3">
                  Are you sure you want to delete this budget?
                </Text>
                <View className="flex-row gap-3">
                  <Pressable
                    onPress={() => setShowDeleteConfirm(false)}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-xl py-3 items-center active:opacity-80"
                  >
                    <Text className="text-gray-700 dark:text-gray-300 text-base font-semibold">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleDelete}
                    className="flex-1 bg-red-500 rounded-xl py-3 items-center active:opacity-80"
                  >
                    <Text className="text-white text-base font-semibold">Delete</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
                className="flex-row items-center justify-center py-3 mb-4"
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
                <Text className="text-red-500 text-sm font-medium ml-2">Delete Budget</Text>
              </Pressable>
            )}

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <Pressable
                onPress={onClose}
                disabled={isLoading}
                className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-2xl py-4 items-center active:opacity-80"
              >
                <Text className="text-gray-700 dark:text-gray-300 text-base font-bold">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                disabled={isLoading}
                className={`flex-1 rounded-2xl py-4 items-center active:opacity-80 ${isLoading ? 'bg-gray-400 dark:bg-gray-600' : 'bg-gray-900 dark:bg-white'}`}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="text-white dark:text-gray-900 text-base font-bold">Save Changes</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
