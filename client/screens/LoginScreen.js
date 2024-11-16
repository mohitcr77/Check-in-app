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
  View
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    try {
      checkIsEmpty(email, "email");
      checkIsEmpty(password, "password");
      // checkValidPassword(password)

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
        <Text status="primary" style={styles.title}>
          Welcome Back!
        </Text>
        <Input
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          size="large"
        />
        <Input
          style={styles.input}
          placeholder="Password"
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          accessoryRight={
            <TouchableOpacity onPress={togglePasswordVisibility}>
              <Icon fill="#7e7e7e" name={showPassword ? "eye-off-outline" : "eye-outline"} />
            </TouchableOpacity>
          }
          size="large"
        />
        <Button
          accessoryLeft={loading && LoadingIndicator}
          disabled={loading}
          appearance="outline"
          onPress={handleLogin}
        >
          {loading ? "" : "Login"}
        </Button>
        <Button
          style={styles.button}
          status="info"
          appearance="ghost"
          onPress={() => navigation.navigate("UserType")}
        >
          Don't have an account?Register...
        </Button>
      </Layout>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    justifyContent: "center",
  },
  title: {
    fontSize: 30,
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  button: {
    margin: 10,
  },
  indicator: {
    justifyContent: "center",
    alignItems: "center",
  },
});
