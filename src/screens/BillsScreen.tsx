import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  FadeIn,
  FadeInDown,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchBills,
  createBill,
  updateBill,
  deleteBill,
  markBillAsPaid,
  markBillAsUnpaid,
} from "../store/slices/billsSlice";
import { BillItem } from "../components";
import { Bill, CreateBillRequest, UpdateBillRequest } from "../api";
import { AddBillModal } from "../components/bills/AddBillModal";
import { EditBillModal } from "../components/bills/EditBillModal";
import { useCurrencySymbol } from "../hooks/useCurrency";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

// ============ TYPES ============
type FilterTab = "all" | "unpaid" | "paid";

// ============ SKELETON SHIMMER ============
function SkeletonShimmer({
  width = "100%" as any,
  height = 16,
  borderRadius = 8,
  delay = 0,
}: {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  delay?: number;
}) {
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0, { duration: 1000 }),
        ),
        -1,
        false,
      ),
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      shimmerValue.value,
      [0, 1],
      [0.3, 0.7],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <AnimatedView
      style={[animatedStyle, { width: width as number, height, borderRadius }]}
      className="bg-gray-200 dark:bg-gray-700"
    />
  );
}

function SkeletonBillRow({ delay = 0 }: { delay?: number }) {
  return (
    <Animated.View
      entering={FadeIn.delay(delay)}
      className="flex-row items-center py-4"
    >
      <SkeletonShimmer width={56} height={56} borderRadius={16} delay={delay} />
      <View className="flex-1 ml-4">
        <SkeletonShimmer width="60%" height={16} delay={delay + 100} />
        <View className="mt-2">
          <SkeletonShimmer width="40%" height={12} delay={delay + 200} />
        </View>
      </View>
      <SkeletonShimmer width={80} height={20} delay={delay + 300} />
    </Animated.View>
  );
}

// ============ SUMMARY CARD ============
interface SummaryCardProps {
  totalBills: number;
  unpaidCount: number;
  paidCount: number;
  totalDue: number;
  currencySymbol?: string;
}

