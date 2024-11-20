import React, { useState, useEffect } from 'react';
import { Layout, Text, Button, Spinner } from '@ui-kitten/components';
import { FlatList, StyleSheet, View, Alert } from 'react-native';
import axios from 'axios';
import { api } from '../services/API';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, subMonths } from 'date-fns';

export default function AttendanceHistoryScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  const fetchAttendanceRecords = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${api}/attendance/records`, {
        headers: { Authorization: `${token}` }
      });


      
      // Filter records from the past month
      const oneMonthAgo = subMonths(new Date(), 1);
      const recentRecords = response.data.filter(record => new Date(record.check_in_time) >= oneMonthAgo);
      setAttendanceRecords(recentRecords);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <Layout style={styles.recordItem}>
      <Text category="h6">Date: {format(new Date(item.check_in_time), 'yyyy-MM-dd')}</Text>
      <Text>Check-in: {format(new Date(item.check_in_time), 'HH:mm:ss')}</Text>
      <Text>Check-out: {item.check_out_time ? format(new Date(item.check_out_time), 'HH:mm:ss') : 'Not available'}</Text>
      <Text>Location: {item.location?.name || 'Unknown'}</Text>
    </Layout>
  );

  return (
    <Layout style={styles.container}>
      <Text status='primary' style={styles.title} category="h5">
        Attendance History (Past Month)
      </Text>
      {loading ? (
        <Spinner size="large" />
      ) : (
        <FlatList
          data={attendanceRecords}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text>No records available</Text>}
        />
      )}
      <Button style={styles.button} onPress={() => navigation.goBack()}>
        Back to Home
      </Button>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    // backgroundColor: '#f7f9fc',
  },
  title: {
    textAlign: 'center',
    marginVertical: 15,
    
  },
  recordItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#e4e9f2',
    borderRadius: 8,
    marginVertical: 5,
  },
  button: {
    marginTop: 15,
  },
});
