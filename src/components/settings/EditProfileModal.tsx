import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { updateProfile } from "../../store/slices/authSlice";

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function EditProfileModal({
  visible,
  onClose,
}: EditProfileModalProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible && user) {
      setName(user.name);
      setError("");
    }
  }, [visible, user]);

  const handleClose = () => {
    setError("");
    onClose();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const result = await dispatch(updateProfile({ name: name.trim() }));
      if (updateProfile.fulfilled.match(result)) {
        handleClose();
      } else {
        setError((result.payload as string) || "Failed to update profile.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = name.trim().length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-white dark:bg-gray-900"
      >
        <SafeAreaView className="flex-1" edges={["top"]}>
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <Pressable
              onPress={handleClose}
              className="w-10 h-10 items-center justify-center"
            >
              <Ionicons name="close" size={28} color="#6b7280" />
            </Pressable>
            <Text className="text-gray-900 dark:text-white text-lg font-bold">
              Edit Profile
            </Text>
            <View className="w-10" />
          </View>

          <View className="flex-1 px-6 pt-8">
            {/* Avatar placeholder */}
            <View className="items-center mb-8">
              <View className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-500/20 items-center justify-center">
                <Ionicons name="person" size={44} color="#22c55e" />
              </View>
              <Text className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                Avatar upload coming soon
              </Text>
            </View>

            {/* Name Input */}
            <View className="mb-6">
              <Text className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2 uppercase tracking-wide">
                Full Name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                placeholderTextColor="#9ca3af"
                className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-5 py-4 text-gray-900 dark:text-white text-base"
                autoFocus
              />
            </View>

            {/* Email (read-only) */}
            <View className="mb-6">
              <Text className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2 uppercase tracking-wide">
                Email
              </Text>
              <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-5 py-4 flex-row items-center">
                <Text className="text-gray-500 dark:text-gray-400 text-base flex-1">
                  {user?.email}
                </Text>
                <Ionicons
                  name="lock-closed-outline"
                  size={16}
                  color="#9ca3af"
                />
              </View>
            </View>

            {error ? (
              <View className="bg-red-50 dark:bg-red-500/10 rounded-xl px-4 py-3 mb-4">
                <Text className="text-red-500 text-sm">{error}</Text>
              </View>
            ) : null}
          </View>

          {/* Save Button */}
          <View className="px-6 pb-8">
            <Pressable
              onPress={handleSave}
              disabled={isLoading || !isFormValid}
              className={`rounded-2xl py-4 items-center ${
                isLoading || !isFormValid
                  ? "bg-gray-200 dark:bg-gray-700"
                  : "bg-gray-900 dark:bg-white active:opacity-80"
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text
                  className={`text-base font-semibold ${
                    isLoading || !isFormValid
                      ? "text-gray-400 dark:text-gray-500"
                      : "text-white dark:text-gray-900"
                  }`}
                >
                  Save Changes
                </Text>
              )}
            </Pressable>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
