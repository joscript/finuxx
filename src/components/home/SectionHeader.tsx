import React from "react";
import { View, Text, Pressable } from "react-native";

export interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function SectionHeader({
  title,
  actionLabel,
  onActionPress,
}: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-5 mb-4">
      <Text className="text-gray-500 dark:text-gray-400 text-xs font-bold tracking-widest uppercase">
        {title}
      </Text>
      {actionLabel && (
        <Pressable onPress={onActionPress} className="active:opacity-60">
          <Text className="text-gray-900 dark:text-white text-sm font-semibold underline">
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
