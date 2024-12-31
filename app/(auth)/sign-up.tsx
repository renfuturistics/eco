import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Image,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { Link, Redirect, router } from "expo-router";
import { images } from "../../constants";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import { createUser } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";

const SignUp = () => {
  const { setUser, setIsLogged } = useGlobalContext();
  const { loading, isLogged } = useGlobalContext();
  console.log(isLogged);
  if (!loading && isLogged) return <Redirect href="/home" />;

  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({

    email: "",
    password: "",
    firstName: "",   // New field for first name
    lastName: "",    // New field for last name
    phoneNumber: "", // New field for phone number
  });

  const submit = async () => {
    if (

      form.email === "" ||
      form.password === "" ||
      form.firstName === "" ||
      form.lastName === "" ||
      form.phoneNumber === ""
    ) {
      Alert.alert("Error", "Please fill in all fields");
    }

    setSubmitting(true);
    try {
      // Update the createUser function to accept the additional fields
      const result = await createUser(
        form.email,
        form.password,
    
        form.firstName,   // Pass firstName
        form.lastName,    // Pass lastName
        form.phoneNumber  // Pass phoneNumber
      );
      setUser(result);
      setIsLogged(true);

      router.replace("/home");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View
          className="w-full flex justify-center h-full px-4 my-6"
          style={{
            minHeight: Dimensions.get("window").height - 100,
          }}
        >
          <Image
            source={images.logo}
            resizeMode="contain"
            className="w-[115px] h-[34px]"
          />

          <Text className="text-2xl font-semibold text-white mt-10 font-psemibold">
            Sign Up to the app
          </Text>

    

          <FormField
            title="First Name"
            value={form.firstName}
            handleChangeText={(e) => setForm({ ...form, firstName: e })}
            otherStyles="mt-7"
          />

          <FormField
            title="Last Name"
            value={form.lastName}
            handleChangeText={(e) => setForm({ ...form, lastName: e })}
            otherStyles="mt-7"
          />

          <FormField
            title="Phone Number"
            value={form.phoneNumber}
            handleChangeText={(e) => setForm({ ...form, phoneNumber: e })}
            otherStyles="mt-7"
            keyboardType="phone-pad"
          />

          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="email-address"
          />

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
          />

          <CustomButton
            title="Sign Up"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />

          <View className="flex justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Have an account already?
            </Text>
            <Link
              href="/sign-in"
              className="text-lg font-psemibold text-secondary"
            >
              Login
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
