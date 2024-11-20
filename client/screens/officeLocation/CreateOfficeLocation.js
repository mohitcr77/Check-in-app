import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
  Switch,
  Keyboard,
  TouchableWithoutFeedback,
  View,
  ScrollView
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../services/API";
import * as Location from "expo-location";
import { ActivityIndicator } from "react-native";
import {
  Layout,
  Text,
  Input,
  Button,
  Toggle,
  Spinner,
  Card,
  Icon
} from "@ui-kitten/components";

const LoadingIndicator = (props) => (
  <View style={[props.style, styles.indicator]}>
    <Spinner size="small" />
  </View>
);

const LocationIcon = (props) => (
  <Icon {...props} name='navigation-2-outline'/>
);

const MapIcon = (props) => (
  <Icon {...props} name='map-outline'/>
);

const CompassIcon = (props) => (
  <Icon {...props} name='compass-outline'/>
);

const CreateOfficeLocation = ({ navigation }) => {
  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radius, setRadius] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [errors, setErrors] = useState({});

  const validateInputs = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Location name is required';
    if (!latitude) newErrors.latitude = 'Latitude is required';
    if (!longitude) newErrors.longitude = 'Longitude is required';
    if (!radius) newErrors.radius = 'Radius is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchCurrentLocation = async () => {
    try {
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location services to use this feature');
        setUseCurrentLocation(false);
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLatitude(currentLocation.coords.latitude.toString());
      setLongitude(currentLocation.coords.longitude.toString());
    } catch (error) {
      Alert.alert("Error fetching current location");
      setUseCurrentLocation(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLocation = async () => {
    try {
      if (!validateInputs()) return;
      setLoadingBtn(true);
      const token = await AsyncStorage.getItem("token");
      // console.log("++++++", token);

      const response = await axios.post(
        `${api}/location/`,
        {
          name,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          radius_meters: parseInt(radius, 10),
        },
        { headers: { Authorization: `${token}` } }
      );
      await AsyncStorage.removeItem("token");
      Alert.alert(
        'Success', 
        'Office location created successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            })
          }
        ]
      );
    } catch (error) {
      

      Alert.alert(
        "Error",
        error.response?.data?.msg || "Failed to create location"
      );
    } finally{
      setLoadingBtn(false);
    }
  };

  const toggleCurrentLocation = async () => {
    setUseCurrentLocation((prev) => !prev);
    if (!useCurrentLocation) {
      await fetchCurrentLocation();
    } else {
      setLatitude("");
      setLongitude("");
    }
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <Layout style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.headerContainer}>
            <Text status="primary" category="h4" style={styles.title}>
              Office Location
            </Text>
            <Text appearance="hint" style={styles.subtitle}>
              Set up your office location for employee check-ins
            </Text>
          </View>

          <Card style={styles.formCard}>
            <Input
              label="Location Name"
              placeholder="Enter office location name"
              value={name}
              onChangeText={text => {
                setName(text);
                setErrors({...errors, name: null});
              }}
              status={errors.name ? 'danger' : 'basic'}
              caption={errors.name}
              accessoryLeft={LocationIcon}
              style={styles.input}
              size="large"
            />

            <View style={styles.toggleContainer}>
              <Text category="s1">Use Current Location</Text>
              <Toggle
                checked={useCurrentLocation}
                onChange={toggleCurrentLocation}
                disabled={loading}
              />
            </View>

            {loading && (
              <View style={styles.loadingContainer}>
                <Spinner status='primary'/>
                <Text style={styles.loadingText}>Fetching location...</Text>
              </View>
            )}

            <Input
              label="Latitude"
              placeholder="Enter latitude"
              value={latitude}
              onChangeText={text => {
                setLatitude(text);
                setErrors({...errors, latitude: null});
              }}
              status={errors.latitude ? 'danger' : 'basic'}
              caption={errors.latitude}
              accessoryLeft={MapIcon}
              keyboardType="numeric"
              disabled={useCurrentLocation}
              style={styles.input}
              size="large"
            />

            <Input
              label="Longitude"
              placeholder="Enter longitude"
              value={longitude}
              onChangeText={text => {
                setLongitude(text);
                setErrors({...errors, longitude: null});
              }}
              status={errors.longitude ? 'danger' : 'basic'}
              caption={errors.longitude}
              accessoryLeft={MapIcon}
              keyboardType="numeric"
              disabled={useCurrentLocation}
              style={styles.input}
              size="large"
            />

            <Input
              label="Check-in Radius (meters)"
              placeholder="Enter allowed radius in meters"
              value={radius}
              onChangeText={text => {
                setRadius(text);
                setErrors({...errors, radius: null});
              }}
              status={errors.radius ? 'danger' : 'basic'}
              caption={errors.radius || "Employees can only check-in within this radius"}
              accessoryLeft={CompassIcon}
              keyboardType="numeric"
              style={styles.input}
              size="large"
            />

            <Button
              style={styles.createButton}
              disabled={loadingBtn}
              accessoryLeft={loadingBtn ? LoadingIndicator : null}
              onPress={handleCreateLocation}
              size="large"
            >
              {loadingBtn ? 'CREATING...' : 'CREATE LOCATION'}
            </Button>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  </TouchableWithoutFeedback>
);
};

export default CreateOfficeLocation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center'
  },
  headerContainer: {
    marginVertical: 24,
    alignItems: 'center'
  },
  title: {
    // color: '#fff',
    marginBottom: 8
  },
  subtitle: {
    color: '#8F9BB3',
    textAlign: 'center'
  },
  formCard: {
    backgroundColor: '#2a3457',
    borderRadius: 12,
    padding: 1
  },
  input: {
    marginBottom: 16
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#1A2138',
    borderRadius: 8
  },
  loadingText: {
    marginLeft: 8,
    color: '#8F9BB3'
  },
  createButton: {
    marginTop: 24
  },
  indicator: {
    justifyContent: 'center',
    alignItems: 'center'
  }
});
