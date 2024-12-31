import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  Ionicons,
  FontAwesome,
  MaterialIcons,
  Feather,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  signOut,
  getUserPoints,
  getUserPosts,
  getFollowersCount,
  getFollowingCount,
} from "../../lib/appwrite"; // Import follow/unfollow functions
import { useGlobalContext } from "../../context/GlobalProvider";
import UserPostCard from "../../components/UserPostCard";
import BottomSheet, {
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AntDesign from '@expo/vector-icons/AntDesign';
const ProfilePage = () => {
  const router = useRouter();
  const { setIsLogged, setUser, user } = useGlobalContext();
  const [points, setPoints] = useState(0);
  const [posts, setPosts] = useState<any>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true); // Track loading state
  const [bottomSheetIndex, setBottomSheetIndex] = useState(-1); // State for controlling BottomSheet
  const sheetRef = useRef<BottomSheet>(null);

  const userId = user?.Id || "";

  // User Info
  const userInfo = {
    avatar: user?.avatar || "https://via.placeholder.com/150",
    firstName: user?.name || "Unknown",
    lastName: user?.surname || "User",
  };

  // Options for Bottom Sheet
  const options = [
    {
      title: "Your Profile",
      icon: <FontAwesome name="user" size={24} color="white" />,
      route: "/edit_profile",
    },
    {
      title: "Password",
      icon: <MaterialIcons name="security" size={24} color="white" />,
      route: "/change-password",
    },
    {
      title: "Privacy Policy",
      icon: <Feather name="shield" size={24} color="white" />,
      route: "/privacy-policy",
    },
    {
      title: "Help Center",
      icon: <MaterialIcons name="help-outline" size={24} color="white" />,
      route: "/help-center",
    },
    {
      title: "Logout",
      icon: <MaterialIcons name="logout" size={24} color="white" />,
      route: "/logout",
    },
  ];

  // Fetch User Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Set loading to true when fetching starts
      try {
        const [pointsData, postsData, followers, following] = await Promise.all(
          [
            getUserPoints(userId),
            getUserPosts(userId),
            getFollowersCount(userId.toString()),
            getFollowingCount(userId.toString()),
          ]
        );
        setPoints(pointsData || 0);
        setPosts(postsData || []);
        setFollowersCount(followers);
        setFollowingCount(following);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // Set loading to false when data is fetched or error occurs
      }
    };
    if (userId) fetchData();
  }, [userId]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut();
      setIsLogged(false);
      setUser(null);
      router.replace("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Bottom sheet toggle
  const toggleBottomSheet = () => {
    if (sheetRef.current) {
      if (bottomSheetIndex === -1) {
        sheetRef.current.expand(); // Open the sheet
        setBottomSheetIndex(1);
      } else {
        sheetRef.current.close(); // Close the sheet
      }
    }
  };

  if (loading) {
    // Show loading spinner while data is being fetched
    return (
      <View className="bg-primary" style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  return (
    <BottomSheetModalProvider>
      <GestureHandlerRootView style={styles.container}>
        {/* Top Navigation */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>{"Profile"}</Text>
          <View style={{ gap: 20, flexDirection: "row",alignItems:"center" }}>
            <TouchableOpacity
              onPress={()=>router.push("inbox")}
              accessibilityLabel="Toggle menu"
            >
              <AntDesign name="message1" size={22} color="white" />
      
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleBottomSheet}
              accessibilityLabel="Toggle menu"
            >
              <Ionicons name="menu" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Scrollable Content */}
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
                <Text style={styles.statText}>{followersCount || 0}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statText}>{followingCount || 0}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>

            {/* Points Section */}
          </View>
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsText}>You have earned</Text>
            <Text style={styles.pointsValue}>{points || 0} Points</Text>
          </View>
          <View style={styles.postsSection}>
            <Text style={styles.postsTitle}>Your Posts</Text>
            {posts.length > 0 ? (
              posts.map((post: any) => (
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
              ))
            ) : (
              <Text style={styles.noPostsText}>You have no posts yet.</Text>
            )}
          </View>
        </ScrollView>

        {/* Bottom Sheet */}
        <BottomSheet
          ref={sheetRef}
          enablePanDownToClose={true}
          index={bottomSheetIndex} // Use the state to control the BottomSheet
          snapPoints={["25%", "50%", "90%"]}
          enableDynamicSizing={false}
          onClose={() => setBottomSheetIndex(-1)} // Reset state
        >
          <BottomSheetScrollView
            contentContainerStyle={styles.contentContainer}
          >
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionItem}
                onPress={() => {
                  if (option.route === "/logout") {
                    handleLogout();
                  } else {
                    router.push(option.route);
                  }
                  if (sheetRef.current) {
                    sheetRef.current.close();
                    setBottomSheetIndex(-1); // Sync state with the closed state
                  }
                }}
              >
                <View style={styles.optionTextContainer}>
                  <View style={styles.iconContainer}>{option.icon}</View>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                </View>
                <Ionicons
                  name="chevron-forward-sharp"
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
            ))}
          </BottomSheetScrollView>
        </BottomSheet>
      </GestureHandlerRootView>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#161622",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
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
  pointsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#1E293B", // A distinct background color for contrast
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#64748B", // Optional: subtle border for emphasis
  },
  pointsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E2E8F0", // Text color
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FACC15", // Highlighted color for the points
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
  followButtonContainer: {
    alignItems: "flex-end",
  },
  followButton: {
    paddingVertical: 10,
    paddingHorizontal: 100,
    top: -15,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  followingButton: {
    backgroundColor: "#FF9C01", // Red color for Unfollow
  },
  notFollowingButton: {
    backgroundColor: "#FF9C01", // Green color for Follow
  },
  followButtonText: {
    color: "white",
    fontSize: 16,
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

  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },

  contentContainer: {
    backgroundColor: "#161622", // Dark background for bottom sheet
    height: "100%",
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  optionTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 15,
  },
  optionTitle: {
    color: "white",
    fontSize: 16,
  },
});
export default ProfilePage;
