import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { getAllCourses } from "../../lib/appwrite";
import { SearchInput } from "../../components";
import CourseCard from "../../components/CourseCard";
interface courseInfo {
  id: string;
  name: string;
}
const CoursesHomePage = () => {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]); // Holds all courses
  const [courseTypes, setCourseTypes] = useState<courseInfo[] | null>(null); // Holds unique course types (categories)
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  useEffect(() => {
    async function fetchCourses() {
      try {
        setIsLoading(true); // Start loading
        const courseData = await getAllCourses(); // Fetch enriched courses
        setCourses(courseData);

        // Deduplicate course types based on id and name
        const seen = new Set();
        const combinedCourseTypes = courseData
          .map((course: any) => ({
            id: course.category?.$id,
            name: course.category?.name,
          }))
          .filter(
            (category) =>
              category.id &&
              category.name &&
              !seen.has(category.id) &&
              seen.add(category.id)
          );

        setCourseTypes(combinedCourseTypes); // Set deduplicated course types
        setError(null); // Clear any previous error
      } catch (err) {
        setError("Failed to load courses. Please try again later.");
      } finally {
        setIsLoading(false); // Stop loading
      }
    }

    fetchCourses();
  }, []);

  // Render a single course card
  const renderCourseCard = ({ item }: any) => (
    <CourseCard
      id={item.$id}
      thumbnail={item.thumbnail}
      title={item.title}
      type={item.category?.name} // Use category name for type
      format={item.format}
      numberOfLessons={item.lessons}
    />
  );

  // Render a section for each course type
  const renderCourseTypeSection = (type: courseInfo) => {
    const coursesOfType = courses.filter(
      (course) => course.category?.name === type.name
    );
  
    return (
      <View key={type.id} className="mb-8 ">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-white text-3xl font-bold">
            {type.name} Programs
          </Text>
          <TouchableOpacity onPress={() => router.push(`/courses-lessons?typeId=${type.id}&typeName=${type.name}`)}>
            <Text className="text-white text-3xl font-bold">All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={coursesOfType.slice(0, 3)} // Limit the number of displayed courses to 3
          keyExtractor={(item) => item.$id.toString()}
          renderItem={renderCourseCard}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };
  

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#FF9001" />
        <Text className="text-white mt-4">Loading Programs...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
        <Text className="text-white text-xl">{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900 h-full">
      <View className="flex my-6 px-4 space-y-6">
        <View className="flex justify-between items-start flex-row mb-6">
          <View>
            <Text className="text-2xl font-semibold text-white mt-5">
              Let’s Start Learning
            </Text>
          </View>
        </View>
      </View>

      {/* Render Course Type Sections */}
      <FlatList
        className="mt-1 px-4"
        data={courseTypes || []} // Render fetched course types
        keyExtractor={(item) => item.id} // Use the id as the unique key
        renderItem={({ item }) => renderCourseTypeSection(item)} // Pass the full item to the render function
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default CoursesHomePage;
