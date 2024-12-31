import { router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import PageHeader from "../components/PageHeader";
const ChangePasswordScreen = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    // Validation checks
    if (!oldPassword || !newPassword || !confirmPassword) {
      return Alert.alert("Error", "All fields are required.");
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert(
        "Error",
        "New password and confirmation do not match."
      );
    }
    if (newPassword.length < 6) {
      return Alert.alert(
        "Error",
        "New password should be at least 6 characters long."
      );
    }

    // Simulate a save action
    try {
      setIsSaving(true);
      // Replace the following with actual password change logic
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Success message
      Alert.alert("Success", "Your password has been changed.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      Alert.alert("Error", "Failed to change password. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900 ">
        <PageHeader title="Change Password" />
      <View className="flex-1 justify-center px-6">
        <Text className="text-2xl font-bold mb-6 text-white">
          Change Password
        </Text>

        {/* Old Password Input */}
        <TextInput
          placeholder="Old Password"
          secureTextEntry
          placeholderTextColor="#B3B3B3"
          className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-300 text-white"
          value={oldPassword}
          onChangeText={setOldPassword}
        />

        {/* New Password Input */}
        <TextInput
          placeholder="New Password"
          secureTextEntry
          placeholderTextColor="#B3B3B3"
          className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-300 text-white"
          value={newPassword}
          onChangeText={setNewPassword}
        />

        {/* Confirm Password Input */}
        <TextInput
          placeholder="Confirm New Password"
          secureTextEntry
          placeholderTextColor="#B3B3B3"
          className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-300 text-white"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          className={`bg-secondary py-4 rounded-lg flex flex-row justify-center items-center ${
            isSaving ? "opacity-50" : ""
          }`}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-lg font-semibold">Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;
