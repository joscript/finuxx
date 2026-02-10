import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Account, UpdateAccountRequest } from '../../api';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface EditAccountModalProps {
  visible: boolean;
  account: Account | null;
  onClose: () => void;
  onSave: (id: number, data: UpdateAccountRequest) => void;
}

export function EditAccountModal({ visible, account, onClose, onSave }: EditAccountModalProps) {
  const [accountName, setAccountName] = useState('');
  const [balance, setBalance] = useState('');

  const scale = useSharedValue(1);

  // Initialize form when account changes
  useEffect(() => {
    if (account) {
      setAccountName(account.name);
      setBalance(account.balance?.toString() || '0');
    }
  }, [account]);

  const resetForm = () => {
    setAccountName('');
    setBalance('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!account || !accountName.trim() || !balance.trim()) {
      return;
    }

    const updatedData: UpdateAccountRequest = {
      name: accountName.trim(),
      balance: parseFloat(balance.replace(/,/g, '')) || 0,
    };

    onSave(account.id, updatedData);
    resetForm();
    onClose();
  };

  const isFormValid = accountName.trim() && balance.trim();

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  if (!account) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-white dark:bg-gray-900"
      >
        <SafeAreaView className="flex-1" edges={['top']}>
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <Pressable onPress={handleClose} className="w-10 h-10 items-center justify-center">
              <Ionicons name="close" size={28} color="#6b7280" />
            </Pressable>
            <Text className="text-gray-900 dark:text-white text-lg font-bold">
              Edit Account
            </Text>
            <View className="w-10" />
          </View>

          <ScrollView 
            className="flex-1" 
            contentContainerStyle={{ padding: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Account Name Input */}
            <View className="mb-6">
              <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2 uppercase tracking-wide">
                Account Name
              </Text>
              <TextInput
                value={accountName}
                onChangeText={setAccountName}
                placeholder="e.g., BDO Savings"
                placeholderTextColor="#9ca3af"
                className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-5 py-4 text-gray-900 dark:text-white text-base"
              />
            </View>

            {/* Balance Input */}
            <View className="mb-6">
              <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2 uppercase tracking-wide">
                Current Balance
              </Text>
              <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-2xl px-5 py-4">
                <Text className="text-gray-500 dark:text-gray-400 text-xl font-medium mr-2">
                  {account.currency || '₱'}
                </Text>
                <TextInput
                  value={balance}
                  onChangeText={setBalance}
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                  className="flex-1 text-gray-900 dark:text-white text-2xl font-bold"
                />
              </View>
            </View>

            {/* Account Info (Read-only) */}
            <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 mb-6">
              <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-3 uppercase tracking-wide">
                Account Details
              </Text>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-500 dark:text-gray-400">Type</Text>
                <Text className="text-gray-900 dark:text-white font-medium capitalize">{account.type}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-500 dark:text-gray-400">Category</Text>
                <Text className="text-gray-900 dark:text-white font-medium capitalize">{account.category}</Text>
              </View>
              {account.institution && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-500 dark:text-gray-400">Institution</Text>
                  <Text className="text-gray-900 dark:text-white font-medium">{account.institution}</Text>
                </View>
              )}
            </View>

            {/* Info Card */}
            <View className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 mb-6">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={22} color="#3b82f6" />
                <View className="flex-1 ml-3">
                  <Text className="text-gray-900 dark:text-white font-semibold mb-1">
                    Update Balance
                  </Text>
                  <Text className="text-gray-600 dark:text-gray-400 text-sm leading-5">
                    Update the account name or balance to reflect your current financial state.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View className="px-5 pb-5 pt-3 border-t border-gray-100 dark:border-gray-800">
            <AnimatedPressable
              onPress={handleSubmit}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={!isFormValid}
              style={buttonAnimatedStyle}
              className={`rounded-2xl py-5 items-center justify-center ${
                isFormValid 
                  ? 'bg-gray-900' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <View className="flex-row items-center">
                <Ionicons 
                  name="checkmark-circle" 
                  size={22} 
                  color={isFormValid ? '#ffffff' : '#9ca3af'} 
                />
                <Text className={`text-base font-bold ml-2 ${
                  isFormValid 
                    ? 'text-white' 
                    : 'text-gray-400 dark:text-gray-500'
                }`}>
                  Save Changes
                </Text>
              </View>
            </AnimatedPressable>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
