import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Switch,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context';
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
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============ MOCK DATA ============
const MOCK_USER = {
  name: 'Josua',
  email: 'josua@example.com',
  avatar:
    'https://scontent.fcrk2-4.fna.fbcdn.net/v/t39.30808-1/452520623_2513715905502570_4656031386816113501_n.jpg?stp=dst-jpg_s480x480_tt6&_nc_cat=100&ccb=1-7&_nc_sid=1d2534&_nc_eui2=AeGzE2cW0JEmTuJamWkgltViRljU-CF6-HRGWNT4IXr4dG8CyY8oJBi11-umFwf6Ztd8LzqcTFa-5ee6auZPHHol&_nc_ohc=aRWyNVYfE7gQ7kNvwFM9N6f&_nc_oc=Admqkd1vIqSrNaHHPKtVqxgWikKZH_T4hjFR-3tPJehAfVM7T3MPQZZhPe_AKTmk-kQ&_nc_zt=24&_nc_ht=scontent.fcrk2-4.fna&_nc_gid=fLcKi5C2AEiRB1fqbuGtzQ&oh=00_Afocb2ycTPpEx7ZhvCwcRoVe7qV2-S44QQHz5hy_SAG8jg&oe=697B49F6',
};

const MOCK_SETTINGS = {
  currency: 'PHP (₱)',
  language: 'English',
  theme: 'System',
  startOfWeek: 'Monday',
  budgetAlerts: true,
  billReminders: true,
  aiCoachNudges: true,
  lowBalanceAlerts: false,
  biometricLogin: true,
  autoLockTime: '1 minute',
  connectedDevices: 2,
  appVersion: '1.0.0',
};

