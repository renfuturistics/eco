import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import { useGlobalContext } from "../context/GlobalProvider";
import { createSubscription } from "../lib/appwrite";
import PageHeader from "../components/PageHeader";

const LoadingIndicator = ({ message }: { message: string }) => (
  <View className="flex justify-center items-center">
    <ActivityIndicator size="large" color="#FF9001" />
    <Text className="text-white mt-4">{message}</Text>
  </View>
);

const SubscriptionDetails = ({ subscription }: { subscription: any }) => (
  <View className="bg-secondary p-4 rounded-md shadow-md">
    <Text className="text-white text-lg">
      <Text className="font-bold">Status:</Text> Active
    </Text>
    <Text className="text-white text-lg">
      <Text className="font-bold">Plan:</Text> {subscription.planName || "N/A"}
    </Text>
    <Text className="text-white text-lg">
      <Text className="font-bold">Expires On:</Text>{" "}
      {new Date(subscription.expiryDate).toLocaleDateString() || "N/A"}
    </Text>
    <TouchableOpacity className="mt-4 bg-red-600 p-3 rounded-md">
      <Text className="text-white text-center font-bold">Cancel Subscription</Text>
    </TouchableOpacity>
  </View>
);

const SubscriptionPage = () => {
  const { subscription, setSubscription, user } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const newSubscription = await createSubscription(user?.Id, "h"); // Replace with your logic
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
      <PageHeader title="Subscriptions" />
      <View className="h-full px-4 flex justify-center items-center">
        <View className="w-full">
          <Text className="text-2xl text-white font-bold text-center mb-4">
            Subscription Page
          </Text>

          {loading ? (
            <LoadingIndicator message="Processing..." />
          ) : subscription ? (
            <SubscriptionDetails subscription={subscription} />
          ) : (
            <View className="bg-secondary p-4 rounded-md shadow-md">
              <Text className="text-white text-lg mb-4 text-center">
                You do not have an active subscription.
              </Text>
              <TouchableOpacity
                className="bg-highlight p-3 rounded-md"
                onPress={handleSubscribe}
              >
                <Text className="text-white text-center font-bold">Subscribe Now</Text>
              </TouchableOpacity>
            </View>
          )}

          {error && (
            <Text className="text-red-500 text-center mt-4">{error}</Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SubscriptionPage;
