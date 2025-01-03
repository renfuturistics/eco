import {
  Account,
  Avatars,
  Client,
  Databases,
  Functions,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.zambia.ecoesmara",
  projectId: "67198dbd00277f568222",
  storageId: "671992c80019376d25f1",
  databaseId: "671990030023bc46a07a",
  userCollectionId: "6719901a0029b981b666",
  videoCollectionId: "6719902e002d4501a460",
  coursesCollectionId: "67335b4f000fd5559638",
  lessonsCollectionId: "67335bbe00123573e330",
  userCoursesCollectionId: "673353f6001566d5f853",
  postsCollectionId: "6735f193002676cd0e7f",
  notificationCollectionId: "6749a841002bba848436",
  commentsCollectionId: "673d0849000dddc44721",
  followsCollectionId: "674ed0910011543c47b8",
  conversationsCollectionId: "675ff98a0034a054c900",
  messagesCollectionId: "675ffbe600292a61dc98",
  certificateFunctionId: "676fc380002e66f4afbe",
  subscriptionCollectionId: "6773c7bd000ca5f2a632",
};

const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

const account = new Account(client);
const storage = new Storage(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const functions = new Functions(client);
// Register user
export async function createUser(
  email: string,
  password: string,

  name: string,
  surname: string,
  contact: string
) {
  try {
    const newAccount = await account.create(ID.unique(), email, password, name);

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(name);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      newAccount.$id,
      {
        Id: newAccount.$id,
        email: email,
        avatar: avatarUrl,
        contact,
        role: "User",
        password,
        name,
        surname,
      }
    );

    return newUser;
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
}

// Sign In
export async function signIn(email: string, password: string) {
  try {
    const session = await account.createEmailPasswordSession(email, password);

    return session;
  } catch (error: any) {
    throw new Error(error);
  }
}

// Get Account
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error: any) {
    throw new Error(error);
  }
}

// Get Current User

export async function getCurrentUser(): Promise<any | null> {
  try {
    // Fetch the currently logged-in account
    const currentAccount = await getAccount();
    if (!currentAccount) {
      throw new Error("No current account found. User might not be logged in.");
    }

    // Query the database for the user's document using the account ID
    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("Id", currentAccount.$id)]
    );

    // Handle empty results
    if (!currentUser.documents || currentUser.documents.length === 0) {
      throw new Error("No user document found for the current account.");
    }

    return currentUser.documents[0]; // Return the first user document
  } catch (error: any) {
    console.error("Error in getCurrentUser:", error.message || error);
    return null; // Return null in case of an error
  }
}

// Sign Out
export async function signOut() {
  try {
    const session = await account.deleteSession("current");

    return { success: true, session };
  } catch (error: any) {
    throw new Error(error);
  }
}

// Get all video Posts
export async function getAllVideoPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId
    );

    // Function to format the date
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    const postsWithFormattedDate = posts.documents.map((post: any) => ({
      ...post,
      createdAt: formatDate(post.$createdAt), // Format the createdAt date
    }));

    return postsWithFormattedDate;
  } catch (error: any) {
    throw new Error(error);
  }
}

// Get video posts created by user
export async function getUserPosts(userId: string) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      [
        Query.equal("user", userId),
        Query.orderDesc("$createdAt"), // Orders by creation date descending
      ]
    );

    return posts.documents;
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch user posts");
  }
}
export async function getUserInfoById(documentId: string) {
  try {
    // Fetch the document by its unique document ID
    const response = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      documentId
    );

    // Return the document
    return response;
  } catch (error: any) {
    // Handle and throw any errors
    throw new Error(
      error.message || "Failed to fetch user info by document ID"
    );
  }
}
// Get video posts that matches search query
export async function searchPosts(query: string) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      [Query.search("title", query)]
    );

    if (!posts) throw new Error("Something went wrong");

    return posts.documents;
  } catch (error: any) {
    throw new Error(error);
  }
}

// Get latest created video posts
export async function getLatestPosts(page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit; // Calculate the offset

    // Fetch posts with pagination (limit and offset)
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      [
        Query.orderDesc("$createdAt"), // Order by creation date
        Query.limit(limit), // Limit the number of posts
        Query.offset(offset), // Set offset for pagination
      ]
    );

    // Return the posts and the total number of posts available
    return {
      posts: posts.documents,
      totalCount: posts.total,
    };
  } catch (error: any) {
    throw new Error(error);
  }
}

