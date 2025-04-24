import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  DeviceEventEmitter,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import Slider from "@react-native-community/slider";
import * as Notifications from "expo-notifications";
import { Stack, useNavigation, useLocalSearchParams } from "expo-router";
import { useGlobalContext } from "../../context/GlobalProvider";
import {
  handleVideoCompletion,
  getLessonAndCourseByLessonId,
} from "../../lib/appwrite";

let currentlyPlayingSound: Audio.Sound | null = null;

const AudioPlayer = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
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

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: true, isLooping: false }
        );

        setSound(newSound);
        currentlyPlayingSound = newSound;

        const status = await newSound.getStatusAsync();
        if (status.isLoaded && status.durationMillis) {
          setDurationMillis(status.durationMillis);
        }

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setPositionMillis(status.positionMillis);
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish) {
              audioCompletion();
            }
          }
        });

        scheduleNotification();
      } catch (error) {
        console.error("Error loading sound:", error);
      }
    };

    loadSound();

    return () => {
      sound?.unloadAsync();
      if (currentlyPlayingSound === sound) currentlyPlayingSound = null;
    };
  }, [url]);

  const handlePlayPause = async () => {
    if (isPlaying) {
      await sound?.pauseAsync();
    } else {
      await sound?.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  const rewind = async () => {
    const newPosition = Math.max(positionMillis - 15000, 0);
    await sound?.setPositionAsync(newPosition);
    setPositionMillis(newPosition);
  };

  const fastForward = async () => {
    const newPosition = Math.min(positionMillis + 15000, durationMillis);
    await sound?.setPositionAsync(newPosition);
    setPositionMillis(newPosition);
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      const status = await sound?.getStatusAsync();
      if (status?.isLoaded) {
        setPositionMillis(status.positionMillis);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sound]);

  const requestNotificationPermissions = async () => {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Permission for notifications is required!");
    }
  };

  const createNotificationChannel = async () => {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
  };

  const scheduleNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Background Audio",
        body: "Audio is playing in the background. Tap to open.",
        sound: undefined,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        seconds: 5,
        repeats: true,
      } as Notifications.TimeIntervalTriggerInput,
    });
  };

  useEffect(() => {
    requestNotificationPermissions();
    createNotificationChannel();
  }, []);

  useEffect(() => {
    if (Platform.OS === "android") {
      DeviceEventEmitter.addListener(
        "android.intent.action.BOOT_COMPLETED",
        () => {
          scheduleNotification();
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

  if (loading) {
    return (
      <SafeAreaView className="bg-gray-800 flex-1 items-center justify-center">
        <Text className="text-white">Loading...</Text>
      </SafeAreaView>
    );
  }

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
        <Image
          source={{
            uri: courseData?.thumbnail || "https://via.placeholder.com/300",
          }}
          className="w-[80vw] h-[80vw] rounded-lg mb-5"
        />
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
              await sound?.setPositionAsync(value);
              setPositionMillis(value);
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
};

const formatTime = (millis: number) => {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

export default AudioPlayer;
