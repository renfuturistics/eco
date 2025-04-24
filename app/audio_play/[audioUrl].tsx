import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
  DeviceEventEmitter,
  InteractionManager,
} from "react-native";
import { useNavigation, useLocalSearchParams, Stack } from "expo-router";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import * as Device from "expo-device";
import {
  getLessonAndCourseByLessonId,
  handleVideoCompletion,
} from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";

let currentlyPlayingSound: Audio.Sound | null = null;

const AudioPlayer = () => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const navigation = useNavigation();
  const [lessonData, setLessonData] = useState<any>(null);
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const params = useLocalSearchParams();
  const url = params.audioUrl as string;
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;
  const { user } = useGlobalContext();
  const userId = user?.Id;

  const audioCompletion = () => {
    handleVideoCompletion(userId, courseId, lessonId);
  };

  useEffect(() => {
    if (!lessonId) return;

    const fetchLessonAndCourse = async () => {
      setLoading(true);
      try {
        const { lesson, course } = await getLessonAndCourseByLessonId(lessonId);
        setLessonData(lesson);
        setCourseData(course);
      } catch (err) {
        setError("❌ Error fetching lesson or course.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonAndCourse();
  }, [lessonId]);

  useEffect(() => {
    const loadSound = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
          interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        if (currentlyPlayingSound) {
          await currentlyPlayingSound.pauseAsync();
          await currentlyPlayingSound.unloadAsync();
        }

        const { sound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: true, isLooping: false }
        );

        soundRef.current = sound;
        currentlyPlayingSound = sound;

        const status = await sound.getStatusAsync();
        if (status.isLoaded && status.durationMillis) {
          setDurationMillis(status.durationMillis);
        }

        sound.setOnPlaybackStatusUpdate((status) => {
          requestAnimationFrame(() => {
            try {
              if (!status.isLoaded) return;
              setPositionMillis(status.positionMillis);
              setIsPlaying(status.isPlaying);
              if (status.didJustFinish) {
                audioCompletion();
              }
            } catch (e) {
              console.warn("Playback status update error:", e);
            }
          });
        });
      } catch (error) {
        console.error("Error loading sound:", error);
      }
    };

    const timeout = setTimeout(async () => {
      loadSound();
      await schedulePushNotification();
    }, 1000);

    return () => {
      soundRef.current?.unloadAsync();
      if (currentlyPlayingSound === soundRef.current) {
        currentlyPlayingSound = null;
      }
      clearTimeout(timeout);
    };
  }, [url]);

  const handlePlayPause = async () => {
    const sound = soundRef.current;
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
        await Notifications.cancelAllScheduledNotificationsAsync();
      } else {
        await sound.playAsync();
        setIsPlaying(true);
        await schedulePushNotification();
      }
    } catch (e) {
      console.error("Play/Pause Error:", e);
    }
  };

  const rewind = async () => {
    const newPosition = Math.max(positionMillis - 10000, 0);
    try {
      await soundRef.current?.setPositionAsync(newPosition);
      setPositionMillis(newPosition);
    } catch (e) {
      console.error("Rewind Error:", e);
    }
  };

  const fastForward = async () => {
    const newPosition = Math.min(positionMillis + 10000, durationMillis);
    try {
      await soundRef.current?.setPositionAsync(newPosition);
      setPositionMillis(newPosition);
    } catch (e) {
      console.error("FastForward Error:", e);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const sound = soundRef.current;
      if (!sound) return;

      InteractionManager.runAfterInteractions(async () => {
        try {
          const status = await sound.getStatusAsync();
          if (status?.isLoaded) {
            setPositionMillis(status.positionMillis);
          }
        } catch (e) {
          console.log("Interval status error:", e);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  async function schedulePushNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "You've got mail! 📬",
        body: "Here is the notification body",
        data: { data: "goes here", test: { test1: "more data" } },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
      },
    });
  }

  useEffect(() => {
    if (Platform.OS === "android") {
      DeviceEventEmitter.addListener(
        "android.intent.action.BOOT_COMPLETED",
        () => {
          console.log("Device boot completed, rescheduling notification.");
          schedulePushNotification();
        }
      );
    }

    return () => {
      if (Platform.OS === "android") {
        DeviceEventEmitter.removeAllListeners(
          "android.intent.action.BOOT_COMPLETED"
        );
      }
    };
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync().then();
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("myNotificationChannel", {
        name: "A channel is needed for the permissions prompt to appear",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }

      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ??
          Constants?.easConfig?.projectId;
        if (!projectId) {
          throw new Error("Project ID not found");
        }
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log(token);
      } catch (e) {
        token = `${e}`;
      }
    } else {
      alert("Must use physical device for Push Notifications");
    }

    return token;
  }

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#1F1F1F",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: "#fff", marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  if (courseData && lessonData) {
    return (
      <SafeAreaView
        className="bg-gray-800"
        style={{
          flex: 1,
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        }}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-row items-center p-4">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl ml-4">Now Playing</Text>
        </View>

        <View className="items-center mt-8">
          {courseData?.thumbnail ? (
            <Image
              source={{ uri: courseData.thumbnail }}
              className="w-[80vw] h-[80vw] rounded-lg mb-5"
            />
          ) : (
            <View className="w-[80vw] h-[80vw] bg-gray-700 rounded-lg mb-5 items-center justify-center">
              <Text className="text-black">No Thumbnail</Text>
            </View>
          )}

          <Text className="text-2xl text-white font-bold">
            {lessonData?.title || "Untitled Lesson"}
          </Text>
          <Text className="text-lg text-gray-400 mb-5">
            {courseData?.instructor || "Unknown Instructor"}
          </Text>

          <View className="flex-row items-center w-[85vw]">
            <Text className="text-white">{formatTime(positionMillis)}</Text>
            <Slider
              style={{ width: "85%" }}
              minimumValue={0}
              maximumValue={durationMillis}
              value={positionMillis}
              onSlidingComplete={async (value) => {
                try {
                  await soundRef.current?.setPositionAsync(value);
                  setPositionMillis(value);
                } catch (e) {
                  console.log("Slider error:", e);
                }
              }}
              minimumTrackTintColor="#FF9C01"
              maximumTrackTintColor="#8E8E93"
              thumbTintColor="#FF9C01"
            />
            <Text className="text-white">{formatTime(durationMillis)}</Text>
          </View>

          <View className="flex-row items-center justify-between w-[60vw] mt-5">
            <TouchableOpacity onPress={rewind}>
              <FontAwesome name="backward" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePlayPause}>
              <FontAwesome
                name={isPlaying ? "pause" : "play"}
                size={30}
                color="white"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={fastForward}>
              <FontAwesome name="forward" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return null;
};

export default AudioPlayer;

const formatTime = (millis: number) => {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};
