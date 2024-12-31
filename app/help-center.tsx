import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import PageHeader from "../components/PageHeader";

const HelpCenterPage = () => {
  const faqs = [
    {
      question: "How do I reset my password?",
      answer:
        "Go to Settings > Account > Reset Password to change your password.",
    },
    {
      question: "How can I update my profile information?",
      answer: "Navigate to Your Profile page and select Edit Profile.",
    },
    {
      question: "How do I contact support?",
      answer: "You can fill out the form below or email support@yourapp.com.",
    },
  ];

  const handleContactSubmit = () => {
    Alert.alert(
      "Message Sent",
      "Our support team will reach out to you shortly."
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
    <PageHeader title="Help Centre" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-center px-6">
          {/* FAQ Section */}
          <View className="mb-8">
            <Text className="text-xl text-white font-semibold mb-4">
              Frequently Asked Questions
            </Text>
            {faqs.map((faq, index) => (
              <View key={index} className="bg-gray-800 p-4 mb-4 rounded-lg">
                <Text className="text-lg text-white font-bold">
                  {faq.question}
                </Text>
                <Text className="text-gray-400 mt-2">{faq.answer}</Text>
              </View>
            ))}
          </View>

          {/* Contact Support Section */}
          <View className="mb-8">
            <Text className="text-xl text-white font-semibold mb-4">
              Contact Support
            </Text>
            <TextInput
              className="bg-gray-800 text-white p-4 rounded-lg mb-4"
              placeholder="Enter your email address"
              placeholderTextColor="#B3B3B3"
              keyboardType="email-address"
            />
            <TextInput
              className="bg-gray-800 text-white p-4 rounded-lg mb-4"
              placeholder="How can we help you?"
              placeholderTextColor="#B3B3B3"
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity
              className="bg-secondary p-4 rounded-lg flex-row items-center justify-center"
              onPress={handleContactSubmit}
            >
              <MaterialIcons name="send" size={24} color="white" />
              <Text className="ml-2 text-white text-lg">Send Message</Text>
            </TouchableOpacity>
          </View>

          {/* Contact Options */}
          <View className="mb-8">
            <Text className="text-xl text-white font-semibold mb-4">
              Other Contact Options
            </Text>
            <TouchableOpacity
              className="flex-row items-center p-4 bg-gray-800 rounded-lg mb-4"
              onPress={() =>
                Alert.alert(
                  "Support",
                  "You can email us at support@yourapp.com."
                )
              }
            >
              <Ionicons name="mail-outline" size={24} color="white" />
              <Text className="ml-2 text-white text-lg">Email Us</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center p-4 bg-gray-800 rounded-lg"
              onPress={() =>
                Alert.alert("Phone Support", "Call us at +1234567890")
              }
            >
              <Ionicons name="call-outline" size={24} color="white" />
              <Text className="ml-2 text-white text-lg">Call Us</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpCenterPage;
