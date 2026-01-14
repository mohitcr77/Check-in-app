import React, { useState, useEffect } from "react";
import { Layout, Text, Button, Datepicker, Select, SelectItem, List, ListItem, IndexPath } from "@ui-kitten/components";
import axiosInstance from "../services/axiosConfig";
import { api } from "../services/API";
import { StyleSheet } from "react-native";
export default function AttendanceRecords() {
    const [date, setDate] = useState(new Date());
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(new IndexPath(0));
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            const response = await axiosInstance.get(`${api}/admin/getLocations`);

            setLocations(response.data);
        } catch (error) {
            console.error("Error fetching locations:", error);
        }
    };

    const fetchAttendanceRecords = async () => {
        if (!locations[selectedLocation.row]) {
            alert("Please select an office location.");
            return;
        }

        setLoading(true);
        const formattedDate = date.toISOString().split("T")[0];

        try {
            const response = await axiosInstance.get(`${api}/admin/attendanceRecords/date`, {
                params: { date: formattedDate, location: locations[selectedLocation.row]._id },
            });
            setRecords(response.data);
        } catch (error) {
            console.error("Error fetching attendance records:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout style={{ flex: 1, padding: 20 }}>
            <Text category="h5" style={{ marginBottom: 10 }}>View Attendance Records</Text>

            <Datepicker date={date} onSelect={nextDate => setDate(nextDate)} label="Select Date" />

            <Select
                selectedIndex={selectedLocation}
                onSelect={index => setSelectedLocation(index)}
                value={locations[selectedLocation.row]?.name || "Select Office Location"} 
                placeholder="Select Office Location"
            >
                {locations.map((location, index) => (
                    <SelectItem title={location.name} key={location._id} />
                ))}
            </Select>

            <Button
                style={styles.fetchButton}
                onPress={fetchAttendanceRecords}
                disabled={loading}
                size="large"
            >
                {loading ? "Loading..." : "Fetch Records"}
            </Button>

            <List
                style={{ marginTop: 20 }}
                data={records}
                renderItem={({ item }) => (
                    <ListItem
                        title={() => <Text style={{ fontSize: 18, fontWeight: "bold" }}>{item.user.name}</Text>}
                        description={() => (
                            <Text style={{ fontSize: 14, color: "gray" }}>
                                Check-in: {new Date(item.check_in_time).toLocaleTimeString()} | 
                                Check-out: {item.check_out_time ? new Date(item.check_out_time).toLocaleTimeString() : "Not checked out"}
                            </Text>
                        )}
                    />
                )}
            />
        </Layout>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    marginBottom: 10,
    textAlign: "center",
  },
  fetchButton: {
    marginTop: 20,
    marginBottom: 10,
    width: '100%',
    height: 56,
  },
  button: {
    marginVertical: 10,
  },
  list: {
    marginTop: 20,
  },
});
