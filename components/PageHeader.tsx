import { router } from "expo-router";

import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
const PageHeader = ({ title }: any) => {
  return (
    <View
      style={{
        marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
      className="h-16 bg-gray-800 mb-3 flex flex-row items-center px-4"
    >
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="flex justify-center items-center w-10 h-10 bg-[#2C353D] rounded-full mr-4"
      >
        <FontAwesome name="chevron-left" size={16} color="#C5D0E6" />
      </TouchableOpacity>

      {/* Header Title */}
      <Text className="font-semibold text-lg text-[#F7F7F7]">{title}</Text>
    </View>
  );
};

export default PageHeader;
