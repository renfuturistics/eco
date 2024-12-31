import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  ScrollView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { CustomButton } from "../components";
import { createPost } from "../lib/appwrite";
import { useGlobalContext } from "../context/GlobalProvider";
const AddPostPage = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnail, setThumbnail] = useState<any>(null);
  const { user } = useGlobalContext();
  const userId = user.Id;

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "You need to grant permission to pick an image."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });

      if (!result.canceled) {
      
        setImageUri(result.assets[0].uri);
        setThumbnail(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong while picking the image.");
    }
  };

  const handlePostSubmit = async () => {
    if (!title || !description) {
      Alert.alert("Validation Error", "Title and description are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const form = {
        title,
        description,
        thumbnail,
        tags: tags.split(",").map((tag) => tag.trim()), // Convert comma-separated tags into an array
        userId, // Replace with the actual user ID from authentication
      };

      await createPost(form);

      // Reset fields
      setTitle("");
      setDescription("");
      setTags("");
      setImageUri(null);
      setThumbnail(null);
      router.replace('/home')
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create the post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={{ marginTop: Platform.OS === "android" ? 20 : 10 }}
        className="px-4 py-6"
      >
        <Text className="text-2xl font-bold text-center mb-6 text-white">
          Add a New Post
        </Text>

        {/* Image Picker */}
        <View className="items-center mb-6">
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              className="w-48 h-48 rounded-lg mb-4"
            />
          ) : (
            <Text className="text-lg text-gray-500 mb-4">
              No image selected
            </Text>
          )}
          <TouchableOpacity
            onPress={pickImage}
            className="bg-primary py-3 px-6 rounded-lg flex-row items-center"
          >
            <Ionicons name="image" size={24} color="white" />
            <Text className="ml-2 text-white text-lg">Pick an Image</Text>
          </TouchableOpacity>
        </View>

        {/* Title Input */}
        <View className="mb-4">
          <TextInput
            className="bg-gray-800 text-white p-2 rounded-lg"
            placeholder="Enter Post Title"
            placeholderTextColor="#B3B3B3"
            value={title}
            onChangeText={setTitle}
          />
          {!title && (
            <Text className="text-red-500 text-sm mt-1">Title is required</Text>
          )}
        </View>

        {/* Description Input */}
        <View className="mb-5">
          <TextInput
            className="bg-gray-800 text-white p-2 rounded-lg placeholder-gray-500"
            placeholder="Add a description..."
            placeholderTextColor="#888"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
          />
          {!description && (
            <Text className="text-red-500 text-sm mt-1">
              Description is required
            </Text>
          )}
        </View>

        {/* Tags Input */}
        <View className="mb-4">
          <TextInput
            className="bg-gray-800 text-white p-2 rounded-lg"
            placeholder="Enter Tags (comma-separated)"
            placeholderTextColor="#B3B3B3"
            value={tags}
            onChangeText={setTags}
          />
        </View>

        {/* Submit Button */}
        <CustomButton
          title={isSubmitting ? "Submitting..." : "Submit"}
          handlePress={handlePostSubmit}
          containerStyles="mt-7"
          isLoading={isSubmitting}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddPostPage;
