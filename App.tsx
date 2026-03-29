import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { useColorScheme } from "nativewind";
import { store } from "./src/store";
import { useAppDispatch, useAppSelector } from "./src/store/hooks";
import { checkAuth } from "./src/store/slices/authSlice";
import { fetchSettings } from "./src/store/slices/settingsSlice";
import { RootNavigator } from "./src/navigation";

import "./global.css";

// Fetches settings after auth and applies the stored theme
function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchSettings());
    }
  }, [isAuthenticated, dispatch]);

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
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaProvider>
          <NavigationContainer>
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
