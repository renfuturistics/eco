import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, SafeAreaView, ScrollView } from "react-native";
import { ProgressBar } from "react-native-paper";
import { fetchGrowthSummary } from "../lib/appwrite";
import { useGlobalContext } from "../context/GlobalProvider";
import { Ionicons } from "@expo/vector-icons";

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
        <Text className="text-orange-400 mt-4 text-lg">Loading Growth Summary...</Text>
      </SafeAreaView>
    );
  }

  if (!growthSummary) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center p-4">
        <Text className="text-red-500 text-lg text-center">
          No growth summary found.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900 p-4">
      <ScrollView>
        <Text className="text-white text-3xl font-bold mb-6 text-center">
          Your Growth Summary
        </Text>

        <View className="bg-gray-800 rounded-lg p-6 mb-4 shadow-lg items-center">
          <Ionicons name="school-outline" size={24} color="#FF9001" />
          <Text className="text-gray-400 text-sm mt-2">Courses Completed</Text>
          <Text className="text-white text-2xl font-bold mt-1">
            {growthSummary.totalCoursesCompleted}
          </Text>
        </View>

        <View className="bg-gray-800 rounded-lg p-6 mb-4 shadow-lg items-center">
          <Ionicons name="book-outline" size={24} color="#FF9001" />
          <Text className="text-gray-400 text-sm mt-2">Lessons Completed</Text>
          <Text className="text-white text-2xl font-bold mt-1">
            {growthSummary.totalLessonsCompleted}
          </Text>
          <ProgressBar
            progress={growthSummary.totalLessonsCompleted / 100} // Assume 100 lessons as a goal
            color="#FF9001"
            className="w-full h-2 mt-4 rounded-lg"
          />
        </View>

        <View className="bg-gray-800 rounded-lg p-6 mb-4 shadow-lg items-center">
          <Ionicons name="time-outline" size={24} color="#FF9001" />
          <Text className="text-gray-400 text-sm mt-2">Time Spent Learning</Text>
          <Text className="text-white text-2xl font-bold mt-1">
            {growthSummary.totalTimeSpent} hrs
          </Text>
        </View>

        <View className="bg-gray-800 rounded-lg p-6 mb-4 shadow-lg items-center">
          <Ionicons name="trophy-outline" size={24} color="#FF9001" />
          <Text className="text-gray-400 text-sm mt-2">Goals Completed</Text>
          <Text className="text-white text-2xl font-bold mt-1">
            {growthSummary.goalsCompleted}
          </Text>
        </View>

        <View className="bg-gray-800 rounded-lg p-6 mb-4 shadow-lg items-center">
          <Ionicons name="calendar-outline" size={24} color="#FF9001" />
          <Text className="text-gray-400 text-sm mt-2">Active Days</Text>
          <Text className="text-white text-2xl font-bold mt-1">
            {growthSummary.daysActive}
          </Text>
        </View>

        <View className="bg-gray-800 rounded-lg p-6 shadow-lg items-center">
          <Ionicons name="time-outline" size={24} color="#FF9001" />
          <Text className="text-gray-400 text-sm mt-2">Last Activity</Text>
          <Text className="text-white text-2xl font-bold mt-1">
            {new Date(growthSummary.lastActivityDate).toDateString()}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GrowthSummary;
