import { Keyboard, TouchableWithoutFeedback, Image, StyleSheet, Alert, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { api } from "../services/API";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Layout, Text, Input, Button, Spinner } from "@ui-kitten/components";
import * as ImagePicker from "expo-image-picker";

const LoadingIndicator = (props) => (
  <View style={[props.style, styles.indicator]}>
    <Spinner size='small' />
  </View>
);

const RegisterScreen = ({ navigation, route }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const { role } = route.params;
  const [organizationCode, setOrganizationCode] = useState("");
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    try {
      setLoading(true);
      const payload = { name, email, password, role };

      if (role === "employee") {
        payload.organizationCode = organizationCode;
      }
      // console.log(payload);
      
      const response = await axios.post(`${api}/auth/register`, payload);
      
      const { accessToken } = response.data;
      await AsyncStorage.setItem("token", accessToken);
      if (profileImage) {
        await uploadProfileImage();
      }
      setLoading(false)
      Alert.alert("Registration successful");

      if (role === "admin") {
        navigation.navigate("CreateOrganization");
      } else {
        navigation.navigate("JoinOrganization");
      }
    } catch (error) {
      setLoading(false)
      Alert.alert(
        "Registration failed",
        error.response?.data?.msg || "An error occurred"
      );
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const uploadProfileImage = async () => {
      console.log("upload");
      
    try {
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();
      formData.append("profileImage", {
        uri: profileImage,
        type: "image/jpeg",
        name: "profile.jpg",
      });
      console.log(formData);
      
      await axios.post(`${api}/users/upload-profile-image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `${token}`,
        },
      });
      console.log("success");
      
    } catch (error) {
      console.log(error.response);
      
      //add notify user if image is not uploaded?
      // Alert.alert("Image upload failed", error.response?.data?.msg || "An error occurred");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <Layout style={styles.container}>
      <Text status="primary" style={styles.title}>
        Register as {role === "admin" ? "Admin" : "Employee"}
      </Text>
      <Input
        size="large"
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <Input
      size="large"
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <Input
      size="large"
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {/* {role === "employee" && (
        <Input
        size="large"
          style={styles.input}
          placeholder="Organization Code"
          value={organizationCode}
          onChangeText={setOrganizationCode}
        />
      )} */}

      <Text style={styles.text} category="p1">Upload Profile Image</Text>

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <Text style={styles.placeholderText}>Select Profile Photo</Text>
        )}
      </TouchableOpacity>

      <Button accessoryLeft={loading && LoadingIndicator} style={styles.button} appearance="outline" onPress={handleRegister}>{loading ? "":"Register"}</Button>
      <Button
      status="info"
        appearance="ghost"
        onPress={() => navigation.navigate("UserType")}
      >Back to User Select</Button>
    </Layout>
    </TouchableWithoutFeedback>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 10,
  },
  title: {
    fontSize: 30,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
  },
  button:{
    margin: 18
  },
  imagePicker: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderText: {
    color: "#666",
    textAlign: "center",
  },
  text:{
    padding: 10
  },
  indicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
