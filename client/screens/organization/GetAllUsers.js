import React, { useState, useEffect } from "react";
import { Layout, Text, List, ListItem, Spinner } from "@ui-kitten/components";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../services/API";
import { StyleSheet, Image } from "react-native";

export default function GetAllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`${api}/admin/users`, {
        headers: { Authorization: `${token}` },
      });
      setUsers(response.data);
      setLoading(false)
    } catch (error) {
      console.error("Error fetching user list:", error.response ? error.response.data : error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <ListItem
      title={() => <Text style={styles.title}>{item.name}</Text>}
      description={() => <Text style={styles.description}>{item.email || "No email available"}</Text>}
      accessoryLeft={() => (
        <Image
          source={
            item.profileImage
              ? { uri: item.profileImage }
              : require("../../assets/images/profileImage.jpg")
          }
          style={styles.profileImage}
        />
      )}
    />
  );

  return (
    <Layout style={styles.container}>
      <Text category="h5" style={styles.headerText}>All Users</Text>
      {loading ? (
        <Layout style={styles.loadingContainer}>
          <Spinner size="large" />
        </Layout>
      ) : (
        <List
          style={styles.list}
          data={users}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <Layout style={styles.separator} />}
        />
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#1E1E1E", // Adjust for dark theme
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#E4E4E4", // Light text for dark background
  },
  list: {
    marginTop: 10,
  },
  title: {
    fontSize: 16,
    color: "#FFF", // Text color for dark theme
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    color: "#AAA", // Subtle text color for dark theme
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  separator: {
    height: 1,
    backgroundColor: "#444", // Separator for dark theme
    marginVertical: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
