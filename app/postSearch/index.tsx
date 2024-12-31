import React, { useState, memo } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  Alert,
  TextInput,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useAppwrite from "../../lib/useAppwrite";
import { searchPosts } from "../../lib/appwrite";
import { EmptyState } from "../../components";
import PostCard from "../../components/PostCard";
import { icons } from "../../constants";
import { Stack } from "expo-router";

type TPost = {
  title: string;
  description: string;
  $id: string;
  user: { avatar?: string };
  image?: string;
  comments: number;
  tags: string[];
};

const Search = () => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TPost[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      Alert.alert("Missing Query", "Please enter a search term.");
      return;
    }

    setLoading(true);
    try {
      const results: any = await searchPosts(query.trim());
      setSearchResults(results);
      Keyboard.dismiss(); // Dismiss the keyboard after searching
    } catch (error) {
      console.error("Error searching posts:", error);
      Alert.alert("Error", "Failed to fetch search results.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <Stack.Screen options={{headerShown:false}}/>
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <View className="my-6 px-4">
          <Text className="font-pmedium text-gray-100 text-md">
            Search Results
          </Text>

          <View className="mt-6 mb-8">
            <View className="flex flex-row items-center space-x-4 w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 focus:border-secondary">
              <TextInput
                className="text-base text-white flex-1 font-pregular"
                placeholder="Search..."
                placeholderTextColor="#CDCDE0"
                value={query}
                onChangeText={setQuery}
              />
              <TouchableOpacity
                onPress={handleSearch}
                accessibilityRole="button"
                accessibilityLabel="Search"
                disabled={loading}
              >
                <Image
                  source={icons.search}
                  className="w-5 h-5"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {loading ? (
          // Show a loading spinner when data is being fetched
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text className="text-gray-100 mt-4">Loading...</Text>
          </View>
        ) : (
          <FlatList
          className="px-3"
            data={searchResults}
            keyExtractor={(item) => item.$id}
            renderItem={({ item }) => (
              <MemoizedPostCard
                description={item.description}
                id={item.$id}
                image={item.image}
                title={item.title}
                avatar={item.user.avatar || "https://via.placeholder.com/150"}
                tags={item.tags || []}
                comments={item.comments || 0}
              />
            )}
            ListEmptyComponent={() => (
              <EmptyState
                title="No Posts Found"
                subtitle="No posts found for this search query."
              />
            )}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Memoized PostCard to optimize rendering
const MemoizedPostCard = memo(PostCard);

export default Search;