// Function to add points to the user's profile
export async function addPoints(userId: string, pointsToAdd: number) {
  try {
    // Fetch the current user document from the user collection
    const userDoc = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("Id", userId)]
    );

    if (!userDoc || userDoc.documents.length === 0) {
      throw new Error("User not found");
    }

    const currentUser = userDoc.documents[0];
    const currentPoints = currentUser.points || 0; // Default to 0 if undefined

    // Calculate new points
    const updatedPoints = currentPoints + pointsToAdd;

    // Update the user's points in the database
    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      currentUser.$id,
      { points: updatedPoints }
    );

    return updatedUser;
  } catch (error) {
    console.error("Error adding points:", error);
    throw new Error("Failed to add points");
  }
}

export const getUserPoints = async (userId: string) => {
  try {
    // Fetch the user data from the 'users' collection

    const response = await databases.getDocument(
      appwriteConfig.databaseId, // The database ID
      appwriteConfig.userCollectionId, // The collection ID where user data is stored
      userId // The user's unique ID
    );

    // Assuming user data has a 'points' field that stores the points
    const points = response.points;

    if (points === undefined) {
      throw new Error("Points not found for the user");
    }

    return points;
  } catch (error: any) {
    console.error("Error fetching user points:", error.message);
    throw error; // Rethrow the error if you want to handle it elsewhere
  }
};
export const getAllCourses = async () => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId, // The database ID where courses are stored
      appwriteConfig.coursesCollectionId,
      [Query.greaterThanEqual("lessons", 1)] // The collection ID for courses
    );

    const courses = response.documents;

    if (!courses || courses.length === 0) {
      throw new Error("No courses found");
    }

    return courses; // Return all courses
  } catch (error: any) {
    console.error("Error fetching courses:", error.message);
    throw error; // Rethrow the error if you want to handle it elsewhere
  }
};
export const getAllCoursesByCategory = async (categoryId: string) => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId, // The database ID where courses are stored
      appwriteConfig.coursesCollectionId, // The collection ID for courses
      [
        Query.equal("category", categoryId), // Filter courses by category ID
        Query.greaterThanEqual("lessons", 1), // Ensure courses have at least one lesson
      ]
    );

    const courses = response.documents;

    if (!courses || courses.length === 0) {
      throw new Error("No courses found for this category");
    }

    return courses; // Return filtered courses
  } catch (error: any) {
    console.error("Error fetching courses by category:", error.message);
    throw error; // Rethrow the error if you want to handle it elsewhere
  }
};
// Function to get lessons for a specific course
export const getLessonsForCourse = async (courseId: string) => {
  try {
    // Use Appwrite Query to filter lessons by courseId
    const response = await databases.listDocuments(
      appwriteConfig.databaseId, // The database ID where lessons are stored
      appwriteConfig.lessonsCollectionId, // The collection ID for lessons
      [
        Query.equal("courseId", [courseId]), // Filter lessons by courseId
        Query.limit(50), // Optional: Limit the number of lessons to 50
        Query.orderAsc("title"), // Optional: Order lessons by title in ascending order
      ]
    );

    const lessons = response.documents;

    if (!lessons || lessons.length === 0) {
      throw new Error("No lessons found for this course");
    }

    return lessons; // Return the lessons for the course
  } catch (error: any) {
    console.error("Error fetching lessons:", error.message);
    throw error; // Rethrow the error if you want to handle it elsewhere
  }
};
// Function to create a new course
export const createCourse = async (courseData: {
  title: string;
  description: string;
  instructor: string;
  duration: string;
  lessons: number;
  thumbnailUrl: string; // Optional: Thumbnail image URL
  category: string;
}) => {
  const Id = ID.unique();
  try {
    // Create a new course document in the database
    const response = await databases.createDocument(
      appwriteConfig.databaseId, // The database ID where courses are stored
      appwriteConfig.coursesCollectionId, // The collection ID for courses
      Id, // Use unique() to automatically generate a unique ID for the course
      {
        Id,
        title: courseData.title,
        description: courseData.description,
        instructor: courseData.instructor,
        lessons: courseData.lessons,
        category: courseData.category,
        duration: courseData.duration,
        thumbnailUrl: courseData.thumbnailUrl || null, // Use null if no thumbnail is provided
      }
    );

    return response; // Return the created course document
  } catch (error: any) {
    console.error("Error creating course:", error.message);
    throw error; // Rethrow the error if you want to handle it elsewhere
  }
};
export const getCourseWithLessons = async (courseId: string) => {
  try {
    // Fetch the course by its document ID
    const course = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.coursesCollectionId,
      courseId
    );

    // Fetch lessons associated with the course using a standard attribute (e.g., "courseId")
    const lessonsResponse = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.lessonsCollectionId,
      [
        Query.equal("courseId", courseId), // Replace "courseId" with the field name in lessons that references the course
      ]
    );

    const lessons = lessonsResponse.documents;

    return {
      course,
      lessons,
    };
  } catch (error: any) {
    console.error("Error fetching course with lessons:", error.message);
    throw new Error("Could not fetch course and lessons. Please try again.");
  }
};
export const getUserCourses = async (userID: string) => {
  try {
    // Query the progress collection to get user-specific enrollments
    const enrollmentResponse = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCoursesCollectionId,
      [Query.equal("user", userID)]
    );

    // Extract course IDs from the user's enrollment
    const enrolledCourseIDs = enrollmentResponse.documents.map(
      (enrollment: any) => enrollment.course
    );

    if (enrolledCourseIDs.length === 0) {
      return [];
    }

    // Fetch details for all courses the user is enrolled in
    const courseResponse = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.coursesCollectionId,
      [Query.equal("$id", enrolledCourseIDs)] // Corrected to use Query.in
    );

    // Combine course details with enrollment progress
    const userCourses = courseResponse.documents.map((course: any) => {
      const progress = enrollmentResponse.documents.find(
        (enrollment: any) => enrollment.course === course.$id
      );
      return {
        course,
        progress,
      };
    });

    return userCourses;
  } catch (error) {
    console.error("Error fetching user courses:", error);
    throw new Error("Failed to fetch enrolled courses.");
  }
};
export const createUserCourse = async (
  userID: string,
  courseID: string,
  totalLessons: number
) => {
  try {
    // Check if the user is already enrolled in the course
    const existingEnrollment = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCoursesCollectionId,
      [Query.equal("user", userID), Query.equal("course", courseID)]
    );
    // If enrollment already exists, return it
    if (existingEnrollment.documents.length > 0) {
      return existingEnrollment.documents[0];
    }

    // Create a new document for the user's course enrollment
    const enrollment = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCoursesCollectionId,
      ID.unique(),
      {
        user: userID,
        course: courseID,
        totalLessons,
        completedLessons: 0, // Initial completed lessons set to 0
        isCompleted: false, // Initial course completion status set to false


      }
    );

    return enrollment;
  } catch (error) {
    console.error("Error creating user course:", error);
    throw new Error("Failed to create user course.");
  }
};

