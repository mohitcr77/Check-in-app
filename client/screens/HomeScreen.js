import React, { useState, useEffect } from "react";
import { StyleSheet, Image, ScrollView, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Layout, Text, Button, Avatar, Card } from "@ui-kitten/components";
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
      // console.log(token);
      
      if (token) {
        const decoded = decodeToken(token);
        // console.log(userInfo);
        // console.log(officeLocation);
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
      setOfficeLocation(response.data);
    } catch (error) {
      console.log("Error fetching office location:", error);
    }
  };

  useEffect(() => {
  const fetchUserInfo = async () => {
    await getUserInfo();
  };
  fetchUserInfo();
}, []);


  return (
    <Layout style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {userInfo && (
          <>
            <View style={styles.profileSection}>
              <Image
                style={!userInfo.profileImage ? {width:150, height: 150} : {width:150, height: 150, borderRadius: 150}}
                source={
                  userInfo.profileImage ?
                  {uri: userInfo.profileImage}: 
                  userInfo?.role === "admin"
                    ? require("../assets/images/manager.png")
                    : require("../assets/images/employee.png")
                   }
              />
              <Text style={styles.welcomeText}>Welcome,</Text>
              <Text style={styles.nameText}>{userInfo.name}</Text>
            </View>

            <Card style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Organization</Text>
                <Text style={styles.infoValue}>{userInfo.organization?.name}</Text>
              </View>
              {officeLocation && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Office</Text>
                  <Text style={styles.infoValue}>{officeLocation?.name}</Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{userInfo.email}</Text>
              </View>
              { userInfo?.role === "admin" && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Organization Code</Text>
                  <Text style={styles.infoValue}>{userInfo.organization?.code}</Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Role</Text>
                <Text style={styles.infoValue}>{userInfo.role === 'employee' ? 'User' : 'Admin'}</Text>
              </View>
            </Card>

            <Card style={styles.actionCard}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.checkInContainer}>
                <Button
                  style={[styles.checkButton, styles.checkInButton]}
                  status="success"
                  onPress={() => navigation.navigate("Attendance", { action: "checkin" })}
                >
                  Check In
                </Button>
                <Button
                  style={[styles.checkButton, styles.checkOutButton]}
                  status="danger"
                  onPress={() => navigation.navigate("Attendance", { action: "checkout" })}
                >
                  Check Out
                </Button>
              </View>
            </Card>

            <Card style={styles.actionCard}>
              <Text style={styles.sectionTitle}>Management</Text>
              {userInfo?.role === "admin" ? (
                <View>
                  <Button
                    style={styles.button}
                    status="primary"
                    onPress={() => navigation.navigate("AttendanceRecords")}
                  >
                    View Attendance Records
                  </Button>
                  <Button
                    style={styles.button}
                    status="info"
                    onPress={() => navigation.navigate("GetAllUsers")}
                  >
                    List All Users
                  </Button>
                </View>
              ) : (
                <Button
                  style={styles.button}
                  status="info"
                  onPress={() => navigation.navigate("GetMyRecords")}
                >
                  View My Records
                </Button>
              )}
            </Card>

            <Button
              style={styles.logoutButton}
              appearance="ghost"
              status="danger"
              onPress={handleLogout}
            >
              Logout
            </Button>
          </>
        )}
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222B45'
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 20
  },
  welcomeText: {
    fontSize: 16,
    color: '#8F9BB3',
    marginTop: 10
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 5
  },
  infoCard: {
    backgroundColor: '#1A2138',
    marginBottom: 16,
    borderRadius: 12
  },
  actionCard: {
    backgroundColor: '#1A2138',
    marginBottom: 16,
    borderRadius: 12
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2E3A59'
  },
  infoLabel: {
    color: '#8F9BB3',
    fontSize: 14
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16
  },
  checkInContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10
  },
  checkButton: {
    flex: 1
  },
  button: {
    marginBottom: 10
  },
  logoutButton: {
    marginTop: 10
  }
});
