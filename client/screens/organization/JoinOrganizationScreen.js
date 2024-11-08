import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../services/API';

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
      navigation.navigate('Home');
    } catch (error) {
      
      Alert.alert('Error joining organization', error.response?.data?.msg || 'An error occurred');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Enter Organization Code" value={organizationCode} onChangeText={setOrganizationCode} />
      <Button title="Join Organization" onPress={handleJoinOrganization} />
    </View>
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
