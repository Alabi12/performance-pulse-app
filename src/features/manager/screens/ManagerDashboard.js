// src/features/manager/screens/ManagerDashboard.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchKPIs } from '../../../store/slices/kpiSlice';
import { loadAttendanceHistory } from '../../../store/slices/attendanceSlice';

const { width } = Dimensions.get('window');

const ManagerDashboard = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector((state) => state.auth.user);
  const { kpis } = useSelector((state) => state.kpi);
  const { todayAttendance, history } = useSelector((state) => state.attendance);

  useEffect(() => {
    dispatch(fetchKPIs());
    dispatch(loadAttendanceHistory());
  }, [dispatch]);

  // Get all team members (for demo, we'll use mock data)
  const teamMembers = [
    { id: 1, name: 'John Employee', position: 'Sales Rep', department: 'Sales' },
    { id: 3, name: 'Mike Johnson', position: 'Marketing Specialist', department: 'Marketing' }
  ];

  const pendingApprovals = kpis.filter(kpi => kpi.status === 'pending');
  const teamKPIs = kpis.filter(kpi => kpi.createdBy !== user.id);

  const StatCard = ({ icon, value, label, color, onPress }) => (
    <TouchableOpacity 
      style={styles.statCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[`${color}20`, `${color}10`]}
        style={styles.statGradient}
      >
        <View style={[styles.statIcon, { backgroundColor: color }]}>
          {icon}
        </View>
        <Text style={styles.statNumber}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const handleNavigation = (screen) => {
    navigation.navigate(screen);
  };

  const handleComingSoon = (feature) => {
    Alert.alert('Feature Coming Soon', `${feature} will be available in Phase 2`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#3B82F6', '#2563EB']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Manager Dashboard</Text>
            <Text style={styles.userName}>Hello, {user?.name}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <StatCard
            icon={<Ionicons name="people" size={20} color="#FFFFFF" />}
            value={teamMembers.length}
            label="Team Members"
            color="#3B82F6"
            onPress={() => handleNavigation('Team Goals')}
          />
          <StatCard
            icon={<MaterialIcons name="pending-actions" size={20} color="#FFFFFF" />}
            value={pendingApprovals.length}
            label="Pending Approvals"
            color="#F59E0B"
            onPress={() => handleNavigation('Team Goals')}
          />
          <StatCard
            icon={<Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />}
            value={teamKPIs.length}
            label="Team Goals"
            color="#10B981"
            onPress={() => handleNavigation('Team Goals')}
          />
        </View>

        {/* Pending Approvals */}
        {pendingApprovals.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pending Approvals</Text>
              <TouchableOpacity 
                onPress={() => handleNavigation('Team Goals')}
                activeOpacity={0.7}
              >
                <Text style={styles.seeAll}>View All →</Text>
              </TouchableOpacity>
            </View>
            {pendingApprovals.slice(0, 3).map((kpi) => (
              <View key={kpi.id} style={styles.approvalItem}>
                <View style={styles.approvalInfo}>
                  <Text style={styles.approvalTitle}>{kpi.title}</Text>
                  <Text style={styles.approvalUser}>
                    By: {kpi.createdByName || 'Team Member'}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.reviewButton}
                  onPress={() => handleNavigation('Team Goals')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.reviewText}>Review</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Team Overview */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Team Overview</Text>
            <Text style={styles.teamCount}>{teamMembers.length} members</Text>
          </View>
          {teamMembers.map((member) => {
            const memberKPIs = kpis.filter(kpi => kpi.createdBy === member.id);
            const completedKPIs = memberKPIs.filter(kpi => kpi.currentValue >= kpi.targetValue);
            const completionRate = memberKPIs.length > 0 ? (completedKPIs.length / memberKPIs.length) * 100 : 0;
            
            return (
              <View key={member.id} style={styles.teamMemberItem}>
                <View style={styles.memberInfo}>
                  <View style={styles.avatarSmall}>
                    <Text style={styles.avatarSmallText}>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                  <View style={styles.memberDetails}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberRole}>{member.position}</Text>
                    <Text style={styles.memberDepartment}>{member.department}</Text>
                  </View>
                </View>
                <View style={styles.memberStats}>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBackground}>
                      <View
                        style={[
                          styles.progressFill,
                          { 
                            width: `${completionRate}%`,
                            backgroundColor: completionRate >= 75 ? '#10B981' : 
                                           completionRate >= 50 ? '#3B82F6' : '#F59E0B'
                          }
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {Math.round(completionRate)}%
                    </Text>
                  </View>
                  <Text style={styles.memberStat}>
                    {completedKPIs.length}/{memberKPIs.length} Goals
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Manager Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => handleNavigation('Team Goals')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.actionIcon}
              >
                <Ionicons name="checkmark-done" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.actionLabel}>Approve Goals</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => handleNavigation('Team Goals')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.actionIcon}
              >
                <Ionicons name="stats-chart" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.actionLabel}>Team Progress</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => handleComingSoon('Reports')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.actionIcon}
              >
                <Ionicons name="document-text" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.actionLabel}>Reports</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => handleComingSoon('Attendance review')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.actionIcon}
              >
                <Ionicons name="time" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.actionLabel}>Attendance</Text>
            </TouchableOpacity>
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
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: '#E0F2FE',
    marginBottom: 4,
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statGradient: {
    padding: 20,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    opacity: 0.9,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  teamCount: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  seeAll: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '600',
  },
  approvalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  approvalInfo: {
    flex: 1,
  },
  approvalTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  approvalUser: {
    fontSize: 12,
    color: '#6B7280',
  },
  reviewButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  reviewText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  teamMemberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarSmallText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  memberDepartment: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  memberStats: {
    alignItems: 'flex-end',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  progressBackground: {
    width: 60,
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    minWidth: 30,
    textAlign: 'right',
  },
  memberStat: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginBottom: 40,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionItem: {
    width: (width - 88) / 2,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    gap: 12,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
});

export default ManagerDashboard;