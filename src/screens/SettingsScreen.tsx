import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Switch,
  Dimensions,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout } from "../store/slices/authSlice";
import { fetchSettings, updateSettings } from "../store/slices/settingsSlice";
import SelectionModal, {
  SelectionOption,
} from "../components/settings/SelectionModal";
import EditProfileModal from "../components/settings/EditProfileModal";
import ChangePasswordModal from "../components/settings/ChangePasswordModal";
import DeleteAccountModal from "../components/settings/DeleteAccountModal";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  FadeInDown,
  FadeIn,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Default avatar for users without profile picture
const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?name=User&background=random";

// Default settings when API data is not available
const DEFAULT_SETTINGS = {
  currency: "PHP",
  language: "en",
  theme: "system",
  startOfWeek: "monday",
  budgetAlerts: true,
  billReminders: true,
  goalUpdates: true,
  emailNotifications: true,
  pushNotifications: true,
  lowBalanceAlerts: true,
  goalReminders: true,
  transactionAlerts: true,
  lowBalanceThreshold: 500,
  biometricLogin: true,
  autoLockTime: "1 minute",
  connectedDevices: 1,
  appVersion: "1.0.0",
};

// ============ SELECTION OPTIONS ============
const CURRENCY_OPTIONS: SelectionOption[] = [
  { label: "Philippine Peso (₱)", value: "PHP" },
  { label: "US Dollar ($)", value: "USD" },
  { label: "Euro (€)", value: "EUR" },
  { label: "British Pound (£)", value: "GBP" },
  { label: "Japanese Yen (¥)", value: "JPY" },
  { label: "Australian Dollar (A$)", value: "AUD" },
];

const LANGUAGE_OPTIONS: SelectionOption[] = [
  { label: "English", value: "en" },
  { label: "Filipino", value: "fil" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
];

const THEME_OPTIONS: SelectionOption[] = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
];

const START_OF_WEEK_OPTIONS: SelectionOption[] = [
  { label: "Sunday", value: "sunday" },
  { label: "Monday", value: "monday" },
];

const AUTO_LOCK_OPTIONS: SelectionOption[] = [
  { label: "Immediately", value: "immediately" },
  { label: "1 minute", value: "1 minute" },
  { label: "5 minutes", value: "5 minutes" },
  { label: "15 minutes", value: "15 minutes" },
  { label: "Never", value: "never" },
];

// ============ SKELETON SHIMMER COMPONENT ============
function SkeletonShimmer({
  width,
  height,
  borderRadius = 8,
  className = "",
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  className?: string;
}) {
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0, { duration: 1000 }),
      ),
      -1,
      false,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      shimmerValue.value,
      [0, 1],
      [0.3, 0.7],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width: typeof width === "number" ? width : undefined,
          height,
          borderRadius,
        },
        typeof width === "string" ? { flex: 1 } : {},
      ]}
      className={`bg-gray-200 dark:bg-gray-700 ${className}`}
    />
  );
}

// ============ SKELETON SETTING ROW ============
function SkeletonSettingRow() {
  return (
    <View className="flex-row items-center justify-between py-4 px-4">
      <View className="flex-row items-center flex-1">
        <SkeletonShimmer width={40} height={40} borderRadius={20} />
        <View className="ml-4 flex-1">
          <SkeletonShimmer width={120} height={16} borderRadius={8} />
        </View>
      </View>
      <SkeletonShimmer width={60} height={24} borderRadius={12} />
    </View>
  );
}

// ============ SKELETON PROFILE CARD ============
function SkeletonProfileCard() {
  return (
    <View
      className="bg-white dark:bg-gray-800 rounded-[28px] mx-5 p-6"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
      }}
    >
      <View className="flex-row items-center">
        <SkeletonShimmer width={72} height={72} borderRadius={36} />
        <View className="ml-4 flex-1">
          <SkeletonShimmer width={140} height={20} borderRadius={10} />
          <View className="h-2" />
          <SkeletonShimmer width={180} height={14} borderRadius={7} />
        </View>
        <SkeletonShimmer width={40} height={40} borderRadius={20} />
      </View>
    </View>
  );
}

