import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  Dimensions,
  FlatList,
  ViewToken,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  interpolate,
  Extrapolation,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  runOnJS,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useAppDispatch } from "../store/hooks";
import { updateSettings } from "../store/slices/settingsSlice";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

// ============ TYPES ============
type IncomeType = "salary" | "freelance" | "mixed";
type GoalType = "travel" | "emergency" | "debt" | "gadgets";

interface OnboardingState {
  incomeType: IncomeType | null;
  goals: GoalType[];
}

// ============ REUSABLE COMPONENTS ============

// Progress Dots Component
interface ProgressDotsProps {
  total: number;
  current: number;
}

function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <View className="flex-row items-center justify-center gap-2 py-4">
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === current;
        const isPast = index < current;
        return (
          <AnimatedView
            key={index}
            entering={FadeIn.delay(index * 50)}
            className={`h-2 rounded-full ${
              isActive
                ? "w-8 bg-gray-900 dark:bg-white"
                : isPast
                  ? "w-2 bg-gray-700 dark:bg-gray-300"
                  : "w-2 bg-gray-200 dark:bg-gray-700"
            }`}
          />
        );
      })}
    </View>
  );
}

// Primary Button Component
interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  icon,
}: PrimaryButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const bgClass =
    variant === "primary"
      ? "bg-gray-900 dark:bg-white"
      : variant === "secondary"
        ? "bg-gray-100 dark:bg-gray-800"
        : "bg-transparent";

  const textClass =
    variant === "primary"
      ? "text-white dark:text-gray-900"
      : variant === "secondary"
        ? "text-gray-900 dark:text-white"
        : "text-gray-900 dark:text-white";

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        animatedStyle,
        {
          shadowColor: variant === "primary" ? "#111827" : "transparent",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: variant === "primary" ? 8 : 0,
        },
      ]}
      className={`${bgClass} rounded-2xl py-5 px-8 flex-row items-center justify-center ${
        disabled ? "opacity-50" : ""
      }`}
    >
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
    </AnimatedPressable>
  );
}

// Option Card Component
interface OptionCardProps {
  label: string;
  description?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBgColor: string;
  selected: boolean;
  onPress: () => void;
  delay?: number;
}

function OptionCard({
  label,
  description,
  icon,
  iconColor,
  iconBgColor,
  selected,
  onPress,
  delay = 0,
}: OptionCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      entering={FadeInDown.delay(delay).duration(400)}
      style={[
        animatedStyle,
        {
          shadowColor: selected ? "#111827" : "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: selected ? 0.2 : 0.08,
          shadowRadius: 12,
          elevation: selected ? 6 : 3,
        },
      ]}
      className={`rounded-2xl p-5 mb-3 flex-row items-center ${
        selected
          ? "bg-gray-100 dark:bg-gray-700 border-2 border-gray-900 dark:border-white"
          : "bg-white dark:bg-gray-800 border-2 border-transparent"
      }`}
    >
      <View
        className={`w-14 h-14 rounded-2xl items-center justify-center ${iconBgColor}`}
      >
        <Ionicons name={icon} size={26} color={iconColor} />
      </View>
      <View className="flex-1 ml-4">
        <Text className="text-gray-900 dark:text-white text-lg font-bold tracking-tight">
          {label}
        </Text>
        {description && (
          <Text className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            {description}
          </Text>
        )}
      </View>
      <View
        className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
          selected
            ? "bg-gray-900 dark:bg-white border-gray-900 dark:border-white"
            : "border-gray-300 dark:border-gray-600"
        }`}
      >
        {selected && (
          <Ionicons
            name="checkmark"
            size={14}
            color={selected ? "#fff" : "#111827"}
          />
        )}
      </View>
    </AnimatedPressable>
  );
}

// Multi-Select Chip Component
interface SelectChipProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
  delay?: number;
}

function SelectChip({
  label,
  icon,
  selected,
  onPress,
  delay = 0,
}: SelectChipProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      entering={FadeInDown.delay(delay).duration(300)}
      style={animatedStyle}
      className={`rounded-2xl px-5 py-4 mr-3 mb-3 flex-row items-center ${
        selected
          ? "bg-gray-900 dark:bg-white"
          : "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      }`}
    >
      <Ionicons
        name={icon}
        size={20}
        color={selected ? "#fff" : "#6b7280"}
        style={{ marginRight: 8 }}
      />
      <Text
        className={`text-base font-semibold ${
          selected
            ? "text-white dark:text-gray-900"
            : "text-gray-700 dark:text-gray-300"
        }`}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

// Onboarding Card Wrapper
interface OnboardingCardProps {
  children: React.ReactNode;
}

function OnboardingCard({ children }: OnboardingCardProps) {
  return (
    <View style={{ width: SCREEN_WIDTH }} className="flex-1 px-6">
      {children}
    </View>
  );
}

// Value Prop Card Component
interface ValuePropCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBgColor: string;
  title: string;
  description: string;
  delay?: number;
}

