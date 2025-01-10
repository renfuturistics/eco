import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { fetchGoals } from "../lib/appwrite";
import { useGlobalContext } from "../context/GlobalProvider";
import { ProgressBar } from "react-native-paper";

const GoalsList = () => {
  const [goals, setGoals] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useGlobalContext();

  useEffect(() => {
    fetchGoal();
  }, []);

  const fetchGoal = async () => {
    try {
      const goals = await fetchGoals(user?.Id);
      setGoals(goals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      Alert.alert("Error", "Failed to load goals. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const renderGoal = ({ item }: any) => {
    const progress = item.progress || 0; // Assuming `progress` is a decimal between 0 and 1

    return (
      <TouchableOpacity
        onPress={() => router.push(`/goalDetails/${item.$id}`)}
        className="bg-gray-800 p-4 rounded-lg mb-4"
      >
        <Text className="text-white text-lg font-semibold">{item.title}</Text>
        <Text className="text-gray-400 text-sm mt-1">{item.description}</Text>
        <Text className="text-gray-400 text-sm mt-1">
          Start Date: {new Date(item.startDate).toDateString()}
        </Text>
        <Text className="text-gray-400 text-sm">
          End Date: {new Date(item.endDate).toDateString()}
        </Text>
        <View className="mt-4">
          <ProgressBar
            progress={progress}
            color="#FF9001"
            style={{ height: 8, borderRadius: 4 }}
          />
          <Text className="text-gray-400 text-sm mt-1">
            {Math.round(progress * 100)}% Complete
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="px-3 py-4">
        {loading ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : goals.length > 0 ? (
          <FlatList
            data={goals}
            keyExtractor={(item) => item.$id}
            renderItem={renderGoal}
          />
        ) : (
          <Text className="text-gray-500 text-center mt-4">
            No goals found. Start by creating a new goal!
          </Text>
        )}
        <TouchableOpacity
          onPress={() => router.push("/createGoal")}
          className="bg-secondary py-4 rounded-lg mt-6"
        >
          <Text className="text-white text-center font-bold text-lg">
            + Create New Goal
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default GoalsList;
