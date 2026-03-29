import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  FlatList,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface SelectionOption {
  label: string;
  value: string;
}

interface SelectionModalProps {
  visible: boolean;
  title: string;
  options: SelectionOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export default function SelectionModal({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: SelectionModalProps) {
  const handleSelect = (value: string) => {
    onSelect(value);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.45)",
          justifyContent: "flex-end",
        }}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={{ flex: 1 }} />
        </TouchableWithoutFeedback>

        <View className="bg-white dark:bg-gray-900 rounded-t-[32px] pb-10">
          {/* Handle */}
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <Text className="text-gray-900 dark:text-white text-lg font-bold">
              {title}
            </Text>
            <Pressable
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center active:bg-gray-200 dark:active:bg-gray-700"
            >
              <Ionicons name="close" size={18} color="#6b7280" />
            </Pressable>
          </View>

          {/* Options */}
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            scrollEnabled={options.length > 7}
            style={{ maxHeight: 360 }}
            renderItem={({ item }) => {
              const isSelected = item.value === selectedValue;
              return (
                <Pressable
                  onPress={() => handleSelect(item.value)}
                  className="flex-row items-center justify-between px-6 py-4 active:bg-gray-50 dark:active:bg-gray-800"
                >
                  <Text
                    className={`text-base font-medium ${
                      isSelected
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {item.label}
                  </Text>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color="#22c55e"
                    />
                  )}
                </Pressable>
              );
            }}
            ItemSeparatorComponent={() => (
              <View className="h-px bg-gray-100 dark:bg-gray-800 ml-6" />
            )}
          />
        </View>
      </View>
    </Modal>
  );
}
