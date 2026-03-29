import React, { useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import type { NavigationContainerRef } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { useColorScheme } from "nativewind";
import * as Notifications from "expo-notifications";
import { store } from "./src/store";
import { useAppDispatch, useAppSelector } from "./src/store/hooks";
import { checkAuth } from "./src/store/slices/authSlice";
import { fetchSettings } from "./src/store/slices/settingsSlice";
import { fetchNotifications } from "./src/store/slices/notificationsSlice";
import { RootNavigator } from "./src/navigation";
import {
  registerPushToken,
  clearCachedPushToken,
  configureNotificationHandler,
} from "./src/utils/pushNotifications";

import "./global.css";

// Fetches settings after auth, registers push token, and handles notification events
function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    dispatch(checkAuth());
    configureNotificationHandler();
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchSettings());
      // Register push token with backend after authentication
      registerPushToken().catch(() => {});
    } else {
      // Clear cached token on logout so next login re-registers
      clearCachedPushToken().catch(() => {});
    }
  }, [isAuthenticated, dispatch]);

  // Refresh notifications when a push arrives while the app is foregrounded
  useEffect(() => {
    let subscription: Notifications.Subscription | undefined;
    try {
      subscription = Notifications.addNotificationReceivedListener(() => {
        dispatch(fetchNotifications());
      });
    } catch {
      // Native module not linked yet — no-op until rebuilt
    }
    return () => subscription?.remove();
  }, [dispatch]);

  return <>{children}</>;
}

// Applies the stored theme preference whenever settings load
function ThemeApplicator() {
  const { setColorScheme } = useColorScheme();
  const theme = useAppSelector((state) => state.settings.settings?.theme);

  useEffect(() => {
    if (theme) {
      setColorScheme(theme);
    }
  }, [theme, setColorScheme]);

  return null;
}

export default function App() {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  // Navigate to Bills when user taps a bill push notification
  useEffect(() => {
    let subscription: Notifications.Subscription | undefined;
    try {
      subscription = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const data = response.notification.request.content.data as
            | Record<string, any>
            | undefined;
          if (data?.screen === "Bills" && navigationRef.current?.isReady()) {
            navigationRef.current.navigate("Bills" as never);
          }
        },
      );
    } catch {
      // Native module not linked yet — no-op until rebuilt
    }
    return () => subscription?.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaProvider>
          <NavigationContainer ref={navigationRef}>
            <StatusBar style="auto" />
            <AppInitializer>
              <ThemeApplicator />
              <RootNavigator />
            </AppInitializer>
          </NavigationContainer>
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
