import React, { useEffect, useState } from "react";
import { View, Text, Image } from "react-native";
import { FontAwesome } from "@expo/vector-icons"; // Ensure you have this installed
import { images } from "../constants";


const Header: React.FC<{ userId: string,notificationCount:number }> = ({ userId, notificationCount }) => {



  return (
    <View className="flex flex-col items-start p-3 bg-gray-800 absolute w-full h-[60px] mt-5">
      {/* Main Header Layout */}
      <View className="flex flex-row items-center justify-between w-[335px] h-[36px]">
        {/* Logo Section */}
        <View className="flex flex-row items-center gap-x-2 w-70 h-30">
          <View className="flex items-center justify-center p-1 bg-[#F7F7F7] rounded-md">
            <Image
              source={images.logo} // Replace with your logo image path
              className="w-22 h-22"
            />
          </View>
        </View>

        {/* Search Icon */}
        <View className="relative">
          <FontAwesome name="search" size={20} color="#858EAD" />
        </View>

        {/* Notification Icon */}
        <View className="relative">
          <FontAwesome name="bell" size={20} color="#858EAD" />
          {/* Notification Badge */}
          {notificationCount > 0 && (
            <View className="absolute top-[-5px] right-[-5px] w-5 h-5 rounded-full bg-[#FF6934] border border-[#262D34] flex items-center justify-center">
              <Text className="text-white text-[10px] font-bold">
                {notificationCount}
              </Text>
            </View>
          )}
        </View>

        {/* Profile Avatar */}
        <View className="flex flex-row items-center gap-x-2">
          <Image
            source={images.avatar} // Replace with your avatar image path
            className="w-9 h-9 rounded-full border border-[#EA942C] bg-[#F9DFC0]"
          />
        </View>
      </View>
    </View>
  );
};

export default Header;
