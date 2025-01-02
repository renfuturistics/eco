import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useGlobalContext } from "../context/GlobalProvider";
import { Stack } from "expo-router";
import PageHeader from "../components/PageHeader";
import { generateCertificate } from "../lib/appwrite";

const CertificateScreen = () => {
  const { user } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(true); // State for loading image
  const [certificateImage, setCertificateImage] = useState<string | null>(null); // State for certificate image

  useEffect(() => {
    // Call the generateCertificate function
    const createCertificate = async () => {
      try {
        const response = await generateCertificate();

        if (response) {
          const image = JSON.parse(response)
          const imageBase64 = `data:image/png;base64,${image.image}`;
          setCertificateImage(imageBase64); // Set the generated image
          setIsLoading(false); // Stop loading
        } else {
          throw new Error("Failed to generate certificate");
        }
      } catch (error) {
        console.error("Error generating certificate:", error);
        Alert.alert("Error", "Could not generate certificate. Please try again.");
        setIsLoading(false); // Stop loading even on error
      }
    };

    createCertificate();
  }, []);

  const handleSave = () => {
    console.log("Certificate saved!");
    // Logic for saving the certificate, e.g., saving the image to device or cloud
  };

  const handleShare = () => {
    console.log("Certificate shared!");
    // Logic for sharing the certificate, e.g., using share API or integrating with a share plugin
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <Stack.Screen options={{ headerShown: false }} />
      <PageHeader title="Certificate" />
      <View className="items-center p-5">
        {/* Congratulations Text */}
        <Text className="text-3xl font-bold text-gray-300 text-center mt-5 mb-5">
          🎉 Congratulations! 🎉
        </Text>

        {/* Image Container with Fixed Height */}
        <View className="w-11/12 h-64 mb-5">
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color="#FF9001" 
              className="w-full h-full flex justify-center items-center"
            />
          ) : (
            <Image
              source={{ uri: certificateImage! }}
              className="w-full h-full rounded-lg shadow-lg"
              resizeMode="contain"
            />
          )}
        </View>

        {/* Small Text */}
        {!isLoading && (
          <Text className="text-base text-gray-600 text-center mb-5">
            You have successfully completed the course!
          </Text>
        )}

        {/* Buttons */}
        <View className="flex-row space-x-4 gap-4">
          {/* Share Button (Outlined with White Border) */}
          <TouchableOpacity
            className="border-2 border-white py-3 px-5 rounded flex-1"
            onPress={handleShare}
          >
            <Text className="text-white font-bold text-center text-base">
              Share Certificate
            </Text>
          </TouchableOpacity>

          {/* Save Button */}
          <TouchableOpacity
            className="bg-secondary py-3 px-5 rounded shadow-md flex-1"
            onPress={handleSave}
          >
            <Text className="text-white font-bold text-center text-base">
              Save Certificate
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CertificateScreen;
