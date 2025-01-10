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
} from "react-native";
import { fetchGoalAndMilestones } from "../../lib/appwrite";
import PageHeader from "../../components/PageHeader";

const GoalDetails = () => {
  const { id } = useLocalSearchParams();
  const [goal, setGoal] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to toggle milestone completion
  const toggleMilestoneCompletion = (milestoneId: string) => {
    const updatedMilestones = milestones.map((milestone) =>
      milestone.$id === milestoneId
        ? { ...milestone, isCompleted: !milestone.isCompleted }
        : milestone
    );
    setMilestones(updatedMilestones);

    // Optionally update the backend here
    // await databases.updateDocument(databaseId, milestonesCollectionId, milestoneId, { isCompleted: !milestone.isCompleted });
  };

  // Fetch goal and milestones on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { goal, milestones } = await fetchGoalAndMilestones(id.toString());
        setGoal(goal);
        setMilestones(milestones);
      } catch (error) {
        console.error("Error fetching goal and milestones:", error);
        Alert.alert("Error", "Failed to load goal details. Please try again later.");
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
<PageHeader title="My goal"/>
        <Stack.Screen options={{headerShown:false}}/>
      {/* Goal Header */}
      <View className="p-4 bg-secondary rounded-b-3xl mb-4">
        <Text className="text-white text-3xl font-bold">{goal.title}</Text>
        <Text className="text-gray-200 text-base mt-2">{goal.description}</Text>
        <Text className="text-gray-400 text-sm mt-2">
          Due Date: {goal.dueDate || "No due date"}
        </Text>
      </View>

      {/* Milestones List */}
      <FlatList
        data={milestones}
        keyExtractor={(item) => item.$id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View className="bg-gray-800 rounded-lg p-4 mb-4 shadow-md">
            <Text
              className={`text-lg font-semibold mb-2 ${
                item.isCompleted ? "text-green-400" : "text-gray-200"
              }`}
            >
              {item.title}
            </Text>
            <Text className="text-gray-400 text-sm mb-4">
              {item.description || "No description available"}
            </Text>
            <TouchableOpacity
              onPress={() => toggleMilestoneCompletion(item.$id)}
              className={`py-2 px-4 rounded-lg self-start ${
                item.isCompleted ? "bg-red-500" : "bg-green-500"
              }`}
            >
              <Text className="text-white font-medium">
                {item.isCompleted ? "Undo" : "Complete"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text className="text-gray-400 text-center mt-8">
            No milestones found for this goal.
          </Text>
        }
      />
    </SafeAreaView>
  );
};

export default GoalDetails;
