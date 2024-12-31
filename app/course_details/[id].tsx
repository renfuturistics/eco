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

const CourseDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [data, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any>(null);
  const [loading, setLoading] = useState(true); // For tracking loading state
  const [error, setError] = useState<string | null>(null); // For tracking errors

  const [commentList, setCommentList] = useState([
    {
      id: 1,
      author: "Alice",
      text: "This course is amazing! Learned a lot.",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      author: "Bob",
      text: "Loved the marketplace setup section!",
      timestamp: "1 day ago",
    },
  ]);
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState("lessons");

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

  const handleSubscriptionPress = () => {
    router.push("/subscription-page");
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setCommentList((prevreviews) => [
        ...prevreviews,
        {
          id: prevreviews.length + 1,
          author: "You",
          text: newComment,
          timestamp: "Just now",
        },
      ]);
      setNewComment("");
    }
  };

  const renderVideo = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => handleVideoPress(item.url)}
      className="flex-row justify-between items-center py-4 border-b border-gray-700"
    >
      <View className="flex-1">
        <Text className="text-white text-lg">{item.title}</Text>
        <Text className="text-gray-400 text-sm">{item.duration}</Text>
      </View>
      <FontAwesome
        name={data && data.isPaid ? "play-circle" : "lock"}
        size={24}
        color={data && data.isPaid ? "#1DB954" : "#AAA"}
      />
    </TouchableOpacity>
  );

  const renderComment = ({ item }: any) => (
    <View className="flex-row p-4 border-b border-gray-700">
      <View className="flex-1">
        <Text className="text-white font-bold">{item.author}</Text>
        <Text className="text-gray-400 text-xs">{item.timestamp}</Text>
        <Text className="text-gray-300 mt-1">{item.text}</Text>
      </View>
    </View>
  );
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
              <Text className="text-gray-400 text-sm">{formatDate(data?.date)}</Text>
            </View>
  
            {!data?.isPaid && (
              <TouchableOpacity
                onPress={handleSubscriptionPress}
                className="bg-secondary py-3 px-5 rounded-lg items-center my-4"
              >
                <Text className="text-white text-lg font-bold">
                  Subscribe to Access
                </Text>
              </TouchableOpacity>
            )}
  
            <Text className="text-gray-300 text-lg my-4">
              {data?.description}
            </Text>
  
            {/* Lessons Section */}
            <TouchableOpacity
              onPress={() => setActiveTab("lessons")}
              className={`p-3 ${
                activeTab === "lessons" ? "bg-secondary" : "bg-gray-800"
              } rounded-lg mb-4`}
            >
              <Text className="text-center text-white font-bold">Lessons</Text>
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
