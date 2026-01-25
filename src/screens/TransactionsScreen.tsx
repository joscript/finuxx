import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  Dimensions,
  RefreshControl,
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
  withTiming,
  withSpring,
  withRepeat,
  withDelay,
  interpolate,
  Easing,
  FadeInDown,
  FadeIn,
  SlideInRight,
  Layout,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ============ TYPES ============
interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  categoryIcon: keyof typeof Ionicons.glyphMap;
  categoryColor: string;
  merchant: string;
  note?: string;
  amount: number;
  date: string;
  isRecurring?: boolean;
  hasReceipt?: boolean;
}

interface TransactionGroup {
  date: string;
  dateLabel: string;
  data: Transaction[];
}

interface FilterOptions {
  type: 'all' | 'income' | 'expense';
  categories: string[];
  showRecurringOnly: boolean;
  minAmount: string;
  maxAmount: string;
}

const DEFAULT_FILTERS: FilterOptions = {
  type: 'all',
  categories: [],
  showRecurringOnly: false,
  minAmount: '',
  maxAmount: '',
};

// ============ MOCK DATA ============
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'expense',
    category: 'Food & Dining',
    categoryIcon: 'restaurant-outline',
    categoryColor: '#f97316',
    merchant: 'Jollibee',
    note: 'Lunch with friends',
    amount: 450,
    date: '2026-01-25',
    hasReceipt: true,
  },
  {
    id: '2',
    type: 'expense',
    category: 'Transportation',
    categoryIcon: 'car-outline',
    categoryColor: '#3b82f6',
    merchant: 'Grab',
    amount: 185,
    date: '2026-01-25',
    isRecurring: false,
  },
  {
    id: '3',
    type: 'income',
    category: 'Salary',
    categoryIcon: 'briefcase-outline',
    categoryColor: '#22c55e',
    merchant: 'Company Inc.',
    note: 'Monthly salary',
    amount: 35000,
    date: '2026-01-24',
    isRecurring: true,
  },
  {
    id: '4',
    type: 'expense',
    category: 'Shopping',
    categoryIcon: 'bag-outline',
    categoryColor: '#ec4899',
    merchant: 'SM Mall',
    note: 'New shoes',
    amount: 2500,
    date: '2026-01-24',
    hasReceipt: true,
  },
  {
    id: '5',
    type: 'expense',
    category: 'Bills & Utilities',
    categoryIcon: 'flash-outline',
    categoryColor: '#f59e0b',
    merchant: 'Meralco',
    note: 'Electric bill',
    amount: 2450,
    date: '2026-01-23',
    isRecurring: true,
    hasReceipt: true,
  },
  {
    id: '6',
    type: 'expense',
    category: 'Entertainment',
    categoryIcon: 'game-controller-outline',
    categoryColor: '#8b5cf6',
    merchant: 'Netflix',
    amount: 549,
    date: '2026-01-23',
    isRecurring: true,
  },
  {
    id: '7',
    type: 'income',
    category: 'Freelance',
    categoryIcon: 'laptop-outline',
    categoryColor: '#06b6d4',
    merchant: 'Client Project',
    note: 'Website development',
    amount: 15000,
    date: '2026-01-22',
  },
  {
    id: '8',
    type: 'expense',
    category: 'Health',
    categoryIcon: 'medical-outline',
    categoryColor: '#ef4444',
    merchant: 'Mercury Drug',
    amount: 850,
    date: '2026-01-22',
    hasReceipt: true,
  },
  {
    id: '9',
    type: 'expense',
    category: 'Groceries',
    categoryIcon: 'cart-outline',
    categoryColor: '#10b981',
    merchant: 'Puregold',
    note: 'Weekly groceries',
    amount: 3200,
    date: '2026-01-21',
    hasReceipt: true,
  },
  {
    id: '10',
    type: 'expense',
    category: 'Food & Dining',
    categoryIcon: 'cafe-outline',
    categoryColor: '#f97316',
    merchant: 'Starbucks',
    amount: 280,
    date: '2026-01-21',
  },
  {
    id: '11',
    type: 'income',
    category: 'Investment',
    categoryIcon: 'trending-up-outline',
    categoryColor: '#22c55e',
    merchant: 'Stock Dividends',
    amount: 2500,
    date: '2026-01-20',
  },
  {
    id: '12',
    type: 'expense',
    category: 'Transportation',
    categoryIcon: 'bus-outline',
    categoryColor: '#3b82f6',
    merchant: 'Gas Station',
    note: 'Full tank',
    amount: 3500,
    date: '2026-01-20',
    hasReceipt: true,
  },
];

