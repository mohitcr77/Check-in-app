import React, { useState, useEffect } from "react";
import { StyleSheet, Image, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Layout, Text, Button } from "@ui-kitten/components";
import jwt_decode from "jwt-decode";
import axios from "axios";
import { api } from "../services/API";

export default function HomeScreen({ navigation }) {
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    navigation.replace("Login");
  };

  const [userInfo, setUserInfo] = useState(null);
  const [officeLocation, setOfficeLocation] = useState(null);

  const decodeToken = (token) => {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  };

  const getUserInfo = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        const decoded = decodeToken(token);

        setUserInfo(decoded);
        if (decoded.organization) {
          fetchOfficeLocation(decoded.organization);
        }
      }
    } catch (error) {
      console.log("Error decoding token:", error);
    }
  };

  const fetchOfficeLocation = async (organizationId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`${api}/location/office`, {
        headers: { Authorization: `${token}` },
        params: { organization: organizationId },
      });
      setOfficeLocation(response.data); // Set office location from API response
    } catch (error) {
      console.log("Error fetching office location:", error);
    }
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  return (
    <Layout style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Layout style={styles.infoContainer}>
          {userInfo && userInfo.organization && (
            <>
              <Text style={styles.text} status="info" category="h5">
                Organization : {userInfo.organization.name}
              </Text>
              {officeLocation && (
                <Text style={styles.text} status="info" category="h6">
                  Office : {officeLocation.name}
                </Text>
              )}
              <Text style={styles.text} status="info" category="h6">
                Name : {userInfo.name}
              </Text>
              <Text style={styles.text} status="info" category="h6">
                Email : {userInfo.email}
              </Text>
              <Text style={styles.text} status="info" category="h6">
                Role : {userInfo.role}
              </Text>
            </>
          )}
        </Layout>
        <Layout style={styles.imageContainer}>
          <Image
            source={
              userInfo?.role == "admin"
                ? require("../assets/images/manager.png")
                : require("../assets/images/employee.png")
            }
            style={{ width: 250, height: 150 }}
            resizeMode="cover"
          />
        </Layout>
        <Layout>
          <Layout style={styles.checkInContainer}>
            <Button
              status="success"
              style={[styles.button, { flex: 1 }]}
              appearance="outline"
              onPress={() =>
                navigation.navigate("Attendance", { action: "checkin" })
              }
            >
              Check In
            </Button>
            <Button
              status="warning"
              style={[styles.button, { flex: 1 }]}
              appearance="outline"
              onPress={() =>
                navigation.navigate("Attendance", { action: "checkout" })
              }
            >
              Check Out
            </Button>
          </Layout>
          <Button
            style={styles.button}
            appearance="outline"
            onPress={
              () => navigation.navigate("AttendanceRecords")
              
            }
          >
            View Attendance Records
          </Button>
          <Button
            style={styles.button}
            appearance="outline"
            onPress={() => navigation.navigate("GetAllUsers")}
          >
            List All Users
          </Button>
          <Button
            style={styles.button}
            appearance="ghost"
            status="danger"
            onPress={handleLogout}
          >
            Logout
          </Button>
        </Layout>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    padding: 20,
  },
  button: {
    margin: 10,
  },
  checkInContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  infoContainer: {
    marginBottom: 20,
    borderWidth: 1,
    padding: 20,
    borderRadius: 10,
    borderColor: "#14697e",
    justifyContent: "space-around",
    backgroundColor: "#14697e2d",
  },
  text: {
    margin: 8,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
  },
  scrollContainer: {
    flexGrow: 1,
  },
});
