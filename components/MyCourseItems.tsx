import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";

type Course = {
  course: {
    $id: number;
    thumbnail: string;
    category: any;
    title: string;
    instructor: string;
    completedLessons: number;
    total: number;
    date: string;
  };
  progress: {
    course: string;
    completedLessons: number;
    isComplete: string;
    totalLessons: number;
    isCompleted: boolean;
  };
};

type CourseItemProps = {
  course: Course;
};

const CourseItem = ({ course }: CourseItemProps) => {
  const router = useRouter();

  // Calculate progress with clamping
  const progressValue = course.progress.totalLessons > 0
    ? parseFloat(
        (course.progress.completedLessons / course.progress.totalLessons).toFixed(2)
      )
    : 0;

  return (
    <TouchableOpacity 
      onPress={() => {
        router.push(`course_details/${course.course.$id}`);
      }}
      className="p-4 bg-gray-800 rounded-lg mb-4 flex-row"
    >
      {/* Thumbnail */}
      <Image source={{ uri: course.course.thumbnail }} className="w-24 h-24 rounded-lg mr-4" />

      {/* Course Info */}
      <View className="flex-1">
        <Text className="text-sm text-gray-400 mb-1">{course.course.category.name}</Text>
        <Text className="text-lg text-white font-semibold mb-2">{course.course.title}</Text>

        {/* Teacher Info */}
        <View className="flex-row items-center mb-2">
          <Ionicons name="person-circle" size={16} color="#888" />
          <Text className="text-gray-400 ml-1">{course.course.instructor}</Text>
        </View>

        {/* Ongoing vs Completed Display */}
        {course.progress.isCompleted ? (
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => {
                router.push({
                  pathname: "/certificate",
                  params: {
                    id: course.course.$id,
                    title: course.course.title,
                    teacher: course.course.instructor,
                    date: course.course.date,
                  },
                });
              }}
              className="flex-row items-center"
            >
              <Text className="text-green-500 font-semibold text-base mr-2">
                VIEW CERTIFICATE
              </Text>
              <Ionicons name="checkmark-circle" size={18} color="green" />
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row items-center">
            <View className="flex-1 mr-2">
              <ProgressBar 
                progress={progressValue}
                color="#FF9C01"
                style={{ height: 8, borderRadius: 4, backgroundColor: "#3b3b3b" }}
              />
            </View>
            <Text className="text-gray-400 text-sm">{course.progress.completedLessons}/{course.progress.totalLessons}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default CourseItem;
