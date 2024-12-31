import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { useGlobalContext } from "../../context/GlobalProvider";
import {
  getAllCommentsReplies,
  addComment,
  fetchCommentById,
  createNotification,
} from "../../lib/appwrite";
import PageHeader from "../../components/PageHeader";
// Adjust your import paths

const RepliesPage = () => {
  const router = useRouter();
  const { commentId, postId } = useLocalSearchParams();
  const [replies, setReplies] = useState<any>([]);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false); // Progress for sending
  const [isFetching, setIsFetching] = useState(true); // Progress for fetching
  const { user } = useGlobalContext();
  const userId = user?.Id || "";

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        setIsFetching(true); // Start progress
        const fetchedReplies = await getAllCommentsReplies(
          postId.toString(),
          commentId.toString()
        );
        setReplies(fetchedReplies);
      } catch (error) {
        console.error("Error fetching replies:", error);
        Alert.alert("Error", "Failed to fetch replies. Please try again.");
      } finally {
        setIsFetching(false); // End progress
      }
    };
    fetchReplies();
  }, [commentId]);

  const handleAddReply = async () => {
    if (replyText.trim()) {
      setIsSending(true); // Start sending progress
      const newReply = {
        users: userId,
        comment: replyText,
        postId,
        parentId: commentId, // Indicates this is a reply
      };

      try {
        const savedReply = await addComment(newReply);
        setReplies((prev: any) => [savedReply.newComment, ...prev]);
        setReplyText("");

        // Fetch the parent comment to identify the owner
        const parentComment = await fetchCommentById(commentId.toString()); // Assuming this function exists
        const parentOwnerId = parentComment?.users.Id;

        // Send a notification to the parent comment owner if it's not the replier
        if (parentOwnerId && parentOwnerId !== userId) {
          await createNotification({
            type: "Reply",
            userId: parentOwnerId,
            message: `Someone replied to your comment on the post.`,
            icon: "comment", // Adjust the icon to suit your design
            postId: postId.toString(),
            commentId: savedReply.newComment.$id, // Link to the reply
          });
        }
      } catch (error) {
        console.error("Error adding reply:", error);
        Alert.alert("Error", "Failed to send reply. Please try again.");
      } finally {
        setIsSending(false); // End sending progress
      }
    } else {
      Alert.alert("Error", "Reply cannot be empty.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#1a1a2e" }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      {/* Back Button */}
      <PageHeader title="Replies" />

      {/* Progress Indicator or Replies List */}
      {isFetching ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ff9500" />
          <Text className="text-gray-500 mt-2">Loading replies...</Text>
        </View>
      ) : (
        <FlatList
          data={replies}
          renderItem={({ item }) => {
            const user = item.users || {};
            return (
              <View className="flex-row items-start p-4 border-gray-700">
                <Image
                  source={{
                    uri: user.avatar || "https://via.placeholder.com/150",
                  }}
                  className="w-7 h-7 rounded-full"
                />
                <View className="flex-1 ml-3">
                  <Text className="text-white font-bold">
                    {user.name || "Unknown"} {user.surname || "User"}
                  </Text>
                  <Text className="text-gray-300 mt-1">
                    {item.comment || "No comment"}
                  </Text>
                </View>
              </View>
            );
          }}
          keyExtractor={(item) =>
            item?.$id ? item.$id.toString() : Math.random().toString()
          }
          ListEmptyComponent={() => (
            <Text className="text-gray-500 text-center mt-10">
              No replies yet. Be the first to reply!
            </Text>
          )}
        />
      )}

      {/* Input Field */}
      <View className="p-4 bg-gray-800 border-t border-gray-700">
        <View className="flex-row items-center bg-gray-700 rounded-full px-4">
          <TextInput
            className="flex-1 text-white py-2 pr-3"
            placeholder="Write a reply..."
            placeholderTextColor="#bbb"
            value={replyText}
            onChangeText={setReplyText}
            editable={!isSending} // Disable input while sending
          />
          <TouchableOpacity onPress={handleAddReply} disabled={isSending}>
            {isSending ? (
              <ActivityIndicator size="small" color="#ff9500" /> // Sending progress
            ) : (
              <FontAwesome name="send" size={20} color="#ff9500" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default RepliesPage;