export const handleVideoCompletion = async (userId: string, courseId: string, lessonId: string) => {
  try {
    // Fetch the current enrollment record for the user and course
    const enrollmentResponse = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCoursesCollectionId,
      [
        Query.equal("user", userId),
        Query.equal("course", courseId),
      ]
    );

    // Ensure the user is enrolled in the course
    if (enrollmentResponse.documents.length === 0) {
      console.log("User is not enrolled in this course.");
      return;
    }

    const enrollment = enrollmentResponse.documents[0];

    // Check if the lesson is already marked as completed
    const completedLessons = enrollment.completedLessons || [];
    if (completedLessons.includes(lessonId)) {
      console.log("This lesson has already been completed.");
      return; // Do nothing if the lesson is already completed
    }

    // Add the lesson to the completedLessons list
    completedLessons.push(lessonId);

    // Increment the completed lessons count
    const updatedEnrollment = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCoursesCollectionId,
      enrollment.$id,
      {
        completedLessons,
        completedLessonsCount: completedLessons.length, // Optional: you can track total completed lessons
      }
    );

    console.log("Lesson completed:", updatedEnrollment);

    // Proceed to add points (or any other logic)
    addPoints(userId, 5)
      .then((response) => {
        console.log("Points awarded:", response);
      })
      .catch((error) => {
        console.log("Error awarding points:", error);
      });

  } catch (error) {
    console.error("Error handling video completion:", error);
  }
};

