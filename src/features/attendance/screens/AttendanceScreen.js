// src/features/attendance/screens/AttendanceScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../../../components/ui/Button';
import { clockIn, clockOut, loadAttendanceHistory } from '../../../store/slices/attendanceSlice';
import { getCurrentPosition } from '../../../services/locationService';

const AttendanceScreen = () => {
  const dispatch = useDispatch();
  const { todayAttendance, history, isLoading } = useSelector((state) => state.attendance);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState(null);

  useEffect(() => {
    // Load attendance history on component mount
    dispatch(loadAttendanceHistory());
    
    // Update current time every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [dispatch]);

  const handleClockIn = async () => {
    try {
      // Get current location
      const position = await getCurrentPosition();
      setLocation(position);
      
      dispatch(clockIn({
        timestamp: new Date().toISOString(),
        location: position,
        type: 'clock-in'
      }));
      
      Alert.alert('Success', 'Clocked in successfully!');
    } catch (error) {
      Alert.alert('Error', 'Could not get your location. Please enable location services.');
    }
  };

  const handleClockOut = async () => {
    try {
      const position = await getCurrentPosition();
      setLocation(position);
      
      dispatch(clockOut({
        timestamp: new Date().toISOString(),
        location: position,
        type: 'clock-out'
      }));
      
      Alert.alert('Success', 'Clocked out successfully!');
    } catch (error) {
      Alert.alert('Error', 'Could not get your location. Please enable location services.');
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatus = () => {
    if (!todayAttendance) return 'not-clocked-in';
    if (todayAttendance.clockIn && !todayAttendance.clockOut) return 'clocked-in';
    if (todayAttendance.clockIn && todayAttendance.clockOut) return 'clocked-out';
    return 'not-clocked-in';
  };

  const status = getStatus();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Time & Attendance</Text>
        <Text style={styles.currentTime}>
          {currentTime.toLocaleTimeString()}
        </Text>
        <Text style={styles.currentDate}>
          {currentTime.toLocaleDateString()}
        </Text>
      </View>

      {/* Status Card */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Current Status</Text>
        <View style={[
          styles.statusIndicator,
          status === 'clocked-in' && styles.statusClockedIn,
          status === 'clocked-out' && styles.statusClockedOut,
          status === 'not-clocked-in' && styles.statusNotClockedIn
        ]}>
          <Text style={styles.statusText}>
            {status === 'clocked-in' && '🟢 CLOCKED IN'}
            {status === 'clocked-out' && '🔴 CLOCKED OUT'}
            {status === 'not-clocked-in' && '⚪ NOT CLOCKED IN'}
          </Text>
        </View>
        
        {todayAttendance?.clockIn && (
          <Text style={styles.clockInTime}>
            Clocked in at: {formatTime(todayAttendance.clockIn.timestamp)}
          </Text>
        )}
        
        {todayAttendance?.clockOut && (
          <Text style={styles.clockOutTime}>
            Clocked out at: {formatTime(todayAttendance.clockOut.timestamp)}
          </Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title="Clock In"
          onPress={handleClockIn}
          disabled={status !== 'not-clocked-in' || isLoading}
          isLoading={isLoading}
          style={styles.clockInButton}
        />
        
        <Button
          title="Clock Out"
          onPress={handleClockOut}
          disabled={status !== 'clocked-in' || isLoading}
          isLoading={isLoading}
          variant="secondary"
          style={styles.clockOutButton}
        />
      </View>

      {/* Location Info */}
      {location && (
        <View style={styles.locationCard}>
          <Text style={styles.locationTitle}>📍 Current Location</Text>
          <Text style={styles.locationText}>
            Lat: {location.latitude.toFixed(6)}
          </Text>
          <Text style={styles.locationText}>
            Long: {location.longitude.toFixed(6)}
          </Text>
        </View>
      )}

      {/* Attendance History */}
      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>Recent Attendance</Text>
        {history.slice(0, 7).map((day, index) => (
          <View key={index} style={styles.historyItem}>
            <Text style={styles.historyDate}>{formatDate(day.date)}</Text>
            <View style={styles.historyTimes}>
              <Text style={styles.historyTime}>In: {day.clockIn ? formatTime(day.clockIn.timestamp) : '--:--'}</Text>
              <Text style={styles.historyTime}>Out: {day.clockOut ? formatTime(day.clockOut.timestamp) : '--:--'}</Text>
            </View>
          </View>
        ))}
        
        {history.length === 0 && (
          <Text style={styles.noHistory}>No attendance records yet</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  currentTime: {
    fontSize: 18,
    color: '#666',
  },
  currentDate: {
    fontSize: 16,
    color: '#888',
  },
  statusCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  statusIndicator: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  statusClockedIn: {
    backgroundColor: '#d4edda',
  },
  statusClockedOut: {
    backgroundColor: '#f8d7da',
  },
  statusNotClockedIn: {
    backgroundColor: '#e2e3e5',
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  clockInTime: {
    color: '#28a745',
    marginTop: 5,
  },
  clockOutTime: {
    color: '#dc3545',
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  clockInButton: {
    flex: 1,
  },
  clockOutButton: {
    flex: 1,
  },
  locationCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  locationTitle: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  locationText: {
    color: '#666',
    fontSize: 12,
  },
  historySection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  historyDate: {
    fontWeight: '500',
    color: '#333',
  },
  historyTimes: {
    alignItems: 'flex-end',
  },
  historyTime: {
    fontSize: 12,
    color: '#666',
  },
  noHistory: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 20,
  },
});

export default AttendanceScreen;