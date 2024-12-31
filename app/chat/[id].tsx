import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { getMessagesForConversation, createMessage, markMessagesAsRead } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import PageHeader from "../../components/PageHeader";

type Message = {
  content: string;
  senderId: { $id: string };
  $createdAt: string;
};

const Chat = () => {
  const { id: conversationId } = useLocalSearchParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const { user } = useGlobalContext();
  const userId = user?.Id || "";
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        
        // Run both promises concurrently
        const [conversationMessages, _] = await Promise.all([
          getMessagesForConversation(conversationId.toString()),
          markMessagesAsRead(conversationId.toString(), userId),
        ]);
  
        setMessages(conversationMessages);
      } catch (err) {
        console.error("Error fetching conversation messages:", err);
        setError("Failed to load messages.");
      } finally {
        setIsLoading(false);
      }
    };
  
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId]);
  
  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        const savedMessage = await createMessage({
          conversationId: conversationId.toString(),
          content: newMessage,
          senderId: userId,
        });

        setMessages((prevMessages) => [...prevMessages, savedMessage]);
        setNewMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  };

  return (
    <View className="flex-1 bg-gray-900">
      <Stack.Screen options={{ headerShown: false }} />
      <PageHeader title="Chat" />

      {/* Loading and Error States */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#008080" />
          <Text className="text-gray-300 mt-4">Loading...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 text-center">{error}</Text>
        </View>
      ) : (
        <>
          {/* Messages Section */}
          <ScrollView className="flex-1 px-4 py-6">
            {messages.map((msg, index) => (
              <View
                key={index}
                className={`mb-4 p-4 rounded-lg ${
                  msg.senderId.$id === userId
                    ? "bg-[#008080] self-end ml-auto"
                    : "bg-[#113844] self-start mr-auto"
                }`}
              >
                <Text className="text-white">{msg.content}</Text>
                <Text
                  className={`text-xs mt-1 ${
                    msg.senderId.$id === userId
                      ? "text-gray-200"
                      : "text-gray-400"
                  }`}
                >
                  {formatDate(msg.$createdAt)}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Message Input Section */}
          <View className="flex-row items-center mb-4 bg-gray-800 p-3 rounded-lg shadow-sm">
            <TextInput
              className="flex-1 text-white bg-transparent placeholder-gray-500"
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor="#888"
            />
            <TouchableOpacity
              className="bg-[#008080] rounded-full py-3 px-6"
              onPress={handleSendMessage}
            >
              <Text className="text-white font-bold text-lg">Send</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default Chat;