// ============ SKELETON SECTION CARD ============
function SkeletonSectionCard({ rowCount = 3 }: { rowCount?: number }) {
  return (
    <View
      className="bg-white dark:bg-gray-800 rounded-[28px] mx-5 overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
      }}
    >
      {Array.from({ length: rowCount }).map((_, index) => (
        <View key={index}>
          <SkeletonSettingRow />
          {index < rowCount - 1 && (
            <View className="h-px bg-gray-100 dark:bg-gray-700 ml-[72px]" />
          )}
        </View>
      ))}
    </View>
  );
}

// ============ SKELETON LOADING STATE ============
function SkeletonLoading() {
  return (
    <View className="flex-1">
      {/* Header Skeleton */}
      <View className="px-5 py-4">
        <SkeletonShimmer width={100} height={32} borderRadius={16} />
        <View className="h-2" />
        <SkeletonShimmer width={160} height={16} borderRadius={8} />
      </View>

      {/* Profile Card Skeleton */}
      <View className="mt-4">
        <SkeletonProfileCard />
      </View>

      {/* Preferences Section Skeleton */}
      <View className="mt-6 px-5">
        <SkeletonShimmer width={100} height={18} borderRadius={9} />
      </View>
      <View className="mt-3">
        <SkeletonSectionCard rowCount={4} />
      </View>

      {/* Notifications Section Skeleton */}
      <View className="mt-6 px-5">
        <SkeletonShimmer width={120} height={18} borderRadius={9} />
      </View>
      <View className="mt-3">
        <SkeletonSectionCard rowCount={4} />
      </View>
    </View>
  );
}

// ============ PROFILE CARD COMPONENT ============
interface ProfileCardProps {
  name: string;
  email: string;
  avatarUrl: string;
  onEditPress?: () => void;
}

function ProfileCard({
  name,
  email,
  avatarUrl,
  onEditPress,
}: ProfileCardProps) {
  return (
    <Pressable
      onPress={onEditPress}
      className="bg-white dark:bg-gray-800 rounded-[28px] mx-5 p-6 active:opacity-90"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
      }}
    >
      <View className="flex-row items-center">
        <Image
          source={{ uri: avatarUrl }}
          className="w-[72px] h-[72px] rounded-full bg-gray-100"
        />
        <View className="ml-4 flex-1">
          <Text className="text-gray-900 dark:text-white text-xl font-bold tracking-tight">
            {name}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {email}
          </Text>
        </View>
        <View className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full items-center justify-center">
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </View>
      </View>
    </Pressable>
  );
}

// ============ SECTION CARD COMPONENT ============
interface SectionCardProps {
  children: React.ReactNode;
}

function SectionCard({ children }: SectionCardProps) {
  return (
    <View
      className="bg-white dark:bg-gray-800 rounded-[28px] mx-5 overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
      }}
    >
      {children}
    </View>
  );
}

// ============ SECTION HEADER COMPONENT ============
interface SectionHeaderProps {
  title: string;
}

function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <Text className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider px-5 mb-3">
      {title}
    </Text>
  );
}

// ============ SETTING ROW COMPONENT ============
interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBgColor: string;
  title: string;
  value?: string;
  hasToggle?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
  onPress?: () => void;
  isDestructive?: boolean;
  showChevron?: boolean;
  isLast?: boolean;
}

function SettingRow({
  icon,
  iconColor,
  iconBgColor,
  title,
  value,
  hasToggle,
  toggleValue,
  onToggleChange,
  onPress,
  isDestructive,
  showChevron = true,
  isLast = false,
}: SettingRowProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!hasToggle) {
      scale.value = withTiming(0.98, { duration: 100 });
    }
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  return (
    <>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={hasToggle}
        className="active:bg-gray-50 dark:active:bg-gray-700/50"
      >
        <Animated.View
          style={animatedStyle}
          className="flex-row items-center justify-between py-4 px-4"
        >
          <View className="flex-row items-center flex-1">
            <View
              className={`w-10 h-10 rounded-full items-center justify-center ${iconBgColor}`}
            >
              <Ionicons name={icon} size={20} color={iconColor} />
            </View>
            <Text
              className={`ml-4 text-base font-medium ${
                isDestructive ? "text-red-500" : "text-gray-900 dark:text-white"
              }`}
            >
              {title}
            </Text>
          </View>
          <View className="flex-row items-center">
            {value && (
              <Text className="text-gray-500 dark:text-gray-400 text-sm mr-2">
                {value}
              </Text>
            )}
            {hasToggle && (
              <Switch
                value={toggleValue}
                onValueChange={onToggleChange}
                trackColor={{ false: "#e5e7eb", true: "#22c55e" }}
                thumbColor="#ffffff"
                ios_backgroundColor="#e5e7eb"
              />
            )}
            {!hasToggle && showChevron && (
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            )}
          </View>
        </Animated.View>
      </Pressable>
      {!isLast && (
        <View className="h-px bg-gray-100 dark:bg-gray-700 ml-[72px]" />
      )}
    </>
  );
}

