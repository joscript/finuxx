import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import type { Goal, GoalContribution, Account } from '../types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ============ MOCK ACCOUNTS FOR PICKER ============
const MOCK_ACCOUNTS: Pick<Account, 'id' | 'name' | 'icon' | 'iconColor' | 'balance' | 'currency'>[] = [
  { id: '1', name: 'BDO Savings', icon: 'wallet', iconColor: '#3b82f6', balance: 45250, currency: '₱' },
  { id: '2', name: 'BPI Checking', icon: 'card', iconColor: '#10b981', balance: 12500, currency: '₱' },
  { id: '3', name: 'GCash Wallet', icon: 'phone-portrait', iconColor: '#0066ff', balance: 3500, currency: '₱' },
  { id: '4', name: 'Maya Wallet', icon: 'phone-portrait', iconColor: '#22c55e', balance: 1250, currency: '₱' },
  { id: '5', name: 'Cash', icon: 'cash', iconColor: '#22c55e', balance: 5000, currency: '₱' },
];

// ============ PROPS ============
interface AddContributionModalProps {
  visible: boolean;
  goal: Goal | null;
  onClose: () => void;
  onAddContribution: (contribution: Omit<GoalContribution, 'id'>) => void;
}

export default function AddContributionModal({
  visible,
  goal,
  onClose,
  onAddContribution,
}: AddContributionModalProps) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(MOCK_ACCOUNTS[0]);
  const [showAccountPicker, setShowAccountPicker] = useState(false);

  const scale = useSharedValue(1);

  const resetForm = () => {
    setAmount('');
    setNote('');
    setSelectedAccount(MOCK_ACCOUNTS[0]);
    setShowAccountPicker(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!amount.trim() || !goal) {
      return;
    }

    const contribution: Omit<GoalContribution, 'id'> = {
      goalId: goal.id,
      accountId: selectedAccount.id,
      accountName: selectedAccount.name,
      amount: parseFloat(amount.replace(/,/g, '')) || 0,
      date: new Date(),
      note: note.trim() || undefined,
    };

    onAddContribution(contribution);
    handleClose();
  };

  const remainingAmount = goal ? goal.targetAmount - goal.currentAmount : 0;
  const parsedAmount = parseFloat(amount.replace(/,/g, '')) || 0;
  const isValidAmount = parsedAmount > 0 && parsedAmount <= selectedAccount.balance;
  const isFormValid = amount.trim() && isValidAmount;

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  if (!goal) return null;

  const percentage = (goal.currentAmount / goal.targetAmount) * 100;
  const newPercentage = ((goal.currentAmount + parsedAmount) / goal.targetAmount) * 100;

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
              Add Funds
            </Text>
            <View className="w-10" />
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 20 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Goal Preview Card */}
            <View
              className="bg-gray-50 dark:bg-gray-800 rounded-[24px] p-5 mb-6"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View className="flex-row items-center mb-4">
                <View
                  className={`${goal.iconBgColor} w-14 h-14 rounded-2xl items-center justify-center`}
                >
                  <Text className="text-2xl">{goal.emoji}</Text>
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-gray-900 dark:text-white text-lg font-bold">
                    {goal.name}
                  </Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                    ₱{remainingAmount.toLocaleString()} remaining
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor: goal.color,
                  }}
                />
                {parsedAmount > 0 && (
                  <Animated.View
                    entering={FadeIn.duration(300)}
                    className="absolute h-full rounded-full opacity-50"
                    style={{
                      width: `${Math.min(newPercentage, 100)}%`,
                      backgroundColor: goal.color,
                    }}
                  />
                )}
              </View>

              {/* Progress Stats */}
              <View className="flex-row justify-between mt-3">
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  ₱{goal.currentAmount.toLocaleString()} saved
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  {Math.round(percentage)}% → {parsedAmount > 0 ? `${Math.min(Math.round(newPercentage), 100)}%` : ''}
                </Text>
              </View>
            </View>

            {/* Amount Input */}
            <View className="mb-6">
              <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2 uppercase tracking-wide">
                Contribution Amount
              </Text>
              <View
                className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-5 py-4 flex-row items-center"
                style={{
                  borderWidth: parsedAmount > selectedAccount.balance ? 2 : 0,
                  borderColor: '#ef4444',
                }}
              >
                <Text className="text-gray-500 dark:text-gray-400 text-2xl font-medium mr-2">₱</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                  className="flex-1 text-gray-900 dark:text-white text-2xl font-bold"
                  autoFocus
                />
              </View>
              {parsedAmount > selectedAccount.balance && (
                <Text className="text-red-500 text-sm mt-2">
                  Insufficient balance in selected account
                </Text>
              )}

              {/* Quick Amount Buttons */}
              <View className="flex-row gap-3 mt-4">
                {[1000, 2000, 5000].map((quickAmount) => (
                  <Pressable
                    key={quickAmount}
                    onPress={() => setAmount(quickAmount.toString())}
                    className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl py-3 items-center active:bg-gray-200 dark:active:bg-gray-700"
                  >
                    <Text className="text-gray-700 dark:text-gray-300 font-semibold">
                      +₱{quickAmount.toLocaleString()}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Fill Remaining Button */}
              {remainingAmount > 0 && (
                <Pressable
                  onPress={() => setAmount(Math.min(remainingAmount, selectedAccount.balance).toString())}
                  className="mt-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl py-3 items-center active:bg-emerald-100 dark:active:bg-emerald-500/20"
                >
                  <Text className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    Complete Goal (₱{Math.min(remainingAmount, selectedAccount.balance).toLocaleString()})
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Account Picker */}
            <View className="mb-6">
              <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2 uppercase tracking-wide">
                From Account
              </Text>
              <Pressable
                onPress={() => setShowAccountPicker(!showAccountPicker)}
                className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-5 py-4 flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <View
                    className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: `${selectedAccount.iconColor}20` }}
                  >
                    <Ionicons name={selectedAccount.icon} size={20} color={selectedAccount.iconColor} />
                  </View>
                  <View>
                    <Text className="text-gray-900 dark:text-white text-base font-semibold">
                      {selectedAccount.name}
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                      Balance: ₱{selectedAccount.balance.toLocaleString()}
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name={showAccountPicker ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#9ca3af"
                />
              </Pressable>

              {/* Account Picker Dropdown */}
              {showAccountPicker && (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  className="bg-white dark:bg-gray-800 rounded-2xl mt-2 overflow-hidden border border-gray-100 dark:border-gray-700"
                >
                  {MOCK_ACCOUNTS.map((account, index) => (
                    <Pressable
                      key={account.id}
                      onPress={() => {
                        setSelectedAccount(account);
                        setShowAccountPicker(false);
                      }}
                      className={`flex-row items-center px-5 py-4 ${
                        index > 0 ? 'border-t border-gray-100 dark:border-gray-700' : ''
                      } ${selectedAccount.id === account.id ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
                    >
                      <View
                        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                        style={{ backgroundColor: `${account.iconColor}20` }}
                      >
                        <Ionicons name={account.icon} size={20} color={account.iconColor} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 dark:text-white text-base font-semibold">
                          {account.name}
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-sm">
                          ₱{account.balance.toLocaleString()}
                        </Text>
                      </View>
                      {selectedAccount.id === account.id && (
                        <Ionicons name="checkmark-circle" size={22} color="#22c55e" />
                      )}
                    </Pressable>
                  ))}
                </Animated.View>
              )}
            </View>

            {/* Note Input */}
            <View className="mb-6">
              <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2 uppercase tracking-wide">
                Note (Optional)
              </Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="e.g., Salary bonus contribution"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={2}
                className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-5 py-4 text-gray-900 dark:text-white text-base"
                style={{ textAlignVertical: 'top', minHeight: 80 }}
              />
            </View>

            {/* Summary Card */}
            {parsedAmount > 0 && (
              <Animated.View
                entering={FadeIn.duration(300)}
                className="bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-5 mb-6"
              >
                <View className="flex-row items-center mb-3">
                  <Ionicons name="checkmark-circle" size={22} color="#22c55e" />
                  <Text className="text-emerald-700 dark:text-emerald-400 font-semibold ml-2">
                    Contribution Summary
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-emerald-600 dark:text-emerald-400">Amount</Text>
                  <Text className="text-emerald-700 dark:text-emerald-300 font-bold">
                    ₱{parsedAmount.toLocaleString()}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-emerald-600 dark:text-emerald-400">From</Text>
                  <Text className="text-emerald-700 dark:text-emerald-300 font-bold">
                    {selectedAccount.name}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-emerald-600 dark:text-emerald-400">New Progress</Text>
                  <Text className="text-emerald-700 dark:text-emerald-300 font-bold">
                    {Math.min(Math.round(newPercentage), 100)}%
                  </Text>
                </View>
              </Animated.View>
            )}
          </ScrollView>

          {/* Submit Button */}
          <View className="px-5 pb-5 pt-3 border-t border-gray-100 dark:border-gray-800">
            <AnimatedPressable
              onPress={handleSubmit}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={!isFormValid}
              style={animatedButtonStyle}
              className={`rounded-2xl py-5 items-center justify-center ${
                isFormValid
                  ? 'bg-emerald-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="add-circle"
                  size={22}
                  color={isFormValid ? '#ffffff' : '#9ca3af'}
                />
                <Text
                  className={`text-base font-bold ml-2 ${
                    isFormValid
                      ? 'text-white'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  Add ₱{parsedAmount > 0 ? parsedAmount.toLocaleString() : '0'} to Goal
                </Text>
              </View>
            </AnimatedPressable>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
