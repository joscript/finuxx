import React, { useCallback, useState } from "react";
import {
  TouchableOpacity,
  View,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import {
  HomeScreen,
  AccountsScreen,
  AddScreen,
  ReportsScreen,
  TransactionsScreen,
} from "../screens";
import { AddTransactionModal } from "../components";
import type { Transaction } from "../components";
import { useAppDispatch } from "../store/hooks";
import { createTransaction } from "../store/slices/transactionsSlice";
import { CreateTransactionRequest } from "../api";

export type RootTabParamList = {
  Home: undefined;
  Accounts: undefined;
  Add: undefined;
  Transactions: undefined;
  Reports: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const getTabBarIcon = (routeName: string, focused: boolean): IconName => {
  const icons: Record<string, { focused: IconName; unfocused: IconName }> = {
    Home: { focused: "home", unfocused: "home-outline" },
    Accounts: { focused: "wallet", unfocused: "wallet-outline" },
    Add: { focused: "add-circle", unfocused: "add-circle-outline" },
    Transactions: { focused: "receipt", unfocused: "receipt-outline" },
    Reports: { focused: "bar-chart", unfocused: "bar-chart-outline" },
  };

  return focused ? icons[routeName].focused : icons[routeName].unfocused;
};

export default function BottomTabNavigator() {
  const [showAddModal, setShowAddModal] = useState(false);
  const dispatch = useAppDispatch();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleAddTransaction = useCallback(
    async (transaction: Transaction) => {
      const createRequest: CreateTransactionRequest = {
        accountId: transaction.accountId,
        categoryId: transaction.categoryId,
        type: transaction.type,
        amount: parseFloat(transaction.amount),
        merchant: transaction.merchant,
        notes: transaction.notes,
        transactionDate: transaction.transactionDate,
      };

      await dispatch(createTransaction(createRequest));
      setShowAddModal(false);
    },
    [dispatch],
  );

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            const iconName = getTabBarIcon(route.name, focused);
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: isDark
            ? "#ffffff"
            : "oklch(21% 0.034 264.665)",
          tabBarInactiveTintColor: isDark ? "#6b7280" : "gray",
          tabBarStyle: {
            backgroundColor: isDark ? "#111827" : "#ffffff",
            borderTopColor: isDark ? "#1f2937" : "#e5e7eb",
          },
          headerShown: true,
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Accounts"
          component={AccountsScreen}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Add"
          component={AddScreen}
          options={{
            tabBarLabel: () => null,
            tabBarIcon: () => (
              <View style={styles.addButtonContainer}>
                <View style={styles.addButton}>
                  <Ionicons name="add" size={32} color="#fff" />
                </View>
              </View>
            ),
            tabBarButton: ({ children }) => (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowAddModal(true)}
                style={styles.addButtonWrapper}
              >
                {children}
              </TouchableOpacity>
            ),
          }}
        />
        <Tab.Screen
          name="Transactions"
          component={TransactionsScreen}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Reports"
          component={ReportsScreen}
          options={{ headerShown: false }}
        />
      </Tab.Navigator>

      <AddTransactionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddTransaction}
      />
    </>
  );
}

const styles = StyleSheet.create({
  addButtonWrapper: {
    top: -18,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#272640",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
});