export const getAllPosts = async () => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId
    );

    if (response.documents.length === 0) {
      return []; // No posts found
    }

    return response.documents; // Return all posts
  } catch (error) {
    console.error("Error fetching all posts:", error);
    throw new Error("Unable to fetch posts. Please try again later.");
  }
};
export async function uploadFile(file: any, type: string) {
  if (!file) return;

  const { mimeType, fileName, uri, fileSize } = file;
  const asset = { name: fileName, type: mimeType, uri: uri, size: fileSize };

  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      asset
    );

    const fileUrl = await getFilePreview(uploadedFile.$id, type);
    return fileUrl;
  } catch (error: any) {
    throw new Error(error);
  }
}

export async function getFilePreview(fileId: string, type: string) {
  let fileUrl;

  try {
    if (type === "video") {
      fileUrl = storage.getFileView(appwriteConfig.storageId, fileId);
    } else if (type === "image") {
      fileUrl = storage.getFilePreview(appwriteConfig.storageId, fileId);
    } else {
      throw new Error("Invalid file type");
    }

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error: any) {
    throw new Error(error);
  }
}
export async function createPost(form: any) {
  try {
    const [thumbnailUrl] = await Promise.all([
      uploadFile(form.thumbnail, "image"),
    ]);

    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      ID.unique(),
      {
        title: form.title,
        image: thumbnailUrl,
        description: form.description,
        comments: 0,
        tags: form.tags,
        prompt: form.prompt,
        user: form.userId,
      }
    );

    return newPost;
  } catch (error: any) {
    throw new Error(error);
  }
}

export async function getPostById(postId: string) {
  try {
    if (!postId) {
      throw new Error("Post ID is required.");
    }

    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      postId
    );

    return post;
  } catch (error: any) {
    console.error("Error fetching post:", error.message || error);
    throw new Error(error.message || "Failed to fetch post.");
  }
}
// Add a comment to a post
export async function addComment(data: any) {
  try {
    const { postId, users, comment } = data;
    // Validate input
    if (!postId || !users || !comment) {
      throw new Error("Post ID, User ID, and Comment Text are required.");
    }

    // Generate a unique ID for the comment
    const commentId = ID.unique();

    // Save the comment to the database
    const newComment = await databases.createDocument(
      appwriteConfig.databaseId, // Database ID
      appwriteConfig.commentsCollectionId, // Comments collection ID
      commentId, // Unique comment ID
      data
    );

    // Update the post's comment count (optional)
    const post = await getPostById(postId); // Fetch the current post
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      postId,
      {
        comments: (post.comments || 0) + 1, // Increment comment count
      }
    );

    return { newComment }; // Return the created comment and updated post
  } catch (error: any) {
    console.error("Error adding comment:", error.message || error);
    throw new Error(error.message || "Failed to add comment.");
  }
}
export async function getAllComments(postId: string): Promise<any[]> {
  try {
    // Query to filter comments by postId
    const comments = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      [
        Query.equal("postId", postId),
        Query.isNull("parentId"),
        Query.orderAsc("$createdAt"),
      ]
    );

    return comments.documents; // Return the fetched comments
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    throw new Error("Failed to fetch comments");
  }
}
export async function getAllCommentsReplies(
  postId: string,
  parentId: string
): Promise<any[]> {
  try {
    // Query to filter comments by postId
    const comments = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      [
        Query.equal("postId", postId),
        Query.equal("parentId", parentId),
        Query.orderAsc("$createdAt"),
      ]
    );

    return comments.documents; // Return the fetched comments
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    throw new Error("Failed to fetch comments");
  }
}
export async function addReply(data: any) {
  try {
    const { postId, users, comment } = data;
    // Validate input
    if (!postId || !users || !comment) {
      throw new Error("Post ID, User ID, and Comment Text are required.");
    }

    // Generate a unique ID for the comment
    const commentId = ID.unique();

    // Save the comment to the database
    const newComment = await databases.createDocument(
      appwriteConfig.databaseId, // Database ID
      appwriteConfig.commentsCollectionId, // Comments collection ID
      commentId, // Unique comment ID
      data
    );

    return { newComment }; // Return the created comment and updated post
  } catch (error: any) {
    console.error("Error adding comment:", error.message || error);
    throw new Error(error.message || "Failed to add comment.");
  }
}

