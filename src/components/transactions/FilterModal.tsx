import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FilterOptions, DEFAULT_FILTERS, CATEGORY_OPTIONS } from './types';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onApply: (filters: FilterOptions) => void;
  onReset: () => void;
}

export default function FilterModal({ visible, onClose, filters, onApply, onReset }: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, visible]);

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters(DEFAULT_FILTERS);
    onReset();
    onClose();
  };

  const toggleCategory = (categoryName: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryName)
        ? prev.categories.filter((c) => c !== categoryName)
        : [...prev.categories, categoryName],
    }));
  };

  const hasActiveFilters =
    localFilters.type !== 'all' ||
    localFilters.categories.length > 0 ||
    localFilters.showRecurringOnly ||
    localFilters.minAmount !== '' ||
    localFilters.maxAmount !== '';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <Pressable onPress={onClose} className="p-2 -ml-2">
            <Ionicons name="close" size={24} color="#6b7280" />
          </Pressable>
          <Text className="text-gray-900 dark:text-white text-lg font-bold">
            Filter Transactions
          </Text>
          <Pressable onPress={handleReset} className="p-2 -mr-2">
            <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              Reset
            </Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-5">
            {/* Transaction Type */}
            <View className="mb-6">
              <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-3">
                Transaction Type
              </Text>
              <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-2xl p-1">
                {(['all', 'expense', 'income'] as const).map((typeOption) => (
                  <Pressable
                    key={typeOption}
                    onPress={() => setLocalFilters((prev) => ({ ...prev, type: typeOption }))}
                    className={`flex-1 py-3 rounded-xl items-center ${
                      localFilters.type === typeOption ? 'bg-white dark:bg-gray-700' : ''
                    }`}
                    style={
                      localFilters.type === typeOption
                        ? {
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 2,
                          }
                        : {}
                    }
                  >
                    <Text
                      className={`font-semibold capitalize ${
                        localFilters.type === typeOption
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {typeOption}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Categories */}
            <View className="mb-6">
              <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-3">
                Categories
              </Text>
              <View
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                {CATEGORY_OPTIONS.map((cat, index) => {
                  const isSelected = localFilters.categories.includes(cat.name);
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => toggleCategory(cat.name)}
                      className={`flex-row items-center px-5 py-3 ${
                        index > 0 ? 'border-t border-gray-100 dark:border-gray-700' : ''
                      }`}
                    >
                      <View
                        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                        style={{ backgroundColor: `${cat.color}20` }}
                      >
                        <Ionicons name={cat.icon} size={20} color={cat.color} />
                      </View>
                      <Text className="text-gray-900 dark:text-white text-base font-medium flex-1">
                        {cat.name}
                      </Text>
                      <View
                        className={`w-6 h-6 rounded-md border-2 items-center justify-center ${
                          isSelected
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Amount Range */}
            <View className="mb-6">
              <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-3">
                Amount Range
              </Text>
              <View className="flex-row gap-3">
                <View
                  className="flex-1 bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 flex-row items-center"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <Text className="text-gray-400 text-base mr-1">₱</Text>
                  <TextInput
                    value={localFilters.minAmount}
                    onChangeText={(text) =>
                      setLocalFilters((prev) => ({ ...prev, minAmount: text }))
                    }
                    placeholder="Min"
                    placeholderTextColor="#9ca3af"
                    keyboardType="decimal-pad"
                    className="flex-1 text-gray-900 dark:text-white text-base"
                  />
                </View>
                <View className="items-center justify-center">
                  <Text className="text-gray-400">—</Text>
                </View>
                <View
                  className="flex-1 bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 flex-row items-center"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <Text className="text-gray-400 text-base mr-1">₱</Text>
                  <TextInput
                    value={localFilters.maxAmount}
                    onChangeText={(text) =>
                      setLocalFilters((prev) => ({ ...prev, maxAmount: text }))
                    }
                    placeholder="Max"
                    placeholderTextColor="#9ca3af"
                    keyboardType="decimal-pad"
                    className="flex-1 text-gray-900 dark:text-white text-base"
                  />
                </View>
              </View>
            </View>

            {/* Recurring Only Toggle */}
            <Pressable
              onPress={() =>
                setLocalFilters((prev) => ({ ...prev, showRecurringOnly: !prev.showRecurringOnly }))
              }
              className="bg-white dark:bg-gray-800 rounded-2xl px-5 py-4 flex-row items-center justify-between mb-8"
              style={{
                shadowColor: '#000',
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
                    Recurring Only
                  </Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-sm">
                    Show only recurring transactions
                  </Text>
                </View>
              </View>
              <View
                className={`w-12 h-7 rounded-full p-0.5 ${
                  localFilters.showRecurringOnly ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <View
                  className={`w-6 h-6 rounded-full bg-white ${
                    localFilters.showRecurringOnly ? 'ml-auto' : ''
                  }`}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                    elevation: 2,
                  }}
                />
              </View>
            </Pressable>

            {/* Apply Button */}
            <Pressable
              onPress={handleApply}
              className="py-4 rounded-2xl items-center bg-gray-900 dark:bg-white"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text className="text-white dark:text-gray-900 text-lg font-bold">
                Apply Filters{hasActiveFilters ? ` (${localFilters.categories.length > 0 ? localFilters.categories.length + ' categories' : ''})` : ''}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
