import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { MtnGateway } from "../mobile-money/mtn/payment.service";
import uuid from "react-native-uuid";
import { savePendingPayment } from "../lib/localStorage";
const PaymentPage = () => {
  const [selectedProvider, setSelectedProvider] = useState<
    "Airtel" | "MTN" | null
  >(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false); // 👈 added loading state
  const router = useRouter();

  const handlePayment = async () => {
    if (!selectedProvider || !phoneNumber) {
      Alert.alert(
        "Incomplete Information",
        "Please select a plan, payment provider, and enter your phone number."
      );
      return;
    }

    setIsLoading(true); // 👈 show loading screen

    if (selectedProvider === "MTN") {
      const gateway = MtnGateway.getInstance();
      const referenceId = uuid.v4() as string;
      const amount = 100; // 100 ZMW
      const paymentResult = await gateway.processPayment(
        referenceId,
        phoneNumber,
        amount
      );

      if (paymentResult.success) {
        savePendingPayment(referenceId);
        alert("Payment Initiated! Please approve it on your phone.");
        setIsLoading(false);
      } else {
        console.error("Payment Failed:", paymentResult.error);
        alert("Payment Failed: " + paymentResult.error);
        setIsLoading(false);
      }
    } else if (selectedProvider === "Airtel") {
    }
    // Simulate payment processing (e.g. sending request to payment gateway)

    setSelectedProvider(null);
    setPhoneNumber("");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-10 left-6 z-10"
        style={{ marginTop: Platform.OS === "android" ? 30 : 0 }}
      >
        <AntDesign name="arrowleft" size={24} color="white" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center items-center px-6 py-8">
          <Text className="text-2xl font-bold text-white text-center mb-6">
            Mobile Money Payment
          </Text>

          {/* Phone Number Input */}
          <Text className="text-lg text-white mb-4 text-center">
            Enter Mobile Number
          </Text>
          <TextInput
            className="bg-gray-800 text-white p-4 rounded-lg mb-2 text-center w-full"
            placeholder="Enter phone number"
            placeholderTextColor="#B3B3B3"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
          <Text className="text-center text-gray-400 mb-8">
            Enter the phone number you wish to pay with. A prompt will be sent
            to that number for you to enter your mobile money PIN.
          </Text>

          {/* Payment Provider Options */}
          <Text className="text-lg text-white mb-4 text-center">
            Select Payment Method
          </Text>
          <View className="flex-row justify-around w-full mb-8">
            <TouchableOpacity
              className={`flex-1 mx-2 p-4 rounded-lg ${
                selectedProvider === "Airtel" ? "bg-red-600" : "bg-gray-800"
              }`}
              onPress={() => setSelectedProvider("Airtel")}
            >
              <Text className="text-white text-lg text-center">
                Airtel Money
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 mx-2 p-4 rounded-lg ${
                selectedProvider === "MTN" ? "bg-yellow-500" : "bg-gray-800"
              }`}
              onPress={() => setSelectedProvider("MTN")}
            >
              <Text className="text-white text-lg text-center">MTN Money</Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className="bg-secondary p-4 rounded-lg w-full"
            onPress={handlePayment}
          >
            <Text className="text-white text-lg text-center">
              Proceed to Pay
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PaymentPage;