export const createNotification = async (notification: {
  type: string;
  userId: string;
  message: string;
  icon: string;
  postId?: string;
  commentId?: string;
  username?: string;
}) => {
  try {
    const newNotification = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationCollectionId,
      ID.unique(),
      {
        id: ID.unique(),
        userId: notification.userId,
        message: notification.message,
        type: notification.type,
        icon: notification.icon,
        postId: notification.postId,
        commentId: notification.commentId,
        isRead: false,
      }
    );
    return newNotification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    // Fetch all notifications for the user
    const notifications = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationCollectionId,
      [Query.equal("userId", userId), Query.equal("isRead", false)]
    );

    // Update each notification to mark it as read
    const updatePromises = notifications.documents.map((notification) =>
      databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.notificationCollectionId,
        notification.$id,
        { isRead: true }
      )
    );

    // Await all updates
    await Promise.all(updatePromises);

    console.log(
      `Marked ${notifications.total} notifications as read for user: ${userId}`
    );
    return { success: true, count: notifications.total };
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    throw error;
  }
};
export const countUnreadNotifications = async (userId: string) => {
  try {
    // Query the database for unread notifications for the user
    const notifications = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationCollectionId,
      [Query.equal("userId", userId), Query.equal("isRead", false)]
    );

    // Return the count of unread notifications
    console.log(
      `User ${userId} has ${notifications.total} unread notifications.`
    );
    return notifications.total;
  } catch (error) {
    console.error("Error counting unread notifications:", error);
    throw error;
  }
};

export async function getUserNotifications(userId: string) {
  try {
    // Query the notifications collection for the user's notifications
    const notifications = await databases.listDocuments(
      appwriteConfig.databaseId, // Database ID
      appwriteConfig.notificationCollectionId, // Notifications Collection ID
      [
        Query.equal("userId", userId), // Filter by user ID
      ]
    );

    return notifications.documents; // Return the list of notifications
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch notifications");
  }
}
export const fetchCommentById = async (commentId: string) => {
  try {
    const comment = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      commentId
    );
    return comment;
  } catch (error) {
    console.error("Error fetching comment:", error);
    throw error;
  }
};
export async function updateUserDocument(userId: string, updates: any) {
  try {
    const updatedDocument = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId,
      updates
    );

    return updatedDocument;
  } catch (error: any) {
    console.error("Error updating user document:", error.message || error);
    throw new Error(error.message || "Failed to update user document");
  }
}
export const getFollowingCount = async (userId: string) => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.followsCollectionId,
      [Query.equal("followerId", userId)]
    );

    return response.total; // Total following
  } catch (error) {
    console.error("Error fetching following count:", error);
    throw error;
  }
};
export const getFollowersCount = async (userId: string) => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.followsCollectionId,
      [Query.equal("followedId", userId)]
    );

    return response.total; // Total followers
  } catch (error) {
    console.error("Error fetching followers count:", error);
    throw error;
  }
};
export const createFollow = async (follow: {
  followerId: string;
  followedId: string;
  username: string;
}) => {
  try {
    const newFollow = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.followsCollectionId,
      ID.unique(),
      {
        id: ID.unique(),
        followerId: follow.followerId,
        followedId: follow.followedId,
      }
    );
    const notification = {
      userId: follow.followedId,
      message: `${follow.username} started following you`,
      type: "Follow",
      icon: "bell",
    };
    await createNotification(notification);
    return newFollow;
  } catch (error) {
    console.error("Error creating follow:", error);
    throw error;
  }
};
// Remove Follow
export const removeFollow = async (followerId: string, followedId: string) => {
  const follows = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.followsCollectionId,
    [
      Query.equal("followerId", followerId),
      Query.equal("followedId", followedId),
    ]
  );
  if (follows.documents.length > 0) {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.followsCollectionId,
      follows.documents[0].$id
    );
  }
};
export const getFollowersList = async (userId: string) => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.followsCollectionId,
      [Query.equal("followedId", userId)]
    );

    return response.documents; // List of followers
  } catch (error) {
    console.error("Error fetching followers list:", error);
    throw error;
  }
};
export const getFollowingList = async (userId: string) => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.followsCollectionId,
      [Query.equal("followerId", userId)]
    );

    return response.documents; // List of users being followed
  } catch (error) {
    console.error("Error fetching following list:", error);
    throw error;
  }
};
// Check If Following
export const checkIfFollowing = async (
  followerId: string,
  followedId: string
) => {
  const response = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.followsCollectionId,
    [
      Query.equal("followerId", followerId),
      Query.equal("followedId", followedId),
    ]
  );

  return response.documents.length > 0;
};
export const createConversation = async (conversation: {
  participants: string[]; // Array of user IDs participating in the conversation
  lastMessage: string; // The last message in the conversation
}) => {
  try {
    const newConversation = await databases.createDocument(
      appwriteConfig.databaseId, // The database ID
      appwriteConfig.conversationsCollectionId, // The collection ID for conversations
      ID.unique(), // Unique conversation ID
      {
        id: ID.unique(), // Unique ID for this conversation
        participants: conversation.participants, // List of user IDs in the conversation
        lastMessage: conversation.lastMessage, // The last message in the conversation
      }
    );

    // Return the newly created conversation document
    return newConversation;
  } catch (error) {
    // Catch and log any errors
    console.error("Error creating conversation:", error);
    throw error; // Rethrow the error to handle it elsewhere if necessary
  }
};
export const updateConversationLastMessage = async (
  conversationId: string,
  lastMessage: string
) => {
  try {
    // Update the lastMessage field in the conversation document
    await databases.updateDocument(
      appwriteConfig.databaseId, // The database ID
      appwriteConfig.conversationsCollectionId, // The collection ID for conversations
      conversationId, // The conversation ID
      {
        lastMessage: lastMessage, // The new last message
      }
    );
  } catch (error) {
    console.error("Error updating last message in conversation:", error);
    throw error;
  }
};

