import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import CourseCard from "../components/CourseCard";
import PageHeader from "../components/PageHeader";
import { getAllCoursesByCategory } from "../lib/appwrite";
// Adjust import path

const CourseTypes = () => {
  const { typeId, typeName } = useLocalSearchParams();
  const [courses, setCourses] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const fetchedCourses = await getAllCoursesByCategory(typeId.toString()); // Fetch courses for the given type
        setCourses(fetchedCourses);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [typeId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9001" />
        <Text style={styles.loadingText}>Loading {typeName} Programs...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900 h-full">
      <PageHeader title="Lessons" />
      <View>
        <FlatList
          data={courses}
          keyExtractor={(item) => item.$id.toString()}
          renderItem={({ item }) => (
            <CourseCard
              id={item.$id}
              thumbnail={item.thumbnail}
              title={item.title}
              type={item.category?.name} // Use category name for type
              format={item.format}
              numberOfLessons={item.lessons}
            />
          )} // Use your CourseCard component to render individual courses
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

export default CourseTypes;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerText: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  viewAllText: {
    fontSize: 16,
    color: "#FF9001",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});
