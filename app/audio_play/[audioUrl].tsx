import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import FastImage from "react-native-fast-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TrackPlayer, { useActiveTrack } from "react-native-track-player";
import { unknownTrackImageUri } from "../../constants/images/images";
import { defaultStyles, utilsStyles } from "../../styles";
import { colors, screenPadding, fontSize } from "../../constants/tokens";
import { usePlayerBackground } from "../hooks/usePlayerBackground";
import { PlayerControls } from "../../components/PlayerControls";
import { PlayerProgressBar } from "../../components/PlayerProgressbar";
import { MovingText } from "../../components/MovingText";
import { PlayerRepeatToggle } from "../../components/PlayerRepeatToggle";
import { PlayerVolumeBar } from "../../components/PlayerVolumeBar";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { getLessonAndCourseByLessonId } from "../../lib/appwrite";

const AudioPlayer = () => {
  const activeTrack = useActiveTrack();

  const { top, bottom } = useSafeAreaInsets();
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [lessonData, setLessonData] = useState<any>(null);
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();
  const soundRef = useRef(null);
  const params = useLocalSearchParams();
  const audioUrl = typeof params.audioUrl === "string" ? params.audioUrl : "";
  const lessonId = typeof params.lessonId === "string" ? params.lessonId : "";

  useEffect(() => {
    const loadTrack = async () => {
      try {
        await TrackPlayer.play();
      } catch (error) {
        console.error("Error loading track:", error);
      }
    };

    if (audioUrl) {
      loadTrack();
    }
  }, [audioUrl, lessonData, courseData]);
  // Fetch lesson and course data based on lessonId
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
  if (!activeTrack) {
    return (
      <View style={[defaultStyles.container, { justifyContent: "center" }]}>
        <ActivityIndicator color={colors.icon} />
      </View>
    );
  }
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={"#ff4747"} />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red" }}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View style={{ flexDirection: "row", padding: 16, alignItems: "center" }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={{ color: "white", fontSize: 18, marginLeft: 16 }}>
          Now Playing
        </Text>
      </View>
      <View style={styles.overlayContainer}>
        <DismissPlayerSymbol />

        <View style={{ flex: 1, marginTop: top + 70, marginBottom: bottom }}>
          <View style={styles.artworkImageContainer}>
            <Image
              source={{
                uri:
                  typeof activeTrack.artwork === "string" &&
                  activeTrack.artwork !== ""
                    ? activeTrack.artwork
                    : unknownTrackImageUri,
              }}
              resizeMode="cover"
              style={styles.artworkImage}
            />
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ marginTop: "auto" }}>
              <View style={{ height: 60 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {/* Track title */}
                  <View style={styles.trackTitleContainer}>
                    <MovingText
                      text={activeTrack.title ?? ""}
                      animationThreshold={30}
                      style={styles.trackTitleText}
                    />
                  </View>

                  {/* Favorite button icon */}
                </View>

                {/* Track artist */}
                {activeTrack.artist && (
                  <Text
                    numberOfLines={1}
                    style={[styles.trackArtistText, { marginTop: 6 }]}
                  >
                    {activeTrack.artist}
                  </Text>
                )}
              </View>

              <PlayerProgressBar style={{ marginTop: 32 }} />

              <PlayerControls style={{ marginTop: 40 }} />
            </View>

            <PlayerVolumeBar style={{ marginTop: "auto", marginBottom: 30 }} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const DismissPlayerSymbol = () => {
  const { top } = useSafeAreaInsets();

  return (
    <View
      style={{
        position: "absolute",
        top: top + 8,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
      }}
    >
      <View
        accessible={false}
        style={{
          width: 50,
          height: 8,
          borderRadius: 8,
          backgroundColor: "#fff",
          opacity: 0.7,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...defaultStyles.container,
    paddingHorizontal: screenPadding.horizontal,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  artworkImageContainer: {
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 11.0,
    flexDirection: "row",
    justifyContent: "center",
    height: "45%",
  },
  artworkImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 12,
  },
  trackTitleContainer: {
    flex: 1,
    overflow: "hidden",
  },
  trackTitleText: {
    ...defaultStyles.text,
    fontSize: 22,
    fontWeight: "700",
  },
  trackArtistText: {
    ...defaultStyles.text,
    fontSize: fontSize.base,
    opacity: 0.8,
    maxWidth: "90%",
  },
});

export default AudioPlayer;