function SummaryCard({
  totalBills,
  unpaidCount,
  paidCount,
  totalDue,
  currencySymbol = "₱",
}: SummaryCardProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(500)}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
      }}
      className="bg-white dark:bg-gray-800 rounded-[28px] mx-5 p-6 mb-4"
    >
      <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">
        Total Due
      </Text>
      <Text className="text-gray-900 dark:text-white text-3xl font-bold tracking-tight">
        {currencySymbol}
        {totalDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </Text>
      <View className="flex-row mt-4 gap-4">
        <View className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-3 items-center">
          <Text className="text-gray-500 dark:text-gray-400 text-xs">
            Total
          </Text>
          <Text className="text-gray-900 dark:text-white text-lg font-bold">
            {totalBills}
          </Text>
        </View>
        <View className="flex-1 bg-orange-50 dark:bg-orange-500/10 rounded-2xl p-3 items-center">
          <Text className="text-orange-500 text-xs">Unpaid</Text>
          <Text className="text-orange-500 text-lg font-bold">
            {unpaidCount}
          </Text>
        </View>
        <View className="flex-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-3 items-center">
          <Text className="text-emerald-500 text-xs">Paid</Text>
          <Text className="text-emerald-500 text-lg font-bold">
            {paidCount}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ============ FILTER TABS ============
interface FilterTabsProps {
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
}

function FilterTabs({ activeTab, onTabChange }: FilterTabsProps) {
  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unpaid", label: "Unpaid" },
    { key: "paid", label: "Paid" },
  ];

  return (
    <Animated.View
      entering={FadeInDown.delay(100).duration(400)}
      className="flex-row mx-5 mb-4 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1"
    >
      {tabs.map((tab) => (
        <Pressable
          key={tab.key}
          onPress={() => onTabChange(tab.key)}
          className={`flex-1 py-3 rounded-xl items-center ${
            activeTab === tab.key ? "bg-white dark:bg-gray-700" : ""
          }`}
          style={
            activeTab === tab.key
              ? {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }
              : undefined
          }
        >
          <Text
            className={`text-sm font-semibold ${
              activeTab === tab.key
                ? "text-gray-900 dark:text-white"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </Animated.View>
  );
}

// ============ EMPTY STATE ============
function EmptyBills({ filter }: { filter: FilterTab }) {
  const message =
    filter === "paid"
      ? "No paid bills yet"
      : filter === "unpaid"
        ? "All bills are paid!"
        : "No bills added yet";

  return (
    <View className="items-center justify-center py-16">
      <View className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mb-4">
        <Ionicons name="receipt-outline" size={36} color="#9ca3af" />
      </View>
      <Text className="text-gray-500 dark:text-gray-400 text-base font-medium">
        {message}
      </Text>
      <Text className="text-gray-400 dark:text-gray-500 text-sm mt-1">
        {filter === "all" ? "Tap + to add your first bill" : ""}
      </Text>
    </View>
  );
}

// ============ MAIN SCREEN ============
export default function BillsScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { bills, isLoading, error } = useAppSelector((state) => state.bills);
  const currencySymbol = useCurrencySymbol();

  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchBills({}));
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchBills({}));
    setRefreshing(false);
  }, [dispatch]);

  const filteredBills = bills.filter((bill) => {
    if (activeFilter === "paid") return bill.isPaid;
    if (activeFilter === "unpaid") return !bill.isPaid;
    return true;
  });

  const summary = {
    totalBills: bills.length,
    paidCount: bills.filter((b) => b.isPaid).length,
    unpaidCount: bills.filter((b) => !b.isPaid).length,
    totalDue: bills
      .filter((b) => !b.isPaid)
      .reduce((sum, b) => sum + parseFloat(b.amount), 0),
  };

  const handleAddBill = (data: CreateBillRequest) => {
    dispatch(createBill(data));
  };

  const handleUpdateBill = (id: string, data: UpdateBillRequest) => {
    dispatch(updateBill({ id, data }));
  };

  const handleDeleteBill = (id: string) => {
    dispatch(deleteBill(id));
  };

  const handleTogglePaid = (bill: Bill) => {
    if (bill.isPaid) {
      dispatch(markBillAsUnpaid(bill.id));
    } else {
      dispatch(markBillAsPaid(bill.id));
    }
  };

  const handleBillPress = (bill: Bill) => {
    setSelectedBill(bill);
    setEditModalVisible(true);
  };

  const fabScale = useSharedValue(1);
  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const renderBillItem = ({ item, index }: { item: Bill; index: number }) => {
    const isOverdue =
      !item.isPaid &&
      new Date(item.dueDate) < new Date(new Date().toDateString());

    return (
      <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
        <View className="flex-row items-center">
          <View className="flex-1">
            <BillItem
              name={item.name}
              date={new Date(item.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              amount={`${currencySymbol}${parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              icon="receipt-outline"
              iconColor={
                item.isPaid ? "#22c55e" : isOverdue ? "#ef4444" : "#3b82f6"
              }
              isPaid={item.isPaid}
              onPress={() => handleBillPress(item)}
            />
            {isOverdue && (
              <View className="absolute top-3 right-12 bg-red-100 dark:bg-red-500/20 rounded-full px-2 py-0.5">
                <Text className="text-red-500 text-[10px] font-bold uppercase tracking-wide">
                  Overdue
                </Text>
              </View>
            )}
          </View>
          <Pressable
            onPress={() => handleTogglePaid(item)}
            className="ml-2 p-2"
            hitSlop={8}
          >
            <Ionicons
              name={item.isPaid ? "checkmark-circle" : "ellipse-outline"}
              size={24}
              color={item.isPaid ? "#22c55e" : "#9ca3af"}
            />
          </Pressable>
        </View>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <>
      <SummaryCard {...summary} currencySymbol={currencySymbol} />
      <FilterTabs activeTab={activeFilter} onTabChange={setActiveFilter} />
    </>
  );

  const renderEmpty = () => <EmptyBills filter={activeFilter} />;

  const renderSkeleton = () => (
    <View className="mx-5">
      <View className="bg-white dark:bg-gray-800 rounded-[28px] p-6 mb-4">
        <SkeletonShimmer width="40%" height={14} />
        <View className="mt-2">
          <SkeletonShimmer width="60%" height={28} delay={100} />
        </View>
        <View className="flex-row mt-4 gap-4">
          <SkeletonShimmer
            width="30%"
            height={60}
            borderRadius={16}
            delay={200}
          />
          <SkeletonShimmer
            width="30%"
            height={60}
            borderRadius={16}
            delay={300}
          />
          <SkeletonShimmer
            width="30%"
            height={60}
            borderRadius={16}
            delay={400}
          />
        </View>
      </View>
      <View className="bg-white dark:bg-gray-800 rounded-[28px] px-6 py-2">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonBillRow key={i} delay={i * 100 + 500} />
        ))}
      </View>
    </View>
  );

  if (isLoading && bills.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4">
          <Pressable onPress={() => navigation.goBack()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>
          <Text className="text-gray-900 dark:text-white text-xl font-bold">
            Bills
          </Text>
          <View className="w-10" />
        </View>
        {renderSkeleton()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(400)}
        className="flex-row items-center justify-between px-5 py-4"
      >
        <Pressable onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <Text className="text-gray-900 dark:text-white text-xl font-bold">
          Bills
        </Text>
        <View className="w-10" />
      </Animated.View>

      <FlatList
        data={filteredBills}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderBillItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ItemSeparatorComponent={() => (
          <View className="mx-5">
            <View className="h-px bg-gray-100 dark:bg-gray-700/50" />
          </View>
        )}
        className="mx-5"
      />

      {/* FAB */}
      <AnimatedPressable
        style={[
          fabAnimatedStyle,
          {
            position: "absolute",
            bottom: 30,
            right: 20,
            shadowColor: "#111827",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          },
        ]}
        className="w-16 h-16 bg-gray-900 dark:bg-white rounded-full items-center justify-center"
        onPress={() => setAddModalVisible(true)}
        onPressIn={() => {
          fabScale.value = withSpring(0.9);
        }}
        onPressOut={() => {
          fabScale.value = withSpring(1);
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </AnimatedPressable>

      {/* Modals */}
      <AddBillModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAddBill={handleAddBill}
      />

      <EditBillModal
        visible={editModalVisible}
        bill={selectedBill}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedBill(null);
        }}
        onUpdateBill={handleUpdateBill}
        onDeleteBill={handleDeleteBill}
      />
    </SafeAreaView>
  );
}
