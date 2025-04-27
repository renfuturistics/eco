import React, { useCallback, useEffect } from "react";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import TrackPlayer from "react-native-track-player";

import "../global.css";
import GlobalProvider, { useGlobalContext } from "../context/GlobalProvider";
import { playbackService } from "../constants/playbackService";
import { useLogTrackPlayerState } from "./hooks/useLogTrackPlayerState";
import { useSetupTrackPlayer } from "./hooks/useSetupTrackPlayer";
import { MtnGateway } from "../mobile-money/mtn/payment.service";
import { checkPendingPayments, hasPendingPayments } from "../lib/localStorage";

// ✅ Register the playback service safely
TrackPlayer.registerPlaybackService(() => playbackService);

const RootLayout = () => {
  const [fontsLoaded, fontError] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });

  const handleTrackPlayerLoaded = useCallback(() => {
    SplashScreen.hideAsync();
  }, []);

  useSetupTrackPlayer({ onLoad: handleTrackPlayerLoaded });
  useLogTrackPlayerState();

  useEffect(() => {
    const setupGateway = async () => {
      const gateway = MtnGateway.getInstance();
      // setupSandboxCredentials is already called in constructor
      console.log("MTN Gateway initialized");
    };

    setupGateway();
  }, []);

  // 🟡 Check pending payments once at app start
  useEffect(() => {
    checkPendingPayments();
  }, []);

  // 🟠 Polling to check pending payments every 10 seconds
  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function startPolling() {
      const hasPending = await hasPendingPayments();
      if (hasPending) {
        interval = setInterval(() => {
          console.log("Polling pending payments...");
          checkPendingPayments();
        }, 10000);
      }
    }

    startPolling();

    return () => clearInterval(interval);
  }, []);

  // 🧠 Show splash until fonts are loaded or error occurs
  useEffect(() => {
    if (fontError) throw fontError;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView>
      <GlobalProvider>
        <Stack>
          {/* your Stack.Screen components */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="subscribe" options={{ headerShown: false }} />
          <Stack.Screen
            name="search/[query]"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="goalDetails" options={{ headerShown: false }} />
          <Stack.Screen
            name="course_details/[id]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="audio_play/[audioUrl]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="post_details/[id]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="courses-lessons"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="change-password"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="notifications" options={{ headerShown: false }} />
          <Stack.Screen name="help-center" options={{ headerShown: false }} />
          <Stack.Screen name="edit_profile" options={{ headerShown: false }} />
          <Stack.Screen name="payment" options={{ headerShown: false }} />
          <Stack.Screen
            name="privacy-policy"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="inbox" options={{ headerShown: false }} />
        </Stack>
      </GlobalProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
