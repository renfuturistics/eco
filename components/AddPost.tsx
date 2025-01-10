import { useState } from "react";
import { View, TextInput, Image, TouchableOpacity, Text } from "react-native";

import { useGlobalContext } from "../context/GlobalProvider";
const AddPost = () => {


  const { user } = useGlobalContext();

  return (
    <View className="flex flex-row items-center p-4 bg-gray-800 rounded-lg mb-4">
      {/* Avatar */}
      <Image
        source={{ uri: user?user.avatar:"https://via.placeholder.com/150" }} // Replace with your avatar source
        className="w-8 h-8 rounded-full mr-4"
      />

      {user && <Text className="text-white ">
        Welcome back, {user.name + " " + user.surname}
      </Text>}
    </View>
  );
};

export default AddPost;