function ValuePropCard({
  icon,
  iconColor,
  iconBgColor,
  title,
  description,
  delay = 0,
}: ValuePropCardProps) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);

  React.useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500 }),
        withTiming(0.5, { duration: 1500 }),
      ),
      -1,
      true,
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(500)}
      style={{
        shadowColor: iconColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 4,
      }}
      className="bg-white dark:bg-gray-800 rounded-3xl p-6 mb-4"
    >
      <View className="flex-row items-center">
        <View className="relative">
          <AnimatedView
            style={glowStyle}
            className={`absolute -inset-2 ${iconBgColor} rounded-full opacity-50`}
          />
          <View
            className={`w-14 h-14 rounded-2xl items-center justify-center ${iconBgColor}`}
          >
            <Ionicons name={icon} size={28} color={iconColor} />
          </View>
        </View>
        <View className="flex-1 ml-4">
          <Text className="text-gray-900 dark:text-white text-lg font-bold tracking-tight">
            {title}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {description}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ============ SCREEN COMPONENTS ============

// 1. Welcome Screen
function WelcomeScreen() {
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);

  React.useEffect(() => {
    logoOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
    logoScale.value = withSpring(1, { damping: 12, stiffness: 100 });
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  return (
    <View className="flex-1 items-center justify-center px-8">
      {/* Logo Placeholder */}
      <AnimatedView
        style={[
          logoStyle,
          {
            shadowColor: "#111827",
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.3,
            shadowRadius: 24,
            elevation: 12,
          },
        ]}
        className="w-32 h-32 bg-gray-900 dark:bg-white rounded-[40px] items-center justify-center mb-10"
      >
        <Ionicons name="wallet" size={64} color="#fff" />
      </AnimatedView>

      {/* Headline */}
      <Animated.Text
        entering={FadeInDown.delay(300).duration(600)}
        className="text-gray-900 dark:text-white text-4xl font-bold text-center tracking-tight mb-4"
      >
        Your Smart{"\n"}Money Coach
      </Animated.Text>

      {/* Subtext */}
      <Animated.Text
        entering={FadeInDown.delay(500).duration(600)}
        className="text-gray-500 dark:text-gray-400 text-lg text-center leading-7"
      >
        Track, plan, and grow your money with AI.{"\n"}Your financial success
        starts here.
      </Animated.Text>

      {/* Decorative Elements */}
      <AnimatedView
        entering={FadeIn.delay(700)}
        className="absolute top-20 left-8 w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"
      />
      <AnimatedView
        entering={FadeIn.delay(800)}
        className="absolute top-32 right-12 w-4 h-4 rounded-full bg-gray-400 dark:bg-gray-500"
      />
      <AnimatedView
        entering={FadeIn.delay(900)}
        className="absolute bottom-40 left-12 w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400"
      />
      <AnimatedView
        entering={FadeIn.delay(1000)}
        className="absolute bottom-48 right-16 w-3 h-3 rounded-full bg-gray-600 dark:bg-gray-300"
      />
    </View>
  );
}

// 2. Value Props Screen
function ValuePropsScreen() {
  return (
    <View className="flex-1 pt-8">
      <Animated.Text
        entering={FadeInDown.duration(500)}
        className="text-gray-900 dark:text-white text-3xl font-bold text-center tracking-tight mb-2"
      >
        Why Finuxx?
      </Animated.Text>
      <Animated.Text
        entering={FadeInDown.delay(100).duration(500)}
        className="text-gray-500 dark:text-gray-400 text-base text-center mb-8"
      >
        Everything you need to master your finances
      </Animated.Text>

      <View className="flex-1 justify-center px-2">
        <ValuePropCard
          icon="scan-outline"
          iconColor="#22c55e"
          iconBgColor="bg-emerald-100 dark:bg-emerald-500/20"
          title="Track Expenses Automatically"
          description="Smart categorization that learns your spending habits"
          delay={200}
        />
        <ValuePropCard
          icon="pie-chart-outline"
          iconColor="#3b82f6"
          iconBgColor="bg-blue-100 dark:bg-blue-500/20"
          title="Build Smart Budgets"
          description="AI-powered budgets that adapt to your lifestyle"
          delay={350}
        />
        <ValuePropCard
          icon="rocket-outline"
          iconColor="#8b5cf6"
          iconBgColor="bg-violet-100 dark:bg-violet-500/20"
          title="Reach Goals Faster"
          description="Personalized coaching to accelerate your savings"
          delay={500}
        />
      </View>
    </View>
  );
}

// 3. Income Setup Screen
interface IncomeSetupScreenProps {
  selectedIncome: IncomeType | null;
  onSelectIncome: (type: IncomeType) => void;
}

function IncomeSetupScreen({
  selectedIncome,
  onSelectIncome,
}: IncomeSetupScreenProps) {
  const incomeOptions: {
    type: IncomeType;
    label: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    iconBgColor: string;
  }[] = [
    {
      type: "salary",
      label: "Salary",
      description: "Regular paycheck from employer",
      icon: "briefcase-outline",
      iconColor: "#3b82f6",
      iconBgColor: "bg-blue-100 dark:bg-blue-500/20",
    },
    {
      type: "freelance",
      label: "Freelance",
      description: "Variable income from clients",
      icon: "laptop-outline",
      iconColor: "#8b5cf6",
      iconBgColor: "bg-violet-100 dark:bg-violet-500/20",
    },
    {
      type: "mixed",
      label: "Mixed",
      description: "Both salary and side income",
      icon: "layers-outline",
      iconColor: "#22c55e",
      iconBgColor: "bg-emerald-100 dark:bg-emerald-500/20",
    },
  ];

  return (
    <View className="flex-1 pt-8">
      <Animated.Text
        entering={FadeInDown.duration(500)}
        className="text-gray-900 dark:text-white text-3xl font-bold text-center tracking-tight mb-2"
      >
        How do you get paid?
      </Animated.Text>
      <Animated.Text
        entering={FadeInDown.delay(100).duration(500)}
        className="text-gray-500 dark:text-gray-400 text-base text-center mb-8"
      >
        This helps us personalize your experience
      </Animated.Text>

      <View className="flex-1 justify-center px-2">
        {incomeOptions.map((option, index) => (
          <OptionCard
            key={option.type}
            label={option.label}
            description={option.description}
            icon={option.icon}
            iconColor={option.iconColor}
            iconBgColor={option.iconBgColor}
            selected={selectedIncome === option.type}
            onPress={() => onSelectIncome(option.type)}
            delay={200 + index * 100}
          />
        ))}
      </View>
    </View>
  );
}

// 4. Goals Setup Screen
interface GoalsSetupScreenProps {
  selectedGoals: GoalType[];
  onToggleGoal: (goal: GoalType) => void;
}

function GoalsSetupScreen({
  selectedGoals,
  onToggleGoal,
}: GoalsSetupScreenProps) {
  const goalOptions: {
    type: GoalType;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    { type: "travel", label: "Travel", icon: "airplane-outline" },
    {
      type: "emergency",
      label: "Emergency Fund",
      icon: "shield-checkmark-outline",
    },
    { type: "debt", label: "Debt Payoff", icon: "trending-down-outline" },
    { type: "gadgets", label: "Gadgets", icon: "phone-portrait-outline" },
  ];

  return (
    <View className="flex-1 pt-8">
      <Animated.Text
        entering={FadeInDown.duration(500)}
        className="text-gray-900 dark:text-white text-3xl font-bold text-center tracking-tight mb-2"
      >
        What are you saving for?
      </Animated.Text>
      <Animated.Text
        entering={FadeInDown.delay(100).duration(500)}
        className="text-gray-500 dark:text-gray-400 text-base text-center mb-8"
      >
        Select all that apply
      </Animated.Text>

      <View className="flex-1 justify-center px-2">
        <View className="flex-row flex-wrap justify-center">
          {goalOptions.map((option, index) => (
            <SelectChip
              key={option.type}
              label={option.label}
              icon={option.icon}
              selected={selectedGoals.includes(option.type)}
              onPress={() => onToggleGoal(option.type)}
              delay={200 + index * 80}
            />
          ))}
        </View>

        {/* Selected Goals Summary */}
        {selectedGoals.length > 0 && (
          <Animated.View
            entering={FadeInUp.duration(400)}
            className="mt-8 bg-gray-100 dark:bg-gray-800 rounded-2xl p-4"
          >
            <Text className="text-gray-700 dark:text-gray-300 text-center text-sm font-medium">
              {selectedGoals.length} goal{selectedGoals.length > 1 ? "s" : ""}{" "}
              selected — We'll help you get there! 🎯
            </Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

// 5. Meet AI Coach Screen
function MeetCoachScreen() {
  const pulseScale = useSharedValue(1);
  const bubbleOpacity = useSharedValue(0);

  React.useEffect(() => {
    // Avatar pulse
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 }),
      ),
      -1,
      true,
    );

    // Chat bubble fade in
    bubbleOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
  }, []);

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const bubbleStyle = useAnimatedStyle(() => ({
    opacity: bubbleOpacity.value,
  }));

  return (
    <View className="flex-1 pt-8">
      <Animated.Text
        entering={FadeInDown.duration(500)}
        className="text-gray-900 dark:text-white text-3xl font-bold text-center tracking-tight mb-2"
      >
        Meet Your AI Coach
      </Animated.Text>
      <Animated.Text
        entering={FadeInDown.delay(100).duration(500)}
        className="text-gray-500 dark:text-gray-400 text-base text-center mb-8"
      >
        Always here to help you succeed
      </Animated.Text>

      <View className="flex-1 items-center justify-center px-4">
        {/* AI Avatar */}
        <AnimatedView
          style={[
            avatarStyle,
            {
              shadowColor: "#8b5cf6",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.3,
              shadowRadius: 24,
              elevation: 12,
            },
          ]}
          className="w-32 h-32 bg-violet-500 rounded-full items-center justify-center mb-6"
        >
          <Ionicons name="sparkles" size={56} color="#fff" />
        </AnimatedView>

        {/* Chat Bubble */}
        <AnimatedView
          style={[
            bubbleStyle,
            {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            },
          ]}
          className="bg-white dark:bg-gray-800 rounded-3xl p-6 mx-4 max-w-sm"
        >
          {/* Chat bubble tail */}
          <View
            className="absolute -top-3 left-1/2 -ml-3 w-6 h-6 bg-white dark:bg-gray-800"
            style={{ transform: [{ rotate: "45deg" }] }}
          />
          <Text className="text-gray-700 dark:text-gray-200 text-lg text-center leading-7">
            "Hi! I'm your personal finance coach. I'll help you build a budget,
            save smarter, and reach your goals faster! 💪"
          </Text>
        </AnimatedView>

        {/* Features List */}
        <Animated.View
          entering={FadeInUp.delay(800).duration(500)}
          className="mt-8"
        >
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 bg-emerald-100 dark:bg-emerald-500/20 rounded-full items-center justify-center">
              <Ionicons name="checkmark" size={18} color="#22c55e" />
            </View>
            <Text className="text-gray-600 dark:text-gray-300 text-sm ml-3">
              Personalized budget recommendations
            </Text>
          </View>
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 bg-emerald-100 dark:bg-emerald-500/20 rounded-full items-center justify-center">
              <Ionicons name="checkmark" size={18} color="#22c55e" />
            </View>
            <Text className="text-gray-600 dark:text-gray-300 text-sm ml-3">
              Smart savings insights
            </Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-emerald-100 dark:bg-emerald-500/20 rounded-full items-center justify-center">
              <Ionicons name="checkmark" size={18} color="#22c55e" />
            </View>
            <Text className="text-gray-600 dark:text-gray-300 text-sm ml-3">
              24/7 financial guidance
            </Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

// ============ MAIN ONBOARDING SCREEN ============
export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [state, setState] = useState<OnboardingState>({
    incomeType: null,
    goals: [],
  });

  const flatListRef = useRef<FlatList>(null);
  const totalSteps = 5;
  const dispatch = useAppDispatch();

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentStep + 1,
        animated: true,
      });
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep]);

  const handleSelectIncome = (type: IncomeType) => {
    setState((prev) => ({ ...prev, incomeType: type }));
  };

  const handleToggleGoal = (goal: GoalType) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const handleComplete = () => {
    // Persist onboarding preferences to backend settings
    if (state.incomeType || state.goals.length > 0) {
      dispatch(
        updateSettings({
          incomeType: state.incomeType ?? undefined,
          financialGoals: state.goals.length > 0 ? state.goals : undefined,
        }),
      );
    }
    // Navigate to main app
    // In a real app: navigation.replace('MainTabs')
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== currentStep && index >= 0 && index < totalSteps) {
      setCurrentStep(index);
    }
  };

  const renderScreen = ({ index }: { item: number; index: number }) => {
    switch (index) {
      case 0:
        return (
          <OnboardingCard>
            <WelcomeScreen />
          </OnboardingCard>
        );
      case 1:
        return (
          <OnboardingCard>
            <ValuePropsScreen />
          </OnboardingCard>
        );
      case 2:
        return (
          <OnboardingCard>
            <IncomeSetupScreen
              selectedIncome={state.incomeType}
              onSelectIncome={handleSelectIncome}
            />
          </OnboardingCard>
        );
      case 3:
        return (
          <OnboardingCard>
            <GoalsSetupScreen
              selectedGoals={state.goals}
              onToggleGoal={handleToggleGoal}
            />
          </OnboardingCard>
        );
      case 4:
        return (
          <OnboardingCard>
            <MeetCoachScreen />
          </OnboardingCard>
        );
      default:
        return null;
    }
  };

  const getButtonLabel = () => {
    switch (currentStep) {
      case 0:
        return "Get Started";
      case 4:
        return "Start Using App";
      default:
        return "Continue";
    }
  };

  const canContinue = () => {
    switch (currentStep) {
      case 2:
        return state.incomeType !== null;
      case 3:
        return state.goals.length > 0;
      default:
        return true;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Progress Dots */}
      <ProgressDots total={totalSteps} current={currentStep} />

      {/* Pager */}
      <FlatList
        ref={flatListRef}
        data={[0, 1, 2, 3, 4]}
        renderItem={renderScreen}
        keyExtractor={(item) => item.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        scrollEnabled={true}
        className="flex-1"
      />

      {/* Bottom Actions */}
      <View className="px-6 pb-4">
        <PrimaryButton
          label={getButtonLabel()}
          onPress={currentStep === 4 ? handleComplete : handleNext}
          disabled={!canContinue()}
          icon={currentStep === 4 ? "rocket" : "arrow-forward"}
        />
      </View>
    </SafeAreaView>
  );
}
