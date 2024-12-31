import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import "nativewind"; // Import NativeWind for Tailwind support

const sampleCourseData = {
  title: "Building a Marketplace with Next.js",
  date: "2024-10-29",
  author: "John Doe",
  description:
    "This course covers the essentials of building scalable marketplaces using Next.js.",
  thumbnail: require("../assets/images/thumbnail.png"),
  isPaid: false,
  videos: [
    { id: 1, title: "Introduction to Marketplaces", duration: "10 mins" },
    { id: 2, title: "Setting Up Next.js", duration: "20 mins" },
    { id: 3, title: "Database Integration", duration: "15 mins" },
    { id: 4, title: "Building Product Pages", duration: "25 mins" },
    { id: 5, title: "Checkout Process", duration: "30 mins" },
  ],
};

const CourseDetails = () => {
  const { courseId } = useLocalSearchParams();
  const router = useRouter();
  const course = sampleCourseData;

  // State for comments
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
  const [activeTab, setActiveTab] = useState("lessons"); // State for active tab

  const handleVideoPress = (videoId: any) => {
    if (course.isPaid) {
      router.push(`/video/${videoId}`);
    } else {
      alert("Course is locked. Please subscribe to access.");
    }
  };

  const handleSubscriptionPress = () => {
    router.push("/payment"); // Navigate to payment page
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setCommentList((prevComments) => [
        ...prevComments,
        {
          id: prevComments.length + 1,
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
      onPress={() => handleVideoPress(item.id)}
      className="flex-row justify-between items-center py-4 border-b border-gray-700"
    >
      <View className="flex-1">
        <Text className="text-white text-lg">{item.title}</Text>
        <Text className="text-gray-400 text-sm">{item.duration}</Text>
      </View>
      <FontAwesome
        name={course.isPaid ? "play-circle" : "lock"}
        size={24}
        color={course.isPaid ? "#1DB954" : "#AAA"}
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

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Scrollable Content */}
      <ScrollView className="flex-1">
        {/* Course Thumbnail */}
        <View className="p-4">
          <Image
            source={course.thumbnail}
            className="w-full h-60 rounded-lg mb-5"
          />
        </View>

        {/* Course Info */}
        <View className="p-5">
          <Text className="text-white text-2xl font-bold mb-3">
            {course.title}
          </Text>

          <View className="flex-row justify-between my-2">
            <Text className="text-gray-400 text-sm">by {course.author}</Text>
            <Text className="text-gray-400 text-sm">{course.date}</Text>
          </View>

          {/* Subscription Button */}
          {!course.isPaid && (
            <TouchableOpacity
              onPress={handleSubscriptionPress}
              className="bg-secondary py-3 px-5 rounded-lg items-center my-4"
            >
              <Text className="text-white text-lg font-bold">
                Subscribe to Access
              </Text>
            </TouchableOpacity>
          )}

          {/* Course Description */}
          <Text className="text-gray-300 text-lg my-4">
            {course.description}
          </Text>

          {/* Tab Buttons */}
          <View className="flex-row mb-4">
            <TouchableOpacity
              onPress={() => setActiveTab("lessons")}
              className={`flex-1 p-3 ${
                activeTab === "lessons" ? "bg-secondary" : "bg-gray-800"
              } rounded-lg`}
            >
              <Text className="text-center text-white font-bold">Lessons</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("comments")}
              className={`flex-1 p-3 ${
                activeTab === "comments" ? "bg-secondary" : "bg-gray-800"
              } rounded-lg`}
            >
              <Text className="text-center text-white font-bold">Comments</Text>
            </TouchableOpacity>
          </View>

          {/* Active Tab Content */}
          {activeTab === "lessons" && (
            <View>
              {/* Video List */}
              <FlatList
                data={course.videos}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderVideo}
                className="mb-5"
                scrollEnabled={false} // Disable FlatList scrolling to let ScrollView handle it
              />
            </View>
          )}

          {activeTab === "comments" && (
            <View>
              {/* Add Comment Section */}
              <View className="flex-row items-center mb-4">
                <TextInput
                  className="flex-1 bg-gray-800 text-white p-3 rounded-lg"
                  placeholder="Add a comment..."
                  placeholderTextColor="#888"
                  value={newComment}
                  onChangeText={setNewComment}
                />
                <TouchableOpacity onPress={handleAddComment} className="ml-2">
                  <FontAwesome name="send" size={20} color="#FF9001" />
                </TouchableOpacity>
              </View>

              {/* Comments List */}
              <FlatList
                data={commentList}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderComment}
                className="mb-5"
                scrollEnabled={false} // Disable FlatList scrolling
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CourseDetails;
