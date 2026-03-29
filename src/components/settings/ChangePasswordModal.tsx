import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppDispatch } from "../../store/hooks";
import { updatePassword } from "../../store/slices/authSlice";

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({
  visible,
  onClose,
}: ChangePasswordModalProps) {
  const dispatch = useAppDispatch();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const result = await dispatch(
        updatePassword({ currentPassword, newPassword }),
      );
      if (updatePassword.fulfilled.match(result)) {
        Alert.alert("Success", "Your password has been updated.", [
          { text: "OK", onPress: handleClose },
        ]);
      } else {
        setError((result.payload as string) || "Failed to update password.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = !!(currentPassword && newPassword && confirmPassword);

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
              Change Password
            </Text>
            <View className="w-10" />
          </View>

          <ScrollView
            className="flex-1 px-6 pt-8"
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Current Password */}
            <View className="mb-5">
              <Text className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2 uppercase tracking-wide">
                Current Password
              </Text>
              <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-2xl px-5">
                <TextInput
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showCurrent}
                  className="flex-1 py-4 text-gray-900 dark:text-white text-base"
                />
                <Pressable onPress={() => setShowCurrent(!showCurrent)}>
                  <Ionicons
                    name={showCurrent ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#9ca3af"
                  />
                </Pressable>
              </View>
            </View>

            {/* New Password */}
            <View className="mb-5">
              <Text className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2 uppercase tracking-wide">
                New Password
              </Text>
              <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-2xl px-5">
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Minimum 8 characters"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showNew}
                  className="flex-1 py-4 text-gray-900 dark:text-white text-base"
                />
                <Pressable onPress={() => setShowNew(!showNew)}>
                  <Ionicons
                    name={showNew ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#9ca3af"
                  />
                </Pressable>
              </View>
            </View>

            {/* Confirm Password */}
            <View className="mb-6">
              <Text className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2 uppercase tracking-wide">
                Confirm New Password
              </Text>
              <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-2xl px-5">
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter new password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showConfirm}
                  className="flex-1 py-4 text-gray-900 dark:text-white text-base"
                />
                <Pressable onPress={() => setShowConfirm(!showConfirm)}>
                  <Ionicons
                    name={showConfirm ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#9ca3af"
                  />
                </Pressable>
              </View>
            </View>

            {error ? (
              <View className="bg-red-50 dark:bg-red-500/10 rounded-xl px-4 py-3 mb-4">
                <Text className="text-red-500 text-sm">{error}</Text>
              </View>
            ) : null}
          </ScrollView>

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
                  Update Password
                </Text>
              )}
            </Pressable>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
