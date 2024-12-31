import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';
const PaymentPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<"Airtel" | "MTN" | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const router = useRouter(); // Using router to navigate

  const pricingOptions = [
    { name: "Basic Plan", price: "K50/month" },
    { name: "Standard Plan", price: "K100/month" },
    { name: "Premium Plan", price: "K150/month" },
  ];

  const handlePayment = () => {
    if (!selectedPlan || !selectedProvider || !phoneNumber) {
      Alert.alert(
        "Incomplete Information",
        "Please select a plan, payment provider, and enter your phone number."
      );
      return;
    }

    Alert.alert(
      "Payment Initiated",
      `Your payment for ${selectedPlan} via ${selectedProvider} Money is being processed.`
    );

    // Clear selections after payment submission
    setSelectedPlan(null);
    setSelectedProvider(null);
    setPhoneNumber("");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900 px-6 py-8">
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="mb-6"
        style={{marginTop: Platform.OS ==="android"?20:0}}
      >
      <AntDesign name="arrowleft" size={24} color="white" />
      </TouchableOpacity>
      
      <ScrollView>
        <Text className="text-2xl font-bold text-white text-center mb-6">
          Choose Your Plan
        </Text>

        {/* Pricing Options */}
        <View className="mb-8">
          {pricingOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              className={`p-4 rounded-lg mb-4 ${
                selectedPlan === option.name ? "bg-secondary" : "bg-gray-800"
              }`}
              onPress={() => setSelectedPlan(option.name)}
            >
              <Text className="text-lg text-white text-center font-semibold">
                {option.name}
              </Text>
              <Text className="text-center text-white text-sm mt-1">
                {option.price}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Phone Number Input */}
        <Text className="text-lg text-white mb-4 text-center">Enter Mobile Number</Text>
        <TextInput
          className="bg-gray-800 text-white p-4 rounded-lg mb-2 text-center"
          placeholder="Enter phone number"
          placeholderTextColor="#B3B3B3"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
        <Text className="text-center text-gray-400 mb-8">
          Enter the phone number you wish to pay with. A prompt will be sent to that
          number for you to enter your mobile money PIN.
        </Text>

        {/* Payment Provider Options */}
        <Text className="text-lg text-white mb-4 text-center">
          Select Payment Method
        </Text>
        <View className="flex-row justify-around mb-8">
          <TouchableOpacity
            className={`p-4 rounded-lg ${
              selectedProvider === "Airtel" ? "bg-red-600" : "bg-gray-800"
            }`}
            onPress={() => setSelectedProvider("Airtel")}
          >
            <Text className="text-white text-lg">Airtel Money</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`p-4 rounded-lg ${
              selectedProvider === "MTN" ? "bg-yellow-500" : "bg-gray-800"
            }`}
            onPress={() => setSelectedProvider("MTN")}
          >
            <Text className="text-white text-lg">MTN Money</Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className="bg-secondary p-4 rounded-lg"
          onPress={handlePayment}
        >
          <Text className="text-white text-lg text-center">Proceed to Pay</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PaymentPage;
