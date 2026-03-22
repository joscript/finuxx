import React, { useEffect } from "react";
import { View, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  FadeIn,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const BUTTON_SIZE = 56;
const MARGIN = 20;

export interface FloatingChatButtonProps {
  onPress: () => void;
}

export function FloatingChatButton({ onPress }: FloatingChatButtonProps) {
  const translateX = useSharedValue(SCREEN_WIDTH - BUTTON_SIZE - MARGIN);
  const translateY = useSharedValue(SCREEN_HEIGHT - BUTTON_SIZE - 140);
  const contextX = useSharedValue(0);
  const contextY = useSharedValue(0);
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);
  const isDragging = useSharedValue(false);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1500 }),
        withTiming(0.4, { duration: 1500 }),
      ),
      -1,
      true,
    );
  }, []);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      contextX.value = translateX.value;
      contextY.value = translateY.value;
      isDragging.value = true;
      scale.value = withSpring(1.1);
    })
    .onUpdate((event) => {
      const newX = contextX.value + event.translationX;
      const newY = contextY.value + event.translationY;
      translateX.value = Math.max(
        MARGIN,
        Math.min(newX, SCREEN_WIDTH - BUTTON_SIZE - MARGIN),
      );
      translateY.value = Math.max(
        MARGIN + 60,
        Math.min(newY, SCREEN_HEIGHT - BUTTON_SIZE - 100),
      );
    })
    .onEnd(() => {
      isDragging.value = false;
      scale.value = withSpring(1);
      const snapToRight = translateX.value > (SCREEN_WIDTH - BUTTON_SIZE) / 2;
      translateX.value = withSpring(
        snapToRight ? SCREEN_WIDTH - BUTTON_SIZE - MARGIN : MARGIN,
        { damping: 15, stiffness: 150 },
      );
    });

  const tapGesture = Gesture.Tap()
    .onStart(() => {
      scale.value = withSpring(0.9);
    })
    .onEnd(() => {
      scale.value = withSpring(1);
      runOnJS(onPress)();
    });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: isDragging.value ? 0.8 : glowOpacity.value,
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        entering={FadeIn.duration(400).delay(800)}
        style={[
          buttonStyle,
          {
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 999,
          },
        ]}
      >
        <Animated.View
          style={glowStyle}
          className="absolute -inset-2 bg-gray-900 rounded-full"
        />
        <View
          style={{
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 10,
          }}
          className="bg-gray-900 rounded-full items-center justify-center"
        >
          <Ionicons name="sparkles" size={24} color="#fff" />
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
