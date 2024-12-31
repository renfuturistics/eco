import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
  StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import {
  getCurrentUser,
  updateUserDocument,
  uploadFile,
} from "../lib/appwrite";
import PageHeader from "../components/PageHeader";

const EditProfilePage = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [profilePicUri, setProfilePicUri] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUserId(user.$id);
          setName(user.name);
          setEmail(user.email);
          setPhoneNumber(user.contact || "");
          // You can set other fields if needed
        }
      } catch (error: any) {
        console.error("Error loading user data:", error.message || error);
        Alert.alert("Error", "Failed to load user data.");
      }
    };

    fetchUserData();
  }, []);

  const pickImage = async () => {
    try {
      // Request media library permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        return Alert.alert(
          "Permission Denied",
          "You need to grant permission to pick an image."
        );
      }

      // Launch image picker with options
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Restrict to images only
        allowsEditing: true, // Allow users to crop/edit
        aspect: [1, 1], // Enforce square aspect ratio
        quality: 1, // Highest quality
      });

      // Check if the user canceled the image picker
      if (result.canceled) {
        return;
      }

      // Start upload process
      setIsImageUploading(true);

      // Upload the file and update user document concurrently
      const uploadedImageUri = result.assets[0].uri;
      const [thumbnailUrl] = await Promise.all([
        uploadFile(result.assets[0], "image"),
      ]);

      const update = { avatar: thumbnailUrl };

      // Update the user document if `userId` exists
      if (userId) {
        await updateUserDocument(userId, update);
      }

      // Update profile picture URI locally
      setProfilePicUri(uploadedImageUri);
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred while uploading the image."
      );
    } finally {
      // Ensure upload state resets regardless of success or failure
      setIsImageUploading(false);
    }
  };

  type UserUpdates = {
    name: string;
    email: string;
    contact: string;
  };
  const handleSave = async () => {
    if (!userId || !name || !email || !phoneNumber) {
      Alert.alert("Incomplete Information", "Please fill in all fields.");
      return;
    }

    try {
      const updates: UserUpdates = {
        name,
        email,
        contact: phoneNumber,
      };

      await updateUserDocument(userId, updates);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error.message || error);
      Alert.alert("Error", "Failed to update profile.");
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-gray-900 ">
      <PageHeader title="Edit Profile" />
      <ScrollView>
        {/* Profile Picture */}
        <View className="items-center mb-6">
          {profilePicUri ? (
            <Image
              source={{ uri: profilePicUri }}
              className="w-32 h-32 rounded-full mb-4"
            />
          ) : (
            <Ionicons name="person-circle-outline" size={128} color="#B3B3B3" />
          )}
          {/* Activity Indicator */}
          {isImageUploading && (
            <View className="absolute top-0 left-0 right-0 bottom-2  flex justify-center items-center">
              <ActivityIndicator size="small" color="#FF9001" />
            </View>
          )}
          <TouchableOpacity
            onPress={pickImage}
            className="bg-primary py-2 px-4 rounded-lg mt-4"
          >
            <Text className="text-white">Change Profile Picture</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1 justify-center px-6">
          {/* Name Input */}
          <TextInput
            className="bg-gray-800 text-white p-4 rounded-lg mb-4"
            placeholder="Enter Full Name"
            placeholderTextColor="#B3B3B3"
            value={name}
            onChangeText={setName}
          />

          {/* Email Input */}
          <TextInput
            className="bg-gray-800 text-white p-4 rounded-lg mb-4"
            placeholder="Enter Email Address"
            placeholderTextColor="#B3B3B3"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          {/* Phone Number Input */}
          <TextInput
            className="bg-gray-800 text-white p-4 rounded-lg mb-4"
            placeholder="Enter Phone Number"
            placeholderTextColor="#B3B3B3"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            className="bg-secondary py-4 rounded-lg mt-6"
          >
            <Text className="text-white text-lg text-center">Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfilePage;
