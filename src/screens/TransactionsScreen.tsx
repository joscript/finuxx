import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { View, Text, Pressable, FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchTransactions,
  createTransaction,
  fetchTransactionSummary,
} from "../store/slices/transactionsSlice";
import { fetchAccounts } from "../store/slices/accountsSlice";
import { CreateTransactionRequest } from "../api";
import {
  TransactionItem,
  SummaryCard,
  FloatingAddButton,
  MonthSelector,
  FilterModal,
  SkeletonLoading,
  DEFAULT_FILTERS,
  groupTransactionsByDate,
} from "../components/transactions";
import type {
  Transaction,
  TransactionGroup,
  FilterOptions,
} from "../components/transactions";
import { AddTransactionModal } from "../components";
import type { Transaction as TransactionFormData } from "../components";

// ============ MAIN TRANSACTIONS SCREEN ============
export default function TransactionsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);
  const flatListRef = useRef<FlatList>(null);

  // Calculate date range for selected month
  const startDate = useMemo(() => {
    const date = new Date(selectedYear, selectedMonth, 1);
    return date.toISOString().split("T")[0];
  }, [selectedMonth, selectedYear]);

  const endDate = useMemo(() => {
    const date = new Date(selectedYear, selectedMonth + 1, 0);
    return date.toISOString().split("T")[0];
  }, [selectedMonth, selectedYear]);

  // Redux
  const dispatch = useAppDispatch();
  const {
    transactions: apiTransactions,
    isLoading,
    pagination,
  } = useAppSelector((state) => state.transactions);

  // Fetch transactions when filters change
  useEffect(() => {
    dispatch(
      fetchTransactions({
        startDate,
        endDate,
        type: filters.type === "all" ? undefined : filters.type,
      }),
    );
  }, [dispatch, startDate, endDate, filters.type]);

  const hasMore = pagination ? pagination.page < pagination.totalPages : false;

  const loadMore = useCallback(async () => {
    if (pagination && pagination.page < pagination.totalPages) {
      await dispatch(
        fetchTransactions({
          startDate,
          endDate,
          type: filters.type === "all" ? undefined : filters.type,
          page: pagination.page + 1,
        }),
      );
    }
  }, [dispatch, pagination, startDate, endDate, filters.type]);

  // Transform API data to local Transaction type
  const transactions: Transaction[] = useMemo(() => {
    if (!apiTransactions) return [];

    console.log(">>> Transforming API transactions:", apiTransactions);

    const transactionsById = new Map(apiTransactions.map((tx) => [tx.id, tx]));
    const processedTransferPairs = new Set<string>();

    const getTransferPairKey = (transactionId: number, relatedId?: number) => {
      if (!relatedId) return `single-${transactionId}`;
      const [firstId, secondId] = [transactionId, relatedId].sort(
        (a, b) => a - b,
      );
      return `pair-${firstId}-${secondId}`;
    };

    return apiTransactions.reduce<Transaction[]>((acc, t) => {
      if (t.type === "transfer") {
        const relatedTransaction = t.relatedTransactionId
          ? transactionsById.get(t.relatedTransactionId)
          : undefined;

        let canonicalTransfer = t;
        if (
          relatedTransaction?.type === "transfer" &&
          relatedTransaction.transferDirection === "out" &&
          t.transferDirection !== "out"
        ) {
          canonicalTransfer = relatedTransaction;
        }

        const pairKey = getTransferPairKey(
          canonicalTransfer.id,
          canonicalTransfer.relatedTransactionId,
        );

        if (processedTransferPairs.has(pairKey)) {
          return acc;
        }

        processedTransferPairs.add(pairKey);

        const transferDirection = canonicalTransfer.transferDirection || "out";
        const relatedAccountName =
          canonicalTransfer.relatedTransaction?.account?.name ||
          relatedTransaction?.account?.name;

        const transferMerchant =
          transferDirection === "in"
            ? relatedAccountName
              ? `Transfer from ${relatedAccountName}`
              : "Account Transfer"
            : relatedAccountName
              ? `Transfer to ${relatedAccountName}`
              : "Account Transfer";

        acc.push({
          id: canonicalTransfer.id.toString(),
          type: "transfer",
          category: "Transfer",
          categoryIcon: "swap-horizontal-outline",
          categoryColor: "#0ea5e9",
          merchant: transferMerchant,
          note: canonicalTransfer.notes,
          amount: parseFloat(canonicalTransfer.amount),
          date: canonicalTransfer.transactionDate,
          accountId: canonicalTransfer.accountId?.toString(),
          transferDirection,
          relatedAccountName,
        });

        return acc;
      }

      acc.push({
        id: t.id.toString(),
        type: t.type,
        category: t.category?.name || "Uncategorized",
        categoryIcon: (t.category?.icon ||
          "ellipsis-horizontal-outline") as keyof typeof Ionicons.glyphMap,
        categoryColor: t.category?.color || "#6b7280",
        merchant: t.merchant || t.description || "Unknown",
        note: t.notes,
        amount: parseFloat(t.amount),
        date: t.transactionDate,
        accountId: t.accountId?.toString(),
      });

      return acc;
    }, []);
  }, [apiTransactions]);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(
      fetchTransactions({
        startDate,
        endDate,
        type: filters.type === "all" ? undefined : filters.type,
      }),
    );
    setRefreshing(false);
  }, [dispatch, startDate, endDate, filters.type]);

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
    if (filters.type !== "all" && t.type !== filters.type) return false;

    // Category filter
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(t.category)
    )
      return false;

    // Recurring filter
    if (filters.showRecurringOnly && !t.isRecurring) return false;

    // Amount range filter
    const minAmount = parseFloat(filters.minAmount.replace(/,/g, ""));
    const maxAmount = parseFloat(filters.maxAmount.replace(/,/g, ""));
    if (!isNaN(minAmount) && t.amount < minAmount) return false;
    if (!isNaN(maxAmount) && t.amount > maxAmount) return false;

    return true;
  });

  // Check if filters are active
  const hasActiveFilters =
    filters.type !== "all" ||
    filters.categories.length > 0 ||
    filters.showRecurringOnly ||
    filters.minAmount !== "" ||
    filters.maxAmount !== "";

  // Calculate totals from filtered transactions
  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // Group filtered transactions
  const groupedTransactions = groupTransactionsByDate(filteredTransactions);
  console.log(">>> Grouped transactions:", JSON.stringify(groupedTransactions));

  // Handle transaction press
  const handleTransactionPress = (transaction: Transaction) => {
    console.log("Transaction pressed:", transaction.id);
  };

  // Handle add transaction
  const handleAddTransaction = () => {
    setShowAddModal(true);
  };

  // Handle new transaction added
  const handleNewTransaction = useCallback(
    async (newTransaction: TransactionFormData) => {
      // Create via API
      const createRequest: CreateTransactionRequest = {
        accountId: newTransaction.accountId,
        destinationAccountId: newTransaction.destinationAccountId,
        categoryId: newTransaction.categoryId,
        type: newTransaction.type,
        amount: parseFloat(newTransaction.amount),
        merchant: newTransaction.merchant,
        description: newTransaction.notes,
        notes: newTransaction.notes,
        transactionDate: newTransaction.transactionDate,
      };

      console.log(">>> Creating transaction with request:", createRequest);

      const result = await dispatch(createTransaction(createRequest));
      console.log(">>> Create transaction result:", result);
      if (createTransaction.fulfilled.match(result)) {
        // Refresh and scroll to top to show new transaction
        await Promise.all([
          dispatch(
            fetchTransactions({
              startDate,
              endDate,
              type: filters.type === "all" ? undefined : filters.type,
            }),
          ),
          dispatch(fetchAccounts()),
          dispatch(fetchTransactionSummary()),
        ]);
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }
    },
    [dispatch, startDate, endDate, filters.type],
  );

  // Handle filter press
  const handleFilterPress = () => {
    setShowFilterModal(true);
  };

  // Render transaction group
  const renderGroup = ({
    item,
    index,
  }: {
    item: TransactionGroup;
    index: number;
  }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100)
        .duration(400)
        .springify()}
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
          shadowColor: "#000",
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
        <Ionicons
          name={hasActiveFilters ? "filter-outline" : "receipt-outline"}
          size={40}
          color="#9ca3af"
        />
      </View>
      <Text className="text-gray-900 dark:text-white text-lg font-semibold mb-2">
        {hasActiveFilters ? "No matching transactions" : "No transactions yet"}
      </Text>
      <Text className="text-gray-500 dark:text-gray-400 text-sm text-center px-10">
        {hasActiveFilters
          ? "Try adjusting your filters to see more transactions"
          : "Start tracking your expenses and income by tapping the + button"}
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
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      edges={["top"]}
    >
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
              hasActiveFilters
                ? "bg-gray-900 dark:bg-white"
                : "bg-gray-100 dark:bg-gray-800"
            }`}
          >
            <Ionicons
              name="filter-outline"
              size={20}
              color={hasActiveFilters ? "#fff" : "#6b7280"}
            />
            {hasActiveFilters && (
              <View className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full items-center justify-center">
                <Text className="text-white text-[10px] font-bold">
                  {filters.categories.length > 0
                    ? filters.categories.length
                    : "!"}
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
