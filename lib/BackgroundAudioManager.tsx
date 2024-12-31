import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from "expo-av";
import * as Notifications from "expo-notifications";

// Configure background audio settings
export const setupBackgroundAudio = async () => {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    staysActiveInBackground: true,
    playsInSilentModeIOS: true,
    interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
};

// Show notification with playback controls
export const showAudioNotification = async (isPlaying: boolean) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Playing Audio",
      body: isPlaying ? "Audio is playing" : "Audio is paused",
      sound: false,
    },
    trigger: null,
  });
};
