// src/features/dashboard/screens/DashboardScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchKPIs } from '../../../store/slices/kpiSlice';
import { loadAttendanceHistory } from '../../../store/slices/attendanceSlice';
import LogoutButton from '../../../components/ui/LogoutButton';
import { styles } from './DashboardScreen.styles';

const DashboardScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector((state) => state.auth.user);
  const { kpis, loading: kpisLoading, error: kpiError } = useSelector((state) => state.kpi);
  const { todayAttendance, loading: attendanceLoading, error: attendanceError } = useSelector((state) => state.attendance);
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = new Animated.Value(0);

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const loadData = useCallback(async () => {
    try {
      await dispatch(fetchKPIs());
      await dispatch(loadAttendanceHistory());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const userKPIs = kpis?.filter(kpi => kpi.createdBy === user?.id) || [];
  const approvedKPIs = userKPIs.filter(kpi => kpi.status === 'approved');
  const pendingKPIs = userKPIs.filter(kpi => kpi.status === 'pending');

  const calculateOverallProgress = useCallback(() => {
    if (approvedKPIs.length === 0) return 0;
    const totalProgress = approvedKPIs.reduce((sum, kpi) => {
      const progress = kpi.targetValue > 0 ? (kpi.currentValue / kpi.targetValue) : 0;
      return sum + progress;
    }, 0);
    return (totalProgress / approvedKPIs.length) * 100;
  }, [approvedKPIs]);

  const getStatus = useCallback(() => {
    if (!todayAttendance) return 'not-clocked-in';
    if (todayAttendance.clockIn && !todayAttendance.clockOut) return 'clocked-in';
    if (todayAttendance.clockIn && todayAttendance.clockOut) return 'clocked-out';
    return 'not-clocked-in';
  }, [todayAttendance]);

  const status = getStatus();
  const overallProgress = calculateOverallProgress();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getStatusColor = () => {
    switch(status) {
      case 'clocked-in': return '#10B981';
      case 'clocked-out': return '#6B7280';
      case 'not-clocked-in': return '#F59E0B';
      default: return '#9CA3AF';
    }
  };

  const getStatusIcon = () => {
    switch(status) {
      case 'clocked-in': return 'checkmark-circle';
      case 'clocked-out': return 'lock-closed';
      case 'not-clocked-in': return 'time';
      default: return 'alert-circle';
    }
  };

  const formatLocation = (location) => {
    if (!location) return null;
    if (typeof location === 'string') return location;
    if (location.latitude && location.longitude) {
      return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
    }
    if (location.address) return location.address;
    return 'Location recorded';
  };

  const headerBackgroundOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  // Android-specific navigation handler
  const handleNavigation = useCallback((screen, params = {}) => {
    if (Platform.OS === 'android') {
      // Add Android-specific navigation animations or behaviors
      navigation.navigate(screen, params);
    } else {
      navigation.navigate(screen, params);
    }
  }, [navigation]);

  const StatCard = ({ icon, value, label, color, gradient, onPress }) => (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
    >
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
    </TouchableOpacity>
  );

  if (kpisLoading || attendanceLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Animated Header Background */}
      <Animated.View 
        style={[
          styles.headerBackground,
          { opacity: headerBackgroundOpacity }
        ]} 
      />

      {/* Header with Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userRole}>{user?.position} • {user?.department}</Text>
          </View>
          <LogoutButton />
        </View>
      </LinearGradient>

      <Animated.ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6366F1']}
            tintColor={'#6366F1'}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Error Messages */}
        {(kpiError || attendanceError) && (
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={20} color="#DC2626" />
            <Text style={styles.errorText}>
              {kpiError || attendanceError}
            </Text>
          </View>
        )}

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <StatCard
            icon={<Ionicons name="trophy" size={20} color="white" />}
            value={approvedKPIs.length}
            label="Active Goals"
            color="#FF6B6B"
            gradient={['#ff758c', '#ff7eb3']}
            onPress={() => handleNavigation('KPI', { filter: 'approved' })}
          />
          <StatCard
            icon={<MaterialIcons name="trending-up" size={20} color="white" />}
            value={`${Math.round(overallProgress)}%`}
            label="Progress"
            color="#4ECDC4"
            gradient={['#56ccf2', '#2f80ed']}
            onPress={() => handleNavigation('KPI', { filter: 'progress' })}
          />
          <StatCard
            icon={<Ionicons name="time" size={20} color="white" />}
            value={pendingKPIs.length}
            label="Pending"
            color="#FFD166"
            gradient={['#ffd26f', '#ffa43b']}
            onPress={() => handleNavigation('KPI', { filter: 'pending' })}
          />
        </View>

        {/* Attendance Card */}
        <TouchableOpacity 
          style={styles.attendanceCard}
          onPress={() => handleNavigation('Attendance')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#FFFFFF', '#F8FAFC']}
            style={styles.attendanceGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.attendanceHeader}>
              <View style={styles.attendanceTitle}>
                <Ionicons name="time-outline" size={22} color="#6366F1" />
                <Text style={styles.cardTitle}>Today's Attendance</Text>
              </View>
              <View style={styles.attendanceStatusBadge}>
                <Ionicons 
                  name={getStatusIcon()} 
                  size={16} 
                  color={getStatusColor()} 
                />
                <Text style={[styles.statusText, { color: getStatusColor() }]}>
                  {status === 'clocked-in' && 'Clocked In'}
                  {status === 'clocked-out' && 'Clocked Out'}
                  {status === 'not-clocked-in' && 'Not Clocked In'}
                </Text>
              </View>
            </View>

            {todayAttendance ? (
              <View style={styles.attendanceTimes}>
                {todayAttendance.clockIn && (
                  <View style={styles.timeRow}>
                    <Ionicons name="arrow-down-circle" size={18} color="#10B981" />
                    <View>
                      <Text style={styles.timeText}>
                        In: {new Date(todayAttendance.clockIn.timestamp).toLocaleTimeString()}
                      </Text>
                      {todayAttendance.clockIn.location && (
                        <Text style={styles.locationText}>
                          {formatLocation(todayAttendance.clockIn.location)}
                        </Text>
                      )}
                    </View>
                  </View>
                )}
                {todayAttendance.clockOut && (
                  <View style={styles.timeRow}>
                    <Ionicons name="arrow-up-circle" size={18} color="#EF4444" />
                    <View>
                      <Text style={styles.timeText}>
                        Out: {new Date(todayAttendance.clockOut.timestamp).toLocaleTimeString()}
                      </Text>
                      {todayAttendance.clockOut.location && (
                        <Text style={styles.locationText}>
                          {formatLocation(todayAttendance.clockOut.location)}
                        </Text>
                      )}
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <Text style={styles.noAttendanceText}>
                No attendance record for today
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Goals Overview */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="flag" size={22} color="#6366F1" />
              <Text style={styles.sectionTitle}>Recent Goals</Text>
            </View>
            <TouchableOpacity 
              onPress={() => handleNavigation('KPI')}
              style={styles.seeAllButton}
              activeOpacity={0.7}
            >
              <Text style={styles.seeAll}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color="#6366F1" />
            </TouchableOpacity>
          </View>

          {userKPIs.slice(0, 3).map((kpi) => {
            const progress = kpi.targetValue > 0 ? (kpi.currentValue / kpi.targetValue) * 100 : 0;
            const isOverdue = new Date(kpi.deadline) < new Date() && progress < 100;
            
            return (
              <TouchableOpacity 
                key={kpi.id} 
                style={styles.goalItem}
                onPress={() => handleNavigation('KPIDetails', { kpiId: kpi.id })}
                activeOpacity={0.7}
              >
                <View style={styles.goalInfo}>
                  <Text style={styles.goalTitle} numberOfLines={1}>{kpi.title}</Text>
                  <Text style={styles.goalDescription} numberOfLines={1}>{kpi.description}</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <LinearGradient
                      colors={isOverdue ? ['#EF4444', '#DC2626'] : progress >= 80 ? ['#10B981', '#059669'] : ['#3B82F6', '#2563EB']}
                      style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </View>
                  <Text style={[
                    styles.progressText,
                    isOverdue && { color: '#EF4444' }
                  ]}>
                    {Math.round(progress)}%
                  </Text>
                </View>
                <View style={styles.goalMeta}>
                  <Text style={[
                    styles.goalDeadline,
                    isOverdue && { color: '#EF4444', fontWeight: '600' }
                  ]}>
                    Due: {new Date(kpi.deadline).toLocaleDateString()}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    kpi.status === 'approved' && styles.statusApproved,
                    kpi.status === 'pending' && styles.statusPending,
                    kpi.status === 'rejected' && styles.statusRejected
                  ]}>
                    <Text style={styles.statusBadgeText}>
                      {kpi.status.charAt(0).toUpperCase() + kpi.status.slice(1)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {userKPIs.length === 0 && (
            <TouchableOpacity 
              style={styles.emptyState}
              onPress={() => handleNavigation('KPI', { screen: 'CreateKPI' })}
              activeOpacity={0.7}
            >
              <Ionicons name="flag-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No goals set yet</Text>
              <Text style={styles.emptySubtext}>Tap to create your first goal</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => handleNavigation('KPI')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#818cf8', '#6366f1']}
                style={styles.actionIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="add-circle" size={24} color="white" />
              </LinearGradient>
              <Text style={styles.actionLabel}>New Goal</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => handleNavigation('Attendance')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#34d399', '#10b981']}
                style={styles.actionIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="time" size={24} color="white" />
              </LinearGradient>
              <Text style={styles.actionLabel}>Attendance</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => handleNavigation('Reports')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#fbbf24', '#f59e0b']}
                style={styles.actionIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="stats-chart" size={24} color="white" />
              </LinearGradient>
              <Text style={styles.actionLabel}>Progress</Text>
            </TouchableOpacity>

            {user?.role === 'manager' && (
              <TouchableOpacity 
                style={styles.actionItem}
                onPress={() => handleNavigation('Team')}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#a78bfa', '#8b5cf6']}
                  style={styles.actionIcon}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <FontAwesome5 name="users" size={20} color="white" />
                </LinearGradient>
                <Text style={styles.actionLabel}>Team</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default DashboardScreen;