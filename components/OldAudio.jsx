import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, Stack } from "expo-router";
import { Audio } from "expo-av";
import Slider from "@react-native-community/slider"; // Updated import

const samplePodcastData = {
  title: "Building a Marketplace with Next.js",
  date: "2024-10-29",
  author: "John Doe",
  description:
    "In this episode, we dive into the intricacies of building scalable marketplaces using Next.js.",
  thumbnail: require("../assets/images/thumbnail.png"),
  audioUri: require("../assets/audio/audio.mp3"), // Local audio file
};

const AudioDetails = () => {
  const { podcastId } = useLocalSearchParams();
  const podcast = samplePodcastData; // Replace with actual fetched data
  const [sound, setSound] = useState<Audio.Sound | undefined>(undefined);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);

  useEffect(() => {
    const loadSound = async () => {
      const { sound: playbackSound } = await Audio.Sound.createAsync(
        podcast.audioUri
      );
      setSound(playbackSound);

      const status = await playbackSound.getStatusAsync();
      if (status.isLoaded && status.durationMillis) {
        setDurationMillis(status.durationMillis);
      }
    };

    loadSound();

    return () => {
      sound?.unloadAsync(); // Cleanup
    };
  }, [podcast.audioUri]);

  const handlePlayPause = async () => {
    if (isPlaying) {
      await sound?.pauseAsync();
    } else {
      await sound?.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  const rewind = async () => {
    const newPosition = Math.max(positionMillis - 10000, 0);
    await sound?.setPositionAsync(newPosition);
  };

  const fastForward = async () => {
    const newPosition = Math.min(positionMillis + 10000, durationMillis);
    await sound?.setPositionAsync(newPosition);
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#121212" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ padding: 16 }}>
        <Image
          source={podcast.thumbnail}
          style={{
            width: "100%",
            height: 200,
            borderRadius: 12,
            marginBottom: 16,
          }}
        />

        <Text style={{ color: "#FFFFFF", fontSize: 24, fontWeight: "bold" }}>
          {podcast.title}
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 4,
          }}
        >
          <Text style={{ color: "#B3B3B3", fontSize: 14 }}>
            by {podcast.author}
          </Text>
          <Text style={{ color: "#B3B3B3", fontSize: 14 }}>{podcast.date}</Text>
        </View>

        <Text
          style={{
            color: "#B3B3B3",
            fontSize: 16,
            marginTop: 12,
            marginBottom: 16,
          }}
        >
          {podcast.description}
        </Text>

        {/* Time Display */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <Text style={{ color: "#B3B3B3" }}>{formatTime(positionMillis)}</Text>
          <Text style={{ color: "#B3B3B3" }}>{formatTime(durationMillis)}</Text>
        </View>

        {/* Slider */}
        <Slider
          style={{ width: "100%", height: 40 }}
          minimumValue={0}
          maximumValue={durationMillis}
          value={positionMillis}
          onSlidingComplete={async (value) => {
            await sound?.setPositionAsync(value);
          }}
          minimumTrackTintColor="#1DB954"
          maximumTrackTintColor="#FFFFFF"
        />

        {/* Control Buttons */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 20,
          }}
        >
          <TouchableOpacity onPress={rewind}>
            <FontAwesome name="backward" size={30} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#1DB954",
              borderRadius: 50,
              padding: 12,
            }}
            onPress={handlePlayPause}
          >
            <FontAwesome
              name={isPlaying ? "pause" : "play"}
              size={30}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={fastForward}>
            <FontAwesome name="forward" size={30} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const formatTime = (millis) => {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

export default AudioDetails;