// ============ MAIN SETTINGS SCREEN ============
export default function SettingsScreen() {
  const navigation = useNavigation();

  // Redux
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { settings: apiSettings, isLoading } = useAppSelector(
    (state) => state.settings,
  );

  // Modal visibility state
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [deleteAccountVisible, setDeleteAccountVisible] = useState(false);
  const [selectionModal, setSelectionModal] = useState<{
    title: string;
    options: SelectionOption[];
    selectedValue: string;
    onSelect: (value: string) => void;
  } | null>(null);

  // Local settings not stored on the server
  const [biometricLogin, setBiometricLogin] = useState(
    DEFAULT_SETTINGS.biometricLogin,
  );
  const [autoLockTime, setAutoLockTime] = useState(
    DEFAULT_SETTINGS.autoLockTime,
  );

  // Fetch settings on mount + restore local preferences
  useEffect(() => {
    dispatch(fetchSettings());
    AsyncStorage.getItem("autoLockTime").then((v) => {
      if (v) setAutoLockTime(v);
    });
  }, [dispatch]);

  // Transform API settings to local format with defaults
  const settings = {
    currency: apiSettings?.currency || DEFAULT_SETTINGS.currency,
    language: apiSettings?.language || DEFAULT_SETTINGS.language,
    theme: apiSettings?.theme || DEFAULT_SETTINGS.theme,
    startOfWeek: apiSettings?.startOfWeek || DEFAULT_SETTINGS.startOfWeek,
    budgetAlerts:
      apiSettings?.notifications?.budgetAlerts ?? DEFAULT_SETTINGS.budgetAlerts,
    billReminders:
      apiSettings?.notifications?.billReminders ??
      DEFAULT_SETTINGS.billReminders,
    goalUpdates:
      apiSettings?.notifications?.goalUpdates ?? DEFAULT_SETTINGS.goalUpdates,
    emailNotifications:
      apiSettings?.notifications?.email ?? DEFAULT_SETTINGS.emailNotifications,
    pushNotifications:
      apiSettings?.notifications?.push ?? DEFAULT_SETTINGS.pushNotifications,
    lowBalanceAlerts:
      apiSettings?.notifications?.lowBalanceAlerts ??
      DEFAULT_SETTINGS.lowBalanceAlerts,
    goalReminders:
      apiSettings?.notifications?.goalReminders ??
      DEFAULT_SETTINGS.goalReminders,
    transactionAlerts:
      apiSettings?.notifications?.transactionAlerts ??
      DEFAULT_SETTINGS.transactionAlerts,
    lowBalanceThreshold:
      apiSettings?.lowBalanceThreshold ?? DEFAULT_SETTINGS.lowBalanceThreshold,
    appVersion: DEFAULT_SETTINGS.appVersion,
  };

  // Format display values using options arrays
  const currencyDisplay =
    CURRENCY_OPTIONS.find((o) => o.value === settings.currency)
      ?.label.split(" ")
      .slice(0, 3)
      .join(" ") ?? settings.currency;
  const languageDisplay =
    LANGUAGE_OPTIONS.find((o) => o.value === settings.language)?.label ??
    settings.language;
  const themeDisplay =
    settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1);
  const startOfWeekDisplay =
    settings.startOfWeek.charAt(0).toUpperCase() +
    settings.startOfWeek.slice(1);

  // Notification toggle handler — sends full nested notifications object
  const handleNotificationToggle = useCallback(
    (
      key:
        | "budgetAlerts"
        | "billReminders"
        | "goalUpdates"
        | "email"
        | "push"
        | "lowBalanceAlerts"
        | "goalReminders"
        | "transactionAlerts",
    ) =>
      async (value: boolean) => {
        await dispatch(
          updateSettings({
            notifications: {
              email: settings.emailNotifications,
              push: settings.pushNotifications,
              billReminders: settings.billReminders,
              budgetAlerts: settings.budgetAlerts,
              goalUpdates: settings.goalUpdates,
              lowBalanceAlerts: settings.lowBalanceAlerts,
              goalReminders: settings.goalReminders,
              transactionAlerts: settings.transactionAlerts,
              [key]: value,
            },
          }),
        );
      },
    [settings, dispatch],
  );

  // ---- Preferences handlers ----
  const handleEditProfile = () => setEditProfileVisible(true);

  const handleCurrencyPress = () =>
    setSelectionModal({
      title: "Currency",
      options: CURRENCY_OPTIONS,
      selectedValue: settings.currency,
      onSelect: (value) => dispatch(updateSettings({ currency: value })),
    });

  const handleLanguagePress = () =>
    setSelectionModal({
      title: "Language",
      options: LANGUAGE_OPTIONS,
      selectedValue: settings.language,
      onSelect: (value) => dispatch(updateSettings({ language: value })),
    });

  const handleThemePress = () =>
    setSelectionModal({
      title: "Theme",
      options: THEME_OPTIONS,
      selectedValue: settings.theme,
      onSelect: (value) =>
        dispatch(
          updateSettings({ theme: value as "light" | "dark" | "system" }),
        ),
    });

  const handleStartOfWeekPress = () =>
    setSelectionModal({
      title: "Start of Week",
      options: START_OF_WEEK_OPTIONS,
      selectedValue: settings.startOfWeek,
      onSelect: (value) =>
        dispatch(updateSettings({ startOfWeek: value as "sunday" | "monday" })),
    });

  // ---- Security handlers ----
  const handleChangePinPress = () => setChangePasswordVisible(true);

  const handleAutoLockPress = () =>
    setSelectionModal({
      title: "Auto-Lock",
      options: AUTO_LOCK_OPTIONS,
      selectedValue: autoLockTime,
      onSelect: async (value) => {
        setAutoLockTime(value);
        await AsyncStorage.setItem("autoLockTime", value);
      },
    });

  const handleConnectedDevicesPress = () => {
    Alert.alert(
      "Connected Devices",
      `You are currently signed in on ${DEFAULT_SETTINGS.connectedDevices} device. Sign out of all other devices is coming soon.`,
      [{ text: "OK" }],
    );
  };

  // ---- Privacy handlers ----
  const handleDataExportPress = () => {
    Alert.alert(
      "Export Data",
      "Data export is coming soon. We'll notify you when it's available.",
      [{ text: "OK" }],
    );
  };

  const handleDeleteAccountPress = () => setDeleteAccountVisible(true);

  const handlePermissionsPress = () => Linking.openSettings();

  // ---- About handlers ----
  const handleTermsPress = () => {
    Alert.alert("Terms of Service", "Terms of service will be available soon.");
  };

  const handlePrivacyPress = () => {
    Alert.alert("Privacy Policy", "Privacy policy will be available soon.");
  };

  // ---- Logout ----
  const handleLogoutPress = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => dispatch(logout()),
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView
        className="flex-1 bg-gray-50 dark:bg-gray-900"
        edges={["top"]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <SkeletonLoading />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} className="px-5 py-4">
          <View className="flex-row items-center mb-2">
            <Pressable
              onPress={() => navigation.goBack()}
              className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mr-3 active:bg-gray-200 dark:active:bg-gray-700"
            >
              <Ionicons name="chevron-back" size={24} color="#374151" />
            </Pressable>
            <View>
              <Text className="text-gray-900 dark:text-white text-3xl font-bold tracking-tight">
                Settings
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-base mt-1">
                Manage your account
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Profile Card */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(100)}
          className="mt-2"
        >
          <ProfileCard
            name={user?.name || "User"}
            email={user?.email || "user@example.com"}
            avatarUrl={DEFAULT_AVATAR}
            onEditPress={handleEditProfile}
          />
        </Animated.View>

        {/* Preferences Section */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(200)}
          className="mt-8"
        >
          <SectionHeader title="Preferences" />
          <SectionCard>
            <SettingRow
              icon="cash-outline"
              iconColor="#22c55e"
              iconBgColor="bg-emerald-50 dark:bg-emerald-500/20"
              title="Currency"
              value={currencyDisplay}
              onPress={handleCurrencyPress}
            />
            <SettingRow
              icon="language-outline"
              iconColor="#3b82f6"
              iconBgColor="bg-blue-50 dark:bg-blue-500/20"
              title="Language"
              value={languageDisplay}
              onPress={handleLanguagePress}
            />
            <SettingRow
              icon="contrast-outline"
              iconColor="#8b5cf6"
              iconBgColor="bg-violet-50 dark:bg-violet-500/20"
              title="Theme"
              value={themeDisplay}
              onPress={handleThemePress}
            />
            <SettingRow
              icon="calendar-outline"
              iconColor="#f59e0b"
              iconBgColor="bg-amber-50 dark:bg-amber-500/20"
              title="Start of Week"
              value={startOfWeekDisplay}
              onPress={handleStartOfWeekPress}
              isLast
            />
          </SectionCard>
        </Animated.View>

        {/* Notifications Section */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(300)}
          className="mt-8"
        >
          <SectionHeader title="Notifications" />
          <SectionCard>
            <SettingRow
              icon="mail-outline"
              iconColor="#3b82f6"
              iconBgColor="bg-blue-50 dark:bg-blue-500/20"
              title="Email Notifications"
              hasToggle
              toggleValue={settings.emailNotifications}
              onToggleChange={handleNotificationToggle("email")}
            />
            <SettingRow
              icon="notifications-outline"
              iconColor="#22c55e"
              iconBgColor="bg-emerald-50 dark:bg-emerald-500/20"
              title="Push Notifications"
              hasToggle
              toggleValue={settings.pushNotifications}
              onToggleChange={handleNotificationToggle("push")}
            />
            <SettingRow
              icon="wallet-outline"
              iconColor="#ef4444"
              iconBgColor="bg-red-50 dark:bg-red-500/20"
              title="Budget Alerts"
              hasToggle
              toggleValue={settings.budgetAlerts}
              onToggleChange={handleNotificationToggle("budgetAlerts")}
            />
            <SettingRow
              icon="receipt-outline"
              iconColor="#f59e0b"
              iconBgColor="bg-amber-50 dark:bg-amber-500/20"
              title="Bill Reminders"
              hasToggle
              toggleValue={settings.billReminders}
              onToggleChange={handleNotificationToggle("billReminders")}
            />
            <SettingRow
              icon="sparkles-outline"
              iconColor="#8b5cf6"
              iconBgColor="bg-violet-50 dark:bg-violet-500/20"
              title="AI Coach Nudges"
              hasToggle
              toggleValue={settings.goalUpdates}
              onToggleChange={handleNotificationToggle("goalUpdates")}
            />
            <SettingRow
              icon="flag-outline"
              iconColor="#8b5cf6"
              iconBgColor="bg-violet-50 dark:bg-violet-500/20"
              title="Goal Reminders"
              hasToggle
              toggleValue={settings.goalReminders}
              onToggleChange={handleNotificationToggle("goalReminders")}
            />
            <SettingRow
              icon="alert-circle-outline"
              iconColor="#f59e0b"
              iconBgColor="bg-amber-50 dark:bg-amber-500/20"
              title="Low Balance Alerts"
              hasToggle
              toggleValue={settings.lowBalanceAlerts}
              onToggleChange={handleNotificationToggle("lowBalanceAlerts")}
            />
            <SettingRow
              icon="trending-up-outline"
              iconColor="#ef4444"
              iconBgColor="bg-red-50 dark:bg-red-500/20"
              title="Transaction Alerts"
              hasToggle
              toggleValue={settings.transactionAlerts}
              onToggleChange={handleNotificationToggle("transactionAlerts")}
              isLast
            />
          </SectionCard>
        </Animated.View>

        {/* Security Section */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(400)}
          className="mt-8"
        >
          <SectionHeader title="Security" />
          <SectionCard>
            <SettingRow
              icon="finger-print-outline"
              iconColor="#22c55e"
              iconBgColor="bg-emerald-50 dark:bg-emerald-500/20"
              title="Biometric Login"
              hasToggle
              toggleValue={biometricLogin}
              onToggleChange={setBiometricLogin}
            />
            <SettingRow
              icon="keypad-outline"
              iconColor="#3b82f6"
              iconBgColor="bg-blue-50 dark:bg-blue-500/20"
              title="Change PIN"
              onPress={handleChangePinPress}
            />
            <SettingRow
              icon="timer-outline"
              iconColor="#8b5cf6"
              iconBgColor="bg-violet-50 dark:bg-violet-500/20"
              title="Auto-Lock"
              value={autoLockTime}
              onPress={handleAutoLockPress}
            />
            <SettingRow
              icon="phone-portrait-outline"
              iconColor="#f59e0b"
              iconBgColor="bg-amber-50 dark:bg-amber-500/20"
              title="Connected Devices"
              value={`${DEFAULT_SETTINGS.connectedDevices} device`}
              onPress={handleConnectedDevicesPress}
              isLast
            />
          </SectionCard>
        </Animated.View>

        {/* Privacy Section */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(500)}
          className="mt-8"
        >
          <SectionHeader title="Privacy" />
          <SectionCard>
            <SettingRow
              icon="download-outline"
              iconColor="#3b82f6"
              iconBgColor="bg-blue-50 dark:bg-blue-500/20"
              title="Export Data"
              onPress={handleDataExportPress}
            />
            <SettingRow
              icon="shield-checkmark-outline"
              iconColor="#22c55e"
              iconBgColor="bg-emerald-50 dark:bg-emerald-500/20"
              title="Permissions"
              onPress={handlePermissionsPress}
            />
            <SettingRow
              icon="trash-outline"
              iconColor="#ef4444"
              iconBgColor="bg-red-50 dark:bg-red-500/20"
              title="Delete Account"
              isDestructive
              onPress={handleDeleteAccountPress}
              isLast
            />
          </SectionCard>
        </Animated.View>

        {/* App Info Section */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(600)}
          className="mt-8"
        >
          <SectionHeader title="About" />
          <SectionCard>
            <SettingRow
              icon="information-circle-outline"
              iconColor="#6b7280"
              iconBgColor="bg-gray-100 dark:bg-gray-700"
              title="Version"
              value={settings.appVersion}
              showChevron={false}
            />
            <SettingRow
              icon="document-text-outline"
              iconColor="#3b82f6"
              iconBgColor="bg-blue-50 dark:bg-blue-500/20"
              title="Terms of Service"
              onPress={handleTermsPress}
            />
            <SettingRow
              icon="lock-closed-outline"
              iconColor="#8b5cf6"
              iconBgColor="bg-violet-50 dark:bg-violet-500/20"
              title="Privacy Policy"
              onPress={handlePrivacyPress}
              isLast
            />
          </SectionCard>
        </Animated.View>

        {/* Logout Button */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(700)}
          className="mt-8 mx-5"
        >
          <Pressable
            onPress={handleLogoutPress}
            className="bg-red-50 dark:bg-red-500/10 rounded-2xl py-4 items-center active:bg-red-100 dark:active:bg-red-500/20"
            style={{
              shadowColor: "#ef4444",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="flex-row items-center">
              <Ionicons name="log-out-outline" size={22} color="#ef4444" />
              <Text className="text-red-500 text-base font-semibold ml-2">
                Log Out
              </Text>
            </View>
          </Pressable>
        </Animated.View>

        {/* Footer Spacing */}
        <View className="h-8" />
      </ScrollView>

      {/* Modals */}
      <EditProfileModal
        visible={editProfileVisible}
        onClose={() => setEditProfileVisible(false)}
      />
      <ChangePasswordModal
        visible={changePasswordVisible}
        onClose={() => setChangePasswordVisible(false)}
      />
      <DeleteAccountModal
        visible={deleteAccountVisible}
        onClose={() => setDeleteAccountVisible(false)}
      />
      {selectionModal && (
        <SelectionModal
          visible
          title={selectionModal.title}
          options={selectionModal.options}
          selectedValue={selectionModal.selectedValue}
          onSelect={selectionModal.onSelect}
          onClose={() => setSelectionModal(null)}
        />
      )}
    </SafeAreaView>
  );
}
