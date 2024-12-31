import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Stack, useRouter } from "expo-router";

const VideoCard = ({
  title,
  creator,
  avatar,
  thumbnail,
  videoUri,
  date,
}: any) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: "/video_details",
          params: { title, creator, avatar, videoUri, thumbnail, date },
        });
      }}
      style={{
        flexDirection: "column",
        alignItems: "center",
        paddingHorizontal: 16,
        marginBottom: 20,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          marginBottom: 10,
        }}
      >
        <Image
          source={{ uri: avatar }}
          style={{ width: 46, height: 46, borderRadius: 23 }}
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}>
            {title}
          </Text>
          <Text style={{ color: "#AAA", fontSize: 12 }}>{date}</Text>
        </View>
        <Image
          source={require("../assets/icons/menu.png")}
          style={{ width: 20, height: 20 }}
        />
      </View>

      <Image
        source={{ uri: thumbnail }}
        style={{ width: "100%", height: 200, borderRadius: 12 }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
};

export default VideoCard;
