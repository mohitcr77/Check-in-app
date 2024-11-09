import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, ActivityIndicator, Image } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/API';
import { getDistance } from '../helpers/getDistance';
import { Layout, Text, Input, Button, Toggle } from "@ui-kitten/components";

export default function AttendanceScreen({ route, navigation }) {
  const { action } = route.params; 
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [officeLocations, setOfficeLocations] = useState([]); 
  const [nearestLocation, setNearestLocation] = useState(null);

  useEffect(() => {
    const initializeLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission to access location was denied');
          setLoading(false);
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);

        await fetchOrganizationLocations(currentLocation.coords);
      } catch (error) {
        console.error(error);
        Alert.alert('Error fetching location. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initializeLocation();
  }, []);


  const fetchOrganizationLocations = async (currentCoords) =>{
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${api}/location/organization`, {
        headers: {Authorization: `${token}`}
      });
      
      setOfficeLocations(response.data);

      findNearestLocation(currentCoords, response.data);
    } catch (error) {
      Alert.alert('Error fetching office locations', error.response?.data?.msg || 'An error occurred');
    }
  }

  const findNearestLocation = (currentCoords, locations) => {
    let nearest = null;
    let minDistance = Infinity;

    locations.forEach((loc) => {
      const distance = getDistance(currentCoords.latitude, currentCoords.longitude, loc.latitude, loc.longitude);

      if (distance < loc.radius_meters && distance < minDistance) {
        nearest = loc;
        minDistance = distance;
      }
    });

    if (nearest) {
      setNearestLocation(nearest);}
      else {
        Alert.alert('No nearby office location found within allowed radius.');
        // navigation.goBack();
      }
  }

  const handleAttendance = async () => {
    if (!location || !nearestLocation) {
      Alert.alert('Unable to fetch location. Please try again.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        `${api}/attendance/${action}`,
        {
          locationId: nearestLocation._id,
          latitude: location.latitude,
          longitude: location.longitude,
        },
        { headers: { Authorization: `${token}` } }
      );
      Alert.alert(`${action.charAt(0).toUpperCase() + action.slice(1)} Successfully`);
      navigation.goBack();
    } catch (error) {
      console.log(error);
      Alert.alert('Error', error.response?.data?.msg || 'An error occurred');
    }
  };

  return (
    <Layout style={styles.container}>
      <Layout style={styles.imageContainer}>
      <Image 
            source={
              action == "checkin"
                ? require("../assets/images/checkIn.png")
                : require("../assets/images/check-out.png")
            }
            style={{ width: 350, height: 350 }}
            resizeMode="cover"
          />
      </Layout>
      {loading ? (
        <>
        <ActivityIndicator size="large" color="#b8b8c4" /> 
        <Text>Fetching your location...</Text>
        </>
      ) : (
        <>
          <Text>{action === 'checkin' ? 'Checking In...' : 'Checking Out...'}</Text>
          <Button style={{margin:15}} size='large' appearance='ghost' onPress={handleAttendance} >{`Confirm ${action}`}</Button>
        </>
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 350, 
    height: 250, 
    padding: 20, 
    margin: 50,
  },
});
