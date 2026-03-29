import React, { useState, useEffect, useCallback } from "react";
import { FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchAccounts,
  createAccount,
  updateAccount,
} from "../store/slices/accountsSlice";
import { Account, CreateAccountRequest, UpdateAccountRequest } from "../api";
import { useCurrencySymbol } from "../hooks/useCurrency";
import {
  AccountsHeader,
  AccountsNetWorthCard,
  AccountItem,
  AddAccountCard,
  AccountsSectionHeader,
  AddAccountModal,
  EditAccountModal,
  AccountsSkeletonLoading,
} from "../components/accounts";

// ============ MAIN ACCOUNTS SCREEN ============
export default function AccountsScreen() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Redux
  const dispatch = useAppDispatch();
  const { accounts, totals, isLoading } = useAppSelector(
    (state) => state.accounts,
  );
  const currencySymbol = useCurrencySymbol();

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  // Derive data from Redux state
  const assets = totals?.totalAssets || 0;
  const liabilities = totals?.totalLiabilities || 0;

  const assetAccounts = accounts.filter((a) => a.category === "asset");
  const liabilityAccounts = accounts.filter((a) => a.category === "liability");

  // Handlers
  const handleSync = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    await dispatch(fetchAccounts());
    setIsSyncing(false);
  }, [isSyncing, dispatch]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await dispatch(fetchAccounts());
    setIsRefreshing(false);
  }, [dispatch]);

  const handleNetWorthPress = () => {
    console.log("Net worth pressed");
  };

  const handleAccountPress = (accountId: number) => {
    const account = accounts.find((a) => a.id === accountId);
    if (account) {
      setSelectedAccount(account);
      setShowEditModal(true);
    }
  };

  const handleAddAccount = () => {
    setShowAddModal(true);
  };

  const handleAddNewAccount = async (newAccountData: CreateAccountRequest) => {
    await dispatch(createAccount(newAccountData));
  };

  const handleEditAccount = async (id: number, data: UpdateAccountRequest) => {
    await dispatch(updateAccount({ id, data }));
    // Refresh accounts to get updated totals
    dispatch(fetchAccounts());
  };

  if (isLoading) {
    return (
      <SafeAreaView
        className="flex-1 bg-white dark:bg-gray-900"
        edges={["top"]}
      >
        <AccountsSkeletonLoading />
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <>
      {/* Header */}
      <AccountsHeader isSyncing={isSyncing} onSyncPress={handleSync} />

      {/* Net Worth Card */}
      <Animated.View entering={FadeInDown.duration(500).delay(100)}>
        <AccountsNetWorthCard
          assets={assets}
          liabilities={liabilities}
          currency={currencySymbol}
          trend={5.2}
          onPress={handleNetWorthPress}
        />
      </Animated.View>

      {/* Assets Section */}
      <Animated.View entering={FadeInDown.duration(500).delay(200)}>
        <AccountsSectionHeader title="Assets" count={assetAccounts.length} />
      </Animated.View>
    </>
  );

  const renderFooter = () => (
    <>
      {/* Liabilities Section */}
      <Animated.View entering={FadeInDown.duration(500).delay(300)}>
        <AccountsSectionHeader
          title="Liabilities"
          count={liabilityAccounts.length}
        />
      </Animated.View>
      {liabilityAccounts.map((account, index) => (
        <AccountItem
          key={account.id}
          account={account}
          index={index + assetAccounts.length}
          onPress={() => handleAccountPress(account.id)}
        />
      ))}

      {/* Add Account CTA */}
      <Animated.View
        entering={FadeInDown.duration(500).delay(400)}
        className="mt-6"
      >
        <AddAccountCard onPress={handleAddAccount} />
      </Animated.View>
    </>
  );

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={["top"]}>
      <FlatList
        data={assetAccounts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <AccountItem
            account={item}
            index={index}
            onPress={() => handleAccountPress(item.id)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#111827"
            colors={["#111827"]}
          />
        }
      />

      {/* Add Account Modal */}
      <AddAccountModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddAccount={handleAddNewAccount}
      />

      {/* Edit Account Modal */}
      <EditAccountModal
        visible={showEditModal}
        account={selectedAccount}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAccount(null);
        }}
        onSave={handleEditAccount}
      />
    </SafeAreaView>
  );
}
