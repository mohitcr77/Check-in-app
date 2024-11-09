// ProfileImageUploadScreen.js
import React, { useState } from "react";
import { View, Image, StyleSheet, Alert, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { api } from "../services/API";
import { Button, Text } from "@ui-kitten/components";

const ProfileImageUploadScreen = ({ navigation }) => {
  const [profileImage, setProfileImage] = useState(null);

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
    if (!profileImage) {
      Alert.alert("Please select an image before uploading.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();
      formData.append("profileImage", {
        uri: profileImage,
        type: "image/jpeg",
        name: "profile.jpg",
      });

      await axios.post(`${api}/users/upload-profile-image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `${token}`,
        },
      });

      Alert.alert("Profile image uploaded successfully");
      navigation.replace("Home"); // Redirect to Home or relevant screen
    } catch (error) {
      Alert.alert("Image upload failed", error.response?.data?.msg || "An error occurred");
    }
  };

  return (
    <View style={styles.container}>
      <Text category="h5">Upload Profile Image</Text>

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <Text style={styles.placeholderText}>Select Profile Photo</Text>
        )}
      </TouchableOpacity>

      <Button style={styles.button} onPress={uploadProfileImage}>
        Upload Image
      </Button>
      <Button style={styles.button} appearance="ghost" onPress={() => navigation.replace("Home")}>
        Skip
      </Button>
    </View>
  );
};

export default ProfileImageUploadScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
  button: {
    marginVertical: 10,
    width: "60%",
  },
});
