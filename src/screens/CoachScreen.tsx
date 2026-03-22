import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
  ListRenderItem,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
  FadeInDown,
  FadeInUp,
  FadeIn,
  SlideInRight,
  SlideInLeft,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchCoachMessages,
  sendCoachMessage,
} from "../store/slices/coachSlice";
import type { CoachMessage } from "../api/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============ TYPES ============
type MessageType = "user" | "ai" | "suggestion";

interface Message {
  id: string;
  type: MessageType;
  text: string;
  timestamp: Date;
  suggestions?: string[];
}

// ============ CONSTANTS ============
const QUICK_SUGGESTIONS = [
  "Create a budget",
  "Analyze my spending",
  "How can I save more?",
  "Pay off debt faster",
];

function coachMessageToMessage(cm: CoachMessage): Message {
  return {
    id: cm.id,
    type: cm.type,
    text: cm.message,
    timestamp: new Date(cm.createdAt),
    suggestions: cm.suggestions ?? undefined,
  };
}

// ============ HELPER FUNCTIONS ============
function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ============ TYPING INDICATOR COMPONENT ============
function TypingIndicator() {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    dot1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    dot2.value = withDelay(
      150,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
    dot3.value = withDelay(
      300,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot1.value, [0, 1], [0.3, 1]),
    transform: [{ translateY: interpolate(dot1.value, [0, 1], [0, -4]) }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot2.value, [0, 1], [0.3, 1]),
    transform: [{ translateY: interpolate(dot2.value, [0, 1], [0, -4]) }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot3.value, [0, 1], [0.3, 1]),
    transform: [{ translateY: interpolate(dot3.value, [0, 1], [0, -4]) }],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      className="flex-row items-start mb-4 px-5"
    >
      {/* AI Avatar */}
      <View className="w-8 h-8 rounded-full bg-white/10 items-center justify-center mr-3">
        <Ionicons name="sparkles" size={16} color="#ffffff" />
      </View>

      {/* Typing Bubble */}
      <View className="bg-gray-800 rounded-2xl rounded-tl-sm px-5 py-4 flex-row items-center">
        <Animated.View
          style={dot1Style}
          className="w-2.5 h-2.5 rounded-full bg-white mr-1.5"
        />
        <Animated.View
          style={dot2Style}
          className="w-2.5 h-2.5 rounded-full bg-white mr-1.5"
        />
        <Animated.View
          style={dot3Style}
          className="w-2.5 h-2.5 rounded-full bg-white"
        />
      </View>
    </Animated.View>
  );
}

// ============ SKELETON CHAT COMPONENT ============
function SkeletonChat() {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.7, 0.3]),
  }));

  const SkeletonBubble = ({
    isUser,
    width,
  }: {
    isUser: boolean;
    width: number;
  }) => (
    <View
      className={`flex-row items-start mb-4 px-5 ${isUser ? "justify-end" : ""}`}
    >
      {!isUser && (
        <Animated.View
          style={shimmerStyle}
          className="w-8 h-8 rounded-full bg-gray-700 mr-3"
        />
      )}
      <Animated.View
        style={[shimmerStyle, { width }]}
        className={`h-16 rounded-2xl ${
          isUser ? "bg-white/20 rounded-tr-sm" : "bg-gray-700 rounded-tl-sm"
        }`}
      />
    </View>
  );

  return (
    <View className="flex-1 pt-4">
      <SkeletonBubble isUser={false} width={SCREEN_WIDTH * 0.7} />
      <SkeletonBubble isUser={true} width={SCREEN_WIDTH * 0.5} />
      <SkeletonBubble isUser={false} width={SCREEN_WIDTH * 0.65} />
      <SkeletonBubble isUser={false} width={SCREEN_WIDTH * 0.55} />
    </View>
  );
}

// ============ SUGGESTION CHIP COMPONENT ============
interface SuggestionChipProps {
  text: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
}

