import React, { useState } from 'react';
import {  KeyboardAvoidingView, Platform,Alert, StyleSheet, Switch, Keyboard, TouchableWithoutFeedback } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../services/API';
import * as Location from 'expo-location'
import { ActivityIndicator } from 'react-native';
import { Layout, Text, Input, Button, Toggle } from "@ui-kitten/components";

const CreateOfficeLocation = ({navigation}) => {
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchCurrentLocation = async () => {
    try {
      setLoading(true)
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLatitude(currentLocation.coords.latitude.toString());
      setLongitude(currentLocation.coords.longitude.toString());
      setLoading(false)
    } catch (error) {
      Alert.alert('Error fetching current location');
    }
    finally {
      setLoading(false); 
    }
  };

  const handleCreateLocation = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
      // console.log("++++++", token);
      
    const response = await axios.post(
      `${api}/location/`, 
      { 
        name, 
        latitude: parseFloat(latitude), 
        longitude: parseFloat(longitude), 
        radius_meters: parseInt(radius, 10) 
      },
      { headers: { Authorization: `${token}` } }
    );

    Alert.alert('Office location created successfully');
    await AsyncStorage.removeItem("token");
    navigation.replace("Login");
  } catch (error) {
    // console.log(error.response.data);
    
    Alert.alert('Error creating location', error.response?.data?.msg || 'An error occurred');
  }
};

const toggleCurrentLocation = async () => {
  setUseCurrentLocation((prev) => !prev);
  if (!useCurrentLocation) {
    await fetchCurrentLocation();
  } else {
    setLatitude('');
    setLongitude('');
  }
};
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <Layout style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
    <Input
      style={styles.input}
      placeholder="Location Name"
      value={name}
      onChangeText={setName}
    />

    <Layout style={styles.switchContainer}>
      <Text>Use My Current Location</Text>
      <Toggle
        checked={useCurrentLocation}
        onChange={toggleCurrentLocation}
      ></Toggle>
    </Layout>

    {loading && (
        <Layout>
        <ActivityIndicator size="large" color="#0000ff" /> 
        <Text>Fetching your location...</Text>
        </Layout>
      ) }

    <Input
      style={styles.input}
      placeholder="Latitude"
      value={latitude}
      onChangeText={setLatitude}
      keyboardType="numeric"
      disabled={useCurrentLocation} 
    />
    <Input
      style={styles.input}
      placeholder="Longitude"
      value={longitude}
      onChangeText={setLongitude}
      keyboardType="numeric"
      disabled={useCurrentLocation}
    />

    <Input
      style={styles.input}
      placeholder="Radius (meters)"
      value={radius}
      onChangeText={setRadius}
      keyboardType="numeric"
    />

    <Button appearance='outline' onPress={handleCreateLocation} >Create Office Location</Button>
  </KeyboardAvoidingView>
  </Layout>
  </TouchableWithoutFeedback>
  )
}

export default CreateOfficeLocation

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        justifyContent: 'center',
      },
      input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
      },
      switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        justifyContent: 'space-around'
      },
      loader:{
        
      }
})