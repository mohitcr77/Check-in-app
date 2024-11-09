import { Alert, StyleSheet } from "react-native";
import React, { useState } from "react";
import { api } from "../services/API";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Layout, Text, Input, Button } from "@ui-kitten/components";

const RegisterScreen = ({ navigation, route }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { role } = route.params;
  const [organizationCode, setOrganizationCode] = useState("");

  const handleRegister = async () => {
    try {
      const payload = { name, email, password, role };

      if (role === "employee") {
        payload.organizationCode = organizationCode;
      }
      // console.log(payload);
      
      const response = await axios.post(`${api}/auth/register`, payload);
      
      const { accessToken } = response.data;
      await AsyncStorage.setItem("token", accessToken);

      Alert.alert("Registration successful");

      if (role === "admin") {
        navigation.navigate("CreateOrganization");
      } else {
        navigation.navigate("JoinOrganization");
      }
    } catch (error) {
      Alert.alert(
        "Registration failed",
        error.response?.data?.msg || "An error occurred"
      );
    }
  };
  return (
    
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
      {role === "employee" && (
        <Input
        size="large"
          style={styles.input}
          placeholder="Organization Code"
          value={organizationCode}
          onChangeText={setOrganizationCode}
        />
      )}

      <Button style={styles.button} appearance="outline" onPress={handleRegister} >Register</Button>
      <Button
      status="info"
        appearance="ghost"
        onPress={() => navigation.navigate("UserType")}
      >Back to User Select</Button>
    </Layout>
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
  }
});
