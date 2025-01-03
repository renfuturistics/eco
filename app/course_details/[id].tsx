import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator, // For Progress Indicator
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import "nativewind";
import { getCourseWithLessons } from "../../lib/appwrite";
import PageHeader from "../../components/PageHeader";
import { useGlobalContext } from "../../context/GlobalProvider";

const CourseDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { subscription } = useGlobalContext();
  const [data, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any>(null);
  const [loading, setLoading] = useState(true); // For tracking loading state
  const [error, setError] = useState<string | null>(null); // For tracking errors



  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        const courseData = await getCourseWithLessons(id?.toString() || "");
        setCourse(courseData.course);
        setLessons(courseData.lessons);
        setError(null); // Clear any previous errors
      } catch (error: any) {
        console.error("Error fetching courses:", error);
        setError("Failed to fetch course details. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  const handleVideoPress = (url: string) => {
    if (data && !data.isPaid) {
      alert("Course is locked. Please subscribe to access.");
      return;
    }
    if (data && data.format === "video") {
      router.push(`/video_play/${encodeURIComponent(url)}`);
    } else {
      router.push(`/audio_play/${url}`);
    }
  };


  const renderVideo = ({ item }: any) => {
    // Determine if the video is accessible based on subscription or if it's free
    const isAccessible = subscription || !item.isPaid;

    return (
      <TouchableOpacity
        disabled={!isAccessible} // Disable button if not accessible
        onPress={() => isAccessible && handleVideoPress(item.url)}
        className={`flex-row justify-between items-center py-4 border-b ${
          isAccessible ? "border-gray-700" : "border-gray-500"
        }`}
        style={{
          opacity: isAccessible ? 1 : 0.5, // Grayed out effect for inaccessible items
        }}
      >
        <View className="flex-1">
          <Text
            className="text-lg"
            style={{
              color: isAccessible ? "#FFFFFF" : "#AAAAAA", // Text color change for inaccessible items
            }}
          >
            {item.title}
          </Text>
          <Text
            className="text-sm"
            style={{
              color: isAccessible ? "#CCCCCC" : "#777777", // Subtext color adjustment
            }}
          >
            {item.duration}
          </Text>
        </View>
        <FontAwesome
          name={isAccessible ? "play-circle" : "lock"}
          size={24}
          color={isAccessible ? "#1DB954" : "#AAA"} // Icon color adjustment
        />
      </TouchableOpacity>
    );
  };


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <PageHeader title="Program Details" />
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF9001" />
          <Text className="text-gray-400 mt-4">Loading course details...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 text-lg font-bold">{error}</Text>
        </View>
      ) : (
        <ScrollView className="flex-1">
          <View className="p-4">
            <Image
              source={{ uri: data?.thumbnail }}
              className="w-full h-60 rounded-lg mb-5"
            />
          </View>

          <View className="p-5">
            <Text className="text-white text-2xl font-bold mb-3">
              {data?.title}
            </Text>
            <View className="flex-row justify-between my-2">
              <Text className="text-gray-400 text-sm">
                Instructor: {data?.instructor}
              </Text>
              <Text className="text-gray-400 text-sm">
                {formatDate(data?.date)}
              </Text>
            </View>

            <Text className="text-gray-300 text-lg my-4">
              {data?.description}
            </Text>

            {/* Lessons Section */}
            <TouchableOpacity
           onPress={() => {
            if (!subscription) {
              router.push("subscribe"); // Navigate to the subscription page
            } 
          }}
              className={`p-3 bg-secondary rounded-lg mb-4 h-14 flex-row items-center justify-center`} // Added flex-row for the icon
            >
              {!subscription && (
                <FontAwesome
                  name="lock"
                  size={16}
                  color="#FFF"
                  className="mr-2"
                /> // Lock icon if no subscription
              )}
              <Text className="text-center text-white font-bold">
                {subscription ? "Start Today" : "Subscribe"}
              </Text>
            </TouchableOpacity>

            {lessons && lessons.length > 0 ? (
              <FlatList
                data={lessons}
                keyExtractor={(item) => item.title.toString()}
                renderItem={renderVideo}
                className="mb-5"
                scrollEnabled={false}
              />
            ) : (
              <View className="flex items-center justify-center h-48">
                <Text className="text-gray-400 text-lg">
                  No lessons available for this course yet.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default CourseDetails;
