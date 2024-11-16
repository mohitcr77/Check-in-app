import React, { useState } from 'react';
import { Keyboard, TouchableWithoutFeedback, View, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../services/API';
import { Layout, Text, Input, Button, Spinner } from "@ui-kitten/components";
import { checkIsEmpty } from '../../helpers/errorHelper';

const LoadingIndicator = (props) => (
  <View style={[props.style, styles.indicator]}>
    <Spinner size='small' />
  </View>
);

export default function JoinOrganizationScreen({ navigation }) {
  const [organizationCode, setOrganizationCode] = useState('');
  const [loading, setLoading] = useState(false)

  const handleJoinOrganization = async () => {
    try {
      checkIsEmpty(organizationCode);
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      const response = await axios.post(
        `${api}/organizations/join`, 
        { orgCode: organizationCode.toLowerCase() }, 
        { headers: { Authorization: `${token}` } }
      );
      setLoading(false)
      Alert.alert('Joined organization successfully');
      await AsyncStorage.removeItem("token");
      navigation.replace("Login");
    } catch (error) {
      setLoading(false)
      // console.log(error.response);
      
      Alert.alert('Error joining organization', error.response?.data?.msg || 'An error occurred');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <Layout style={styles.container}>
    <Text style={styles.title} status="primary">Join Organization</Text>
        <Text style={styles.text} appearance="hint">
          Hint : Enter the Organization Code to join.
        </Text>
      <Input style={styles.input} placeholder="Enter Organization Code" value={organizationCode} onChangeText={setOrganizationCode} />
      <Button disabled={loading} accessoryLeft={loading && LoadingIndicator} onPress={handleJoinOrganization} appearance="outline" >{loading? "": "Join"}</Button>
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
  text: {
    margin: 2,
    padding: 10,
    alignSelf: "center",
    letterSpacing: 2,
    textAlign: 'center'
  },
  title: {
    fontSize: 25,
    marginBottom: 20,
    textAlign: "center",
  },
});
