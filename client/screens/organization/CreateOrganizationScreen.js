import { Keyboard, TouchableWithoutFeedback, StyleSheet, Alert } from 'react-native'
import React, { useState } from 'react'
import { api } from '../../services/API'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Layout, Text, Input, Button } from "@ui-kitten/components";
const CreateOrganizationScreen = ({navigation}) => {
    const[name, setName] = useState('');
    const[code, setCode] = useState('');
    const[address, setAddress] = useState('');

    const handleCreateOrganization = async () =>{
      try {
          const token = await AsyncStorage.getItem('token');
          
            const response = await axios.post(
                `${api}/organizations/register`,
                {name, code, address},
                {headers:{Authorization: `${token}`}}
            )
            Alert.alert('Organization created successfully');
            navigation.navigate('CreateOfficeLocation');
        } catch (error) {
          console.log(error.response.data);
            Alert.alert('Error creating organization', error.response?.data?.msg || 'An error occurred');
        }
    }
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <Layout style={styles.container}>
      <Input size='large' style={styles.input} placeholder="Organization Name" value={name} onChangeText={setName} />
      <Input size='large' style={styles.input} placeholder="Set Organization Code" value={code} onChangeText={setCode} />
      <Input size='large' style={styles.input} placeholder="Organization Address" value={address} onChangeText={setAddress} />
      <Button status="primary" appearance='outline' onPress={handleCreateOrganization} >Create Organization</Button>
    </Layout>
    </TouchableWithoutFeedback>
  )
}

export default CreateOrganizationScreen

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
})