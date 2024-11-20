import React, { useState, useEffect } from "react";
import { Layout, Text, List, ListItem, Spinner, Avatar, Card, Input } from "@ui-kitten/components";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../services/API";
import { StyleSheet, Image, RefreshControl, View } from "react-native";
import { Icon } from '@ui-kitten/components';

export default function GetAllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

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
      setFilteredUsers(response.data);
    } catch (error) {
      console.error("Error fetching user list:", error.response ? error.response.data : error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  useEffect(() => {
    const filtered = users.filter(user => 
      (user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (user.role?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const SearchIcon = (props) => (
    <Icon {...props} name='search-outline' fill="#8F9BB3"/>
  );

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.userContainer}>
        <Avatar
          style={styles.avatar}
          source={
            item.profileImage
              ? { uri: item.profileImage }
              : require("../../assets/images/profileImage.jpg")
          }
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email || "No email available"}</Text>
          <Text style={styles.userRole}>{item.role || "User"}</Text>
        </View>
      </View>
    </Card>
  );

  if (loading && !refreshing) {
    return (
      <Layout style={styles.loadingContainer}>
        <Spinner size="large" />
      </Layout>
    );
  }


  return (
    <Layout style={styles.container}>
      <View style={styles.header}>
        <Text category="h5" style={styles.headerText}>
          Organization Members
        </Text>
        <Text style={styles.subHeaderText}>
          {filteredUsers.length} of {users.length} {users.length === 1 ? 'member' : 'members'}
        </Text>
      </View>

      <Input
        placeholder="Search members..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        accessoryLeft={SearchIcon}
        style={styles.searchInput}
        size="large"
      />

      <List
        style={styles.list}
        data={filteredUsers}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
      />
    </Layout>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222B45'
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2E3A59'
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  subHeaderText: {
    color: '#8F9BB3',
    marginTop: 4
  },
  searchInput: {
    margin: 16,
    borderRadius: 12,
    backgroundColor: '#1A2138'
  },
  card: {
    margin: 8,
    marginHorizontal: 16,
    backgroundColor: '#2a3457',
    borderRadius: 12
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8
  },
  avatar: {
    width: 50,
    height: 50,
    marginRight: 16
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4
  },
  userEmail: {
    fontSize: 14,
    color: '#8F9BB3',
    marginBottom: 2
  },
  userRole: {
    fontSize: 12,
    color: '#3366FF',
    textTransform: 'capitalize'
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#222B45',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
