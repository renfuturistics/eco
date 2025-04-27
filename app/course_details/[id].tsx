import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

import PageHeader from "../../components/PageHeader";
import TrackPlayer from "react-native-track-player";
import { useGlobalContext } from "../../context/GlobalProvider";
import { getCourseWithLessons, createUserCourse } from "../../lib/appwrite";
import { useAddTrack, useTracks } from "../../store/library";
import { useQueue } from "../../store/queue";
import { checkPendingPayments } from "../../lib/localStorage";

const CourseDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { subscription, user } = useGlobalContext();
  const addTrack = useAddTrack(); // Now you can call this function to add tracks
  const tracks = useTracks();
  const { activeQueueId, setActiveQueueId } = useQueue();

  const [courseData, setCourseData] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = user?.Id || "";

  const queueOffset = useRef(0);

  useEffect(() => {
    checkPendingPayments();
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await getCourseWithLessons(id?.toString() || "");
        setCourseData(data.course);
        setLessons(data.lessons);

        data.lessons.forEach((lesson: any) => {
          const track = {
            id: lesson.$id,
            url: lesson.url,
            title: lesson.title,
            artist: data.course.instructor,
            artwork: data.course.thumbnail || "unknownTrackImageUri",
          };
          addTrack(track);
        });
        setError(null); // Clear previous errors
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Failed to fetch course details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [id, addTrack]); // Include id in dependencies to re-fetch when id changes

  const handleTrackSelect = useCallback(
    async (id: string, url: string) => {
      const selectedTrack = tracks.find((track) => track.url === url);
      if (!selectedTrack) return;
      const trackIndex = tracks.findIndex(
        (track) => track.url === selectedTrack.url
      );

      if (trackIndex === -1) return;

      const isChangingQueue = id !== activeQueueId;

      if (isChangingQueue) {
        const beforeTracks = tracks.slice(0, trackIndex);
        const afterTracks = tracks.slice(trackIndex + 1);

        await TrackPlayer.reset();
        await TrackPlayer.add(selectedTrack);
        await TrackPlayer.add(afterTracks);
        await TrackPlayer.add(beforeTracks);

        queueOffset.current = trackIndex;
        setActiveQueueId(id);
      } else {
        const nextTrackIndex =
          trackIndex - queueOffset.current < 0
            ? tracks.length + trackIndex - queueOffset.current
            : trackIndex - queueOffset.current;

        await TrackPlayer.skip(nextTrackIndex);
        TrackPlayer.play();
      }
    },
    [tracks, activeQueueId, setActiveQueueId]
  );

  const handleVideoPress = async (
    url: string,
    courseId: string,
    totalLessons: number,
    lessonId: string,
    lesson: any
  ) => {
    try {
      await createUserCourse(userId, courseId, totalLessons);

      if (courseData?.format === "video") {
        router.push(
          `/video_play/${encodeURIComponent(url)}?courseId=${encodeURIComponent(
            courseId
          )}&lessonId=${encodeURIComponent(lessonId)}`
        );
      } else {
        handleTrackSelect(lesson.$id, lesson.url);
        router.push({
          pathname: "/audio_play/[audioUrl]",
          params: {
            audioUrl: `${encodeURIComponent(url)}`,
            lessonId: `${encodeURIComponent(lessonId)}`,
          },
        });
      }
    } catch (error: any) {
      console.error("Error handling video press:", error.message);
      Alert.alert("Error", "An error occurred");
    }
  };

  const renderVideo = useCallback(
    ({ item }: any) => {
      const isAccessible = subscription || !item.isPaid;

      return (
        <TouchableOpacity
          disabled={!isAccessible}
          onPress={() =>
            isAccessible &&
            handleVideoPress(
              item.url,
              courseData.$id,
              lessons.length,
              item.$id,
              item
            )
          }
          className={`flex-row justify-between items-center py-4 border-b ${
            isAccessible ? "border-gray-700" : "border-gray-500"
          }`}
          style={{
            opacity: isAccessible ? 1 : 0.5,
          }}
        >
          <View className="flex-1">
            <Text
              className="text-lg"
              style={{
                color: isAccessible ? "#FFFFFF" : "#AAAAAA",
              }}
            >
              {item.title}
            </Text>
            <Text
              className="text-sm"
              style={{
                color: isAccessible ? "#CCCCCC" : "#777777",
              }}
            >
              {item.duration}
            </Text>
          </View>
          <FontAwesome
            name={isAccessible ? "play-circle" : "lock"}
            size={24}
            color={isAccessible ? "#1DB954" : "#AAA"}
          />
        </TouchableOpacity>
      );
    },
    [handleVideoPress, subscription, lessons, courseData]
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FF9001" />
        <Text className="text-gray-400 mt-4">Loading course details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500 text-lg font-bold">{error}</Text>
      </View>
    );
  }

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
              source={{ uri: courseData?.thumbnail }}
              className="w-full h-60 rounded-lg mb-5"
            />
          </View>

          <View className="p-5">
            <Text className="text-white text-2xl font-bold mb-3">
              {courseData?.title}
            </Text>
            <View className="flex-row justify-between my-2">
              <Text className="text-gray-400 text-sm">
                Instructor: {courseData?.instructor}
              </Text>
              <Text className="text-gray-400 text-sm">
                {formatDate(courseData?.date)}
              </Text>
            </View>

            <Text className="text-gray-300 text-lg my-4">
              {courseData?.description}
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
