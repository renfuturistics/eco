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
import { useNavigation } from "@react-navigation/native";
import { fetchGoals } from "../lib/appwrite";
import { useGlobalContext } from "../context/GlobalProvider";
import { router } from "expo-router";

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

  const renderGoal = ({ item }: any) => (
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
    </TouchableOpacity>
  );

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
        <TouchableOpacity className="bg-secondary py-4 rounded-lg mt-6">
          <Text className="text-white text-center font-bold text-lg">
            + Create New Goal
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default GoalsList;
