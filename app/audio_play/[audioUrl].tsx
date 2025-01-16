import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { Audio } from "expo-av";
import Slider from "@react-native-community/slider";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useNavigation } from "expo-router";
import * as Notifications from "expo-notifications";
import { InterruptionModeIOS, InterruptionModeAndroid } from "expo-av";
import { DeviceEventEmitter } from "react-native"; // For boot event

const samplePodcastData = {
  title: "Building a Marketplace with Next.js",
  author: "John Doe",
  thumbnail: require("../../assets/images/thumbnail.png"),
  audioUri: require("../../assets/audio/audio.mp3"),
};

let currentlyPlayingSound: Audio.Sound | null = null;
import * as MediaLibrary from "expo-media-library";
import { handleVideoCompletion } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
const AudioPlayer = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const navigation = useNavigation();
  const screenWidth = Dimensions.get("window").width;
  const params = useLocalSearchParams();
  const url = params.url as string; // The video/audio URL
  const courseId = params.courseId as string; // The course ID
  const lessonId = params.lessonId as string
  const { user } = useGlobalContext();

  const userId = user.Id;

  const audioCompletion = () => {
    handleVideoCompletion(userId,courseId,lessonId)
      };
      useEffect(() => {
        const loadSound = async () => {
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
            samplePodcastData.audioUri,
            { shouldPlay: true, isLooping: false }
          );
      
          setSound(newSound);
          currentlyPlayingSound = newSound;
      
          const status = await newSound.getStatusAsync();
          if (status.isLoaded && status.durationMillis) {
            setDurationMillis(status.durationMillis);
          }
      
          // Listen for playback status updates
          newSound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded) {
              setPositionMillis(status.positionMillis);
              setIsPlaying(status.isPlaying);
      
              // Detect when the audio finishes
              if (status.didJustFinish) {
                console.log("Audio finished playing");
              audioCompletion(); // Call your completion function here
              }
            }
          });
        };
      
        loadSound();
      
        return () => {
          sound?.unloadAsync();
          if (currentlyPlayingSound === sound) currentlyPlayingSound = null;
        };
      }, []);
      

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

  // Request notification permissions and create notification channel
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
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  };

  const scheduleNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Background Audio is playing",
        body: "Tap to open the audio player",
      },
      trigger: {
        seconds: 5, // Trigger after 5 seconds
        repeats: true, // Repeat every 5 seconds
      },
    });
  };

  // Handle device reboot
  useEffect(() => {
    if (Platform.OS === "android") {
      DeviceEventEmitter.addListener(
        "android.intent.action.BOOT_COMPLETED",
        () => {
          scheduleNotification();
        }
      );
    }

    // Cleanup the event listener when the component unmounts
    return () => {
      if (Platform.OS === "android") {
        DeviceEventEmitter.removeAllListeners(
          "android.intent.action.BOOT_COMPLETED"
        );
      }
    };
  }, []);

  useEffect(() => {
    // Request permissions and create notification channel on mount
    requestNotificationPermissions();
    createNotificationChannel();
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#1C1C1E",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flexDirection: "row", alignItems: "center", padding: 15 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={{ color: "white", fontSize: 20, marginLeft: 15 }}>
          Now Playing
        </Text>
      </View>

      <View style={{ alignItems: "center", marginTop: 30 }}>
        <Image
          source={samplePodcastData.thumbnail}
          style={{
            width: screenWidth * 0.8,
            height: screenWidth * 0.8,
            borderRadius: 15,
            marginBottom: 20,
          }}
        />

        <Text style={{ fontSize: 24, color: "white", fontWeight: "bold" }}>
          Lesson name
        </Text>
        <Text style={{ fontSize: 18, color: "#BBBBBB", marginBottom: 20 }}>
          Teacher
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: "white" }}>{formatTime(positionMillis)}</Text>
          <Slider
            style={{ width: screenWidth * 0.85 }}
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
          <Text style={{ color: "white" }}>{formatTime(durationMillis)}</Text>
        </View>

        <View style={{ flexDirection: "row", marginTop: 20 }}>
          <TouchableOpacity onPress={rewind} style={{ padding: 20 }}>
            <FontAwesome name="fast-backward" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePlayPause} style={{ padding: 20 }}>
            <Ionicons
              name={isPlaying ? "pause-circle" : "play-circle"}
              size={60}
              color="#FF9C01"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={fastForward} style={{ padding: 20 }}>
            <FontAwesome name="fast-forward" size={24} color="white" />
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
