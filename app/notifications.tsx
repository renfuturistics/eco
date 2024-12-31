import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator,SafeAreaView, Platform, StatusBar } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getUserNotifications, markAllNotificationsAsRead } from "../lib/appwrite";
import { useGlobalContext } from "../context/GlobalProvider";

import { formatDistanceToNow } from "date-fns";
const NotificationsPage: React.FC = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {  user } = useGlobalContext();
  const userId = user?.Id || "";
  // Fetch notifications using the provided getNotifications function
  const fetchNotifications = async () => {
    setLoading(true); // Start loading state
    try {
      // Combine fetching and marking notifications as read
      const fetchedNotifications = await getUserNotifications(userId);
  
      // Start marking notifications as read in parallel
      const markReadPromise = markAllNotificationsAsRead(userId);
  
      // Wait for both operations to complete
      await Promise.all([fetchedNotifications, markReadPromise]);
  
      // Store fetched notifications in state
      setNotifications(fetchedNotifications);
  
      // Clear any errors
      setError(null);
    } catch (error) {
      console.error("Error fetching or marking notifications as read:", error);
      setError("Failed to fetch notifications. Please try again.");
    } finally {
      setLoading(false); // End loading state
    }
  };
  

  useEffect(() => {
    fetchNotifications(); // Fetch notifications when the component mounts
  }, []);

  const renderItems = ({ item }: { item: any }) => {
    const relativeTime = formatDistanceToNow(new Date(item.$createdAt), {
      addSuffix: true, // Adds "ago" to the time (e.g., "5 minutes ago")
    });
  
    const handleNotificationPress = () => {
      if (item.type === "comment") {
        // Navigate to the post_details page with the postId
        router.push({
          pathname: "/post_details", // Replace with your actual route
          params: { postId: item.postId },
        });
      } else {
        console.log("Unhandled notification type:", item.type);
      }
    };
  
    return (
      <TouchableOpacity
      key={item.id}
      className="flex flex-row items-center justify-between py-4"
      onPress={handleNotificationPress}
    >
      {/* Left Section */}
      <View className="flex flex-row items-center flex-1">
        {/* Icon with Rounded Background */}
        <View className="w-12 h-12 bg-[#2C353D] rounded-full justify-center items-center mr-4">
          <FontAwesome name={item.icon} size={20} color="#C5D0E6" />
        </View>
        {/* Notification Text */}
        <View className="flex-1">
          <Text
            className="text-sm text-[#C5D0E6]"
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.message}
          </Text>
        </View>
      </View>
    
      {/* Right Section: Relative Timestamp */}
      <Text className="text-xs text-[#C5D0E6] ml-4">{relativeTime}</Text>
    </TouchableOpacity>
    
    );
  };
  

  return (
   <SafeAreaView className="flex-1 bg-[#1E242B]">
         {/* Header */}
         <View style={{marginTop:Platform.OS==="android"? StatusBar.currentHeight:0}}   className="h-16 bg-[#262D34] flex flex-row items-center px-4">
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex justify-center items-center w-10 h-10 bg-[#2C353D] rounded-full mr-4"
        >
          <FontAwesome name="chevron-left" size={16} color="#C5D0E6" />
        </TouchableOpacity>
        {/* Header Title */}
        <Text className="font-semibold text-lg text-[#F7F7F7]">Notifications</Text>
      </View>
      {/* Error Message */}
      {error && (
        <View className="flex-1 justify-center items-center">
          <Text className="text-sm text-red-500">{error}</Text>
        </View>
      )}

      {/* Loading Indicator */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#C5D0E6" />
        </View>
      ) : notifications.length === 0 ? (
        // No Notifications Message
        <View className="flex-1 justify-center items-center">
          <Text className="text-sm text-[#C5D0E6]">No notifications to display.</Text>
        </View>
      ) : (
        // Notifications List
        <FlatList
          data={notifications}
          renderItem={renderItems}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 15 }}
        />
      )}
    </SafeAreaView>
  );
};

export default NotificationsPage;
