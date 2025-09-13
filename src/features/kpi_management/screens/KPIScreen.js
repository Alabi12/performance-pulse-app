// src/features/kpi_management/screens/KPIScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
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
  const { kpis, isLoading } = useSelector((state) => state.kpi);
  const user = useSelector((state) => state.auth.user);
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
    dispatch(fetchKPIs());
  }, [dispatch]);

  const isManager = user?.role === 'manager';

  const handleSubmit = () => {
    if (!formData.title || !formData.targetValue || !formData.deadline) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (editingKPI) {
      // Update existing KPI
      dispatch(updateKPIProgress({
        id: editingKPI.id,
        currentValue: parseFloat(formData.currentValue)
      }));
    } else {
      // Create new KPI
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
      'Delete KPI',
      'Are you sure you want to delete this KPI?',
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
      case 'approved': return '#28a745';
      case 'pending': return '#ffc107';
      case 'rejected': return '#dc3545';
      default: return '#6c757d';
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

  const filteredKPIs = isManager ? kpis : kpis.filter(kpi => kpi.createdBy === user.id);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Goals & KPIs</Text>
        {!isManager && (
          <Button
            title="+ New Goal"
            onPress={() => setIsModalVisible(true)}
            style={styles.addButton}
          />
        )}
      </View>

      <ScrollView>
        {filteredKPIs.map((kpi) => (
          <View key={kpi.id} style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiTitle}>
                {getCategoryIcon(kpi.category)} {kpi.title}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(kpi.status) }]}>
                <Text style={styles.statusText}>{kpi.status.toUpperCase()}</Text>
              </View>
            </View>

            <Text style={styles.kpiDescription}>{kpi.description}</Text>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${calculateProgress(kpi.currentValue, kpi.targetValue)}%` }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {kpi.currentValue} / {kpi.targetValue} (
                {Math.round(calculateProgress(kpi.currentValue, kpi.targetValue))}%)
              </Text>
            </View>

            <View style={styles.kpiMeta}>
              <Text style={styles.deadline}>
                Deadline: {new Date(kpi.deadline).toLocaleDateString()}
              </Text>
              <Text style={styles.category}>Category: {kpi.category}</Text>
            </View>

            <View style={styles.actionButtons}>
              {!isManager && kpi.status === 'pending' && (
                <Button
                  title="Edit"
                  onPress={() => handleEdit(kpi)}
                  variant="secondary"
                  style={styles.actionButton}
                />
              )}

              {isManager && kpi.status === 'pending' && (
                <>
                  <Button
                    title="Approve"
                    onPress={() => handleApprove(kpi.id)}
                    style={styles.actionButton}
                  />
                  <Button
                    title="Reject"
                    onPress={() => handleDelete(kpi.id)}
                    variant="danger"
                    style={styles.actionButton}
                  />
                </>
              )}

              {kpi.status === 'approved' && (
                <Button
                  title="Update Progress"
                  onPress={() => handleEdit(kpi)}
                  style={styles.actionButton}
                />
              )}
            </View>
          </View>
        ))}

        {filteredKPIs.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No KPIs found</Text>
            <Text style={styles.emptySubtext}>
              {isManager ? 'No team members have set KPIs yet' : 'Create your first goal to get started'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add/Edit KPI Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingKPI ? 'Edit Goal' : 'Create New Goal'}
            </Text>

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
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    width: 100,
  },
  kpiCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  kpiTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  kpiDescription: {
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28a745',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  kpiMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  deadline: {
    fontSize: 12,
    color: '#666',
  },
  category: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#999',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  inputHalf: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
  },
});

export default KPIScreen;