import React, { useState } from 'react';
import { Keyboard, TouchableWithoutFeedback, View, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../services/API';
import { Layout, Text, Input, Button, Spinner } from "@ui-kitten/components";

export default function JoinOrganizationScreen({ navigation }) {
  const [organizationCode, setOrganizationCode] = useState('');

  const handleJoinOrganization = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await axios.post(
        `${api}/organizations/join`, 
        { orgCode: organizationCode }, 
        { headers: { Authorization: `${token}` } }
      );

      Alert.alert('Joined organization successfully');
      await AsyncStorage.removeItem("token");
      navigation.replace("Login");
    } catch (error) {
      
      Alert.alert('Error joining organization', error.response?.data?.msg || 'An error occurred');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <Layout style={styles.container}>
      <Input style={styles.input} placeholder="Enter Organization Code" value={organizationCode} onChangeText={setOrganizationCode} />
      <Button onPress={handleJoinOrganization} appearance="outline" >Join Organization</Button>
    </Layout>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});
