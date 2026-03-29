import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppDispatch } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({
  visible,
  onClose,
}: DeleteAccountModalProps) {
  const dispatch = useAppDispatch();
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  const handleDelete = async () => {
    setIsLoading(true);
    // Account deletion endpoint is not yet available on the backend.
    // Log the user out and prompt them to contact support.
    Alert.alert(
      "Account Deletion",
      "Full account deletion is not yet available. You have been logged out. Please contact support to permanently delete your account data.",
      [
        {
          text: "OK",
          onPress: () => {
            dispatch(logout());
            handleClose();
          },
        },
      ],
    );
    setIsLoading(false);
  };

  const isConfirmed = confirmText === "DELETE";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View className="bg-white dark:bg-gray-900 rounded-t-[32px] pb-10 px-6">
          {/* Handle */}
          <View className="items-center pt-3 pb-4">
            <View className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          </View>

          {/* Warning Icon */}
          <View className="items-center mb-6">
            <View className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-500/20 items-center justify-center">
              <Ionicons name="warning" size={40} color="#ef4444" />
            </View>
          </View>

          <Text className="text-gray-900 dark:text-white text-2xl font-bold text-center mb-3">
            Delete Account
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm text-center leading-6 mb-6">
            This action is permanent and cannot be undone. All your data —
            accounts, transactions, goals, and budgets — will be permanently
            deleted.
          </Text>

          {/* Confirmation Input */}
          <Text className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2">
            Type DELETE to confirm
          </Text>
          <TextInput
            value={confirmText}
            onChangeText={setConfirmText}
            placeholder='Type "DELETE"'
            placeholderTextColor="#9ca3af"
            autoCapitalize="characters"
            autoCorrect={false}
            className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-5 py-4 text-gray-900 dark:text-white text-base mb-6"
            style={
              confirmText.length > 0 && !isConfirmed
                ? { borderWidth: 2, borderColor: "#ef4444" }
                : {}
            }
          />

          {/* Delete Button */}
          <Pressable
            onPress={handleDelete}
            disabled={!isConfirmed || isLoading}
            className={`rounded-2xl py-4 items-center mb-3 ${
              isConfirmed
                ? "bg-red-500 active:bg-red-600"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text
                className={`text-base font-semibold ${
                  isConfirmed
                    ? "text-white"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                Delete My Account
              </Text>
            )}
          </Pressable>

          {/* Cancel Button */}
          <Pressable
            onPress={handleClose}
            className="rounded-2xl py-4 items-center bg-gray-100 dark:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700"
          >
            <Text className="text-gray-700 dark:text-gray-300 text-base font-semibold">
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