// ============ SKELETON SHIMMER COMPONENT ============
function SkeletonShimmer({ width, height, borderRadius = 8, className = '' }: {
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
        withTiming(0, { duration: 1000 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmerValue.value, [0, 1], [0.3, 0.7], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width: typeof width === 'number' ? width : undefined,
          height,
          borderRadius,
        },
        typeof width === 'string' ? { flex: 1 } : {},
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
        shadowColor: '#000',
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
        shadowColor: '#000',
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

function ProfileCard({ name, email, avatarUrl, onEditPress }: ProfileCardProps) {
  return (
    <Pressable
      onPress={onEditPress}
      className="bg-white dark:bg-gray-800 rounded-[28px] mx-5 p-6 active:opacity-90"
      style={{
        shadowColor: '#000',
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
        shadowColor: '#000',
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
                isDestructive
                  ? 'text-red-500'
                  : 'text-gray-900 dark:text-white'
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
                trackColor={{ false: '#e5e7eb', true: '#22c55e' }}
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
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();
  const { logout } = useAuth();

  // Mock settings state
  const [settings, setSettings] = useState(MOCK_SETTINGS);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Toggle handlers
  const handleToggle = (key: keyof typeof settings) => (value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Navigation handlers
  const handleEditProfile = () => {
    console.log('Edit profile pressed');
  };

  const handleCurrencyPress = () => {
    console.log('Currency selector pressed');
  };

  const handleLanguagePress = () => {
    console.log('Language selector pressed');
  };

  const handleThemePress = () => {
    console.log('Theme selector pressed');
  };

  const handleStartOfWeekPress = () => {
    console.log('Start of week selector pressed');
  };

  const handleChangePinPress = () => {
    console.log('Change PIN pressed');
  };

  const handleAutoLockPress = () => {
    console.log('Auto-lock time selector pressed');
  };

  const handleConnectedDevicesPress = () => {
    console.log('Connected devices pressed');
  };

  const handleDataExportPress = () => {
    console.log('Data export pressed');
  };

  const handleDeleteAccountPress = () => {
    console.log('Delete account pressed');
  };

  const handlePermissionsPress = () => {
    console.log('Permissions pressed');
  };

  const handleTermsPress = () => {
    console.log('Terms pressed');
  };

  const handlePrivacyPress = () => {
    console.log('Privacy pressed');
  };

  const handleLogoutPress = () => {
    logout();
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
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
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header */}
        <Animated.View
          entering={FadeIn.duration(400)}
          className="px-5 py-4"
        >
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
        <Animated.View entering={FadeInDown.duration(500).delay(100)} className="mt-2">
          <ProfileCard
            name={MOCK_USER.name}
            email={MOCK_USER.email}
            avatarUrl={MOCK_USER.avatar}
            onEditPress={handleEditProfile}
          />
        </Animated.View>

        {/* Preferences Section */}
        <Animated.View entering={FadeInDown.duration(500).delay(200)} className="mt-8">
          <SectionHeader title="Preferences" />
          <SectionCard>
            <SettingRow
              icon="cash-outline"
              iconColor="#22c55e"
              iconBgColor="bg-emerald-50 dark:bg-emerald-500/20"
              title="Currency"
              value={settings.currency}
              onPress={handleCurrencyPress}
            />
            <SettingRow
              icon="language-outline"
              iconColor="#3b82f6"
              iconBgColor="bg-blue-50 dark:bg-blue-500/20"
              title="Language"
              value={settings.language}
              onPress={handleLanguagePress}
            />
            <SettingRow
              icon="contrast-outline"
              iconColor="#8b5cf6"
              iconBgColor="bg-violet-50 dark:bg-violet-500/20"
              title="Theme"
              value={settings.theme}
              onPress={handleThemePress}
            />
            <SettingRow
              icon="calendar-outline"
              iconColor="#f59e0b"
              iconBgColor="bg-amber-50 dark:bg-amber-500/20"
              title="Start of Week"
              value={settings.startOfWeek}
              onPress={handleStartOfWeekPress}
              isLast
            />
          </SectionCard>
        </Animated.View>

        {/* Notifications Section */}
        <Animated.View entering={FadeInDown.duration(500).delay(300)} className="mt-8">
          <SectionHeader title="Notifications" />
          <SectionCard>
            <SettingRow
              icon="wallet-outline"
              iconColor="#ef4444"
              iconBgColor="bg-red-50 dark:bg-red-500/20"
              title="Budget Alerts"
              hasToggle
              toggleValue={settings.budgetAlerts}
              onToggleChange={handleToggle('budgetAlerts')}
            />
            <SettingRow
              icon="receipt-outline"
              iconColor="#f59e0b"
              iconBgColor="bg-amber-50 dark:bg-amber-500/20"
              title="Bill Reminders"
              hasToggle
              toggleValue={settings.billReminders}
              onToggleChange={handleToggle('billReminders')}
            />
            <SettingRow
              icon="sparkles-outline"
              iconColor="#8b5cf6"
              iconBgColor="bg-violet-50 dark:bg-violet-500/20"
              title="AI Coach Nudges"
              hasToggle
              toggleValue={settings.aiCoachNudges}
              onToggleChange={handleToggle('aiCoachNudges')}
            />
            <SettingRow
              icon="trending-down-outline"
              iconColor="#06b6d4"
              iconBgColor="bg-cyan-50 dark:bg-cyan-500/20"
              title="Low Balance Alerts"
              hasToggle
              toggleValue={settings.lowBalanceAlerts}
              onToggleChange={handleToggle('lowBalanceAlerts')}
              isLast
            />
          </SectionCard>
        </Animated.View>

        {/* Security Section */}
        <Animated.View entering={FadeInDown.duration(500).delay(400)} className="mt-8">
          <SectionHeader title="Security" />
          <SectionCard>
            <SettingRow
              icon="finger-print-outline"
              iconColor="#22c55e"
              iconBgColor="bg-emerald-50 dark:bg-emerald-500/20"
              title="Biometric Login"
              hasToggle
              toggleValue={settings.biometricLogin}
              onToggleChange={handleToggle('biometricLogin')}
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
              value={settings.autoLockTime}
              onPress={handleAutoLockPress}
            />
            <SettingRow
              icon="phone-portrait-outline"
              iconColor="#f59e0b"
              iconBgColor="bg-amber-50 dark:bg-amber-500/20"
              title="Connected Devices"
              value={`${settings.connectedDevices} devices`}
              onPress={handleConnectedDevicesPress}
              isLast
            />
          </SectionCard>
        </Animated.View>

        {/* Privacy Section */}
        <Animated.View entering={FadeInDown.duration(500).delay(500)} className="mt-8">
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
        <Animated.View entering={FadeInDown.duration(500).delay(600)} className="mt-8">
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
        <Animated.View entering={FadeInDown.duration(500).delay(700)} className="mt-8 mx-5">
          <Pressable
            onPress={handleLogoutPress}
            className="bg-red-50 dark:bg-red-500/10 rounded-2xl py-4 items-center active:bg-red-100 dark:active:bg-red-500/20"
            style={{
              shadowColor: '#ef4444',
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
    </SafeAreaView>
  );
}