function SuggestionChip({
  text,
  onPress,
  variant = "secondary",
}: SuggestionChipProps) {
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

  const isPrimary = variant === "primary";

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className={`px-4 py-2.5 rounded-full mr-2 mb-2 ${
          isPrimary ? "bg-white" : "bg-white/10 border border-white/20"
        }`}
      >
        <Text
          className={`text-sm font-medium ${
            isPrimary ? "text-gray-900" : "text-white"
          }`}
        >
          {text}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ============ MESSAGE BUBBLE COMPONENT ============
interface MessageBubbleProps {
  message: Message;
  onSuggestionPress?: (suggestion: string) => void;
}

function MessageBubble({ message, onSuggestionPress }: MessageBubbleProps) {
  const isUser = message.type === "user";
  const enteringAnimation = isUser
    ? SlideInRight.duration(400)
    : SlideInLeft.duration(400);

  return (
    <Animated.View
      entering={enteringAnimation}
      className={`mb-4 px-5 ${isUser ? "items-end" : "items-start"}`}
    >
      <View
        className={`flex-row items-end ${isUser ? "flex-row-reverse" : ""}`}
      >
        {/* AI Avatar */}
        {!isUser && (
          <View className="w-8 h-8 rounded-full bg-white/10 items-center justify-center mr-3 mb-1">
            <Ionicons name="sparkles" size={16} color="#ffffff" />
          </View>
        )}

        {/* Message Content */}
        <View className={`max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
          {/* Bubble */}
          {isUser ? (
            <View
              className="bg-white rounded-2xl rounded-tr-sm px-4 py-3"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text className="text-gray-900 text-base leading-6">
                {message.text}
              </Text>
            </View>
          ) : (
            <View
              className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Text className="text-gray-100 text-base leading-6">
                {message.text}
              </Text>
            </View>
          )}

          {/* Timestamp */}
          <Text
            className={`text-xs mt-1.5 ${
              isUser ? "text-gray-500" : "text-gray-500 ml-0.5"
            }`}
          >
            {formatTime(message.timestamp)}
          </Text>

          {/* Inline Suggestions */}
          {/* {message.suggestions && message.suggestions.length > 0 && (
            <View className="flex-row flex-wrap mt-3">
              {message.suggestions.map((suggestion, index) => (
                <SuggestionChip
                  key={index}
                  text={suggestion}
                  onPress={() => onSuggestionPress?.(suggestion)}
                  variant={index === 0 ? "primary" : "secondary"}
                />
              ))}
            </View>
          )} */}
        </View>
      </View>
    </Animated.View>
  );
}

// ============ HEADER COMPONENT ============
interface ChatHeaderProps {
  onBackPress?: () => void;
}

function ChatHeader({ onBackPress }: ChatHeaderProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      className="px-5 py-4 border-b border-gray-800"
    >
      <View className="flex-row items-center">
        {/* Back Button */}
        <Pressable
          onPress={onBackPress}
          className="w-10 h-10 bg-gray-800 rounded-full items-center justify-center mr-3 active:bg-gray-700"
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>

        {/* AI Avatar */}
        <View className="relative">
          <View
            className="w-11 h-11 rounded-full bg-white/10 items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Ionicons name="sparkles" size={22} color="#ffffff" />
          </View>
          {/* Online Status Dot */}
          <View className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-gray-900" />
        </View>

        {/* Title & Subtitle */}
        <View className="ml-3 flex-1">
          <Text className="text-white text-lg font-bold tracking-tight">
            AI Coach
          </Text>
          <View className="flex-row items-center">
            <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
            <Text className="text-gray-400 text-sm">
              Your personal finance guide
            </Text>
          </View>
        </View>

        {/* Menu Button */}
        <Pressable className="w-10 h-10 bg-gray-800 rounded-full items-center justify-center active:bg-gray-700">
          <Ionicons name="ellipsis-vertical" size={20} color="#9ca3af" />
        </Pressable>
      </View>
    </Animated.View>
  );
}

// ============ QUICK SUGGESTIONS ROW ============
interface QuickSuggestionsProps {
  suggestions: string[];
  onSuggestionPress: (suggestion: string) => void;
}

function QuickSuggestions({
  suggestions,
  onSuggestionPress,
}: QuickSuggestionsProps) {
  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(200)}
      className="border-t border-gray-800"
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12 }}
      >
        {suggestions.map((suggestion, index) => (
          <SuggestionChip
            key={index}
            text={suggestion}
            onPress={() => onSuggestionPress(suggestion)}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
}

// ============ INPUT BAR COMPONENT ============
interface InputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onAttachPress?: () => void;
}

function InputBar({
  value,
  onChangeText,
  onSend,
  onAttachPress,
}: InputBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderScale = useSharedValue(0);
  const sendButtonScale = useSharedValue(1);

  useEffect(() => {
    borderScale.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
  }, [isFocused]);

  const containerStyle = useAnimatedStyle(() => ({
    borderColor: isFocused ? "#ffffff" : "transparent",
    borderWidth: interpolate(borderScale.value, [0, 1], [1, 2]),
  }));

  const sendButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendButtonScale.value }],
    opacity: value.trim().length > 0 ? 1 : 0.5,
  }));

  const handleSendPressIn = () => {
    sendButtonScale.value = withSpring(0.9);
  };

  const handleSendPressOut = () => {
    sendButtonScale.value = withSpring(1);
  };

  const handleSend = () => {
    if (value.trim().length > 0) {
      onSend();
    }
  };

  return (
    <Animated.View
      entering={FadeInUp.duration(400)}
      className="px-5 py-3 border-t border-gray-800"
    >
      <Animated.View
        style={containerStyle}
        className="flex-row items-center bg-gray-800 rounded-full px-4 py-2"
      >
        {/* Attachment Button */}
        <Pressable
          onPress={onAttachPress}
          className="w-9 h-9 items-center justify-center active:opacity-60"
        >
          <Ionicons name="add-circle-outline" size={24} color="#9ca3af" />
        </Pressable>

        {/* Text Input */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Ask your AI coach..."
          placeholderTextColor="#6b7280"
          className="flex-1 text-white text-base px-3 py-2"
          multiline
          maxLength={500}
        />

        {/* Send Button */}
        <Animated.View style={sendButtonStyle}>
          <Pressable
            onPress={handleSend}
            onPressIn={handleSendPressIn}
            onPressOut={handleSendPressOut}
            disabled={value.trim().length === 0}
            className="w-10 h-10 bg-white rounded-full items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Ionicons name="send" size={18} color="#111827" />
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

// ============ MAIN COACH SCREEN ============
export default function CoachScreen() {
  const dispatch = useAppDispatch();
  const {
    messages: coachMessages,
    isLoading: reduxLoading,
    isSending,
  } = useAppSelector((state) => state.coach);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation();

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Fetch messages on mount
  useEffect(() => {
    dispatch(fetchCoachMessages({ limit: 50 }));
  }, [dispatch]);

  // Sync Redux messages to local state (reversed for inverted FlatList)
  useEffect(() => {
    if (coachMessages.length > 0) {
      const mapped = coachMessages.map(coachMessageToMessage).reverse();
      setMessages(mapped);
    } else if (!reduxLoading && coachMessages.length === 0) {
      // Show welcome message when no history exists
      setMessages([
        {
          id: "welcome",
          type: "ai",
          text: "Hi there! 👋 I'm your AI Finance Coach. I'm here to help you make smarter money decisions, build better habits, and reach your financial goals. Ask me anything!",
          timestamp: new Date(),
          suggestions: [
            "Analyze my spending",
            "How can I save more?",
            "Create a budget",
          ],
        },
      ]);
    }
  }, [coachMessages, reduxLoading]);

  // Show typing indicator while sending
  useEffect(() => {
    setIsTyping(isSending);
  }, [isSending]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = useCallback(() => {
    if (inputText.trim().length === 0 || isSending) return;

    const text = inputText.trim();
    setInputText("");

    // Optimistically add user message to local state
    const optimisticUserMsg: Message = {
      id: `temp-${Date.now()}`,
      type: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [optimisticUserMsg, ...prev]);

    // Dispatch real API call
    dispatch(sendCoachMessage(text));
  }, [inputText, isSending, dispatch]);

  const handleSuggestionPress = useCallback((suggestion: string) => {
    setInputText(suggestion);
  }, []);

  const handleQuickSuggestionPress = useCallback(
    (suggestion: string) => {
      if (isSending) return;

      // Optimistically add user message
      const optimisticUserMsg: Message = {
        id: `temp-${Date.now()}`,
        type: "user",
        text: suggestion,
        timestamp: new Date(),
      };
      setMessages((prev) => [optimisticUserMsg, ...prev]);

      // Dispatch real API call
      dispatch(sendCoachMessage(suggestion));
    },
    [isSending, dispatch],
  );

  const handleAttachPress = useCallback(() => {
    console.log("Attachment pressed");
  }, []);

  const renderMessage: ListRenderItem<Message> = useCallback(
    ({ item }) => (
      <MessageBubble message={item} onSuggestionPress={handleSuggestionPress} />
    ),
    [handleSuggestionPress],
  );

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const ListHeaderComponent = useCallback(() => {
    if (isTyping) {
      return <TypingIndicator />;
    }
    return null;
  }, [isTyping]);

  if (reduxLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900" edges={["top"]}>
        <ChatHeader onBackPress={handleBackPress} />
        <SkeletonChat />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <ChatHeader onBackPress={handleBackPress} />

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          inverted
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16 }}
          ListHeaderComponent={ListHeaderComponent}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
        />

        {/* Quick Suggestions */}
        <QuickSuggestions
          suggestions={QUICK_SUGGESTIONS}
          onSuggestionPress={handleQuickSuggestionPress}
        />

        {/* Input Bar */}
        <InputBar
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSendMessage}
          onAttachPress={handleAttachPress}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
