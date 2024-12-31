import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

interface PostHeaderProps {
  notificationCount: number; // Number of unread notifications
  logo: string; // Logo image URI
  avatar: string; // Avatar image URI
  onSearchPress?: () => void; // Optional search button press handler
  onNotificationPress?: () => void; // Optional notification button press handler
  onAvatarPress?: () => void; // Optional avatar button press handler
}

const PostHeader: React.FC<PostHeaderProps> = ({
  notificationCount,
  logo,
  avatar,
  onSearchPress,
  onNotificationPress,
  onAvatarPress,
}) => {
  return (
    <View
      className="flex flex-row items-center justify-between px-4 bg-black-200 h-12"
      style={{ height: 60 }}
    >
      {/* Left Section: Logo and Search Icon */}
      <View className="flex flex-row items-center gap-3">
        {/* Logo */}
        <Image
          source={require("../assets/images/logo.png")}
          className="w-8 h-8"
          style={{
            marginRight: 12,
          }}
        />
        {/* Search Icon */}
        <TouchableOpacity onPress={onSearchPress}>
          <FontAwesome name="search" size={20} color="#C5D0E6" />
        </TouchableOpacity>
      </View>

      {/* Right Section: Notification and Avatar */}
      <View className="flex flex-row items-center gap-x-7">
        {/* Notification Icon with Badge */}
        <TouchableOpacity
          onPress={onNotificationPress}
          style={{ position: "relative" }}
        >
          <FontAwesome name="bell" size={20} color="#C5D0E6" />
          {notificationCount > 0 && (
            <View
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: "#FF3B30", // Red color for badge
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 8,
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                {notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Avatar */}
        <TouchableOpacity onPress={onAvatarPress}>
          <Image
            source={{ uri: avatar }}
            className="w-8 h-8 rounded-full"
            style={{
              borderWidth: 1,
              borderColor: "rgba(43, 0, 212, 0.1)",
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PostHeader;
