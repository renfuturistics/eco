import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { getConversationsWithUnreadCounts , getUserDetails } from "../lib/appwrite";
import { router } from "expo-router";
import { useGlobalContext } from "../context/GlobalProvider";

import PageHeader from "../components/PageHeader";

const InboxScreen = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [userAvatars, setUserAvatars] = useState<{ [key: string]: string }>({});
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});
  const { user } = useGlobalContext();
  const userId = user?.Id || "";
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const data = await getConversationsWithUnreadCounts(userId);
        setConversations(data);

        // Fetch user details for all participants
        const allParticipantIds = data.flatMap(
          (conversation: any) => conversation.participants
        );
        const uniqueUserIds = [...new Set(allParticipantIds)];
  
        const users = await getUserDetails(uniqueUserIds);
  
        // Map avatars and names
        const avatarsMap = users.reduce(
          (acc: { [key: string]: string }, user: any) => {
            acc[user.$id] = user.avatar || "default-avatar-url";
            return acc;
          },
          {}
        );
        const nameMap = users.reduce(
          (acc: { [key: string]: string }, user: any) => {
            acc[user.$id] = `${user.name} ${user.surname}` || "Anonymous";
            return acc;
          },
          {}
        );
  
        setUserAvatars(avatarsMap);
        setUserNames(nameMap);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        setError("Failed to load messages.");
      }finally {
        setIsLoading(false);
      }
    };
  
    fetchConversations();
  }, [userId]);
  

  const handleConversationPress = (conversationId: string) => {
    // Navigate to the chat screen with the selected conversation
    router.push(`chat/${conversationId}`);
  };

  const renderConversationItem = ({ item }: any) => {
    const otherParticipants = item.participants.filter(
      (participantId: string) => participantId !== userId
    );
  
    // Get participant names
    const otherParticipantsNames =
      otherParticipants
        .map((participantId: string) => userNames[participantId])
        .join(", ") || "Unknown";
  
    // Get avatars of participants
    const avatarUris = otherParticipants.map((id: string) => userAvatars[id]);

    return (
      <TouchableOpacity
        className="mt-2 mb-4 rounded-xl "
        onPress={() => handleConversationPress(item.$id)}
      >
        <View className="flex-row items-center">
          {/* Display multiple avatars */}
          <View className="flex-row -space-x-3">
            {avatarUris.slice(0, 2).map((uri: string, index: number) => (
              <Image
                key={index}
                source={{ uri }}
                className="w-12 h-12 rounded-full border-2 border-white"
              />
            ))}
            {avatarUris.length > 2 && (
              <View className="w-12 h-12 rounded-full bg-gray-300 justify-center items-center border-2 border-white">
                <Text className="text-xs font-semibold text-white">
                  +{avatarUris.length - 2}
                </Text>
              </View>
            )}
          </View>
  
          {/* Conversation Info */}
          <View className="ml-4 flex-1">
            <Text className="font-semibold text-base text-[#F7F7F7] mb-1">
              {otherParticipantsNames}
            </Text>
            <Text
              className="text-sm text-[#C5D0E6]"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.lastMessage}
            </Text>
          </View>
  
          {/* Unread Count */}
          {item.unreadCountForCurrentUser > 0 && (
            <View className="bg-red-500 rounded-full px-2 py-1">
              <Text className="text-white text-xs font-bold">
                {item.unreadCountForCurrentUser}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  
  

  return (
    <View className="bg-primary h-full px-4">
      <PageHeader title="Inbox" />
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#008080" />
          <Text className="text-gray-300 mt-4">Loading...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 text-center">{error}</Text>
        </View>
      ):(<>
            {conversations.length === 0 ? (
        // Display a message when there are no conversations
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-[#F7F7F7]">You have no conversations yet.</Text>
          <Text className="text-sm text-gray-400 mt-2">Start a conversation with someone to get started!</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.$id}
        />
      )}
      </>)}

    </View>
  );
};

export default InboxScreen;
