import React from 'react';
import { View, Text } from 'react-native';

interface AccountsSectionHeaderProps {
  title: string;
  count?: number;
}

export function AccountsSectionHeader({ title, count }: AccountsSectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-5 mb-3 mt-6">
      <Text className="text-gray-900 dark:text-white text-xl font-bold tracking-tight">
        {title}
      </Text>
      {count !== undefined && (
        <View className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            {count} accounts
          </Text>
        </View>
      )}
    </View>
  );
}
