import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { sendNotification } from "./notification";
import { api } from "../services/API";

const GEOFENCING_TASK = "GEOFENCING_TASK";

TaskManager.defineTask(GEOFENCING_TASK, async ({ data, error }) => {
  if (error) {
    console.error("Geofencing task error:", error.message);
    return;
  }

  if (data) {
    const { eventType, region } = data;
    const token = await AsyncStorage.getItem("token");

    try {
      if (eventType === Location.GeofencingEventType.Enter) {
        console.log(`Entered region: ${region.identifier}`);
        // sendNotification("Checked In", `You've entered ${region.identifier}`);
        await axios.post(
          `${api}/attendance/checkin`,
          { locationId: region.identifier },
          { headers: { Authorization: `${token}` } }
        );
      } else if (eventType === Location.GeofencingEventType.Exit) {
        console.log(`Exited region: ${region.identifier}`);
        // sendNotification("Checked Out", `You've exited ${region.identifier}`);
        await axios.post(
          `${api}/attendance/checkout`,
          { locationId: region.identifier },
          { headers: { Authorization: `${token}` } }
        );
      }
    } catch (err) {
      console.error("Attendance API error:", err.response?.data || err.message);
    }
  }
});

export const startGeofencing = async (geofences) => {
  const { granted } = await Location.requestBackgroundPermissionsAsync();
  if (!granted) {
    console.error("Background location permissions not granted");
    return;
  }

  try {
    await Location.startGeofencingAsync(GEOFENCING_TASK, geofences);
    console.log("Geofencing started for:", geofences);
  } catch (error) {
    console.error("Error starting geofencing:", error);
  }
};
