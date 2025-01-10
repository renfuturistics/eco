import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface PostCardProps {
  id: string;
  image?: string; // Optional property
  title: string;
  avatar?: string; // Optional property
  tags: string[];
  comments: number;
  description: string;
}

const PostCard: React.FC<PostCardProps> = ({
  id,
  image,
  title,
  avatar,
  tags,
  description,
  comments,
}) => {
  const router = useRouter();

  const handlePress = () => {
    // Navigate to Post Details and pass the post data
    router.push(`/post_details/${id}`);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="flex flex-col items-start p-4 gap-y-6 bg-gray-800 rounded-lg w-full mb-5"
    >
      {/* Main Content */}
      <View className="flex flex-row gap-x-4 w-full">
        {/* Conditional Image Rendering */}
        {image && (
          <Image
            source={{ uri: image }}
            className="w-14 h-14 rounded-lg"
            style={{
              borderWidth: 1,
              borderColor: "rgba(43, 0, 212, 0.1)",
              shadowColor: "#2B00D4",
              shadowOpacity: 0.06,
              shadowRadius: 6,
            }}
          />
        )}

        {/* Data Section */}
        <View className="flex-1 mr-16">
          {/* Title */}
          <Text numberOfLines={1} className="font-semibold text-base text-[#F7F7F7] mb-1">
            {title}
          </Text>
          <Text
            className="text-sm text-[#C5D0E6] mb-4"
            numberOfLines={image?2:4}
            ellipsizeMode="tail"
          >
            {description}
          </Text>
          {/* Tags */}
   {tags.length >0 &&        <View className="flex flex-row gap-x-2 mb-4">
            {tags.map((tag, index) => (
              <View
                key={index}
                className="flex justify-center items-center px-2 py-1 bg-[#2C353D] rounded-full"
              >
                <Text className="text-[9px] font-regular text-[#C5D0E6]">
                  {tag}
                </Text>
              </View>
            ))}
          </View>}

          {/* Actions */}
          <View className="flex flex-row gap-x-4 items-center mb-2">
            <View className="flex flex-row items-center gap-x-1">
              <FontAwesome name="comment" size={12} color="#C5D0E6" />
              <Text className="text-xs text-[#C5D0E6]">
                {comments.toLocaleString()} Comments
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Conditional Avatar Rendering */}
      {avatar && (
        <Image
          source={{ uri: avatar }}
          className="w-10 h-10 rounded-full absolute right-4 top-4"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
          }}
        />
      )}
    </TouchableOpacity>
  );
};

export default PostCard;
