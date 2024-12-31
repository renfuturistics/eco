import { router, Stack } from "expo-router";
import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import PageHeader from "../components/PageHeader";
const PrivacyPolicyPage = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <PageHeader title="Privacy Policy" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-center px-6">
          <View className="mb-6">
            <Text className="text-lg text-white font-semibold mb-4">
              1. Introduction
            </Text>
            <Text className="text-gray-400">
              We are committed to protecting your personal information and your
              right to privacy. This Privacy Policy describes what information
              we collect, how we use it, and what rights you have concerning it.
              Please read it carefully.
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-lg text-white font-semibold mb-4">
              2. Information We Collect
            </Text>
            <Text className="text-gray-400">
              We collect personal information that you voluntarily provide to us
              when you register, express an interest in obtaining information
              about us, or otherwise contact us. This includes your name, email
              address, phone number, and payment information.
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-lg text-white font-semibold mb-4">
              3. How We Use Your Information
            </Text>
            <Text className="text-gray-400">
              We use the information we collect or receive to communicate with
              you, fulfill our services, improve our application, and ensure
              security. We may also use your information for marketing purposes,
              but only with your consent.
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-lg text-white font-semibold mb-4">
              4. Sharing Your Information
            </Text>
            <Text className="text-gray-400">
              We do not share, sell, rent, or trade your information with third
              parties for their promotional purposes. We may share information
              with third-party vendors, service providers, or contractors who
              perform services on our behalf and require access to such
              information to carry out that work.
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-lg text-white font-semibold mb-4">
              5. Data Security
            </Text>
            <Text className="text-gray-400">
              We have implemented appropriate technical and organizational
              security measures designed to protect the security of any personal
              information we process. However, no electronic transmission over
              the internet or information storage technology can be guaranteed
              to be 100% secure.
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-lg text-white font-semibold mb-4">
              6. Your Privacy Rights
            </Text>
            <Text className="text-gray-400">
              Depending on your location, you may have certain rights regarding
              your personal information, such as the right to access, update,
              delete, or restrict the use of your personal data. Please contact
              us if you would like to exercise these rights.
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-lg text-white font-semibold mb-4">
              7. Contact Us
            </Text>
            <Text className="text-gray-400">
              If you have questions or comments about this policy, you may
              contact us at support@yourapp.com.
            </Text>
          </View>

          <Text className="text-gray-500 text-center mt-8">
            Last Updated: [Insert Date]
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicyPage;