// ============ HELPER FUNCTIONS ============
function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString()}`;
}

function formatDateLabel(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function groupTransactionsByDate(transactions: Transaction[]): TransactionGroup[] {
  const groups: { [key: string]: Transaction[] } = {};

  transactions.forEach((transaction) => {
    if (!groups[transaction.date]) {
      groups[transaction.date] = [];
    }
    groups[transaction.date].push(transaction);
  });

  return Object.keys(groups)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .map((date) => ({
      date,
      dateLabel: formatDateLabel(date),
      data: groups[date],
    }));
}

// ============ SKELETON TRANSACTION ROW ============
interface SkeletonTransactionRowProps {
  delay?: number;
}

function SkeletonTransactionRow({ delay = 0 }: SkeletonTransactionRowProps) {
  const shimmerPosition = useSharedValue(0);

  useEffect(() => {
    shimmerPosition.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 1500, easing: Easing.linear }),
        -1,
        false
      )
    );
  }, [delay]);

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmerPosition.value, [0, 1], [-100, 100]);
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View className="flex-row items-center py-4 px-4">
      {/* Icon Skeleton */}
      <View className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <Animated.View
          style={shimmerStyle}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        />
      </View>

      {/* Content Skeleton */}
      <View className="flex-1 ml-4">
        <View className="w-32 h-4 rounded-full bg-gray-200 dark:bg-gray-700 mb-2 overflow-hidden">
          <Animated.View
            style={shimmerStyle}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </View>
        <View className="w-20 h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <Animated.View
            style={shimmerStyle}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </View>
      </View>

      {/* Amount Skeleton */}
      <View className="w-20 h-5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <Animated.View
          style={shimmerStyle}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        />
      </View>
    </View>
  );
}

// ============ TRANSACTION ITEM ============
interface TransactionItemProps {
  transaction: Transaction;
  index: number;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function TransactionItem({
  transaction,
  index,
  onPress,
  onEdit,
  onDelete,
}: TransactionItemProps) {
  const scale = useSharedValue(1);
  const isIncome = transaction.type === 'income';

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const iconBgColor = isIncome
    ? 'bg-emerald-100 dark:bg-emerald-500/20'
    : `bg-opacity-20`;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(400).springify()}
      layout={Layout.springify()}
    >
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
        className="flex-row items-center py-4 px-4 active:bg-gray-50 dark:active:bg-gray-700/50"
      >
        {/* Category Icon */}
        <View
          className="w-12 h-12 rounded-2xl items-center justify-center"
          style={{ backgroundColor: `${transaction.categoryColor}20` }}
        >
          <Ionicons
            name={transaction.categoryIcon}
            size={22}
            color={transaction.categoryColor}
          />
        </View>

        {/* Content */}
        <View className="flex-1 ml-4">
          <View className="flex-row items-center">
            <Text
              className="text-gray-900 dark:text-white text-base font-semibold"
              numberOfLines={1}
            >
              {transaction.merchant}
            </Text>
            {transaction.isRecurring && (
              <View className="ml-2 bg-blue-100 dark:bg-blue-500/20 px-2 py-0.5 rounded-full">
                <Text className="text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                  RECURRING
                </Text>
              </View>
            )}
            {transaction.hasReceipt && (
              <Ionicons
                name="document-text-outline"
                size={14}
                color="#9ca3af"
                style={{ marginLeft: 6 }}
              />
            )}
          </View>
          <View className="flex-row items-center mt-1">
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              {transaction.category}
            </Text>
            {transaction.note && (
              <Text
                className="text-gray-400 dark:text-gray-500 text-sm ml-2"
                numberOfLines={1}
              >
                • {transaction.note}
              </Text>
            )}
          </View>
        </View>

        {/* Amount */}
        <Text
          className={`text-base font-bold ${
            isIncome
              ? 'text-emerald-500 dark:text-emerald-400'
              : 'text-gray-900 dark:text-white'
          }`}
        >
          {isIncome ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </Text>
      </AnimatedPressable>
    </Animated.View>
  );
}

// ============ SUMMARY CARD ============
interface SummaryCardProps {
  totalIncome: number;
  totalExpense: number;
}

function SummaryCard({ totalIncome, totalExpense }: SummaryCardProps) {
  const netAmount = totalIncome - totalExpense;
  const isPositive = netAmount >= 0;
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4,
        },
      ]}
      className="bg-gray-900 rounded-[24px] mx-5 p-5 mb-4"
    >
      <View className="flex-row items-center justify-between">
        {/* Income */}
        <View className="flex-1 items-center">
          <View className="flex-row items-center mb-2">
            <View className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 items-center justify-center mr-2">
              <Ionicons name="arrow-down" size={14} color="#22c55e" />
            </View>
            <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              Income
            </Text>
          </View>
          <Text className="text-emerald-500 dark:text-emerald-400 text-lg font-bold">
            +{formatCurrency(totalIncome)}
          </Text>
        </View>

        {/* Divider */}
        <View className="w-px h-12 bg-gray-200 dark:bg-gray-700" />

        {/* Expense */}
        <View className="flex-1 items-center">
          <View className="flex-row items-center mb-2">
            <View className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-500/20 items-center justify-center mr-2">
              <Ionicons name="arrow-up" size={14} color="#ef4444" />
            </View>
            <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              Expense
            </Text>
          </View>
          <Text className="text-red-500 dark:text-red-400 text-lg font-bold">
            -{formatCurrency(totalExpense)}
          </Text>
        </View>

        {/* Divider */}
        <View className="w-px h-12 bg-gray-200 dark:bg-gray-700" />

        {/* Net */}
        <View className="flex-1 items-center">
          <View className="flex-row items-center mb-2">
            <View
              className={`w-6 h-6 rounded-full items-center justify-center mr-2 ${
                isPositive
                  ? 'bg-emerald-100 dark:bg-emerald-500/20'
                  : 'bg-red-100 dark:bg-red-500/20'
              }`}
            >
              <Ionicons
                name={isPositive ? 'trending-up' : 'trending-down'}
                size={14}
                color={isPositive ? '#22c55e' : '#ef4444'}
              />
            </View>
            <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              Net
            </Text>
          </View>
          <Text
            className={`text-lg font-bold ${
              isPositive
                ? 'text-emerald-500 dark:text-emerald-400'
                : 'text-red-500 dark:text-red-400'
            }`}
          >
            {isPositive ? '+' : ''}
            {formatCurrency(netAmount)}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ============ FLOATING ADD BUTTON ============
interface FloatingAddButtonProps {
  onPress: () => void;
}

function FloatingAddButton({ onPress }: FloatingAddButtonProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
    rotation.value = withSpring(90);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    rotation.value = withSpring(0);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        animatedStyle,
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          elevation: 8,
        },
      ]}
      className="absolute bottom-6 right-6 w-14 h-14 bg-gray-900 dark:bg-white rounded-full items-center justify-center"
    >
      <Ionicons name="add" size={28} color="#fff" className="dark:hidden" />
      <Ionicons name="add" size={28} color="#1f2937" className="hidden dark:flex" />
    </AnimatedPressable>
  );
}

// ============ MONTH SELECTOR ============
interface MonthSelectorProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number, year: number) => void;
}

function MonthSelector({
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

// ============ CATEGORY OPTIONS ============
const CATEGORY_OPTIONS = [
  { id: 'food', name: 'Food & Dining', icon: 'restaurant-outline' as const, color: '#f97316' },
  { id: 'transport', name: 'Transportation', icon: 'car-outline' as const, color: '#3b82f6' },
  { id: 'shopping', name: 'Shopping', icon: 'bag-outline' as const, color: '#ec4899' },
  { id: 'bills', name: 'Bills & Utilities', icon: 'flash-outline' as const, color: '#f59e0b' },
  { id: 'entertainment', name: 'Entertainment', icon: 'game-controller-outline' as const, color: '#8b5cf6' },
  { id: 'health', name: 'Health', icon: 'medical-outline' as const, color: '#ef4444' },
  { id: 'groceries', name: 'Groceries', icon: 'cart-outline' as const, color: '#10b981' },
  { id: 'salary', name: 'Salary', icon: 'briefcase-outline' as const, color: '#22c55e' },
  { id: 'freelance', name: 'Freelance', icon: 'laptop-outline' as const, color: '#06b6d4' },
  { id: 'investment', name: 'Investment', icon: 'trending-up-outline' as const, color: '#22c55e' },
  { id: 'other', name: 'Other', icon: 'ellipsis-horizontal-outline' as const, color: '#6b7280' },
];

// ============ ADD TRANSACTION MODAL ============
interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (transaction: Transaction) => void;
}

function AddTransactionModal({ visible, onClose, onAdd }: AddTransactionModalProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const scale = useSharedValue(1);

  const resetForm = () => {
    setType('expense');
    setCategory(CATEGORY_OPTIONS[0]);
    setMerchant('');
    setAmount('');
    setNote('');
    setIsRecurring(false);
    setShowCategoryPicker(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!merchant.trim() || !amount.trim()) {
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type,
      category: category.name,
      categoryIcon: category.icon,
      categoryColor: category.color,
      merchant: merchant.trim(),
      note: note.trim() || undefined,
      amount: parseFloat(amount.replace(/,/g, '')),
      date: new Date().toISOString().split('T')[0],
      isRecurring,
      hasReceipt: false,
    };

    onAdd(newTransaction);
    handleClose();
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const filteredCategories = CATEGORY_OPTIONS.filter((cat) => {
    if (type === 'income') {
      return ['salary', 'freelance', 'investment', 'other'].includes(cat.id);
    }
    return !['salary', 'freelance', 'investment'].includes(cat.id);
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-gray-50 dark:bg-gray-900"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <Pressable onPress={handleClose} className="p-2 -ml-2">
            <Ionicons name="close" size={24} color="#6b7280" />
          </Pressable>
          <Text className="text-gray-900 dark:text-white text-lg font-bold">
            Add Transaction
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-5">
            {/* Type Toggle */}
            <View className="mb-6">
              <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-3">
                Type
              </Text>
              <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-2xl p-1">
                <Pressable
                  onPress={() => {
                    setType('expense');
                    setCategory(CATEGORY_OPTIONS[0]);
                  }}
                  className={`flex-1 py-3 rounded-xl items-center ${
                    type === 'expense' ? 'bg-white dark:bg-gray-700' : ''
                  }`}
                  style={
                    type === 'expense'
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
                  <View className="flex-row items-center">
                    <Ionicons
                      name="arrow-up"
                      size={18}
                      color={type === 'expense' ? '#ef4444' : '#9ca3af'}
                    />
                    <Text
                      className={`ml-2 font-semibold ${
                        type === 'expense'
                          ? 'text-red-500'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      Expense
                    </Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setType('income');
                    setCategory(CATEGORY_OPTIONS.find((c) => c.id === 'salary') || CATEGORY_OPTIONS[0]);
                  }}
                  className={`flex-1 py-3 rounded-xl items-center ${
                    type === 'income' ? 'bg-white dark:bg-gray-700' : ''
                  }`}
                  style={
                    type === 'income'
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
                  <View className="flex-row items-center">
                    <Ionicons
                      name="arrow-down"
                      size={18}
                      color={type === 'income' ? '#22c55e' : '#9ca3af'}
                    />
                    <Text
                      className={`ml-2 font-semibold ${
                        type === 'income'
                          ? 'text-emerald-500'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      Income
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>

            {/* Amount */}
            <View className="mb-6">
              <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-3">
                Amount
              </Text>
              <View
                className="bg-white dark:bg-gray-800 rounded-2xl px-5 py-4 flex-row items-center"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <Text className="text-gray-400 text-2xl font-medium mr-2">₱</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                  className="flex-1 text-gray-900 dark:text-white text-2xl font-bold"
                />
              </View>
            </View>

            {/* Category */}
            <View className="mb-6">
              <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-3">
                Category
              </Text>
              <Pressable
                onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                className="bg-white dark:bg-gray-800 rounded-2xl px-5 py-4 flex-row items-center justify-between"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <Ionicons name={category.icon} size={20} color={category.color} />
                  </View>
                  <Text className="text-gray-900 dark:text-white text-base font-semibold">
                    {category.name}
                  </Text>
                </View>
                <Ionicons
                  name={showCategoryPicker ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#9ca3af"
                />
              </Pressable>

              {/* Category Picker */}
              {showCategoryPicker && (
                <View
                  className="bg-white dark:bg-gray-800 rounded-2xl mt-2 overflow-hidden"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  {filteredCategories.map((cat, index) => (
                    <Pressable
                      key={cat.id}
                      onPress={() => {
                        setCategory(cat);
                        setShowCategoryPicker(false);
                      }}
                      className={`flex-row items-center px-5 py-3 ${
                        index > 0 ? 'border-t border-gray-100 dark:border-gray-700' : ''
                      } ${category.id === cat.id ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
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
                      {category.id === cat.id && (
                        <Ionicons name="checkmark" size={20} color="#22c55e" />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Merchant / Source */}
            <View className="mb-6">
              <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-3">
                {type === 'income' ? 'Source' : 'Merchant'}
              </Text>
              <View
                className="bg-white dark:bg-gray-800 rounded-2xl px-5 py-4"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <TextInput
                  value={merchant}
                  onChangeText={setMerchant}
                  placeholder={type === 'income' ? 'e.g., Company Inc.' : 'e.g., Jollibee'}
                  placeholderTextColor="#9ca3af"
                  className="text-gray-900 dark:text-white text-base"
                />
              </View>
            </View>

            {/* Note */}
            <View className="mb-6">
              <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-3">
                Note (optional)
              </Text>
              <View
                className="bg-white dark:bg-gray-800 rounded-2xl px-5 py-4"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="Add a note..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={2}
                  className="text-gray-900 dark:text-white text-base"
                  style={{ minHeight: 60, textAlignVertical: 'top' }}
                />
              </View>
            </View>

            {/* Recurring Toggle */}
            <Pressable
              onPress={() => setIsRecurring(!isRecurring)}
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
                    Recurring
                  </Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-sm">
                    This transaction repeats
                  </Text>
                </View>
              </View>
              <View
                className={`w-12 h-7 rounded-full p-0.5 ${
                  isRecurring ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <View
                  className={`w-6 h-6 rounded-full bg-white ${
                    isRecurring ? 'ml-auto' : ''
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

            {/* Submit Button */}
            <AnimatedPressable
              onPress={handleSubmit}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={!merchant.trim() || !amount.trim()}
              style={[
                animatedButtonStyle,
                {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                },
              ]}
              className={`py-4 rounded-2xl items-center ${
                merchant.trim() && amount.trim()
                  ? 'bg-gray-900 dark:bg-white'
                  : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <Text
                className={`text-lg font-bold ${
                  merchant.trim() && amount.trim()
                    ? 'text-white dark:text-gray-900'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Add Transaction
              </Text>
            </AnimatedPressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ============ FILTER MODAL ============
interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onApply: (filters: FilterOptions) => void;
  onReset: () => void;
}

function FilterModal({ visible, onClose, filters, onApply, onReset }: FilterModalProps) {
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

// ============ SKELETON LOADING STATE ============
function SkeletonLoading() {
  return (
    <View className="flex-1">
      {/* Summary Card Skeleton */}
      <View
        className="bg-gray-100 dark:bg-gray-800 rounded-[24px] mx-5 h-24 mb-4"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 4,
        }}
      />

      {/* Date Header Skeleton */}
      <View className="px-5 mb-3">
        <View className="w-24 h-4 rounded-full bg-gray-200 dark:bg-gray-700" />
      </View>

      {/* Transactions Card Skeleton */}
      <View
        className="bg-white dark:bg-gray-800 rounded-[24px] mx-5 overflow-hidden"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <SkeletonTransactionRow delay={0} />
        <View className="h-px bg-gray-100 dark:bg-gray-700 mx-4" />
        <SkeletonTransactionRow delay={100} />
        <View className="h-px bg-gray-100 dark:bg-gray-700 mx-4" />
        <SkeletonTransactionRow delay={200} />
      </View>

      {/* Date Header Skeleton */}
      <View className="px-5 mb-3 mt-6">
        <View className="w-32 h-4 rounded-full bg-gray-200 dark:bg-gray-700" />
      </View>

      {/* Transactions Card Skeleton */}
      <View
        className="bg-white dark:bg-gray-800 rounded-[24px] mx-5 overflow-hidden"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <SkeletonTransactionRow delay={300} />
        <View className="h-px bg-gray-100 dark:bg-gray-700 mx-4" />
        <SkeletonTransactionRow delay={400} />
      </View>
    </View>
  );
}

// ============ MAIN TRANSACTIONS SCREEN ============
export default function TransactionsScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);
  const flatListRef = useRef<FlatList>(null);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setTransactions(MOCK_TRANSACTIONS);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setTransactions(MOCK_TRANSACTIONS);
      setRefreshing(false);
    }, 1000);
  }, []);

  // Handle month change
  const handleMonthChange = useCallback((month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    // Scroll to top on month change
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  // Apply filters to transactions
  const filteredTransactions = transactions.filter((t) => {
    // Type filter
    if (filters.type !== 'all' && t.type !== filters.type) return false;

    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(t.category)) return false;

    // Recurring filter
    if (filters.showRecurringOnly && !t.isRecurring) return false;

    // Amount range filter
    const minAmount = parseFloat(filters.minAmount.replace(/,/g, ''));
    const maxAmount = parseFloat(filters.maxAmount.replace(/,/g, ''));
    if (!isNaN(minAmount) && t.amount < minAmount) return false;
    if (!isNaN(maxAmount) && t.amount > maxAmount) return false;

    return true;
  });

  // Check if filters are active
  const hasActiveFilters =
    filters.type !== 'all' ||
    filters.categories.length > 0 ||
    filters.showRecurringOnly ||
    filters.minAmount !== '' ||
    filters.maxAmount !== '';

  // Calculate totals from filtered transactions
  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Group filtered transactions
  const groupedTransactions = groupTransactionsByDate(filteredTransactions);

  // Handle transaction press
  const handleTransactionPress = (transaction: Transaction) => {
    console.log('Transaction pressed:', transaction.id);
  };

  // Handle add transaction
  const handleAddTransaction = () => {
    setShowAddModal(true);
  };

  // Handle new transaction added
  const handleNewTransaction = useCallback((newTransaction: Transaction) => {
    setTransactions((prev) => [newTransaction, ...prev]);
    // Scroll to top to show new transaction
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  // Handle filter press
  const handleFilterPress = () => {
    setShowFilterModal(true);
  };

  // Render transaction group
  const renderGroup = ({ item, index }: { item: TransactionGroup; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(400).springify()}
      className="mb-6"
    >
      {/* Date Header */}
      <Text className="text-gray-500 dark:text-gray-400 text-sm font-semibold px-5 mb-3 uppercase tracking-wide">
        {item.dateLabel}
      </Text>

      {/* Transactions Card */}
      <View
        className="bg-white dark:bg-gray-800 rounded-[24px] mx-5 overflow-hidden"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        {item.data.map((transaction, idx) => (
          <React.Fragment key={transaction.id}>
            {idx > 0 && (
              <View className="h-px bg-gray-100 dark:bg-gray-700 mx-4" />
            )}
            <TransactionItem
              transaction={transaction}
              index={idx}
              onPress={() => handleTransactionPress(transaction)}
            />
          </React.Fragment>
        ))}
      </View>
    </Animated.View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
        <Ionicons name={hasActiveFilters ? 'filter-outline' : 'receipt-outline'} size={40} color="#9ca3af" />
      </View>
      <Text className="text-gray-900 dark:text-white text-lg font-semibold mb-2">
        {hasActiveFilters ? 'No matching transactions' : 'No transactions yet'}
      </Text>
      <Text className="text-gray-500 dark:text-gray-400 text-sm text-center px-10">
        {hasActiveFilters
          ? 'Try adjusting your filters to see more transactions'
          : 'Start tracking your expenses and income by tapping the + button'}
      </Text>
      {hasActiveFilters && (
        <Pressable
          onPress={() => setFilters(DEFAULT_FILTERS)}
          className="mt-4 px-6 py-3 bg-gray-900 dark:bg-white rounded-full"
        >
          <Text className="text-white dark:text-gray-900 font-semibold">
            Clear Filters
          </Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(400)}
        className="flex-row items-center justify-between px-5 py-4"
      >
        <Text className="text-gray-900 dark:text-white text-2xl font-bold tracking-tight">
          Transactions
        </Text>
        <View className="flex-row items-center">
          <MonthSelector
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={handleMonthChange}
          />
          <Pressable
            onPress={handleFilterPress}
            className={`w-10 h-10 rounded-full items-center justify-center ml-3 active:bg-gray-200 dark:active:bg-gray-700 ${
              hasActiveFilters ? 'bg-gray-900 dark:bg-white' : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            <Ionicons
              name="filter-outline"
              size={20}
              color={hasActiveFilters ? '#fff' : '#6b7280'}
            />
            {hasActiveFilters && (
              <View className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full items-center justify-center">
                <Text className="text-white text-[10px] font-bold">
                  {filters.categories.length > 0 ? filters.categories.length : '!'}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </Animated.View>

      {isLoading ? (
        <SkeletonLoading />
      ) : (
        <>
          {/* Summary Card */}
          <SummaryCard totalIncome={totalIncome} totalExpense={totalExpense} />

          {/* Transactions List */}
          <FlatList
            ref={flatListRef}
            data={groupedTransactions}
            renderItem={renderGroup}
            keyExtractor={(item) => item.date}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#6b7280"
              />
            }
          />

          {/* Floating Add Button */}
          <FloatingAddButton onPress={handleAddTransaction} />

          {/* Add Transaction Modal */}
          <AddTransactionModal
            visible={showAddModal}
            onClose={() => setShowAddModal(false)}
            onAdd={handleNewTransaction}
          />

          {/* Filter Modal */}
          <FilterModal
            visible={showFilterModal}
            onClose={() => setShowFilterModal(false)}
            filters={filters}
            onApply={setFilters}
            onReset={() => setFilters(DEFAULT_FILTERS)}
          />
        </>
      )}
    </SafeAreaView>
  );
}
