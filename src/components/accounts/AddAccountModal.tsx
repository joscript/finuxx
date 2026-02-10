import React, { useState } from 'react';
import { View, Text, Pressable, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AccountType as ApiAccountType, CreateAccountRequest } from '../../api';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Types
type AccountCategory = 'asset' | 'liability';

// Account type options for the modal
export const ACCOUNT_TYPE_OPTIONS: { type: ApiAccountType; category: AccountCategory; label: string; icon: keyof typeof Ionicons.glyphMap; color: string; bgColor: string }[] = [
  { type: 'savings', category: 'asset', label: 'Savings', icon: 'wallet', color: '#3b82f6', bgColor: 'bg-blue-100 dark:bg-blue-500/20' },
  { type: 'checking', category: 'asset', label: 'Checking', icon: 'card', color: '#10b981', bgColor: 'bg-emerald-100 dark:bg-emerald-500/20' },
  { type: 'wallet', category: 'asset', label: 'E-Wallet', icon: 'phone-portrait', color: '#0066ff', bgColor: 'bg-sky-100 dark:bg-sky-500/20' },
  { type: 'investment', category: 'asset', label: 'Investment', icon: 'trending-up', color: '#8b5cf6', bgColor: 'bg-violet-100 dark:bg-violet-500/20' },
  { type: 'credit', category: 'liability', label: 'Credit Card', icon: 'card', color: '#ef4444', bgColor: 'bg-red-100 dark:bg-red-500/20' },
  { type: 'loan', category: 'liability', label: 'Loan', icon: 'home', color: '#f59e0b', bgColor: 'bg-amber-100 dark:bg-amber-500/20' },
];

interface AddAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onAddAccount: (account: CreateAccountRequest) => void;
}

export function AddAccountModal({ visible, onClose, onAddAccount }: AddAccountModalProps) {
  const [accountName, setAccountName] = useState('');
  const [selectedType, setSelectedType] = useState<typeof ACCOUNT_TYPE_OPTIONS[0] | null>(null);
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState('₱');

  const scale = useSharedValue(1);

  const resetForm = () => {
    setAccountName('');
    setSelectedType(null);
    setBalance('');
    setCurrency('₱');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!accountName.trim() || !selectedType || !balance.trim()) {
      return;
    }

    console.log('>>> selectedType:', selectedType);

    const newAccount: CreateAccountRequest = {
      name: accountName.trim(),
      type: selectedType.type,
      category: selectedType.category,
      balance: parseFloat(balance.replace(/,/g, '')) || 0,
      currency,
      icon: selectedType.icon as string,
      iconColor: selectedType.color,
      iconBgColor: selectedType.bgColor,
    };

    onAddAccount(newAccount);
    resetForm();
    onClose();
  };

  const isFormValid = accountName.trim() && selectedType && balance.trim();

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

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
              Connect Account
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

            {/* Account Type Selection */}
            <View className="mb-6">
              <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-3 uppercase tracking-wide">
                Account Type
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {ACCOUNT_TYPE_OPTIONS.map((option) => {
                  const isSelected = selectedType?.type === option.type;
                  return (
                    <Pressable
                      key={option.type}
                      onPress={() => setSelectedType(option)}
                      className={`flex-row items-center px-4 py-3 rounded-2xl border-2 ${
                        isSelected 
                          ? 'border-gray-900 bg-gray-100 dark:border-white dark:bg-gray-800' 
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <View 
                        className={`w-8 h-8 rounded-full items-center justify-center mr-2 ${option.bgColor}`}
                      >
                        <Ionicons name={option.icon} size={16} color={option.color} />
                      </View>
                      <Text className={`font-semibold ${
                        isSelected 
                          ? 'text-gray-900 dark:text-white' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {option.label}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={18} color="#111827" style={{ marginLeft: 6 }} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Balance Input */}
            <View className="mb-6">
              <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2 uppercase tracking-wide">
                Current Balance
              </Text>
              <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-2xl px-5 py-4">
                <Text className="text-gray-500 dark:text-gray-400 text-xl font-medium mr-2">
                  {currency}
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

            {/* Currency Selector */}
            <View className="mb-8">
              <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-3 uppercase tracking-wide">
                Currency
              </Text>
              <View className="flex-row gap-3">
                {['₱', '$', '€', '¥'].map((curr) => (
                  <Pressable
                    key={curr}
                    onPress={() => setCurrency(curr)}
                    className={`w-14 h-14 rounded-2xl items-center justify-center border-2 ${
                      currency === curr 
                        ? 'border-gray-900 bg-gray-100 dark:border-white dark:bg-gray-800' 
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <Text className={`text-2xl font-bold ${
                      currency === curr 
                        ? 'text-gray-900 dark:text-white' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {curr}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Info Card */}
            <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 mb-6">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={22} color="#111827" />
                <View className="flex-1 ml-3">
                  <Text className="text-gray-900 dark:text-white font-semibold mb-1">
                    Manual Account
                  </Text>
                  <Text className="text-gray-600 dark:text-gray-400 text-sm leading-5">
                    This account will be added manually. You'll need to update the balance yourself to keep it accurate.
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
                  name="add-circle" 
                  size={22} 
                  color={isFormValid ? '#ffffff' : '#9ca3af'} 
                />
                <Text className={`text-base font-bold ml-2 ${
                  isFormValid 
                    ? 'text-white' 
                    : 'text-gray-400 dark:text-gray-500'
                }`}>
                  Add Account
                </Text>
              </View>
            </AnimatedPressable>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
