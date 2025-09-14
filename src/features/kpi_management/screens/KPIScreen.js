// src/features/kpi_management/screens/KPIScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, Platform, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { 
  fetchKPIs, 
  createKPI, 
  updateKPIProgress, 
  approveKPI, 
  deleteKPI 
} from '../../../store/slices/kpiSlice';

const KPIScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { kpis, isLoading: kpisLoading } = useSelector((state) => state.kpi);
  const user = useSelector((state) => state.auth.user);
  const authLoading = useSelector((state) => state.auth.isLoading);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingKPI, setEditingKPI] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetValue: '',
    currentValue: '0',
    deadline: '',
    category: 'sales'
  });

  useEffect(() => {
    if (user) {
      dispatch(fetchKPIs());
    }
  }, [dispatch, user]);

  const isManager = user?.role === 'manager';

  const handleSubmit = () => {
    if (!formData.title || !formData.targetValue || !formData.deadline) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Check if user exists before accessing user.id
    if (!user || !user.id) {
      Alert.alert('Error', 'User information not available. Please try again.');
      return;
    }

    if (editingKPI) {
      dispatch(updateKPIProgress({
        id: editingKPI.id,
        currentValue: parseFloat(formData.currentValue)
      }));
    } else {
      dispatch(createKPI({
        ...formData,
        targetValue: parseFloat(formData.targetValue),
        currentValue: parseFloat(formData.currentValue),
        createdBy: user.id,
        status: 'pending'
      }));
    }

    resetForm();
    setIsModalVisible(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      targetValue: '',
      currentValue: '0',
      deadline: '',
      category: 'sales'
    });
    setEditingKPI(null);
  };

  const handleEdit = (kpi) => {
    setEditingKPI(kpi);
    setFormData({
      title: kpi.title,
      description: kpi.description || '',
      targetValue: kpi.targetValue.toString(),
      currentValue: kpi.currentValue.toString(),
      deadline: kpi.deadline.split('T')[0],
      category: kpi.category
    });
    setIsModalVisible(true);
  };

  const handleApprove = (kpiId) => {
    dispatch(approveKPI(kpiId));
  };

  const handleDelete = (kpiId) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => dispatch(deleteKPI(kpiId)), style: 'destructive' }
      ]
    );
  };

  const calculateProgress = (current, target) => {
    return target > 0 ? (current / target) * 100 : 0;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'rejected': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'rejected': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'sales': return '💰';
      case 'productivity': return '⚡';
      case 'quality': return '⭐';
      case 'customer': return '👥';
      case 'learning': return '📚';
      default: return '🎯';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return '#10B981';
    if (progress >= 50) return '#3B82F6';
    return '#EF4444';
  };

  // Safe filteredKPIs with null checks
  const filteredKPIs = isManager ? (kpis || []) : (kpis || []).filter(kpi => user && kpi.createdBy === user.id);

  // Show loading state while authentication is being checked
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show authentication required screen if user is not logged in
  if (!user) {
    return (
      <View style={styles.authContainer}>
        <Ionicons name="lock-closed" size={48} color="#6366F1" />
        <Text style={styles.authText}>Please log in to access goals</Text>
        <Button
          title="Go to Login"
          onPress={() => navigation.navigate('Auth')}
          style={styles.authButton}
        />
      </View>
    );
  }

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
            <Text style={styles.title}>Goals & Objectives</Text>
            <Text style={styles.subtitle}>
              {isManager ? 'Team Performance' : 'My Progress'}
            </Text>
          </View>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats Overview */}
        {!isManager && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="trophy" size={24} color="#6366F1" />
              <Text style={styles.statNumber}>
                {(filteredKPIs || []).filter(k => k.status === 'approved').length}
              </Text>
              <Text style={styles.statLabel}>Active Goals</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trending-up" size={24} color="#10B981" />
              <Text style={styles.statNumber}>
                {(filteredKPIs || []).length > 0 ? Math.round((filteredKPIs || []).reduce((sum, kpi) => sum + calculateProgress(kpi.currentValue, kpi.targetValue), 0) / filteredKPIs.length) : 0}%
              </Text>
              <Text style={styles.statLabel}>Avg Progress</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time" size={24} color="#F59E0B" />
              <Text style={styles.statNumber}>
                {(filteredKPIs || []).filter(k => k.status === 'pending').length}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
        )}

        {/* Action Button */}
        {!isManager && (
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => setIsModalVisible(true)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#818cf8', '#6366f1']}
              style={styles.createButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="add-circle" size={24} color="white" />
              <Text style={styles.createButtonText}>Create New Goal</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* KPI Cards */}
        {(filteredKPIs || []).map((kpi) => {
          const progress = calculateProgress(kpi.currentValue, kpi.targetValue);
          const isOverdue = new Date(kpi.deadline) < new Date() && progress < 100;
          
          return (
            <TouchableOpacity 
              key={kpi.id} 
              style={styles.kpiCard}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F8FAFC']}
                style={styles.kpiGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.kpiHeader}>
                  <View style={styles.kpiTitleContainer}>
                    <Text style={styles.categoryIcon}>
                      {getCategoryIcon(kpi.category)}
                    </Text>
                    <Text style={styles.kpiTitle} numberOfLines={1}>
                      {kpi.title}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(kpi.status) + '20' }]}>
                    <Ionicons 
                      name={getStatusIcon(kpi.status)} 
                      size={14} 
                      color={getStatusColor(kpi.status)} 
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(kpi.status) }]}>
                      {kpi.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {kpi.description && (
                  <Text style={styles.kpiDescription} numberOfLines={2}>
                    {kpi.description}
                  </Text>
                )}

                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <Text style={[styles.progressPercent, { color: getProgressColor(progress) }]}>
                      {Math.round(progress)}%
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <LinearGradient
                      colors={isOverdue ? ['#EF4444', '#DC2626'] : progress >= 80 ? ['#10B981', '#059669'] : ['#3B82F6', '#2563EB']}
                      style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </View>
                  <Text style={styles.progressValues}>
                    {kpi.currentValue} / {kpi.targetValue}
                  </Text>
                </View>

                <View style={styles.kpiMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar" size={14} color="#6B7280" />
                    <Text style={[styles.deadline, isOverdue && styles.overdueText]}>
                      {new Date(kpi.deadline).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="pricetag" size={14} color='#6B7280' />
                    <Text style={styles.category}>
                      {kpi.category}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  {!isManager && kpi.status === 'pending' && (
                    <Button
                      title="Edit"
                      onPress={() => handleEdit(kpi)}
                      variant="secondary"
                      style={styles.actionButton}
                      size="small"
                    />
                  )}

                  {isManager && kpi.status === 'pending' && (
                    <>
                      <Button
                        title="Approve"
                        onPress={() => handleApprove(kpi.id)}
                        style={styles.actionButton}
                        size="small"
                      />
                      <Button
                        title="Reject"
                        onPress={() => handleDelete(kpi.id)}
                        variant="danger"
                        style={styles.actionButton}
                        size="small"
                      />
                    </>
                  )}

                  {kpi.status === 'approved' && (
                    <Button
                      title="Update Progress"
                      onPress={() => handleEdit(kpi)}
                      style={styles.actionButton}
                      size="small"
                    />
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}

        {(filteredKPIs || []).length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="flag-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No goals found</Text>
            <Text style={styles.emptySubtext}>
              {isManager ? 'No team members have set goals yet' : 'Create your first goal to get started'}
            </Text>
            {!isManager && (
              <Button
                title="Create First Goal"
                onPress={() => setIsModalVisible(true)}
                style={styles.emptyButton}
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* Add/Edit KPI Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingKPI ? 'Edit Goal' : 'Create New Goal'}
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  setIsModalVisible(false);
                  resetForm();
                }}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Input
                label="Goal Title *"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="e.g., Increase sales by 20%"
              />

              <Input
                label="Description"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Describe your goal..."
                multiline
              />

              <View style={styles.row}>
                <View style={styles.inputHalf}>
                  <Input
                    label="Target Value *"
                    value={formData.targetValue}
                    onChangeText={(text) => setFormData({ ...formData, targetValue: text })}
                    placeholder="100"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputHalf}>
                  <Input
                    label="Current Progress"
                    value={formData.currentValue}
                    onChangeText={(text) => setFormData({ ...formData, currentValue: text })}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Input
                label="Deadline *"
                value={formData.deadline}
                onChangeText={(text) => setFormData({ ...formData, deadline: text })}
                placeholder="YYYY-MM-DD"
              />

              <View style={styles.buttonRow}>
                <Button
                  title="Cancel"
                  onPress={() => {
                    setIsModalVisible(false);
                    resetForm();
                  }}
                  variant="secondary"
                  style={styles.modalButton}
                />
                <Button
                  title={editingKPI ? 'Update' : 'Create'}
                  onPress={handleSubmit}
                  style={styles.modalButton}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  authText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginVertical: 16,
  },
  authButton: {
    marginTop: 20,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
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
  subtitle: {
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
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  createButton: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  createButtonGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  kpiCard: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  kpiGradient: {
    padding: 24,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  kpiTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  categoryIcon: {
    fontSize: 20,
  },
  kpiTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  kpiDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressValues: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  kpiMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deadline: {
    fontSize: 12,
    color: '#6B7280',
  },
  overdueText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  category: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScroll: {
    padding: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
  },
});

export default KPIScreen;