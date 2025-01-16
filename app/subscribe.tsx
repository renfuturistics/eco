import { useState } from "react";
import {
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { useGlobalContext } from "../context/GlobalProvider";
import { createSubscription } from "../lib/appwrite";
import PageHeader from "../components/PageHeader";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
// Loading Indicator Component
const LoadingIndicator = ({ message }: { message: string }) => (
  <View className="flex justify-center items-center h-full">
    <ActivityIndicator size="large" color="#FF9001" />
    <Text className="text-gray-300 mt-4 text-base">{message}</Text>
  </View>
);

// Subscription Details Component
const SubscriptionDetails = ({ subscription }: { subscription: any }) => (
  <View className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg">
    <Text className="text-white text-xl font-bold mb-4 text-center">
      Active Subscription
    </Text>
    <Text className="text-gray-300 text-lg mb-2">
      <Text className="font-semibold">Status:</Text>{" "}
      {subscription.status || "N/A"}
    </Text>
    <Text className="text-gray-300 text-lg mb-2">
      <Text className="font-semibold">Expires On:</Text>{" "}
      {new Date(subscription.validUntil).toLocaleDateString() || "N/A"}
    </Text>
    <TouchableOpacity
      onPress={() => router.replace("/home")}
      className="mt-6 bg-secondary py-3 rounded-lg shadow-md"
    >
      <Text className="text-white text-center font-semibold">Continue</Text>
    </TouchableOpacity>
  </View>
);

// Subscription Options Component
const SubscriptionOptions = ({
  onSubscribe,
}: {
  onSubscribe: (planId: string) => void;
}) => {
  const subscriptionPlans = [
    {
      id: "premium",
      name: "Premium Plan",
      price: "K10/month",
      benefits: [
        "Access to full lessons",
        "All basic features",
        "Priority support",
        "Create Posts",
        "Add Goals",
      ],
    },
  ];

  return (
    <View className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg">
      <Text className="text-white text-xl font-bold text-center mb-6">
        Upgrade to premium
      </Text>
      <FlatList
        data={subscriptionPlans}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="mb-6 p-4 bg-gray-700 rounded-lg shadow-md">
            <Text className="text-white text-lg font-bold mb-2">
              {item.name}
            </Text>
            <Text className="text-gray-400 mb-4">{item.price}</Text>
            {item.benefits.map((benefit, index) => (
              <Text key={index} className="text-gray-300 text-sm mb-1">
                • {benefit}
              </Text>
            ))}
            <TouchableOpacity
              className="mt-4 bg-secondary py-3 rounded-lg shadow-md"
              onPress={() => onSubscribe(item.id)}
            >
              <Text className="text-white text-center font-bold">
                Subscribe to {item.name}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

// Main Subscription Page Component
const SubscriptionPage = () => {
  const { subscription, setSubscription, user } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    setLoading(true);
    setError(null);
    try {
      const newSubscription = await createSubscription(user?.Id, planId);
      setSubscription(newSubscription);
    } catch (err) {
      console.error("Subscription error:", err);
      setError("Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary flex-1">

      <View className="flex-1 px-3 justify-start items-center py-8">
        {/* Informational Text */}

        <View className="w-full mb-6">
          <LinearGradient
            colors={["#1E3A8A", "#3B82F6"]} // Blue gradient from dark to light
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-full py-8 px-4"
          >
            <Text className="text-white text-center text-3xl font-extrabold">
              Learn without Limits. Try our premium individual plan now
            </Text>
          </LinearGradient>
        </View>

        <View className="mt-2 mb-6">
          <Text className="text-white text-center text-3xl font-extrabold">
            Affordable plan for any situation
          </Text>
          <Text className="text-white text-xl font-bold text-center mt-4 mb-6">
            Pay using mobile money
          </Text>
          <View className="flex-row justify-center gap-4 space-x-8 mt-4">
            <Image
              source={require("../assets/images/airtel.png")} // Replace with your Airtel Money image path
              className="w-12 h-12 rounded-full bg-white p-2"
              style={{ padding: 4 }}
              resizeMode="contain"
            />
            <Image
              source={require("../assets/images/mtn.jpg")} // Replace with your MTN Money image path
              className="w-12 h-12 rounded-full"
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Render Content Based on Subscription State */}
        {loading ? (
          <LoadingIndicator message="Processing your request..." />
        ) : subscription ? (
          <SubscriptionDetails subscription={subscription} />
        ) : (
          <SubscriptionOptions onSubscribe={handleSubscribe} />
        )}

        {/* Error Message */}
        {error && (
          <Text className="text-red-500 text-center mt-6 text-sm">{error}</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default SubscriptionPage;
