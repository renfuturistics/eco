import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Image,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,

  Alert,

  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, Stack, router } from "expo-router";

import { formatDistanceToNow } from "date-fns";
import {
  getPostById,
  addComment,
  getAllComments,
  getAllCommentsReplies,
  createNotification,
} from "../../lib/appwrite";
import { images } from "../../constants";
import PageHeader from "../../components/PageHeader";
import { useGlobalContext } from "../../context/GlobalProvider";

const UserInfo = ({
  avatar,
  author,
  timestamp,
}: {
  avatar: string;
  author: string;
  timestamp: string;
}) => (
  <View className="flex-row items-center mb-1">
    <Image source={{ uri: avatar }} className="w-5 h-5 rounded-full mr-2" />
    <Text className="text-white font-bold mr-2">{author}</Text>
    <Text className="text-gray-400 text-xs">{timestamp}</Text>
  </View>
);

const PostDetails = () => {
  const params = useLocalSearchParams();
  const { id } = params;
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false); // Progress for sending
  const [loading, setLoading] = useState<boolean>(false);
  const [comments, setComments] = useState<any[]>([]);
  const [replies, setReplies] = useState<{ [key: string]: any[] }>({}); // Store replies for each comment
  const [showReplies, setShowReplies] = useState<{ [key: string]: boolean }>(
    {}
  ); // To toggle reply visibility
  const [postOwnerId,setPostOwnerId] = useState(null)
  const [post, setPost] = useState<any>(null);
  const { user } = useGlobalContext();
  const userId = user?.Id || "";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const fetchedPost = await getPostById(id?.toString());
        const fetchComments = await getAllComments(id?.toString());
        setComments(fetchComments);

        setPost(fetchedPost);
        setPostOwnerId(fetchedPost.user.Id)
        setError(null);
      } catch (error) {
        console.error("Error fetching post:", error);
        setError("Failed to fetch post. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [id]);

  const [inputState, setInputState] = useState({
    newComment: "",
    replyText: "",
  });


  const handleInputChange = (
    key: "newComment" | "replyText",
    value: string
  ) => {
    setInputState((prevState) => ({ ...prevState, [key]: value }));
  };

  const handleAddComment = useCallback(async () => {
    if (inputState.newComment.trim()) {
      try {
        const newComment = {
          users: userId, // ID of the user adding the comment
          comment: inputState.newComment,
          postId: id, // ID of the post being commented on
          parentId: null, // For thread-based comments, this could link to the parent comment
        };
  
        setIsSending(true); // Start sending progress
        const savedComment = await addComment(newComment);
  
        if (!savedComment || !savedComment.newComment.$id) {
          throw new Error("Invalid comment data");
        }
  
        // Update comments dynamically
        setComments((prevComments) => [savedComment.newComment, ...prevComments]);
  
        // Clear input field
        setInputState((prevState) => ({ ...prevState, newComment: "" }));
  
        // Send notification to the owner of the post/comment
     
        if (postOwnerId && postOwnerId !== userId) { // Avoid sending notifications to self
          await createNotification({
            type:"Comment",
            userId: postOwnerId,
            message: `New comment on your post: "${inputState.newComment}"`,
            icon: "comment",
            postId: id.toString(),
            commentId: savedComment.newComment.$id, // Pass the comment ID
          });
        }
      } catch (error) {
        console.error("Error adding comment:", error);
        Alert.alert("Error", "Failed to add a comment. Please try again.");
      } finally {
        setIsSending(false); // End sending progress
      }
    } else {
      Alert.alert("No comment", "Please add a comment.");
    }
  }, [inputState.newComment, userId, id]);
  
  // Toggle visibility of replies
  const toggleReplies = (commentId: string) => {
    router.push({
      pathname: "/replies", // Navigate to the Replies page
      params: {
        commentId,
        postId: id, // Pass the post ID
      },
    });
  };

  const renderComment = useCallback(
    ({ item }: any) => (
      <TouchableOpacity
        onPress={() => toggleReplies(item.$id)}
        className="p-5 border-b border-gray-700"
      >
        {/* User Info Section */}
        <View className="flex-row items-center mb-2">
          <Image
            source={{ uri: item.users?.avatar || "default-avatar-url" }} // Use default avatar if missing
            className="w-8 h-8 rounded-full mr-3"
          />
          <View>
            <Text className="text-white font-semibold text-sm">
              {item.users?.name || "Unknown Author"}
            </Text>
            {/* Show time ago instead of full date */}
            <Text className="text-gray-400 text-xs">
              {formatDistanceToNow(new Date(item.$createdAt), {
                addSuffix: true, // Adds "ago" at the end
              })}
            </Text>
          </View>
        </View>
  
        {/* Comment Text Section */}
        <Text className="text-gray-300 mb-2S mt-2 text-base">{item.comment}</Text>
  
        {/* Show Replies Section */}
        <TouchableOpacity
          className="mt-3 flex-row items-center"
          onPress={() => toggleReplies(item.$id)}
        >

          <Text className="text-blue-400 text-sm ">Show Replies</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    ),
    [toggleReplies]
  );
  
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#ff9500" />
        <Text className="text-gray-300 mt-2">Loading post...</Text>
      </SafeAreaView>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <SafeAreaView
      className="flex-1 bg-gray-900"
    >
      <PageHeader title="Posts" />
      <FlatList
        className="p-2"
        data={comments}
        keyboardShouldPersistTaps="handled"
        renderItem={renderComment}
        keyExtractor={(item) => (item?.$id ? item.$id.toString() : Math.random().toString())}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="p-1">
            <TouchableOpacity
            onPress={()=> {
              if(post.user.$id!==userId){
             router.push(`/user-profile/${post.user.$id}`)
              }
 
            }}
            className="flex-row gap-4 items-center my-2 mb-4">
              <Image
                source={{ uri: post.user.avatar }}
                className={"w-9 h-9 rounded-xl"}
              />
              <Text className="text-gray-400 text-md font-medium">
                {post.user.name + " " + post.user.surname}
              </Text>
            </TouchableOpacity>
            {post?.image ? (
              <View className="shadow-lg rounded-lg overflow-hidden mb-5">
                <Image source={{ uri: post.image }} className="w-full h-80" />
              </View>
            ) : (
              <View></View>
            )}

            <View className="flex-row gap-3">
              <Text className="text-white text-2xl font-bold mb-4">
                {post.title}
              </Text>
            </View>
            <View></View>

            <Text className="text-gray-300 text-base leading-6 mb-5">
              {post.description}
            </Text>
            <View className="flex flex-row items-center gap-3 mb-3">
              <Text className="text-gray-400 text-xs">
              {formatDistanceToNow(new Date(post.$createdAt), {
                addSuffix: true, // Adds "ago" at the end
              })}
               </Text>
              <Text className="text-gray-400 text-xs">
                {post.comments.toLocaleString()} Comments
              </Text>
            </View>
            <View className="flex-row items-start mb-4 bg-gray-800 p-3 rounded-lg shadow-sm">
              <TextInput
                className="flex-1 text-white bg-transparent placeholder-gray-500"
                placeholder="Add a comment..."
                placeholderTextColor="#888"
                numberOfLines={4}
                editable={!isSending} // Disable input while sending
                value={inputState.newComment}
                onChangeText={(text) => handleInputChange("newComment", text)}
              />
              <TouchableOpacity
                onPress={handleAddComment}
                className="ml-2 p-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full justify-center items-center"
              >
                        {isSending ? (
              <ActivityIndicator size="small" color="#ff9500" /> // Sending progress
            ) : (
              <FontAwesome name="send" size={18} color="#fff" />
            )}
           
              </TouchableOpacity>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default PostDetails;
