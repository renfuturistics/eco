import { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import CourseItem from "../../components/MyCourseItems";
import { getUserCourses } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";

const CoursesList = () => {
  const [userCourses, setUserCourses] = useState<any[]>([]); // Holds all courses
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const { user } = useGlobalContext();
  const userId = user.Id;

  const [activeTab, setActiveTab] = useState<"Ongoing" | "Completed">(
    "Ongoing"
  );

  useEffect(() => {
    async function fetchCourses() {
      try {
        setIsLoading(true); // Start loading
        const courseData: any = await getUserCourses(userId); // Fetch user courses
        if (!courseData) throw new Error("No courses found");

        setUserCourses(courseData);
        setError(null); // Clear any previous error
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses. Please try again later.");
      } finally {
        setIsLoading(false); // Stop loading
      }
    }

    fetchCourses();
  }, []);

  // Filter courses based on selected tab
  const filteredCourses = userCourses.filter((course: any) =>
    activeTab === "Ongoing" ? !course.progress.isCompleted : course.progress.isCompleted
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#FF9001" />
        <Text className="text-white mt-4">Loading courses...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
        <Text className="text-white text-lg">{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      {/* Header */}
      <View
        style={{
          marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        }}
        className="py-4"
      >
        <View className="flex justify-between items-start flex-row ">
          <View>
            <Text className="text-2xl ml-4 font-semibold text-white">
              My Courses
            </Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row justify-center py-2 bg-gray-900">
        {["Ongoing", "Completed"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab as "Ongoing" | "Completed")}
            className={`px-8 py-3 rounded-lg mx-2 ${
              activeTab === tab ? "bg-secondary" : "bg-gray-700"
            }`}
          >
            <Text
              className={`font-semibold text-base ${
                activeTab === tab ? "text-white" : "text-gray-300"
              }`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Course List */}
      <ScrollView className="p-4">
        {filteredCourses.map((course: any) => (
          <CourseItem key={course.course.title} course={course} />
        ))}
        {filteredCourses.length === 0 && (
          <View className="flex items-center justify-center h-48">
            <Text className="text-gray-400 text-lg">
              {activeTab === "Ongoing"
                ? "No ongoing courses"
                : "No completed courses"}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CoursesList;
