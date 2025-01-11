import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, SafeAreaView } from "react-native";
import { ProgressBar } from "react-native-paper";
import { fetchGrowthSummary } from "../lib/appwrite";
import { useGlobalContext } from "../context/GlobalProvider";

const GrowthSummary = () => {
  const { user } = useGlobalContext();
  const [growthSummary, setGrowthSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSummary();
    }
  }, [user]);

  const fetchSummary = async () => {
    try {
      const summary = await fetchGrowthSummary(user?.Id);
      setGrowthSummary(summary);
    } catch (error) {
      console.error("Error fetching growth summary:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center p-4">
        <ActivityIndicator size="large" color="#FF9001" />
        <Text className="text-white mt-4">Loading Growth Summary...</Text>
      </SafeAreaView>
    );
  }

  if (!growthSummary) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center p-4">
        <Text className="text-red-400 text-center">
          No growth summary found.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900 p-2">
      <Text className="text-white text-2xl font-bold mb-6">Your Growth Summary</Text>

      <View className="bg-gray-800 p-4 rounded-lg mb-4">
        <Text className="text-gray-400 text-sm">Courses Completed</Text>
        <Text className="text-white text-lg font-bold mt-1">
          {growthSummary.totalCoursesCompleted}
        </Text>
      </View>

      <View className="bg-gray-800 p-4 rounded-lg mb-4">
        <Text className="text-gray-400 text-sm">Lessons Completed</Text>
        <Text className="text-white text-lg font-bold mt-1">
          {growthSummary.totalLessonsCompleted}
        </Text>
        <ProgressBar
          progress={growthSummary.totalLessonsCompleted / 100} // Assume 100 lessons as a goal
          color="#FF9001"
          className="h-2 mt-2"
        />
      </View>

      <View className="bg-gray-800 p-4 rounded-lg mb-4">
        <Text className="text-gray-400 text-sm">Time Spent Learning</Text>
        <Text className="text-white text-lg font-bold mt-1">
          {growthSummary.totalTimeSpent} hrs
        </Text>
      </View>

      <View className="bg-gray-800 p-4 rounded-lg mb-4">
        <Text className="text-gray-400 text-sm">Goals Completed</Text>
        <Text className="text-white text-lg font-bold mt-1">
          {growthSummary.goalsCompleted}
        </Text>
      </View>

      <View className="bg-gray-800 p-4 rounded-lg mb-4">
        <Text className="text-gray-400 text-sm">Active Days</Text>
        <Text className="text-white text-lg font-bold mt-1">
          {growthSummary.daysActive}
        </Text>
      </View>

      <View className="bg-gray-800 p-4 rounded-lg">
        <Text className="text-gray-400 text-sm">Last Activity</Text>
        <Text className="text-white text-lg font-bold mt-1">
          {new Date(growthSummary.lastActivityDate).toDateString()}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default GrowthSummary;
