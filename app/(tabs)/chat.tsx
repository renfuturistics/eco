import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import AddPost from "../../components/AddPost"; // Importing the AddPost component
import PostCard from "../../components/PostCard";
import { countUnreadNotifications, getLatestPosts } from "../../lib/appwrite"; // Importing the function
import PostHeader from "../../components/PostHeader";
import { images } from "../../constants";
import { useGlobalContext } from "../../context/GlobalProvider";
import { router } from "expo-router";
import SubscriptionPage from "../subscribe";

const ForumScreen = () => {
  const [posts, setPosts] = useState<any[]>([]); // State to store fetched posts
  const [initialLoading, setInitialLoading] = useState(true); // State for initial loading indicator
  const [loadingMore, setLoadingMore] = useState(false); // State for loading more posts indicator
  const [error, setError] = useState<string | null>(null); // State for error handling
  const [refreshing, setRefreshing] = useState(false); // State for pull-to-refresh
  const [page, setPage] = useState(1); // Page state for pagination
  const [totalCount, setTotalCount] = useState(0); // Total number of posts for pagination control
  const { user, subscription } = useGlobalContext(); // Use subscription state
  const [unreadCount, setUnreadCount] = useState(0);
  const userId = user?.Id || "";

  // Redirect non-subscribers

  // Fetch unread notifications count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await countUnreadNotifications(userId);
        setUnreadCount(count);
      } catch (error) {
        console.error("Error fetching unread notification count:", error);
      }
    };

    if (userId) {
      fetchUnreadCount();
    }
  }, [userId]);

  // Fetch posts based on the page number
  const fetchPosts = async (
    isInitialFetch: boolean = false,
    pageNumber: number = 1
  ) => {
    try {
      if (isInitialFetch) setInitialLoading(true);
      else setLoadingMore(true);

      const fetchedPosts = await getLatestPosts(pageNumber); // Pass page to get posts for that page
      setPosts((prevPosts) => [...prevPosts, ...fetchedPosts.posts]); // Append new posts to the existing posts
      setTotalCount(fetchedPosts.totalCount); // Set total count for pagination controls
      setError(null); // Clear any errors
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to fetch posts. Please try again.");
    } finally {
      if (isInitialFetch) setInitialLoading(false);
      else setLoadingMore(false);
    }
  };

  // Initial fetch of posts when the component mounts
  useEffect(() => {
    if (subscription) {
      fetchPosts(true); // Initial fetch
    }
  }, [subscription]);

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const fetchedPosts = await getLatestPosts(1); // Refresh posts with page 1
      setPosts(fetchedPosts.posts); // Replace posts with refreshed ones
      setPage(1); // Reset page to 1 for the refresh
      setError(null);
    } catch (error) {
      console.error("Error refreshing posts:", error);
      setError("Failed to refresh posts. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  // Load more posts when the user reaches the bottom of the list
  const loadMorePosts = () => {
    if (posts.length < totalCount && !loadingMore) {
      // Check if there are more posts to load
      setPage((prevPage) => {
        const nextPage = prevPage + 1;
        fetchPosts(false, nextPage); // Fetch posts for the next page
        return nextPage;
      });
    }
  };

  if(!subscription){
    return (<SubscriptionPage/>)
  }
  // Loading state display
  if (initialLoading) {
    return (
      <SafeAreaView className="bg-primary h-full px-4 flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FF9001" />
        <Text className="text-white mt-4">Loading posts...</Text>
      </SafeAreaView>
    );
  }

  // Error state display
  if (error) {
    return (
      <SafeAreaView className="bg-primary h-full px-4 flex-1 justify-center items-center">
        <Text className="text-red-500 text-lg">{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-primary h-full px-4">
      <View className="mb-4">
        <PostHeader
          notificationCount={unreadCount || 0}
          logo={images.logo}
          avatar={user ? user.avatar : "https://via.placeholder.com/150"}
          onNotificationPress={() => router.push("/notifications")}
          onSearchPress={() => router.push("/postSearch")}
        />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF9001"
            colors={["#FF9001"]}
          />
        }
        onScrollEndDrag={loadMorePosts}
      >
        <AddPost />
        <View className="space-y-4">
          {posts.map((post) => (
            <PostCard
              description={post.description}
              id={post.$id}
              key={post.$id}
              image={post.image}
              title={post.title}
              avatar={post.user.avatar || "https://via.placeholder.com/150"}
              tags={post.tags || []}
              comments={post.comments || 0}
            />
          ))}
        </View>

        {/* Loading indicator for fetching more posts */}
        {loadingMore && posts.length > 0 && (
          <View className="flex items-center mt-4">
            <ActivityIndicator size="small" color="#FF9001" />
            <Text className="text-white">Loading more posts...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ForumScreen;
