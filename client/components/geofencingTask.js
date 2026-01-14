import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sendNotification } from "./notification";
import { api } from "../services/API";
import { getDeviceInfo, detectMockLocation } from "../helpers/deviceInfo";

const GEOFENCING_TASK = "GEOFENCING_TASK";

// Store failed attempts for retry
const storeFailedAttempt = async (attempt) => {
  try {
    const existingAttempts = await AsyncStorage.getItem("failedAttendance");
    const attempts = existingAttempts ? JSON.parse(existingAttempts) : [];
    attempts.push(attempt);
    await AsyncStorage.setItem("failedAttendance", JSON.stringify(attempts));
  } catch (error) {
    console.error("Error storing failed attempt:", error);
  }
};

TaskManager.defineTask(GEOFENCING_TASK, async ({ data, error }) => {
  if (error) {
    console.error("Geofencing task error:", error.message);
    return;
  }

  if (data) {
    const { eventType, region } = data;
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      // Get current location for accurate coordinates
      let currentLocation = null;
      let locationData = null;
      let isMockLocation = false;

      try {
        locationData = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        currentLocation = locationData.coords;

        // Detect mock location
        isMockLocation = detectMockLocation(locationData);

        if (isMockLocation) {
          console.warn("Mock location detected!");
          await sendNotification(
            "Location Warning",
            "Mock location detected. Attendance may be flagged for review."
          );
        }
      } catch (locError) {
        console.warn("Could not get precise location, using geofence center:", locError.message);
        // Use region coordinates as fallback
        currentLocation = {
          latitude: region.latitude,
          longitude: region.longitude,
          accuracy: null
        };
      }

      // Get device information
      const deviceInfo = await getDeviceInfo();

      const requestBody = {
        locationId: region.identifier,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        accuracy: currentLocation.accuracy || null,
        isAutomatic: true,
        isMockLocation,
        deviceInfo
      };

      if (eventType === Location.GeofencingEventType.Enter) {
        console.log(`Entered region: ${region.identifier}`, requestBody);

        const response = await axios.post(
          `${api}/attendance/checkin`,
          requestBody,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 second timeout
          }
        );

        // Send success notification
        await sendNotification(
          "Check-In Successful",
          `You've been automatically checked in at ${region.notificationMessage || 'your office'}`
        );

        console.log("Check-in successful:", response.data);

      } else if (eventType === Location.GeofencingEventType.Exit) {
        console.log(`Exited region: ${region.identifier}`, requestBody);

        const response = await axios.post(
          `${api}/attendance/checkout`,
          requestBody,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );

        // Send success notification
        await sendNotification(
          "Check-Out Successful",
          `You've been automatically checked out from ${region.notificationMessage || 'your office'}`
        );

        console.log("Check-out successful:", response.data);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.msg || err.response?.data?.error || err.message;
      console.error("Attendance API error:", errorMessage, err.response?.status);

      // Store failed attempt for retry later
      await storeFailedAttempt({
        eventType,
        region: region.identifier,
        timestamp: new Date().toISOString(),
        error: errorMessage,
      });

      // Notify user of failure
      await sendNotification(
        "Attendance Error",
        `Failed to ${eventType === Location.GeofencingEventType.Enter ? 'check in' : 'check out'}: ${errorMessage}`
      );
    }
  }
});

// Retry failed attendance attempts
export const retryFailedAttendance = async () => {
  try {
    const failedAttemptsStr = await AsyncStorage.getItem("failedAttendance");
    if (!failedAttemptsStr) return;

    const failedAttempts = JSON.parse(failedAttemptsStr);
    if (failedAttempts.length === 0) return;

    console.log(`Retrying ${failedAttempts.length} failed attendance attempts...`);

    const token = await AsyncStorage.getItem("token");
    if (!token) return;

    const stillFailed = [];

    for (const attempt of failedAttempts) {
      try {
        const endpoint = attempt.eventType === Location.GeofencingEventType.Enter
          ? `${api}/attendance/checkin`
          : `${api}/attendance/checkout`;

        // Get current location for retry
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        await axios.post(
          endpoint,
          {
            locationId: attempt.region,
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            isAutomatic: true,
            isRetry: true,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );

        console.log(`Successfully retried attendance for region ${attempt.region}`);
      } catch (error) {
        console.error(`Retry failed for region ${attempt.region}:`, error.message);
        stillFailed.push(attempt);
      }
    }

    // Update storage with only still-failed attempts
    await AsyncStorage.setItem("failedAttendance", JSON.stringify(stillFailed));
  } catch (error) {
    console.error("Error retrying failed attendance:", error);
  }
};

export const startGeofencing = async (geofences) => {
  const { granted } = await Location.requestBackgroundPermissionsAsync();
  if (!granted) {
    console.error("Background location permissions not granted");
    await sendNotification(
      "Permission Required",
      "Please enable background location to use automatic attendance"
    );
    return;
  }

  try {
    // Add location name to geofence regions for better notifications
    const enrichedGeofences = geofences.map(gf => ({
      ...gf,
      notificationMessage: gf.name || gf.identifier
    }));

    await Location.startGeofencingAsync(GEOFENCING_TASK, enrichedGeofences);
    console.log("Geofencing started for:", enrichedGeofences.length, "locations");

    // Retry any failed attempts from previous sessions
    await retryFailedAttendance();
  } catch (error) {
    console.error("Error starting geofencing:", error);
    await sendNotification(
      "Geofencing Error",
      "Failed to start automatic attendance tracking"
    );
  }
};
