import { Keyboard, TouchableWithoutFeedback, Image, StyleSheet, Alert, TouchableOpacity, View, ScrollView } from "react-native";
import React, { useState } from "react";
import { api } from "../services/API";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Layout, Text, Input, Button, Spinner, CheckBox } from "@ui-kitten/components";
import * as ImagePicker from "expo-image-picker";
import { checkIsEmpty, checkValidPassword } from "../helpers/errorHelper";

const LoadingIndicator = (props) => (
  <View style={[props.style, styles.indicator]}>
    <Spinner size='small' />
  </View>
);

const RegisterScreen = ({ navigation, route }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const { role } = route.params;
  const [organizationCode, setOrganizationCode] = useState("");
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(false);
  const [errors, setErrors] = useState({});

  const validateInputs = () => {
    let tempErrors = {};
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    if (!name.trim()) tempErrors.name = "Name is required";
    if (!email.trim()) tempErrors.email = "Email is required";
    if (!confirmPassword.trim()) tempErrors.confirmPassword = "Confirm Password is required";

    if (!hasUpperCase) {
      tempErrors.password =
        "Password must contain at least one uppercase letter";
    }

    if (!hasLowerCase) {
      tempErrors.password =
        "Password must contain at least one lowercase letter";
    }

    if (!hasSpecialChar) {
      tempErrors.password =
        "Password must contain at least one special character";
    }
    if (!hasNumber) {
      tempErrors.password = "Password must contain at least one number";
    }
    if (password.length < minLength) {
      tempErrors.password = `Password must be at least ${minLength} characters long`;
    }
    if (!password.trim()) tempErrors.password = "Password is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleRegister = async () => {
    try {
      if (!validateInputs()) return;
      // checkIsEmpty(name, "name");
      // checkIsEmpty(email, "email");
      // checkIsEmpty(password, "password");
      // checkIsEmpty(confirmPassword, "confirm-password");

      // checkValidPassword(password)

      // setName(name.trim())
      // setEmail(email.trim())
      // setConfirmPassword(confirmPassword.trim())
      // setPassword(password.trim)


      if(confirmPassword !== password){
        const error = new Error(`Passwords do not match`);
        error.response = { data: { msg: `Passwords do not match` } };
        throw error;
      }
    
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
      // console.log(formData);
      
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
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.headerContainer}>
            <Text status="primary" style={styles.title}>Create {role === "admin" ? "Admin" : "User"} Account</Text>
            <Text style={styles.subtitle}>Enter your details to get started</Text>
          </View>

          <View style={styles.formContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.profileImageContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.profileImageText}>Upload Photo</Text>
                </View>
              )}
            </TouchableOpacity>

            <Input
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setErrors({ ...errors, name: null });
              }}
              size="large"
              status={errors.name ? "danger" : "basic"}
              caption={errors.name}
            />
            <Input
              style={styles.input}
              placeholder="Email Address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors({ ...errors, email: null });
              }}
              autoCapitalize="none"
              status={errors.email ? "danger" : "basic"}
              caption={errors.email}
              size="large"
            />
            <Input
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors({ ...errors, password: null });
              }}
              secureTextEntry={!checked}
              size="large"
              caption={errors.password}
              status={errors.password ? "danger" : "basic"}
            />
            <Input
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setErrors({ ...errors, confirmPassword: null });
              }}
              secureTextEntry={!checked}
              status={errors.confirmPassword ? "danger" : "basic"}
              size="large"
              caption={errors.confirmPassword}
            />

            <View style={styles.checkboxContainer}>
              <CheckBox
                checked={checked}
                onChange={nextChecked => setChecked(nextChecked)}
              >
                Show Password
              </CheckBox>
            </View>

            <Button 
              style={styles.registerButton}
              appearance="filled"
              size="large"
              disabled={loading}
              accessoryLeft={loading ? LoadingIndicator : null}
              onPress={handleRegister}
            >
              {loading ? "" : "Create Account"}
            </Button>

            <TouchableOpacity 
              style={styles.loginLink}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.loginLinkText}>
                Already have an account? Login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Layout>
    </TouchableWithoutFeedback>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222B45' // Dark background matching Eva Dark theme
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    color: '#8F9BB3',
    textAlign: 'center'
  },
  formContainer: {
    backgroundColor: '#2a3457', 
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5
  },
  profileImageContainer: {
    alignSelf: 'center',
    marginBottom: 20
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center'
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  profileImageText: {
    color: '#666'
  },
  input: {
    marginBottom: 15,
    borderRadius: 10
  },
  checkboxContainer: {
    marginBottom: 20,
    alignSelf: 'flex-start'
  },
  registerButton: {
    borderRadius: 10,
    marginBottom: 15
  },
  loginLink: {
    alignSelf: 'center'
  },
  loginLinkText: {
    color: '#007bff',
    fontWeight: '600'
  },
  indicator: {
    justifyContent: 'center',
    alignItems: 'center'
  }
});
