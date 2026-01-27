import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation';
import { useAuth } from '../context';

type SignupScreenNavigationProp = NavigationProp<RootStackParamList>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ============ REUSABLE COMPONENTS ============

interface AuthInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  showPasswordToggle?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  delay?: number;
  error?: string;
}

function AuthInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  showPasswordToggle = false,
  disabled = false,
  icon,
  delay = 0,
  error,
}: AuthInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const focusScale = useSharedValue(1);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: focusScale.value }],
  }));

  const handleFocus = () => {
    setIsFocused(true);
    focusScale.value = withSpring(1.01);
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusScale.value = withSpring(1);
  };

  const borderColor = error
    ? 'border-red-400 dark:border-red-500'
    : isFocused
    ? 'border-gray-900 dark:border-white'
    : 'border-gray-200 dark:border-gray-700';

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(400)}
      className="mb-4"
    >
      <Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2 ml-1">
        {label}
      </Text>
      <Animated.View
        style={[
          animatedContainerStyle,
          {
            shadowColor: isFocused ? '#111827' : '#000',
            shadowOffset: { width: 0, height: isFocused ? 6 : 2 },
            shadowOpacity: isFocused ? 0.15 : 0.05,
            shadowRadius: isFocused ? 12 : 4,
            elevation: isFocused ? 4 : 1,
          },
        ]}
        className={`flex-row items-center bg-white dark:bg-gray-800 rounded-2xl border-2 px-4 ${borderColor} ${
          disabled ? 'opacity-50' : ''
        }`}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={error ? '#f87171' : isFocused ? '#111827' : '#9ca3af'}
            style={{ marginRight: 12 }}
          />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          className="flex-1 py-4 text-gray-900 dark:text-white text-base"
        />
        {showPasswordToggle && (
          <Pressable onPress={() => setIsSecure(!isSecure)} hitSlop={8}>
            <Ionicons
              name={isSecure ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color="#6b7280"
            />
          </Pressable>
        )}
      </Animated.View>
      {error && (
        <Text className="text-red-500 dark:text-red-400 text-xs mt-1 ml-1">
          {error}
        </Text>
      )}
    </Animated.View>
  );
}

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  icon?: keyof typeof Ionicons.glyphMap;
}

function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon,
}: PrimaryButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.96);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const bgClass =
    variant === 'primary'
      ? 'bg-gray-900 dark:bg-white'
      : 'bg-gray-100 dark:bg-gray-800';

  const textClass =
    variant === 'primary'
      ? 'text-white dark:text-gray-900'
      : 'text-gray-900 dark:text-white';

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        animatedStyle,
        {
          shadowColor: variant === 'primary' ? '#111827' : 'transparent',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: variant === 'primary' ? 8 : 0,
        },
      ]}
      className={`${bgClass} rounded-2xl py-5 px-8 flex-row items-center justify-center ${
        disabled || loading ? 'opacity-60' : ''
      }`}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#fff' : '#111827'}
        />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={variant === 'primary' ? '#fff' : '#374151'}
              style={{ marginRight: 8 }}
            />
          )}
          <Text className={`${textClass} text-lg font-bold tracking-tight`}>
            {label}
          </Text>
        </>
      )}
    </AnimatedPressable>
  );
}

// Password Strength Indicator
interface PasswordStrengthProps {
  password: string;
}

