import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Button,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useGlobalContext } from "../context/GlobalProvider";

import { router, Stack } from "expo-router";
import { MtnGateway } from "../mobile-money/mtn/payment.service";
import { subscribeToPlan } from "../lib/appwrite";
import { checkPendingPayments } from "../lib/localStorage";

// Loading Indicator Component
const LoadingIndicator = () => (
  <View className="flex justify-center items-center h-full">
    <ActivityIndicator size="large" color="#FF9001" />
    <Text className="text-gray-300 mt-4 text-base">
      Verifying your payment...
    </Text>
  </View>
);
type PaymentStatusResponse = {
  success: boolean;
  data?: { status: "SUCCESSFUL" | "PENDING" | "FAILED"; [key: string]: any };
  error?: string;
};

const PaymentConfirmationPage = () => {
  const {
    selectedPlan,
    paymentReference,
    user,
    setSubscription,
    setSelectedPlan,
  } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  // Function to check the payment status
  const confirmPayment = async () => {
    const gateway = MtnGateway.getInstance();
    if (!paymentReference || !selectedPlan || !user) {
      setError("Missing payment reference, plan or user data.");
      return;
    }

    setLoading(true);

    try {
      // Call your backend to confirm payment, you can pass paymentReference and user details
      const paymentStatus: PaymentStatusResponse = await gateway.confirmPayment(
        paymentReference
      );

      // Type narrowing to ensure `data` exists
      if (paymentStatus.success && paymentStatus.data) {
        const { status } = paymentStatus.data;

        if (status === "SUCCESSFUL") {
          console.log(paymentStatus);
          setPaymentConfirmed(true);
          setError(null);
          checkPaymentsAndActivate();
          router.replace("/"); // Redirect to home or another page
        } else if (status === "PENDING") {
          Alert.alert("Pending", "Your payment is still pending!");
        } else {
          Alert.alert("FAILED", "Your payment has failed!");
        }
      } else if (paymentStatus.success) {
        // Handle case where success is true but no data is available
        setError("No data returned for payment status.");
      } else {
        setError(`${paymentStatus.error}`);
      }
    } catch (err) {
      console.error("Error confirming payment:", err);
      setError("An error occurred while confirming the payment.");
    } finally {
      setLoading(false);
    }
  };
  const checkPaymentsAndActivate = async () => {
    await checkPendingPayments(async () => {
      console.log("Activating subscription now...");
      try {
        const subscriptionData = await subscribeToPlan(
          user.$id,
          selectedPlan,
          paymentReference
        );
        setSubscription(subscriptionData);
        console.log("Subscription activated successfully!");
        setSelectedPlan(null);
        router.replace("/home");
      } catch (err) {
        console.error("Failed to activate subscription:", err);
      }
    });
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-800 p-6">
      <Stack.Screen options={{ headerShown: false }} />
      <Text className="text-white text-xl font-bold text-center mb-6">
        Payment Confirmation
      </Text>

      <View className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-lg">
        <Text className="text-white text-lg font-semibold mb-4">
          You have selected the {selectedPlan?.name} plan.
        </Text>
        <Text className="text-gray-300 text-sm mb-4">
          Payment Reference: {paymentReference}
        </Text>

        {loading ? (
          <LoadingIndicator />
        ) : paymentConfirmed ? (
          <Text className="text-green-400 text-lg text-center mb-4">
            Payment Confirmed! You can now access your plan.
          </Text>
        ) : (
          <>
            {/* Message prompting the user to authorize the payment */}
            <Text className="text-gray-300 text-base mb-4">
              The payment request has been sent. You will receive a prompt soon.
              Once received, please authorize the payment by entering your
              mobile money PIN to complete your transaction. Once you authorize
              payment click on confirm payment
            </Text>

            <TouchableOpacity
              className="bg-secondary py-3 rounded-lg shadow-md mt-4"
              onPress={confirmPayment}
            >
              <Text className="text-white text-center font-bold">
                Confirm Payment
              </Text>
            </TouchableOpacity>

            {error && (
              <Text className="text-red-500 text-center mt-4 text-sm">
                {error}
              </Text>
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default PaymentConfirmationPage;
