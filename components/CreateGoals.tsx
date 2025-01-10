import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  FlatList,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useGlobalContext } from "../context/GlobalProvider";
import { createGoal } from "../lib/appwrite";
import CustomButton from "./CustomButton";

interface Milestone {
  id: string;
  title: string;
}

const CreateGoalsWithDates = () => {
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [milestoneInput, setMilestoneInput] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const { user } = useGlobalContext();

  const addMilestone = () => {
    if (milestoneInput.trim().length === 0) {
      Alert.alert("Error", "Milestone title cannot be empty");
      return;
    }

    const newMilestone: Milestone = {
      id: Date.now().toString(),
      title: milestoneInput,
    };

    setMilestones((prev) => [...prev, newMilestone]);
    setMilestoneInput("");
  };

  const removeMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((milestone) => milestone.id !== id));
  };

  const saveGoal = async () => {
    if (goalTitle.trim().length === 0) {
      Alert.alert("Error", "Goal title cannot be empty");
      return;
    }
    if (!startDate || !endDate) {
      Alert.alert("Error", "Please select start and end dates");
      return;
    }
    if (endDate <= startDate) {
      Alert.alert("Error", "End date must be after the start date");
      return;
    }

    const goalData = {
      title: goalTitle,
      description: goalDescription,
      milestones,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    try {
      const userID = user?.Id;
      await createGoal(
        userID,
        goalData.title,
        goalData.description,
        goalData.milestones,
        goalData.startDate,
        goalData.endDate
      );

      setGoalTitle("");
      setGoalDescription("");
      setMilestones([]);
      setStartDate(null);
      setEndDate(null);

      Alert.alert("Success", "Goal saved successfully!");
    } catch (error) {
      console.error("Error saving goal:", error);
      Alert.alert("Error", "Failed to save the goal. Please try again.");
    }
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined, type: "start" | "end") => {
    if (type === "start") {
      setShowStartPicker(false);
      if (selectedDate) setStartDate(selectedDate);
    } else {
      setShowEndPicker(false);
      if (selectedDate) setEndDate(selectedDate);
    }
  };

  const renderItem = ({ item }: { item: Milestone }) => (
    <View className="flex-row justify-between items-center bg-gray-800 p-3 rounded-lg mb-2">
      <Text className="text-white flex-1 text-sm">{item.title}</Text>
      <TouchableOpacity
        onPress={() => removeMilestone(item.id)}
        className="bg-red-500 py-1 px-3 rounded-lg"
      >
        <Text className="text-white">Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-900">

      <View className="p-2">
        <Text className="text-lg font-semibold text-white mb-2">Goal Title</Text>
        <TextInput
          className="bg-gray-800 text-white p-4 rounded-lg h-14 mb-4"
          placeholder="Enter Goal Title"
          placeholderTextColor="#B3B3B3"
          value={goalTitle}
          onChangeText={setGoalTitle}
        />

        <Text className="text-lg font-semibold text-white mb-2">Description</Text>
        <TextInput
          className="bg-gray-800 text-white p-4 rounded-lg h-20 mb-4"
          placeholder="Add a description..."
          placeholderTextColor="#888"
          value={goalDescription}
          onChangeText={setGoalDescription}
          multiline
        />

        <Text className="text-lg font-semibold text-white mb-2">Start Date</Text>
        <TouchableOpacity
          onPress={() => setShowStartPicker(true)}
          className="bg-gray-800 p-4 rounded-lg mb-4"
        >
          <Text className="text-white">
            {startDate ? `Start Date: ${startDate.toDateString()}` : "Select Start Date"}
          </Text>
        </TouchableOpacity>

        <Text className="text-lg font-semibold text-white mb-2">End Date</Text>
        <TouchableOpacity
          onPress={() => setShowEndPicker(true)}
          className="bg-gray-800 p-4 rounded-lg mb-4"
        >
          <Text className="text-white">
            {endDate ? `End Date: ${endDate.toDateString()}` : "Select End Date"}
          </Text>
        </TouchableOpacity>

        {showStartPicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => handleDateChange(event, selectedDate, "start")}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => handleDateChange(event, selectedDate, "end")}
          />
        )}

        <Text className="text-lg font-semibold text-white mb-2">Milestones</Text>
        <View className="flex-row items-center mb-4">
          <TextInput
            className="flex-1 bg-gray-800 text-white p-4 rounded-lg mr-4"
            placeholder="Milestone Title"
            placeholderTextColor="#B3B3B3"
            value={milestoneInput}
            onChangeText={setMilestoneInput}
          />
          <TouchableOpacity
            onPress={addMilestone}
            className=" bg-secondary py-3 px-5 rounded-lg"
          >
            <Text className="text-white font-semibold">Add</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={milestones}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text className="text-gray-500 text-center">No milestones added yet.</Text>
          }
        />

        <CustomButton
          title="Save Goal"
          handlePress={saveGoal}
          containerStyles="mt-6 bg-primary py-4 rounded-lg"
          textStyles="text-white text-lg font-bold"
        />
      </View>
    </SafeAreaView>
  );
};

export default CreateGoalsWithDates;
