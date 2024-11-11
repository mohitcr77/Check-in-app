import { StyleSheet, View } from "react-native";
import React, {useState,  useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../services/API";
import axios from "axios";
import { Layout, Text, Input, Button, Toggle, Spinner } from "@ui-kitten/components";

const LoadingIndicator = (props) => (
  <View style={[props.style, styles.indicator]}>
    <Spinner size='small' />
  </View>
);

const GetAllUsers = ({ navigation, route }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUserList();
  }, []);

  const getUserList = async () => {
    try {
            const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`${api}/admin/users`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      
      setUsers(response.data);
    } catch (error) {
      
      console.error("Error fetching user list", error.response ? error.response.data : error.message);
    }
  };
  

  return (
    <Layout style={styles.container}>
    {users.length > 0 ? (
      users.map((user, index) => (
        <Layout style={styles.listViewContainer} key={index}>
        <Text status="primary" style={styles.userText} key={index}>
          {user}
        </Text>
        </Layout>
      ))
    ) : (
        <LoadingIndicator/> 
      
    )}
  </Layout>
);
};

export default GetAllUsers;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    justifyContent: "flex-start",
    flex:1
  },
  listViewContainer: {
    backgroundColor: "#14457e2d",
    padding: 10,
    borderRadius: 10,
    margin: 4,
    borderColor: "#14457e",
    borderWidth:1
  },
  userText: {
    fontSize: 18,
    marginVertical: 5,
    borderRadius: 10,
  },
  indicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
