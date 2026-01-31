import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import { CoachScreen, BudgetScreen, SettingsScreen, GoalsScreen, GoalDetailScreen, NotificationsScreen, OnboardingScreen, LoginScreen, SignupScreen } from '../screens';
import { useAppSelector } from '../store/hooks';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  MainTabs: undefined;
  Coach: undefined;
  Budget: undefined;
  Settings: undefined;
  Goals: undefined;
  GoalDetail: { goalId: string };
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  // In a real app, you would check if the user has completed onboarding
  // const hasCompletedOnboarding = useAppStore(state => state.hasCompletedOnboarding);
  const hasCompletedOnboarding = true; // Set to false to test onboarding flow
  
  // Get authentication state from Redux
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!hasCompletedOnboarding && (
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{
            animation: 'fade',
          }}
        />
      )}
      {!isAuthenticated ? (
        // Auth screens - shown when not authenticated
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="Signup"
            component={SignupScreen}
            options={{
              animation: 'slide_from_right',
            }}
          />
        </>
      ) : (
        // App screens - shown when authenticated
        <>
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          <Stack.Screen
            name="Coach"
            component={CoachScreen}
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="Budget"
            component={BudgetScreen}
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="Goals"
            component={GoalsScreen}
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="GoalDetail"
            component={GoalDetailScreen}
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
