import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { fetchGoalAndMilestones } from "../../lib/appwrite";
import PageHeader from "../../components/PageHeader";

const GoalDetails = () => {
  const { id } = useLocalSearchParams();
  const [goal, setGoal] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Toggle milestone completion
  const toggleMilestoneCompletion = (milestoneId: string) => {
    const updatedMilestones = milestones.map((milestone) =>
      milestone.$id === milestoneId
        ? { ...milestone, isCompleted: !milestone.isCompleted }
        : milestone
    );
    setMilestones(updatedMilestones);
  };

  // Fetch goal and milestones
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { goal, milestones } = await fetchGoalAndMilestones(
          id.toString()
        );
        setGoal(goal);
        setMilestones(milestones);
      } catch (error) {
        console.error("Error fetching goal and milestones:", error);
        Alert.alert(
          "Error",
          "Failed to load goal details. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#FF9001" />
        <Text className="text-white mt-4">Loading goal details...</Text>
      </SafeAreaView>
    );
  }

  if (!goal) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
        <Text className="text-gray-400 text-lg">Goal not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <PageHeader title="Goal Details" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Goal Details */}
      <ScrollView className="flex-1">
        <View className="p-6 bg-primary rounded-b-3xl shadow-md">
          <Text className="text-white text-3xl font-bold mb-2">{goal.title}</Text>
          <Text className="text-gray-200 text-base leading-6">
            {goal.description}
          </Text>
          <Text className="text-gray-400 text-sm mt-4">
            Due Date: {new Date(goal.endDate).toDateString()}
          </Text>
        </View>

        {/* Milestones Section */}
        <View className="p-6">
          <Text className="text-white text-xl font-bold mb-4">Milestones</Text>
          {milestones.length === 0 ? (
            <Text className="text-gray-400 text-center">
              No milestones found for this goal.
            </Text>
          ) : (
            <FlatList
              data={milestones}
              keyExtractor={(item) => item.$id}
              renderItem={({ item }) => (
                <View
                  className={`bg-gray-800 rounded-lg p-4 mb-4 ${
                    item.isCompleted && "opacity-70"
                  }`}
                >
                  <Text
                    className={`text-lg font-semibold ${
                      item.isCompleted ? "text-green-400" : "text-white"
                    }`}
                  >
                    {item.title}
                  </Text>
                  <Text className="text-gray-400 text-sm mb-4">
                    {item.description || "No description provided."}
                  </Text>
                  <TouchableOpacity
                    onPress={() => toggleMilestoneCompletion(item.$id)}
                    className={`py-2 px-6 rounded-full ${
                      item.isCompleted ? "bg-red-500" : "bg-green-500"
                    }`}
                  >
                    <Text className="text-white text-center font-semibold">
                      {item.isCompleted ? "Undo Completion" : "Mark as Complete"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GoalDetails;
