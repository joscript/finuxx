import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/config";

const PUSH_TOKEN_CACHE_KEY = "@finuxx_expo_push_token";

/**
 * Configure how notifications appear when the app is in the foreground.
 * Call this once inside a useEffect in App.tsx, not at module level.
 */
export function configureNotificationHandler(): void {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch {
    // Native module not yet linked — requires a native rebuild
  }
}

/**
 * Request push notification permission from the user.
 * Returns true if granted, false otherwise.
 */
export async function requestPushPermission(): Promise<boolean> {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("bills", {
        name: "Bill Reminders",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#f59e0b",
        sound: "default",
      });
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    if (existingStatus === "granted") return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch {
    return false;
  }
}

/**
 * Get the Expo push token for this device.
 * Returns null if permissions were denied or on a simulator.
 */
export async function getExpoPushToken(): Promise<string | null> {
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch {
    // Simulators and devices without push capability return an error here
    return null;
  }
}

/**
 * Register this device's push token with the backend.
 * Caches the token in AsyncStorage to avoid redundant API calls.
 */
export async function registerPushToken(): Promise<void> {
  const granted = await requestPushPermission();
  if (!granted) return;

  const token = await getExpoPushToken();
  if (!token) return;

  // Skip if token is unchanged since last registration
  const cachedToken = await AsyncStorage.getItem(PUSH_TOKEN_CACHE_KEY);
  if (cachedToken === token) return;

  try {
    await apiClient.put(ENDPOINTS.AUTH.PUSH_TOKEN, { expoPushToken: token });
    await AsyncStorage.setItem(PUSH_TOKEN_CACHE_KEY, token);
  } catch {
    // Non-fatal: push reminders will still work via in-app notifications
  }
}

/**
 * Clear the cached push token (call on logout so the next login re-registers).
 */
export async function clearCachedPushToken(): Promise<void> {
  await AsyncStorage.removeItem(PUSH_TOKEN_CACHE_KEY);
}
