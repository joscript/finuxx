import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AvailableCategory } from './types';
import { AVAILABLE_CATEGORIES, QUICK_AMOUNT_OPTIONS } from './constants';

interface AddBudgetModalProps {
  visible: boolean;
  existingCategories: string[];
  onClose: () => void;
  onAdd: (category: { name: string; icon: string; color: string; iconBgColor: string; budget: number; categoryId?: number }) => void;
  isLoading?: boolean;
}

export function AddBudgetModal({ visible, existingCategories, onClose, onAdd, isLoading = false }: AddBudgetModalProps) {
  const [step, setStep] = useState<'category' | 'amount'>('category');
  const [selectedCategory, setSelectedCategory] = useState<AvailableCategory | null>(null);
  const [budgetAmount, setBudgetAmount] = useState('');

  useEffect(() => {
    if (visible) {
      setStep('category');
      setSelectedCategory(null);
      setBudgetAmount('');
    }
  }, [visible]);

  const availableToAdd = AVAILABLE_CATEGORIES.filter(
    (cat) => !existingCategories.includes(cat.name)
  );

  const handleCategorySelect = (category: AvailableCategory) => {
    setSelectedCategory(category);
    setStep('amount');
  };

  const handleAdd = () => {
    const amount = parseFloat(budgetAmount.replace(/,/g, ''));
    if (!isNaN(amount) && amount > 0 && selectedCategory) {
      onAdd({
        ...selectedCategory,
        budget: amount,
      });
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
            className="bg-white dark:bg-gray-800 rounded-t-[32px] px-6 pt-4 pb-10 max-h-[85%]"
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

            {step === 'category' ? (
              <>
                {/* Category Selection Header */}
                <View className="mb-6">
                  <Text className="text-gray-900 dark:text-white text-xl font-bold">
                    Add New Budget
                  </Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Select a category for your budget
                  </Text>
                </View>

                {/* Category Grid */}
                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  className="max-h-[400px]"
                >
                  <View className="flex-row flex-wrap">
                    {availableToAdd.map((category, index) => (
                      <Pressable
                        key={category.name}
                        onPress={() => handleCategorySelect(category)}
                        className="w-[48%] bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 mb-3 active:opacity-70"
                        style={{ marginRight: index % 2 === 0 ? '4%' : 0 }}
                      >
                        <View className={`${category.iconBgColor} w-12 h-12 rounded-xl items-center justify-center mb-3`}>
                          <Ionicons name={category.icon as any} size={24} color={category.color} />
                        </View>
                        <Text className="text-gray-900 dark:text-white text-sm font-semibold">
                          {category.name}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  {availableToAdd.length === 0 && (
                    <View className="items-center py-10">
                      <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
                      <Text className="text-gray-500 dark:text-gray-400 text-base mt-3 text-center">
                        All categories have budgets!
                      </Text>
                    </View>
                  )}
                </ScrollView>

                {/* Cancel Button */}
                <Pressable
                  onPress={onClose}
                  className="bg-gray-100 dark:bg-gray-700 rounded-2xl py-4 items-center mt-4 active:opacity-80"
                >
                  <Text className="text-gray-700 dark:text-gray-300 text-base font-bold">Cancel</Text>
                </Pressable>
              </>
            ) : (
              <>
                {/* Amount Step Header */}
                <Pressable
                  onPress={() => setStep('category')}
                  className="flex-row items-center mb-6"
                >
                  <Ionicons name="chevron-back" size={24} color="#6b7280" />
                  <Text className="text-gray-500 dark:text-gray-400 text-sm ml-1">Back</Text>
                </Pressable>

                {/* Selected Category */}
                <View className="flex-row items-center mb-6">
                  <View className={`${selectedCategory?.iconBgColor} w-14 h-14 rounded-2xl items-center justify-center`}>
                    <Ionicons name={selectedCategory?.icon as any} size={26} color={selectedCategory?.color} />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-gray-900 dark:text-white text-xl font-bold">
                      {selectedCategory?.name}
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                      Set your monthly budget
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
                      autoFocus
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
                    onPress={handleAdd}
                    disabled={!budgetAmount || isLoading}
                    className={`flex-1 rounded-2xl py-4 items-center active:opacity-80 ${
                      budgetAmount && !isLoading ? 'bg-gray-900 dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text className={`text-base font-bold ${
                        budgetAmount ? 'text-white dark:text-gray-900' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        Add Budget
                      </Text>
                    )}
                  </Pressable>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
