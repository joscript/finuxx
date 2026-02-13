import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Pressable, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  fetchCurrentBudget, 
  updateBudget, 
  clearBudgetsError 
} from '../store/slices/budgetsSlice';
import {
  BudgetSummaryCard,
  BudgetCategoryItem,
  AddBudgetCard,
  PeriodToggle,
  EditBudgetModal,
  AddBudgetModal,
  BudgetSkeletonLoading,
  UIBudgetCategory,
  transformBudgetCategory,
} from '../components/budget';

// ============ MAIN BUDGET SCREEN ============
export default function BudgetScreen() {
  const navigation = useNavigation();
  const [period, setPeriod] = useState<'monthly' | 'weekly'>('monthly');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<UIBudgetCategory | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Redux
  const dispatch = useAppDispatch();
  const { currentBudget, isLoading, error } = useAppSelector((state) => state.budgets);

  // Fetch budget on mount
  useEffect(() => {
    dispatch(fetchCurrentBudget());
  }, [dispatch]);

  // Show error if any
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: () => dispatch(clearBudgetsError()) }
      ]);
    }
  }, [error, dispatch]);

  // Transform API budget categories to UI format
  const categories: UIBudgetCategory[] = useMemo(() => {
    if (currentBudget?.categories && currentBudget.categories.length > 0) {
      return currentBudget.categories.map((bc, index) => transformBudgetCategory(bc, index));
    }
    return [];
  }, [currentBudget]);

  // Calculate totals from API or categories
  const totalBudget = useMemo(() => {
    if (currentBudget?.totalAmount) {
      return parseFloat(currentBudget.totalAmount);
    }
    return categories.reduce((sum, cat) => sum + cat.budget, 0);
  }, [currentBudget, categories]);

  const totalSpent = useMemo(() => {
    if (currentBudget?.totalSpent !== undefined) {
      return currentBudget.totalSpent;
    }
    return categories.reduce((sum, cat) => sum + cat.spent, 0);
  }, [currentBudget, categories]);

  // Get budget data based on period
  const getBudgetData = useCallback(() => {
    if (period === 'weekly') {
      return {
        totalBudget: Math.round(totalBudget / 4),
        totalSpent: Math.round(totalSpent / 4),
        categories: categories.map((cat) => ({
          ...cat,
          budget: Math.round(cat.budget / 4),
          spent: Math.round(cat.spent / 4),
        })),
      };
    }
    return {
      totalBudget,
      totalSpent,
      categories,
    };
  }, [period, categories, totalBudget, totalSpent]);

  const budgetData = getBudgetData();

  const handlePeriodToggle = (newPeriod: 'monthly' | 'weekly') => {
    setPeriod(newPeriod);
  };

  const handleCategoryPress = (category: UIBudgetCategory) => {
    setSelectedCategory(category);
    setEditModalVisible(true);
  };

  const handleAddCategory = () => {
    setAddModalVisible(true);
  };

  const handleSaveBudget = async (categoryId: string, newBudget: number, apiCategoryId?: number) => {
    if (!currentBudget?.id) {
      // No current budget exists - close modal and show message
      setEditModalVisible(false);
      Alert.alert('Info', 'Please create a budget first before editing categories.');
      return;
    }

    setIsUpdating(true);
    try {
      // Build the updated categories array
      const updatedCategories = currentBudget.categories?.map(cat => ({
        categoryId: cat.categoryId,
        allocatedAmount: cat.categoryId === apiCategoryId 
          ? newBudget 
          : parseFloat(cat.allocatedAmount),
      })) || [];

      // If the category doesn't exist in current budget, add it
      if (apiCategoryId && !updatedCategories.some(c => c.categoryId === apiCategoryId)) {
        updatedCategories.push({
          categoryId: apiCategoryId,
          allocatedAmount: newBudget,
        });
      }

      // Calculate new total
      const newTotalAmount = updatedCategories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);

      await dispatch(updateBudget({
        id: currentBudget.id,
        data: {
          totalAmount: newTotalAmount,
          categories: updatedCategories,
        },
      })).unwrap();

      // Refresh current budget to get updated spending data
      dispatch(fetchCurrentBudget());
      setEditModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update budget');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteBudget = async (categoryId: string, apiCategoryId?: number) => {
    if (!currentBudget?.id) {
      setEditModalVisible(false);
      return;
    }

    setIsUpdating(true);
    try {
      // Build the updated categories array without the deleted category
      const updatedCategories = currentBudget.categories
        ?.filter(cat => cat.categoryId !== apiCategoryId)
        .map(cat => ({
          categoryId: cat.categoryId,
          allocatedAmount: parseFloat(cat.allocatedAmount),
        })) || [];

      // Calculate new total
      const newTotalAmount = updatedCategories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);

      await dispatch(updateBudget({
        id: currentBudget.id,
        data: {
          totalAmount: newTotalAmount,
          categories: updatedCategories,
        },
      })).unwrap();

      // Refresh current budget
      dispatch(fetchCurrentBudget());
      setEditModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to delete category');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddNewBudget = async (newCategory: { 
    name: string; 
    icon: string; 
    color: string; 
    iconBgColor: string; 
    budget: number;
    categoryId?: number;
  }) => {
    if (!currentBudget?.id) {
      // No current budget exists - need to create one first
      setAddModalVisible(false);
      Alert.alert('Info', 'No active budget found. Please create a budget first.');
      return;
    }

    if (!newCategory.categoryId) {
      setAddModalVisible(false);
      Alert.alert('Error', 'Category ID is required');
      return;
    }

    setIsUpdating(true);
    try {
      // Build the updated categories array with the new category
      const existingCategories = currentBudget.categories?.map(cat => ({
        categoryId: cat.categoryId,
        allocatedAmount: parseFloat(cat.allocatedAmount),
      })) || [];

      const updatedCategories = [
        ...existingCategories,
        {
          categoryId: newCategory.categoryId,
          allocatedAmount: newCategory.budget,
        },
      ];

      // Calculate new total
      const newTotalAmount = updatedCategories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);

      await dispatch(updateBudget({
        id: currentBudget.id,
        data: {
          totalAmount: newTotalAmount,
          categories: updatedCategories,
        },
      })).unwrap();

      // Refresh current budget
      dispatch(fetchCurrentBudget());
      setAddModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add category');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSummaryPress = () => {
    // Could navigate to budget details or analytics
    console.log('Summary card pressed');
  };

  const renderCategoryItem = useCallback(
    ({ item, index }: { item: UIBudgetCategory; index: number }) => (
      <BudgetCategoryItem
        key={item.id}
        id={item.id}
        name={item.name}
        icon={item.icon}
        spent={item.spent}
        budget={item.budget}
        color={item.color}
        iconBgColor={item.iconBgColor}
        index={index}
        onPress={() => handleCategoryPress(item)}
      />
    ),
    []
  );

  const ListHeaderComponent = useCallback(
    () => (
      <>
        {/* Header with Back Button */}
        <Animated.View entering={FadeIn.duration(400)} className="px-5 py-6">
          <View className="flex-row items-center mb-2">
            <Pressable
              onPress={() => navigation.goBack()}
              className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mr-3 active:bg-gray-200 dark:active:bg-gray-700"
            >
              <Ionicons name="chevron-back" size={22} color="#374151" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-gray-900 dark:text-white text-3xl font-bold tracking-tight">
                Budgets
              </Text>
            </View>
          </View>
          <Text className="text-gray-500 dark:text-gray-400 text-base ml-[52px]">
            {period === 'monthly' ? 'Stay on track this month' : 'Stay on track this week'}
          </Text>
        </Animated.View>

        {/* Period Toggle */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} className="mb-6">
          <PeriodToggle period={period} onToggle={handlePeriodToggle} />
        </Animated.View>

        {/* Budget Summary Card */}
        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
          <BudgetSummaryCard
            totalBudget={budgetData.totalBudget}
            totalSpent={budgetData.totalSpent}
            period={period}
            onPress={handleSummaryPress}
          />
        </Animated.View>

        {/* Section Header */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(300)}
          className="flex-row items-center justify-between px-5 mt-8 mb-4"
        >
          <Text className="text-gray-900 dark:text-white text-xl font-bold tracking-tight">
            Categories
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            {budgetData.categories.length} active
          </Text>
        </Animated.View>
      </>
    ),
    [period, budgetData.totalBudget, budgetData.totalSpent, budgetData.categories.length, navigation]
  );

  const ListFooterComponent = useCallback(
    () => (
      <Animated.View entering={FadeInUp.duration(400).delay(100 + budgetData.categories.length * 80)}>
        <AddBudgetCard onPress={handleAddCategory} />
        <View className="h-8" />
      </Animated.View>
    ),
    [budgetData.categories.length]
  );

  const EmptyStateComponent = useCallback(
    () => (
      <Animated.View 
        entering={FadeInDown.duration(500).delay(300)} 
        className="px-5 py-12 items-center"
      >
        <View className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full items-center justify-center mb-4">
          <Ionicons name="wallet-outline" size={40} color="#10B981" />
        </View>
        <Text className="text-gray-900 dark:text-white text-xl font-bold text-center mb-2">
          No budgets yet
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-base text-center mb-6 px-8">
          Start tracking your spending by creating your first budget category
        </Text>
        <Pressable
          onPress={handleAddCategory}
          className="bg-emerald-500 px-6 py-3 rounded-xl active:bg-emerald-600"
        >
          <Text className="text-white font-semibold text-base">Add Your First Budget</Text>
        </Pressable>
      </Animated.View>
    ),
    []
  );

  if (isLoading && !currentBudget) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
        <BudgetSkeletonLoading />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
      <FlatList
        data={budgetData.categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={budgetData.categories.length > 0 ? ListFooterComponent : undefined}
        ListEmptyComponent={EmptyStateComponent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      />

      {/* Edit Budget Modal */}
      <EditBudgetModal
        visible={editModalVisible}
        category={selectedCategory}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveBudget}
        onDelete={handleDeleteBudget}
        isLoading={isUpdating}
      />

      {/* Add Budget Modal */}
      <AddBudgetModal
        visible={addModalVisible}
        existingCategories={categories.map((c) => c.name)}
        onClose={() => setAddModalVisible(false)}
        onAdd={handleAddNewBudget}
        isLoading={isUpdating}
      />
    </SafeAreaView>
  );
}