export const createMessage = async (message: {
  conversationId: string; // The ID of the conversation the message belongs to
  senderId: string; // The ID of the user sending the message
  content: string; // The content of the message
}) => {
  console.log(message.conversationId);
  try {
    // Create the message document
    const newMessage = await databases.createDocument(
      appwriteConfig.databaseId, // The database ID
      appwriteConfig.messagesCollectionId, // The collection ID for messages
      ID.unique(), // Unique ID for the message
      {
        conversationId: message.conversationId, // Link to the conversation
        senderId: message.senderId, // ID of the message sender
        content: message.content, // The actual message content
        // Timestamp of when the message was sent
      }
    );

    // Optionally, update the lastMessage field in the conversation document
    await updateConversationLastMessage(
      message.conversationId,
      message.content
    );

    return newMessage;
  } catch (error) {
    console.error("Error creating message:", error);
    throw error;
  }
};
export const getMessagesForConversation = async (conversationId: string) => {
  try {
    const messages = await databases.listDocuments(
      appwriteConfig.databaseId, // The database ID
      appwriteConfig.messagesCollectionId, // The collection ID for messages
      [Query.equal("conversationId", conversationId)] // Filter messages by conversation ID
      // Skip 0 documents (start from the beginning)
    );

    return messages.documents;
  } catch (error) {
    console.error("Error retrieving messages for conversation:", error);
    throw error;
  }
};

export const getConversationsWithUnreadCounts = async (userId: string) => {
  try {
    // Fetch all conversations where the current user is a participant
    const conversationsResponse = await databases.listDocuments(
      appwriteConfig.databaseId, // The database ID
      appwriteConfig.conversationsCollectionId, // The collection ID for conversations
      [Query.contains("participants", userId), Query.limit(100)] // Filter conversations where the user is a participant
    );

    const conversations = conversationsResponse.documents;

    // Fetch unread message counts for each conversation
    const conversationsWithCounts = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadMessagesResponse = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.messagesCollectionId,
          [
            Query.equal("conversationId", conversation.$id), // Filter by conversation
            Query.notEqual("senderId", userId), // Exclude current user as sender
            Query.equal("isRead", false), // Unread messages only
          ]
        );

        return {
          ...conversation,
          unreadCountForCurrentUser: unreadMessagesResponse.total,
        };
      })
    );

    return conversationsWithCounts; // Conversations with unread counts
  } catch (error) {
    console.error("Error fetching unread counts:", error);
    return [];
  }
};

