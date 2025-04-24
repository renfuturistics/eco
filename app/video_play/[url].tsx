import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { Video, AVPlaybackStatus, ResizeMode } from "expo-av";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

// Import the function to award points
import { addPoints, handleVideoCompletion } from "../../lib/appwrite"; // Adjust the import path accordingly
import { useGlobalContext } from "../../context/GlobalProvider";

const VideoPlay = () => {
  const params = useLocalSearchParams();
  const url = params.url as string; // The video/audio URL
  const courseId = params.courseId as string; // The course ID
  const lessonId = params.lessonId as string;
  const router = useRouter();
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);

  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true); // Loading state for the video
  const screenWidth = Dimensions.get("window").width;
  let controlTimeout = useRef<NodeJS.Timeout | null>(null); // Track timeout for controls
  const { user } = useGlobalContext();

  const userId = user.Id;

  const videoCompletion = () => {
    handleVideoCompletion(userId, courseId, lessonId);
  };

  const togglePlayback = () => {
    if (status?.isLoaded) {
      if (status.isPlaying) {
        videoRef.current?.pauseAsync();
      } else {
        if (position >= duration) {
          videoRef.current?.setPositionAsync(0);
        }
        videoRef.current?.playAsync();
      }
    }
  };

  const handleFastForward = () => {
    if (videoRef.current && status?.isLoaded) {
      const newPosition = Math.min(position + 15000, duration);
      videoRef.current.setPositionAsync(newPosition);
      setPosition(newPosition);
    }
  };

  const handleRewind = () => {
    if (videoRef.current && status?.isLoaded) {
      const newPosition = Math.max(position - 15000, 0);
      videoRef.current.setPositionAsync(newPosition);
      setPosition(newPosition);
    }
  };

  const resetControlsTimeout = () => {
    if (controlTimeout.current) {
      clearTimeout(controlTimeout.current);
    }
    controlTimeout.current = setTimeout(() => setControlsVisible(false), 3000);
  };

  useEffect(() => {
    if (controlsVisible) {
      resetControlsTimeout(); // Reset timeout whenever controls are shown
    }
    return () => {
      if (controlTimeout.current) clearTimeout(controlTimeout.current);
    };
  }, [controlsVisible]);

  useEffect(() => {
    const updateStatus = async () => {
      if (videoRef.current) {
        const playbackStatus = await videoRef.current.getStatusAsync();
        setStatus(playbackStatus);
        if (playbackStatus.isLoaded) {
          setDuration(playbackStatus.durationMillis || 0);
          setPosition(playbackStatus.positionMillis || 0);
        }
      }
    };
    const intervalId = setInterval(updateStatus, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const handleSeek = async (value: number) => {
    if (videoRef.current) {
      const seekPosition = value * duration;
      await videoRef.current.setPositionAsync(seekPosition);
    }
  };

  const handleScreenTap = () => {
    setControlsVisible((visible) => {
      const newState = !visible;
      if (newState) resetControlsTimeout(); // Reset timeout if controls become visible
      return newState;
    });
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    setStatus(status);

    if (status.isLoaded && status.didJustFinish) {
      videoCompletion();
    }
    setIsLoading(!status.isLoaded || !status.isPlaying); // Update loading state
  };

  return (
    <TouchableWithoutFeedback onPress={handleScreenTap}>
      <SafeAreaView className="flex-1 bg-black">
        <Stack.Screen options={{ headerShown: false }} />

        <View className="flex-1 justify-center items-center">
          {/* Video Player */}
          <Video
            className="w-full h-60 rounded-xl mt-3"
            ref={videoRef}
            source={{
              uri: "https://cloud.appwrite.io/v1/storage/buckets/671992c80019376d25f1/files/6751a37b0020c8e653b8/view?project=67198dbd00277f568222&project=67198dbd00277f568222&mode=admin",
            }}
            style={{
              width: Dimensions.get("window").width,
              height: Dimensions.get("window").height,
            }}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
          />

          {/* Activity Indicator */}
          {isLoading && (
            <ActivityIndicator
              size="large"
              color="#FF9C01"
              style={{
                position: "absolute",
              }}
            />
          )}

          {/* Dark Overlay */}
          {controlsVisible && (
            <View
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.4)",
              }}
            />
          )}

          {/* Back Button */}
          {controlsVisible && (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                position: "absolute",
                top: 40,
                left: 20,
                zIndex: 1,
              }}
            >
              <Ionicons name="chevron-back-sharp" size={28} color="white" />
            </TouchableOpacity>
          )}

          {/* Controls */}
          {controlsVisible && (
            <View className="absolute bottom-7 w-full px-4">
              <View className="flex-row items-center justify-center mb-4">
                <TouchableOpacity onPress={handleRewind} className="p-3">
                  <MaterialCommunityIcons
                    name="rewind-15"
                    size={30}
                    color="white"
                  />
                </TouchableOpacity>

                <TouchableOpacity onPress={togglePlayback} className="p-3">
                  <Ionicons
                    name={
                      status?.isLoaded && status?.isPlaying ? "pause" : "play"
                    }
                    size={48}
                    color="white"
                  />
                </TouchableOpacity>

                <TouchableOpacity onPress={handleFastForward} className="p-3">
                  <MaterialCommunityIcons
                    name="fast-forward-15"
                    size={30}
                    color="white"
                  />
                </TouchableOpacity>
              </View>

              {/* Seekbar */}
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-white">
                  {status?.isLoaded && position
                    ? new Date(position).toISOString().substr(11, 8)
                    : "00:00"}
                </Text>
                <Slider
                  style={{ width: screenWidth * 0.7 }}
                  minimumValue={0}
                  maximumValue={1}
                  value={duration > 0 ? position / duration : 0}
                  onValueChange={handleSeek}
                  thumbTintColor="white"
                  minimumTrackTintColor="#FF9C01"
                  maximumTrackTintColor="#ccc"
                />
                <Text className="text-white">
                  {status?.isLoaded && duration
                    ? new Date(duration).toISOString().substr(11, 8)
                    : "00:00"}
                </Text>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default VideoPlay;
