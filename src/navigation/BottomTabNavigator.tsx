import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import {
  HomeScreen,
  AccountsScreen,
  AddScreen,
  ReportsScreen,
  TransactionsScreen,
} from '../screens';
import { AddTransactionModal } from '../components';

export type RootTabParamList = {
  Home: undefined;
  Transactions: undefined;
  Add: undefined;
  Accounts: undefined;
  Reports: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const getTabBarIcon = (routeName: string, focused: boolean): IconName => {
  const icons: Record<string, { focused: IconName; unfocused: IconName }> = {
    Home: { focused: 'home', unfocused: 'home-outline' },
    Transactions: { focused: 'receipt', unfocused: 'receipt-outline' },
    Add: { focused: 'add-circle', unfocused: 'add-circle-outline' },
    Accounts: { focused: 'wallet', unfocused: 'wallet-outline' },
    Reports: { focused: 'bar-chart', unfocused: 'bar-chart-outline' },
  };

  return focused ? icons[routeName].focused : icons[routeName].unfocused;
};

export default function BottomTabNavigator() {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            const iconName = getTabBarIcon(route.name, focused);
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'oklch(21% 0.034 264.665)',
          tabBarInactiveTintColor: 'gray',
          headerShown: true,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Tab.Screen name="Transactions" component={TransactionsScreen} options={{ headerShown: false }} />
        <Tab.Screen
          name="Add"
          component={AddScreen}
          options={{
            tabBarLabel: 'Add',
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setShowAddModal(true);
            },
          }}
        />
        <Tab.Screen name="Accounts" component={AccountsScreen} options={{ headerShown: false }} />
        <Tab.Screen name="Reports" component={ReportsScreen} />
      </Tab.Navigator>

      <AddTransactionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(transaction) => {
          console.log('New transaction added:', transaction);
          setShowAddModal(false);
        }}
      />
    </>
  );
}
