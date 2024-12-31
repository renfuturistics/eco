// components/AudioCard.tsx
import { View, Text, Image, Button } from "react-native";
import React from "react";
import { TMedia } from "../types/TMedia";

const AudioCard = ({ title, creator, avatar, media, createdAt }: TMedia) => {
  return (
    <View className="p-4 bg-gray-800 rounded-md mb-4">
      <Image source={{ uri: avatar }} className="w-10 h-10 rounded-full" />
      <Text className="text-white">{title}</Text>
      <Text className="text-gray-400">{creator}</Text>

      {/* Implement playAudio logic for playing the audio file */}
    </View>
  );
};

export default AudioCard;
