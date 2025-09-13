// src/features/dashboard/screens/DashboardScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { fetchKPIs } from '../../../store/slices/kpiSlice';
import { loadAttendanceHistory } from '../../../store/slices/attendanceSlice';
import LogoutButton from '../../../components/ui/LogoutButton';

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
  const overallProgress = calculateOverallProgress();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const StatCard = ({ icon, value, label, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        {icon}
      </View>
      <Text style={styles.statNumber}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userRole}>{user?.position} • {user?.department}</Text>
        </View>
        <LogoutButton />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <StatCard
            icon={<Ionicons name="trophy" size={20} color="#FF6B6B" />}
            value={approvedKPIs.length}
            label="Active Goals"
            color="#FF6B6B"
          />
          <StatCard
            icon={<MaterialIcons name="trending-up" size={20} color="#4ECDC4" />}
            value={`${Math.round(overallProgress)}%`}
            label="Progress"
            color="#4ECDC4"
          />
          <StatCard
            icon={<Ionicons name="time" size={20} color="#FFD166" />}
            value={pendingKPIs.length}
            label="Pending"
            color="#FFD166"
          />
        </View>

        {/* Attendance Card */}
        <TouchableOpacity 
          style={styles.attendanceCard}
          onPress={() => navigation.navigate('Attendance')}
        >
          <View style={styles.attendanceHeader}>
            <View style={styles.attendanceTitle}>
              <Ionicons name="time-outline" size={20} color="#6B7280" />
              <Text style={styles.cardTitle}>Today's Attendance</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>

          <View style={styles.attendanceStatus}>
            <View style={[
              styles.statusBadge,
              status === 'clocked-in' && styles.statusClockedIn,
              status === 'clocked-out' && styles.statusClockedOut,
              status === 'not-clocked-in' && styles.statusNotClockedIn
            ]}>
              <Text style={styles.statusText}>
                {status === 'clocked-in' && 'Clocked In'}
                {status === 'clocked-out' && 'Clocked Out'}
                {status === 'not-clocked-in' && 'Not Clocked In'}
              </Text>
            </View>
          </View>

          {todayAttendance && (
            <View style={styles.attendanceTimes}>
              {todayAttendance.clockIn && (
                <View style={styles.timeRow}>
                  <Ionicons name="arrow-down-circle" size={16} color="#10B981" />
                  <Text style={styles.timeText}>
                    In: {new Date(todayAttendance.clockIn.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              )}
              {todayAttendance.clockOut && (
                <View style={styles.timeRow}>
                  <Ionicons name="arrow-up-circle" size={16} color="#EF4444" />
                  <Text style={styles.timeText}>
                    Out: {new Date(todayAttendance.clockOut.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>

        {/* Goals Overview */}
        <View style={styles.goalsCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="flag" size={20} color="#3B82F6" />
              <Text style={styles.cardTitle}>Recent Goals</Text>
            </View>
            <TouchableOpacity 
              onPress={() => navigation.navigate('KPI')}
              style={styles.seeAllButton}
            >
              <Text style={styles.seeAll}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          {userKPIs.slice(0, 3).map((kpi) => {
            const progress = (kpi.currentValue / kpi.targetValue) * 100;
            return (
              <View key={kpi.id} style={styles.goalItem}>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalTitle} numberOfLines={1}>{kpi.title}</Text>
                  <Text style={styles.goalDescription} numberOfLines={1}>{kpi.description}</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${progress}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {Math.round(progress)}%
                  </Text>
                </View>
                <Text style={styles.goalDeadline}>
                  Due: {new Date(kpi.deadline).toLocaleDateString()}
                </Text>
              </View>
            );
          })}

          {userKPIs.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="flag-outline" size={40} color="#9CA3AF" />
              <Text style={styles.emptyText}>No goals set yet</Text>
              <Text style={styles.emptySubtext}>Create your first goal to get started</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigation.navigate('KPI')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#3B82F620' }]}>
                <Ionicons name="add-circle" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.actionLabel}>New Goal</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigation.navigate('Attendance')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#10B98120' }]}>
                <Ionicons name="time" size={24} color="#10B981" />
              </View>
              <Text style={styles.actionLabel}>Attendance</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigation.navigate('KPI')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#F59E0B20' }]}>
                <Ionicons name="stats-chart" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.actionLabel}>Progress</Text>
            </TouchableOpacity>

            {user?.role === 'manager' && (
              <TouchableOpacity 
                style={styles.actionItem}
                onPress={() => navigation.navigate('KPI')}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#8B5CF620' }]}>
                  <FontAwesome5 name="users" size={20} color="#8B5CF6" />
                </View>
                <Text style={styles.actionLabel}>Team</Text>
              </TouchableOpacity>
            )}
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  greeting: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  attendanceCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  attendanceTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  attendanceTimes: {
    marginTop: 12,
    gap: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  goalsCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAll: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '500',
  },
  goalItem: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  goalInfo: {
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    minWidth: 35,
  },
  goalDeadline: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  actionsCard: {
    backgroundColor: 'white',
    margin: 16,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    gap: 8,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
});

export default DashboardScreen;