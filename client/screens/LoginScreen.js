import React, { useState } from "react";
import {
  Layout,
  Text,
  Input,
  Button,
  Spinner,
  Icon,
} from "@ui-kitten/components";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../services/API";
import {
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
  Alert,
  View,
  ScrollView,
} from "react-native";
import { checkIsEmpty, checkValidPassword } from "../helpers/errorHelper.js";
import { TouchableOpacity } from "react-native-gesture-handler";

const LoadingIndicator = (props) => (
  <View style={[props.style, styles.indicator]}>
    <Spinner size="small" />
  </View>
);

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateInputs = () => {
    let tempErrors = {};
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!email.trim()) tempErrors.email = "Email is required";

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

  const handleLogin = async () => {
    try {
      if (!validateInputs()) return;
      // checkIsEmpty(email.trim(), "email");
      // checkIsEmpty(password.trim(), "password");
      // checkValidPassword(password)
      setEmail(email.trim());
      setPassword(password.trim());

      setLoading(true);
      const response = await axios.post(`${api}/auth/login`, {
        email,
        password,
      });

      const { accessToken } = response.data;
      await AsyncStorage.setItem("token", accessToken);
      setLoading(false);
      Alert.alert("Login successful");
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    } catch (error) {
      setLoading(false);
      console.log(error);
      Alert.alert(
        "Login failed",
        error.response?.data?.msg || "An error occurred"
      );
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Layout style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <Text status="primary" style={styles.title}>
              Welcome Back!
            </Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          <View style={styles.formContainer}>
            <Input
              style={styles.input}
              placeholder="Email Address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors({ ...errors, email: null });
              }}
              autoCapitalize="none"
              caption={errors.email}
              status={errors.email ? "danger" : "basic"}
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
              caption={errors.password}
              secureTextEntry={!showPassword}
              status={errors.password ? "danger" : "basic"}
              accessoryRight={
                <TouchableOpacity onPress={togglePasswordVisibility}>
                  <Icon
                    fill="#8F9BB3"
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              }
              size="large"
            />

            {/* <TouchableOpacity style={styles.forgotPasswordLink}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity> */}

            <Button
              style={styles.loginButton}
              appearance="filled"
              size="large"
              accessoryLeft={loading ? LoadingIndicator : null}
              disabled={loading}
              onPress={handleLogin}
            >
              {loading ? "" : "Login"}
            </Button>

            <View style={styles.registerLinkContainer}>
              <Text style={styles.registerText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("UserType")}>
                <Text style={styles.registerLinkText}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Layout>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#8F9BB3",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#2a3457",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    marginBottom: 15,
    borderRadius: 10,
  },
  forgotPasswordLink: {
    alignSelf: "flex-end",
    marginBottom: 15,
  },
  forgotPasswordText: {
    color: "#007AFF",
    fontSize: 14,
  },
  loginButton: {
    marginTop: 10,
    borderRadius: 10,
  },
  registerLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  registerText: {
    color: "#8F9BB3",
    marginRight: 5,
  },
  registerLinkText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  eyeIcon: {
    width: 24,
    height: 24,
  },
  indicator: {
    justifyContent: "center",
    alignItems: "center",
  },
});
