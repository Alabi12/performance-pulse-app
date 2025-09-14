// src/features/reports/screens/ReportsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { fetchKPIs } from '../../../store/slices/kpiSlice';
import { loadAttendanceHistory } from '../../../store/slices/attendanceSlice';

const ReportsScreen = () => {
  const dispatch = useDispatch();
  const { kpis } = useSelector((state) => state.kpi);
  const { history } = useSelector((state) => state.attendance);
  const user = useSelector((state) => state.auth.user);
  const [selectedTimeframe, setSelectedTimeframe] = useState('monthly');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const loadData = async () => {
    setLoading(true);
    try {
      await dispatch(fetchKPIs());
      await dispatch(loadAttendanceHistory());
    } catch (error) {
      console.error('Failed to load report data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter user-specific KPIs
  const userKPIs = kpis?.filter(kpi => kpi.createdBy === user?.id) || [];
  const approvedKPIs = userKPIs.filter(kpi => kpi.status === 'approved');
  const pendingKPIs = userKPIs.filter(kpi => kpi.status === 'pending');

  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (approvedKPIs.length === 0) return 0;
    const totalProgress = approvedKPIs.reduce((sum, kpi) => {
      const progress = kpi.targetValue > 0 ? (kpi.currentValue / kpi.targetValue) : 0;
      return sum + progress;
    }, 0);
    return (totalProgress / approvedKPIs.length) * 100;
  };

  // Calculate attendance statistics
  const calculateAttendanceStats = () => {
    const last30Days = history.slice(0, 30);
    const totalDays = last30Days.length;
    const presentDays = last30Days.filter(day => day.clockIn).length;
    const onTimeDays = last30Days.filter(day => {
      if (!day.clockIn) return false;
      const clockInTime = new Date(day.clockIn.timestamp).getHours();
      return clockInTime <= 9; // Before 9 AM
    }).length;

    return {
      attendanceRate: totalDays > 0 ? (presentDays / totalDays) * 100 : 0,
      punctualityRate: presentDays > 0 ? (onTimeDays / presentDays) * 100 : 0,
      totalDays,
      presentDays,
    };
  };

  const attendanceStats = calculateAttendanceStats();
  const overallProgress = calculateOverallProgress();

  // KPI Progress by Category
  const getProgressByCategory = () => {
    const categories = {};
    approvedKPIs.forEach(kpi => {
      if (!categories[kpi.category]) {
        categories[kpi.category] = { total: 0, count: 0 };
      }
      const progress = kpi.targetValue > 0 ? (kpi.currentValue / kpi.targetValue) * 100 : 0;
      categories[kpi.category].total += progress;
      categories[kpi.category].count += 1;
    });

    return Object.entries(categories).map(([category, data]) => ({
      category,
      averageProgress: data.count > 0 ? data.total / data.count : 0,
    }));
  };

  const progressByCategory = getProgressByCategory();

  // Chart data for KPI progress
  const kpiProgressData = {
    labels: approvedKPIs.slice(0, 5).map(kpi => kpi.title.substring(0, 10) + '...'),
    datasets: [
      {
        data: approvedKPIs.slice(0, 5).map(kpi => 
          Math.min((kpi.currentValue / kpi.targetValue) * 100, 100)
        ),
      },
    ],
  };

  // Chart data for attendance
  const attendanceData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [8.5, 8.2, 8.7, 8.1, 8.9, 0, 0], // Sample data
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#6366F1',
    backgroundGradientFrom: '#818cf8',
    backgroundGradientTo: '#6366F1',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726',
    },
  };

  const StatCard = ({ title, value, subtitle, icon, color, gradient }) => (
    <LinearGradient
      colors={gradient}
      style={[styles.statCard, { borderLeftColor: color }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View style={styles.statHeader}>
        <Text style={styles.statTitle}>{title}</Text>
        <Ionicons name={icon} size={20} color="white" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </LinearGradient>
  );

  const TimeframeButton = ({ label, value }) => (
    <TouchableOpacity
      style={[
        styles.timeframeButton,
        selectedTimeframe === value && styles.timeframeButtonActive
      ]}
      onPress={() => setSelectedTimeframe(value)}
    >
      <Text style={[
        styles.timeframeButtonText,
        selectedTimeframe === value && styles.timeframeButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="stats-chart" size={48} color="#6366F1" />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Performance Reports</Text>
            <Text style={styles.headerSubtitle}>
              {selectedTimeframe === 'weekly' ? 'Weekly' : 
               selectedTimeframe === 'monthly' ? 'Monthly' : 'Quarterly'} Overview
            </Text>
          </View>
          <Ionicons name="document-text" size={24} color="white" />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Timeframe Selector */}
        <View style={styles.timeframeContainer}>
          <TimeframeButton label="Weekly" value="weekly" />
          <TimeframeButton label="Monthly" value="monthly" />
          <TimeframeButton label="Quarterly" value="quarterly" />
        </View>

        {/* Overview Stats */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Goals Progress"
            value={`${Math.round(overallProgress)}%`}
            subtitle="Overall completion"
            icon="trophy"
            color="#4ECDC4"
            gradient={['#56ccf2', '#2f80ed']}
          />
          <StatCard
            title="Attendance"
            value={`${Math.round(attendanceStats.attendanceRate)}%`}
            subtitle={`${attendanceStats.presentDays}/${attendanceStats.totalDays} days`}
            icon="calendar"
            color="#FF6B6B"
            gradient={['#ff758c', '#ff7eb3']}
          />
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Active Goals"
            value={approvedKPIs.length}
            subtitle="Approved objectives"
            icon="checkmark-circle"
            color="#10B981"
            gradient={['#34d399', '#10b981']}
          />
          <StatCard
            title="Pending"
            value={pendingKPIs.length}
            subtitle="Awaiting approval"
            icon="time"
            color="#F59E0B"
            gradient={['#ffd26f', '#ffa43b']}
          />
        </View>

        {/* KPI Progress Chart */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up" size={22} color="#6366F1" />
            <Text style={styles.sectionTitle}>Goal Progress</Text>
          </View>
          <BarChart
            data={kpiProgressData}
            width={Dimensions.get('window').width - 64}
            height={220}
            yAxisLabel=""
            yAxisSuffix="%"
            chartConfig={chartConfig}
            style={styles.chart}
            fromZero
            showValuesOnTopOfBars
          />
        </View>

        {/* Attendance Chart */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={22} color="#6366F1" />
            <Text style={styles.sectionTitle}>Weekly Hours</Text>
          </View>
          <BarChart
            data={attendanceData}
            width={Dimensions.get('window').width - 64}
            height={220}
            yAxisLabel=""
            yAxisSuffix="h"
            chartConfig={chartConfig}
            style={styles.chart}
          />
        </View>

        {/* Category Performance */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="podium" size={22} color="#6366F1" />
            <Text style={styles.sectionTitle}>Performance by Category</Text>
          </View>
          {progressByCategory.map((item, index) => (
            <View key={index} style={styles.categoryItem}>
              <Text style={styles.categoryName}>
                {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
              </Text>
              <View style={styles.categoryProgress}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(item.averageProgress, 100)}%` }
                    ]}
                  />
                </View>
                <Text style={styles.categoryPercent}>
                  {Math.round(item.averageProgress)}%
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Insights */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb" size={22} color="#6366F1" />
            <Text style={styles.sectionTitle}>Performance Insights</Text>
          </View>
          <View style={styles.insightItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.insightText}>
              You've achieved {Math.round(overallProgress)}% of your goals this period
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Ionicons name="time" size={16} color="#F59E0B" />
            <Text style={styles.insightText}>
              {pendingKPIs.length} goals pending approval
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Ionicons name="calendar" size={16} color="#6366F1" />
            <Text style={styles.insightText}>
              {attendanceStats.attendanceRate}% attendance rate
            </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 24,
  },
  timeframeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  timeframeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  timeframeButtonActive: {
    backgroundColor: '#6366F1',
  },
  timeframeButtonText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 12,
  },
  timeframeButtonTextActive: {
    color: 'white',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
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
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  categoryProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 3,
  },
  categoryPercent: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  insightText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
});

export default ReportsScreen;