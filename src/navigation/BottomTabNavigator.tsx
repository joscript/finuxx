import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import {
  HomeScreen,
  AccountsScreen,
  AddScreen,
  ReportsScreen,
  SettingsScreen,
} from '../screens';

export type RootTabParamList = {
  Home: undefined;
  Accounts: undefined;
  Add: undefined;
  Reports: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const getTabBarIcon = (routeName: string, focused: boolean): IconName => {
  const icons: Record<string, { focused: IconName; unfocused: IconName }> = {
    Home: { focused: 'home', unfocused: 'home-outline' },
    Accounts: { focused: 'wallet', unfocused: 'wallet-outline' },
    Add: { focused: 'add-circle', unfocused: 'add-circle-outline' },
    Reports: { focused: 'bar-chart', unfocused: 'bar-chart-outline' },
    Settings: { focused: 'settings', unfocused: 'settings-outline' },
  };

  return focused ? icons[routeName].focused : icons[routeName].unfocused;
};

export default function BottomTabNavigator() {
  return (
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
      <Tab.Screen name="Accounts" component={AccountsScreen} options={{ headerShown: false }} />
      <Tab.Screen
        name="Add"
        component={AddScreen}
        options={{
          tabBarLabel: 'Add',
        }}
      />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
