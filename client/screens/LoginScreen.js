import React, { useState } from "react";
import { Layout, Text, Input, Button } from "@ui-kitten/components";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../services/API";
import { StyleSheet,Alert } from "react-native";
const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${api}/auth/login`, {
        email,
        password,
      });
      
      const { accessToken } = response.data;
      await AsyncStorage.setItem("token", accessToken);

      Alert.alert("Login successful");
      navigation.navigate("Home");
    } catch (error) {
      console.log(error);
      
      Alert.alert(
        "Login failed",
        error.response?.data?.msg || "An error occurred"
      );
    }
  };

  return (
    <Layout style={styles.container}>
      <Text status='primary' style={styles.title}>Welcome Back!</Text>
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
        secureTextEntry
        size="large"
      />
      <Button appearance="outline" onPress={handleLogin} >Login</Button>
      <Button
      style={styles.button}
      status="info"
      appearance="ghost"
        onPress={() => navigation.navigate("UserType")}
      >Don't have an account?Register...</Button>
    </Layout>
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
  button:{
    margin:10,
  }
});
