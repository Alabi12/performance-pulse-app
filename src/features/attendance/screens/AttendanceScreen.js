// src/features/attendance/screens/AttendanceScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../../../components/ui/Button';
import { clockIn, clockOut, loadAttendanceHistory } from '../../../store/slices/attendanceSlice';
import { getCurrentPosition } from '../../../services/locationService';

const AttendanceScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
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

  const StatCard = ({ icon, value, label, color, gradient }) => (
    <LinearGradient
      colors={gradient}
      style={[styles.statCard, { borderLeftColor: color }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View style={[styles.statIcon, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
        {icon}
      </View>
      <Text style={styles.statNumber}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Time & Attendance</Text>
            <Text style={styles.currentDate}>{currentTime.toLocaleDateString()}</Text>
          </View>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Current Time Card */}
        <View style={styles.timeCard}>
          <Text style={styles.currentTime}>
            {currentTime.toLocaleTimeString()}
          </Text>
        </View>

        {/* Status Card */}
        <View style={styles.attendanceCard}>
          <View style={styles.attendanceHeader}>
            <View style={styles.attendanceTitle}>
              <Ionicons name="time-outline" size={22} color="#6366F1" />
              <Text style={styles.cardTitle}>Today's Attendance</Text>
            </View>
          </View>

          <View style={styles.attendanceStatus}>
            <View style={[
              styles.statusBadge,
              status === 'clocked-in' && styles.statusClockedIn,
              status === 'clocked-out' && styles.statusClockedOut,
              status === 'not-clocked-in' && styles.statusNotClockedIn
            ]}>
              <Text style={styles.statusText}>
                {status === 'clocked-in' && '🟢 Clocked In'}
                {status === 'clocked-out' && '🔴 Clocked Out'}
                {status === 'not-clocked-in' && '⚪ Not Clocked In'}
              </Text>
            </View>
          </View>

          {todayAttendance && (
            <View style={styles.attendanceTimes}>
              {todayAttendance.clockIn && (
                <View style={styles.timeRow}>
                  <Ionicons name="arrow-down-circle" size={18} color="#10B981" />
                  <Text style={styles.timeText}>
                    In: {formatTime(todayAttendance.clockIn.timestamp)}
                  </Text>
                </View>
              )}
              {todayAttendance.clockOut && (
                <View style={styles.timeRow}>
                  <Ionicons name="arrow-up-circle" size={18} color="#EF4444" />
                  <Text style={styles.timeText}>
                    Out: {formatTime(todayAttendance.clockOut.timestamp)}
                  </Text>
                </View>
              )}
            </View>
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
            variant="primary"
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
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="location" size={22} color="#6366F1" />
                <Text style={styles.sectionTitle}>Current Location</Text>
              </View>
            </View>
            <View style={styles.locationDetails}>
              <View style={styles.locationRow}>
                <Text style={styles.locationLabel}>Latitude:</Text>
                <Text style={styles.locationValue}>{location.latitude.toFixed(6)}</Text>
              </View>
              <View style={styles.locationRow}>
                <Text style={styles.locationLabel}>Longitude:</Text>
                <Text style={styles.locationValue}>{location.longitude.toFixed(6)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Attendance History */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="calendar" size={22} color="#6366F1" />
              <Text style={styles.sectionTitle}>Recent Attendance</Text>
            </View>
          </View>

          {history.slice(0, 7).map((day, index) => (
            <View key={index} style={styles.historyItem}>
              <View style={styles.historyDateContainer}>
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text style={styles.historyDate}>{formatDate(day.date)}</Text>
              </View>
              <View style={styles.historyTimes}>
                <View style={styles.historyTimeRow}>
                  <Ionicons name="arrow-down-circle" size={14} color="#10B981" />
                  <Text style={styles.historyTime}>
                    {day.clockIn ? formatTime(day.clockIn.timestamp) : '--:--'}
                  </Text>
                </View>
                <View style={styles.historyTimeRow}>
                  <Ionicons name="arrow-up-circle" size={14} color="#EF4444" />
                  <Text style={styles.historyTime}>
                    {day.clockOut ? formatTime(day.clockOut.timestamp) : '--:--'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
          
          {history.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No attendance records yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

   headerGradient: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  headerTextContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  currentDate: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 24,
  },
  timeCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  currentTime: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1F2937',
  },
  attendanceCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  attendanceTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  attendanceStatus: {
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusClockedIn: {
    backgroundColor: '#D1FAE5',
  },
  statusClockedOut: {
    backgroundColor: '#FEE2E2',
  },
  statusNotClockedIn: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  attendanceTimes: {
    marginTop: 16,
    gap: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  clockInButton: {
    flex: 1,
  },
  clockOutButton: {
    flex: 1,
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  locationDetails: {
    gap: 12,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  locationLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  locationValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  historyDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyDate: {
    fontWeight: '500',
    color: '#1F2937',
  },
  historyTimes: {
    alignItems: 'flex-end',
    gap: 4,
  },
  historyTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyTime: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
});

export default AttendanceScreen;