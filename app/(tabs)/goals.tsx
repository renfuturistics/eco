import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Platform,
  StatusBar,
} from "react-native";
import CreateGoalsWithDates from "../../components/CreateGoals";
import GoalsList from "../../components/goalList";

const GoalsTabScreen = () => {
  const [activeTab, setActiveTab] = useState<"Create Goal" | "Goals List">(
    "Create Goal"
  );

  const renderTabContent = () => {
    if (activeTab === "Create Goal") {
      return <CreateGoalsWithDates />;
    } else {
      return <GoalsList />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      {/* Header */}
      <View
        style={{
          marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        }}
        className="py-4"
      >
        <View className="flex justify-between items-start flex-row">
          <Text className="text-2xl ml-4 font-semibold text-white">
            {activeTab === "Create Goal" ? "Create a New Goal" : "Your Goals"}
          </Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row justify-center py-2 bg-gray-900">
        {["Create Goal", "Goals List"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab as "Create Goal" | "Goals List")}
            className={`px-8 py-3 rounded-lg mx-2 ${
              activeTab === tab ? "bg-secondary" : "bg-gray-700"
            }`}
          >
            <Text
              className={`font-semibold text-base ${
                activeTab === tab ? "text-white" : "text-gray-300"
              }`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <FlatList
        data={[{ key: "tabContent" }]}
        keyExtractor={(item) => item.key}
        renderItem={() => (
          <View className="p-4 flex-1">
            {renderTabContent()}
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default GoalsTabScreen;
