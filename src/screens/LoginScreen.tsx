import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInLeft,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../navigation";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { login, clearError } from "../store/slices/authSlice";

type LoginScreenNavigationProp = NavigationProp<RootStackParamList>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ============ REUSABLE COMPONENTS ============

interface AuthInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  showPasswordToggle?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  delay?: number;
}

function AuthInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  showPasswordToggle = false,
  disabled = false,
  icon,
  delay = 0,
}: AuthInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const focusScale = useSharedValue(1);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: focusScale.value }],
    borderColor: isFocused ? "#111827" : "#e5e7eb",
  }));

  const handleFocus = () => {
    setIsFocused(true);
    focusScale.value = withSpring(1.01);
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusScale.value = withSpring(1);
  };

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
            shadowColor: isFocused ? "#111827" : "#000",
            shadowOffset: { width: 0, height: isFocused ? 6 : 2 },
            shadowOpacity: isFocused ? 0.15 : 0.05,
            shadowRadius: isFocused ? 12 : 4,
            elevation: isFocused ? 4 : 1,
          },
        ]}
        className={`flex-row items-center bg-white dark:bg-gray-800 rounded-2xl border-2 px-4 ${
          isFocused
            ? "border-gray-900 dark:border-white"
            : "border-gray-200 dark:border-gray-700"
        } ${disabled ? "opacity-50" : ""}`}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? "#111827" : "#9ca3af"}
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
              name={isSecure ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#6b7280"
            />
          </Pressable>
        )}
      </Animated.View>
    </Animated.View>
  );
}

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  icon?: keyof typeof Ionicons.glyphMap;
}

function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
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
    variant === "primary" ? "bg-primary-500" : "bg-gray-100 dark:bg-gray-800";

  const textClass =
    variant === "primary" ? "text-white" : "text-gray-900 dark:text-white";

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        animatedStyle,
        {
          shadowColor: variant === "primary" ? "#FF5A5F" : "transparent",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: variant === "primary" ? 8 : 0,
        },
      ]}
      className={`${bgClass} rounded-2xl py-5 px-8 flex-row items-center justify-center ${
        disabled || loading ? "opacity-60" : ""
      }`}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? "#fff" : "#484848"}
        />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={variant === "primary" ? "#fff" : "#374151"}
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

interface SocialButtonProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
}

function SocialButton({
  label,
  icon,
  onPress,
  disabled = false,
}: SocialButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.97);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        animatedStyle,
        {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        },
      ]}
      className={`flex-1 bg-white dark:bg-gray-800 rounded-2xl py-4 px-6 flex-row items-center justify-center border border-gray-200 dark:border-gray-700 ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <Ionicons
        name={icon}
        size={22}
        color="#374151"
        style={{ marginRight: 8 }}
      />
      <Text className="text-gray-700 dark:text-gray-300 text-base font-semibold">
        {label}
      </Text>
    </AnimatedPressable>
  );
}

// ============ MAIN SCREEN ============

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { isLoading: authLoading, error: authError } = useAppSelector(
    (state) => state.auth,
  );

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Sync auth error to local state
  useEffect(() => {
    if (authError) {
      setError(authError);
      dispatch(clearError());
    }
  }, [authError, dispatch]);

  // Simple validation
  const isEmailValid = email.includes("@") && email.includes(".");
  const isPasswordValid = password.length >= 6;
  const isFormValid = isEmailValid && isPasswordValid;

  const handleLogin = async () => {
    if (!isFormValid) {
      setError("Please enter valid credentials");
      return;
    }

    setError(null);
    dispatch(login({ email, password }));
    // If successful, Redux will update isAuthenticated and navigation will handle the rest
  };

  const handleForgotPassword = () => {
    // TODO: Navigate to forgot password screen
    console.log("Forgot password pressed");
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google login
    console.log("Google login pressed");
  };

  const handleAppleLogin = () => {
    // TODO: Implement Apple login
    console.log("Apple login pressed");
  };

  const navigateToSignup = () => {
    navigation.navigate("Signup");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-8 pb-6 justify-center">
            {/* Logo Placeholder */}
            <Animated.View
              entering={FadeIn.delay(100).duration(500)}
              className="items-center mb-8"
            >
              <View
                style={{
                  shadowColor: "#111827",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.15,
                  shadowRadius: 20,
                  elevation: 6,
                }}
                className="w-20 h-20 bg-gray-900 dark:bg-white rounded-3xl items-center justify-center"
              >
                <Ionicons
                  name="wallet-outline"
                  size={40}
                  color="#fff"
                  className="dark:color-gray-900"
                />
                <View className="absolute">
                  <Ionicons name="wallet-outline" size={40} color="#fff" />
                </View>
              </View>
            </Animated.View>

            {/* Title */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(400)}
              className="mb-8"
            >
              <Text className="text-gray-900 dark:text-white text-3xl font-bold text-center tracking-tight">
                Welcome Back
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-base text-center mt-2">
                Sign in to continue managing your finances
              </Text>
            </Animated.View>

            {/* Form */}
            <View className="mb-6">
              <AuthInput
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                icon="mail-outline"
                disabled={authLoading}
                delay={300}
              />

              <AuthInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                showPasswordToggle
                icon="lock-closed-outline"
                disabled={authLoading}
                delay={400}
              />

              {/* Forgot Password */}
              <Animated.View
                entering={FadeInDown.delay(500).duration(400)}
                className="items-end mb-2"
              >
                <Pressable onPress={handleForgotPassword} hitSlop={8}>
                  <Text className="text-gray-600 dark:text-gray-400 text-sm font-semibold">
                    Forgot Password?
                  </Text>
                </Pressable>
              </Animated.View>

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

            {/* Login Button */}
            <Animated.View entering={FadeInDown.delay(600).duration(400)}>
              <PrimaryButton
                label="Login"
                onPress={handleLogin}
                loading={authLoading}
                disabled={!isFormValid}
              />
            </Animated.View>

            {/* Divider */}
            <Animated.View
              entering={FadeIn.delay(700).duration(400)}
              className="flex-row items-center my-6"
            >
              <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <Text className="text-gray-400 dark:text-gray-500 text-sm px-4">
                or
              </Text>
              <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </Animated.View>

            {/* Social Login */}
            <Animated.View
              entering={FadeInDown.delay(800).duration(400)}
              className="flex-row gap-3"
            >
              <SocialButton
                label="Google"
                icon="logo-google"
                onPress={handleGoogleLogin}
                disabled={authLoading}
              />
              <SocialButton
                label="Apple"
                icon="logo-apple"
                onPress={handleAppleLogin}
                disabled={authLoading}
              />
            </Animated.View>

            {/* Signup Link */}
            <Animated.View
              entering={FadeInUp.delay(900).duration(400)}
              className="flex-row items-center justify-center mt-8"
            >
              <Text className="text-gray-500 dark:text-gray-400 text-base">
                Don't have an account?{" "}
              </Text>
              <Pressable onPress={navigateToSignup} hitSlop={8}>
                <Text className="text-gray-900 dark:text-white text-base font-bold">
                  Sign up
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
