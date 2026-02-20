import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MONTHS } from './types';

interface MonthSelectorProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number, year: number) => void;
}

export default function MonthSelector({
  selectedMonth,
  selectedYear,
  onMonthChange,
}: MonthSelectorProps) {
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      onMonthChange(11, selectedYear - 1);
    } else {
      onMonthChange(selectedMonth - 1, selectedYear);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      onMonthChange(0, selectedYear + 1);
    } else {
      onMonthChange(selectedMonth + 1, selectedYear);
    }
  };

  return (
    <View className="flex-row items-center">
      <Pressable
        onPress={handlePrevMonth}
        className="w-8 h-8 items-center justify-center rounded-full active:bg-gray-100 dark:active:bg-gray-700"
      >
        <Ionicons name="chevron-back" size={20} color="#6b7280" />
      </Pressable>
      <Text className="text-gray-900 dark:text-white text-base font-semibold mx-2 min-w-[100px] text-center">
        {MONTHS[selectedMonth]} {selectedYear}
      </Text>
      <Pressable
        onPress={handleNextMonth}
        className="w-8 h-8 items-center justify-center rounded-full active:bg-gray-100 dark:active:bg-gray-700"
      >
        <Ionicons name="chevron-forward" size={20} color="#6b7280" />
      </Pressable>
    </View>
  );
}
