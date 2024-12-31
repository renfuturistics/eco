import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import UserPostCard from "../../components/UserPostCard";
import {
  checkIfFollowing,
  createConversation,
  createFollow,
  getFollowersCount,
  getFollowingCount,
  getUserInfoById,
  getUserPosts,
  removeFollow,
} from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";

const ProfilePage = () => {
  const { userId } = useLocalSearchParams();
  const [userInformation, setUserInformation] = useState<any>();
  const [posts, setPosts] = useState<any>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const { user } = useGlobalContext();

  const currentUserId = user?.Id || "";
  // User Info
  const userInfo = {
    avatar: userInformation?.avatar || "https://via.placeholder.com/150",
    firstName: userInformation?.name || "Unknown",
    lastName: userInformation?.surname || "User",
  };

  // Fetch User Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          userInformation,
          postsData,
          followers,
          following,
          isUserFollowing,
        ] = await Promise.all([
          getUserInfoById(userId.toString()),
          getUserPosts(userId.toString()),
          getFollowersCount(userId.toString()),
          getFollowingCount(userId.toString()),
          checkIfFollowing(currentUserId, userId.toString()),
        ]);

        setUserInformation(userInformation);
        setPosts(postsData || []);
        setFollowersCount(followers);
        setFollowingCount(following);
        setIsFollowing(isUserFollowing);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    if (userId) fetchData();
  }, [userId]);

  // Handle Follow/Unfollow
  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        // Unfollow
        await removeFollow(currentUserId, userId.toString());
        setIsFollowing(false);
        setFollowersCount((prev) => prev - 1);
      } else {
        // Follow
        const username = `${user.name} ${user.surname}`;
        await createFollow({
          followerId: currentUserId,
          followedId: userId.toString(),
          username,
        });
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#161622",
    },
    scrollContainer: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    profileHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 20,
    },
    avatarContainer: {
      alignItems: "center",
      marginRight: 20,
    },
    avatar: {
      width: 70,
      height: 70,
      borderRadius: 40,
      borderColor: "#333",
      borderWidth: 3,
    },
    profileName: {
      fontSize: 14,
      color: "white",
      marginTop: 10,
    },
    statsContainer: {
      paddingHorizontal: 15,
      top: -15,
      flexDirection: "row",
      justifyContent: "space-between",
      flex: 1,
    },
    statItem: {
      alignItems: "center",
    },
    statText: {
      color: "white",
      fontSize: 16,
      fontWeight: "bold",
    },
    statLabel: {
      color: "white",
      fontSize: 12,
    },

    followButton: {
      paddingVertical: 8,
      paddingHorizontal: 40,
      borderRadius: 5,
      justifyContent: "center",
      alignItems: "center",
    },
    followingButton: {
      borderColor: "white",
      borderWidth: 1,
    },
    notFollowingButton: {
      borderColor: "white",
      borderWidth: 1,
    },
    followButtonText: {
      color: isFollowing ? "red" : "white",
      fontSize: 14,
      fontWeight: "bold",
    },
    buttonContainer: {
      flexDirection: "row", // Ensures buttons are side by side
      marginTop: 15,
    },
    messageButton: {
      // Blue color for Message
      paddingVertical: 8,
      paddingHorizontal: 40,
      borderColor: "white",
      borderWidth: 1,
      borderRadius: 5,
      justifyContent: "center",
      alignItems: "center",
    },
    messageButtonText: {
      color: "white",
      fontSize: 14,
      fontWeight: "bold",
    },
    postsSection: {
      marginTop: 20,
    },
    postsTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "white",
      marginBottom: 10,
    },
    postsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    noPostsText: {
      color: "white",
      fontSize: 16,
    },
  });
  const handleMessagePress = async () => {
    try {
      const participants = [currentUserId, userId.toString()]; // Assuming `currentUserId` is the logged-in user and `userId` is the person being messaged
      const lastMessage = "Start a conversation"; // Default last message

      // Call the backend to create a new conversation
      const newConversation = await createConversation({
        participants,
        lastMessage,
      });

      // Get the conversation ID
      const conversationId = newConversation.id;

      // If conversation is created successfully, navigate to the conversation screen
      if (conversationId) {
        router.push(`chat/${conversationId}`);
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Profile",
          headerStyle: { backgroundColor: "#161622" },
          headerTitleStyle: { color: "white" },
          headerTintColor: "white",
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: userInfo.avatar }} style={styles.avatar} />
            <Text style={styles.profileName}>
              {userInfo.firstName} {userInfo.lastName}
            </Text>
          </View>

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statText}>{posts.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statText}>{followersCount}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statText}>{followingCount}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        </View>

        {/* Follow and Message Buttons Section */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.followButton,
              isFollowing ? styles.followingButton : styles.notFollowingButton,
              { flex: 1, marginRight: 10 }, // Ensures both buttons share space and have some gap
            ]}
            onPress={handleFollowToggle}
          >
            <Text style={styles.followButtonText}>
              {isFollowing ? "Unfollow" : "Follow"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleMessagePress}
            style={[
              styles.messageButton,
              { flex: 1, marginLeft: 10 }, // Ensures both buttons share space and have some gap
            ]}
          >
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
        </View>

        {/* User Posts Section */}
        <View style={styles.postsSection}>
          <Text style={styles.postsTitle}>Your Posts</Text>
          {posts.length > 0 ? (
            <View style={styles.postsGrid}>
              {posts.map((post: any) => (
                <UserPostCard
                  key={post?.$id}
                  id={post?.$id}
                  title={post?.title || "Untitled"}
                  description={post?.description || "No description provided"}
                  image={post.image} // Placeholder image
                  avatar={post?.user?.avatar || userInfo.avatar}
                  tags={post?.tags || []}
                  comments={post?.comments || 0}
                />
              ))}
            </View>
          ) : (
            <Text style={styles.noPostsText}>You have no posts yet.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfilePage;
