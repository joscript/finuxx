import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { useAppDispatch } from './src/store/hooks';
import { checkAuth } from './src/store/slices/authSlice';
import { RootNavigator } from './src/navigation';

import './global.css';

// App initialization component that handles auth check on mount
function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return <>{children}</>;
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <AppInitializer>
            <RootNavigator />
          </AppInitializer>
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}
