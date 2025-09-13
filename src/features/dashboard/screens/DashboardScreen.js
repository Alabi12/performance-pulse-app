// src/features/dashboard/screens/DashboardScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchKPIs } from '../../../store/slices/kpiSlice';
import { loadAttendanceHistory } from '../../../store/slices/attendanceSlice';

const DashboardScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector((state) => state.auth.user);
  const { kpis } = useSelector((state) => state.kpi);
  const { todayAttendance } = useSelector((state) => state.attendance);

  useEffect(() => {
    dispatch(fetchKPIs());
    dispatch(loadAttendanceHistory());
  }, [dispatch]);

  const userKPIs = kpis.filter(kpi => kpi.createdBy === user.id);
  const approvedKPIs = userKPIs.filter(kpi => kpi.status === 'approved');
  const pendingKPIs = userKPIs.filter(kpi => kpi.status === 'pending');

  const calculateOverallProgress = () => {
    if (approvedKPIs.length === 0) return 0;
    const totalProgress = approvedKPIs.reduce((sum, kpi) => {
      return sum + (kpi.currentValue / kpi.targetValue);
    }, 0);
    return (totalProgress / approvedKPIs.length) * 100;
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
      <Text style={styles.title}>Welcome, {user?.name}!</Text>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{approvedKPIs.length}</Text>
          <Text style={styles.statLabel}>Active Goals</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{Math.round(calculateOverallProgress())}%</Text>
          <Text style={styles.statLabel}>Overall Progress</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{pendingKPIs.length}</Text>
          <Text style={styles.statLabel}>Pending Approval</Text>
        </View>
      </View>

      {/* Attendance Status */}
      <TouchableOpacity 
        style={styles.attendanceCard}
        onPress={() => navigation.navigate('Attendance')}
      >
        <Text style={styles.cardTitle}>Today's Attendance</Text>
        <View style={styles.attendanceStatus}>
          <View style={[
            styles.statusDot,
            status === 'clocked-in' && styles.statusClockedIn,
            status === 'clocked-out' && styles.statusClockedOut,
            status === 'not-clocked-in' && styles.statusNotClockedIn
          ]} />
          <Text style={styles.attendanceText}>
            {status === 'clocked-in' && 'Clocked In ✅'}
            {status === 'clocked-out' && 'Clocked Out ✅'}
            {status === 'not-clocked-in' && 'Not Clocked In ⏰'}
          </Text>
        </View>
        {todayAttendance?.clockIn && (
          <Text style={styles.attendanceTime}>
            In: {new Date(todayAttendance.clockIn.timestamp).toLocaleTimeString()}
          </Text>
        )}
        {todayAttendance?.clockOut && (
          <Text style={styles.attendanceTime}>
            Out: {new Date(todayAttendance.clockOut.timestamp).toLocaleTimeString()}
          </Text>
        )}
      </TouchableOpacity>

      {/* Recent Goals */}
      <View style={styles.goalsCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Recent Goals</Text>
          <TouchableOpacity onPress={() => navigation.navigate('KPI')}>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>

        {userKPIs.slice(0, 3).map((kpi) => (
          <View key={kpi.id} style={styles.goalItem}>
            <Text style={styles.goalTitle}>{kpi.title}</Text>
            <View style={styles.goalProgress}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(kpi.currentValue / kpi.targetValue) * 100}%` }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round((kpi.currentValue / kpi.targetValue) * 100)}%
              </Text>
            </View>
            <Text style={styles.goalDeadline}>
              Deadline: {new Date(kpi.deadline).toLocaleDateString()}
            </Text>
          </View>
        ))}

        {userKPIs.length === 0 && (
          <Text style={styles.noGoals}>No goals set yet. Create your first goal!</Text>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsCard}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('KPI')}
          >
            <Text style={styles.actionText}>📊 View Goals</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Attendance')}
          >
            <Text style={styles.actionText}>⏰ Attendance</Text>
          </TouchableOpacity>
          {user?.role === 'manager' && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('KPI')}
            >
              <Text style={styles.actionText}>👥 Team KPIs</Text>
            </TouchableOpacity>
          )}
        </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E86DE',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  attendanceCard: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  attendanceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusClockedIn: {
    backgroundColor: '#28a745',
  },
  statusClockedOut: {
    backgroundColor: '#dc3545',
  },
  statusNotClockedIn: {
    backgroundColor: '#ffc107',
  },
  attendanceText: {
    fontSize: 16,
    fontWeight: '500',
  },
  attendanceTime: {
    color: '#666',
    fontSize: 14,
  },
  goalsCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAll: {
    color: '#2E86DE',
    fontWeight: '500',
  },
  goalItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  goalProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28a745',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    minWidth: 40,
  },
  goalDeadline: {
    fontSize: 12,
    color: '#999',
  },
  noGoals: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 20,
  },
  actionsCard: {
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
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#2E86DE',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  actionText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default DashboardScreen;