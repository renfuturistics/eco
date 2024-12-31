import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

interface CourseCardProps {
  id:string;
  thumbnail: any;
  title: string;
  type: string;
  numberOfLessons: number;
  format:'video'|'audio'
}

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  thumbnail,
  title,
  type,
  numberOfLessons,
  format
}) => {
  const router = useRouter();

  const handlePress = () => {
    // Navigate to Course Details
    router.push(`/course_details/${id}`);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="flex flex-col items-start p-4 gap-y-4 bg-[#262D34] rounded-lg w-full mb-5"
    >
      <View className="flex flex-row gap-x-4 w-full">
        {/* Thumbnail */}
        <Image
          source={{uri:thumbnail}}
          className=" rounded-lg"
          style={{
            borderWidth: 1,
            borderColor: "rgba(43, 0, 212, 0.1)",
            shadowColor: "#2B00D4",
            shadowOpacity: 0.06,
            shadowRadius: 6,
            width: 110,
            height: 110,
          }}
        />

        {/* Course Info */}
        <View className="flex-1">
          {/* Course Title */}
          <Text className="font-semibold text-base text-[#F7F7F7] mb-2">
            {title}
          </Text>

          {/* Course Type */}
          <Text className="text-sm font-bold text-[#C5D0E6] mb-2">{type}</Text>
          <Text className="text-sm text-white mb-2">Format: {format}</Text>
          {/* Lesson Count */}
          <Text className="text-xs text-secondary">
            {numberOfLessons} Lessons
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CourseCard;