function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = useMemo(() => {
    if (!password) return { level: 0, label: '', color: '' };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 1, label: 'Weak', color: 'bg-red-400' };
    if (score <= 4) return { level: 2, label: 'Medium', color: 'bg-amber-400' };
    return { level: 3, label: 'Strong', color: 'bg-green-500' };
  }, [password]);

  if (!password) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      className="mb-4 -mt-2"
    >
      <View className="flex-row gap-1 mb-1">
        {[1, 2, 3].map((level) => (
          <View
            key={level}
            className={`flex-1 h-1 rounded-full ${
              level <= strength.level ? strength.color : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </View>
      <Text
        className={`text-xs ml-1 ${
          strength.level === 1
            ? 'text-red-500'
            : strength.level === 2
            ? 'text-amber-500'
            : 'text-green-500'
        }`}
      >
        {strength.label} password
      </Text>
    </Animated.View>
  );
}

// ============ MAIN SCREEN ============

export default function SignupScreen() {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const { login } = useAuth();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation
  const isNameValid = name.trim().length >= 2;
  const isEmailValid = email.includes('@') && email.includes('.');
  const isPasswordValid = password.length >= 8;
  const isConfirmPasswordValid = confirmPassword === password && confirmPassword.length > 0;
  const isFormValid = isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid;

  // Field-level errors (shown after blur)
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const getFieldError = (field: keyof typeof touched) => {
    if (!touched[field]) return undefined;

    switch (field) {
      case 'name':
        return !isNameValid ? 'Name must be at least 2 characters' : undefined;
      case 'email':
        return !isEmailValid ? 'Please enter a valid email' : undefined;
      case 'password':
        return !isPasswordValid ? 'Password must be at least 8 characters' : undefined;
      case 'confirmPassword':
        return !isConfirmPasswordValid ? 'Passwords do not match' : undefined;
      default:
        return undefined;
    }
  };

  const handleSignup = async () => {
    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (!isFormValid) {
      setError('Please fix the errors above');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate auth request
    setTimeout(() => {
      setIsLoading(false);
      // Set authenticated and navigate to main app
      login();
    }, 1500);
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-6 pb-6">
            {/* Back Button */}
            <Animated.View entering={FadeIn.delay(100).duration(400)}>
              <Pressable
                onPress={() => navigation.goBack()}
                hitSlop={12}
                className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 items-center justify-center mb-4"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <Ionicons name="arrow-back" size={22} color="#374151" />
              </Pressable>
            </Animated.View>

            {/* Title */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(400)}
              className="mb-6"
            >
              <Text className="text-gray-900 dark:text-white text-3xl font-bold tracking-tight">
                Create Account
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-base mt-2">
                Start your journey to smarter budgeting
              </Text>
            </Animated.View>

            {/* Form */}
            <View className="mb-4">
              <AuthInput
                label="Full Name"
                placeholder="Enter your name"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setTouched((prev) => ({ ...prev, name: true }));
                }}
                autoCapitalize="words"
                icon="person-outline"
                disabled={isLoading}
                delay={300}
                error={getFieldError('name')}
              />

              <AuthInput
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setTouched((prev) => ({ ...prev, email: true }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                icon="mail-outline"
                disabled={isLoading}
                delay={400}
                error={getFieldError('email')}
              />

              <AuthInput
                label="Password"
                placeholder="Create a password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setTouched((prev) => ({ ...prev, password: true }));
                }}
                secureTextEntry
                showPasswordToggle
                icon="lock-closed-outline"
                disabled={isLoading}
                delay={500}
                error={getFieldError('password')}
              />

              {/* Password Strength */}
              <PasswordStrength password={password} />

              <AuthInput
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setTouched((prev) => ({ ...prev, confirmPassword: true }));
                }}
                secureTextEntry
                showPasswordToggle
                icon="shield-checkmark-outline"
                disabled={isLoading}
                delay={600}
                error={getFieldError('confirmPassword')}
              />

              {/* Error Message */}
              {error && (
                <Animated.View
                  entering={FadeIn.duration(300)}
                  className="bg-red-50 dark:bg-red-500/10 rounded-xl p-3 mb-4"
                >
                  <Text className="text-red-600 dark:text-red-400 text-sm text-center">
                    {error}
                  </Text>
                </Animated.View>
              )}
            </View>

            {/* Signup Button */}
            <Animated.View entering={FadeInDown.delay(700).duration(400)}>
              <PrimaryButton
                label="Create Account"
                onPress={handleSignup}
                loading={isLoading}
                disabled={false}
              />
            </Animated.View>

            {/* Terms */}
            <Animated.View
              entering={FadeIn.delay(800).duration(400)}
              className="mt-4 px-4"
            >
              <Text className="text-gray-400 dark:text-gray-500 text-xs text-center leading-5">
                By creating an account, you agree to our{' '}
                <Text className="text-gray-600 dark:text-gray-300 font-semibold">
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text className="text-gray-600 dark:text-gray-300 font-semibold">
                  Privacy Policy
                </Text>
              </Text>
            </Animated.View>

            {/* Login Link */}
            <Animated.View
              entering={FadeInUp.delay(900).duration(400)}
              className="flex-row items-center justify-center mt-6"
            >
              <Text className="text-gray-500 dark:text-gray-400 text-base">
                Already have an account?{' '}
              </Text>
              <Pressable onPress={navigateToLogin} hitSlop={8}>
                <Text className="text-gray-900 dark:text-white text-base font-bold">
                  Login
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