export const markMessagesAsRead = async (
  conversationId: string,
  userId: string
) => {
  try {
    // Fetch unread messages for this conversation
    const unreadMessagesResponse = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.messagesCollectionId,
      [
        Query.equal("conversationId", conversationId),
        Query.notEqual("senderId", userId), // Messages not sent by the current user
        Query.equal("isRead", false), // Only unread messages
      ]
    );

    // Update each unread message to mark as read
    const unreadMessages = unreadMessagesResponse.documents;
    for (const message of unreadMessages) {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.messagesCollectionId,
        message.$id, // Message ID
        { isRead: true }
      );
    }
  } catch (error) {
    console.error("Error marking messages as read:", error);
  }
};

export const deleteMessage = async (messageId: string) => {
  try {
    // Delete the message by its ID
    await databases.deleteDocument(
      appwriteConfig.databaseId, // The database ID
      appwriteConfig.messagesCollectionId, // The collection ID for messages
      messageId // The message ID to delete
    );
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};
export const getUserDetails = async (userIds: string[]) => {
  try {
    const usersDetails = await Promise.all(
      userIds.map(async (userId) => {
        const userDoc = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.userCollectionId, // Change this to the correct collection ID
          userId
        );
        return userDoc; // Returning the user document containing details like avatar
      })
    );
    return usersDetails;
  } catch (error) {
    console.error("Error fetching user details:", error);
    return [];
  }
};
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  message: string
) => {
  try {
    await databases.createDocument(
      "databaseId", // Replace with your database ID
      "messagesCollectionId", // Replace with your messages collection ID
      "unique()", // Automatically generate a unique ID
      {
        conversationId,
        senderId,
        message,
        timestamp: new Date().toISOString(),
      }
    );
  } catch (error) {
    console.error("Error sending message:", error);
  }
};
export const generateCertificate = async () => {
  try {
    const response = await functions.createExecution(
      appwriteConfig.certificateFunctionId, // Replace with your function ID
      JSON.stringify({
        name: "John Doe", // Example name
        course: "React Native", // Example course
        date: "2024-12-28", // Example date
      })
    );

    if (response.status === "completed") {
      console.log(response);
      return response.responseBody;
    } else {
      console.log(response);
    }
  } catch (error) {
    console.error(error);
  }
};
export async function createSubscription(userId: string, paymentId: string) {
  try {
    // Calculate the subscription's expiration date (e.g., one month from now)
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + 1);

    // Create a new subscription document
    const newSubscription = await databases.createDocument(
      appwriteConfig.databaseId, // Replace with your database ID
      appwriteConfig.subscriptionCollectionId, // Replace with your subscription collection ID
      ID.unique(),
      {
        userId: userId,
        paymentId: paymentId,
        status: "active",
        validUntil: validUntil.toISOString(),
        createdAt: new Date().toISOString(),
      }
    );

    if (!newSubscription)
      throw new Error("Failed to create subscription document.");

    return newSubscription;
  } catch (error: any) {
    console.error("Error in createSubscription:", error.message || error);
    throw new Error(error);
  }
}
export async function getActiveSubscription(userId: string) {
  try {
    const subscriptions = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.subscriptionCollectionId,
      [
        Query.equal("userId", userId),
        Query.equal("status", "active"),
        Query.greaterThan("validUntil", new Date().toISOString()),
      ]
    );

    if (subscriptions.documents.length === 0) {
      throw new Error("No active subscription found.");
    }

    return subscriptions.documents[0]; // Return the active subscription
  } catch (error: any) {
    console.error("Error in getActiveSubscription:", error.message || error);
    throw new Error(error);
  }
}
export async function expireSubscriptions() {
  try {
    const now = new Date().toISOString();

    const expiredSubscriptions = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.subscriptionCollectionId,
      [Query.lessThan("validUntil", now), Query.equal("status", "active")]
    );

    const updatePromises = expiredSubscriptions.documents.map(
      (subscription: any) =>
        databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.subscriptionCollectionId,
          subscription.$id,
          { status: "expired" }
        )
    );

    await Promise.all(updatePromises);

    return { success: true, count: expiredSubscriptions.documents.length };
  } catch (error: any) {
    console.error("Error in expireSubscriptions:", error.message || error);
    throw new Error(error);
  }
}
