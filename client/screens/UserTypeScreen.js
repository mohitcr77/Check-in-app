import { StyleSheet } from "react-native";
import React from "react";
import { Layout, Text, Input, Button } from "@ui-kitten/components";

const UserTypeScreen = ({ navigation }) => {
  return (
    <Layout style={styles.container}>
      <Text status="primary" style={styles.title}>
        SELECT USER TYPE
      </Text>
      <Button
        status="success"
        size="large"
        style={styles.button}
        onPress={() => navigation.navigate("Register", { role: "admin" })}
      >
        {() => <Text style={{ color: "#ffffff" }}>Register for admin</Text>}
      </Button>
      <Button
        status="warning"
        style={styles.button}
        onPress={() => navigation.navigate("Register", { role: "employee" })}
      >
        {() => <Text style={{ color: "#ffffff" }}>Register for Employee</Text>}
        
      </Button>
      <Button
        status="info"
        appearance="ghost"
        onPress={() => navigation.navigate("Login")}
      >
        Already have an account? Login...
      </Button>
    </Layout>
  );
};

export default UserTypeScreen;

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
  button: {
    margin: 20,
  },
});
