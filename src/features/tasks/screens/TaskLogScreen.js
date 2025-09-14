// src/features/tasks/screens/TaskLogScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  StatusBar,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { addTask, updateTask, deleteTask } from '../../../store/slices/taskSlice';

const TaskLogScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector((state) => state.auth.user);
  const tasks = useSelector((state) => state.task.tasks);
  const [newTask, setNewTask] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editText, setEditText] = useState('');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const handleAddTask = () => {
    if (!newTask.trim()) {
      Alert.alert('Error', 'Please enter a task description');
      return;
    }

    setIsAdding(true);
    const task = {
      id: Date.now(),
      description: newTask.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      createdByName: user.name
    };

    dispatch(addTask(task));
    setNewTask('');
    setIsAdding(false);
  };

  const handleToggleComplete = (taskId) => {
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (taskToUpdate) {
      const updatedTask = {
        ...taskToUpdate,
        completed: !taskToUpdate.completed
      };
      dispatch(updateTask(updatedTask));
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setEditText(task.description);
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editText.trim()) {
      Alert.alert('Error', 'Task description cannot be empty');
      return;
    }

    const updatedTask = {
      ...editingTask,
      description: editText.trim()
    };

    dispatch(updateTask(updatedTask));
    setIsEditModalVisible(false);
    setEditingTask(null);
    setEditText('');
  };

  const handleDeleteTask = (taskId) => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => {
            dispatch(deleteTask(taskId));
          },
          style: "destructive"
        }
      ]
    );
  };

  const userTasks = tasks.filter(task => task.createdBy === user.id);

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>Daily Tasks</Text>
              <Text style={styles.subtitle}>Log your daily activities</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Add Task Input */}
          <View style={styles.inputCard}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="What did you work on today?"
                placeholderTextColor="#9CA3AF"
                value={newTask}
                onChangeText={setNewTask}
                onSubmitEditing={handleAddTask}
              />
              <TouchableOpacity 
                style={[styles.addButton, isAdding && styles.addButtonDisabled]}
                onPress={handleAddTask}
                disabled={isAdding}
              >
                <Ionicons 
                  name={isAdding ? "time-outline" : "add"} 
                  size={24} 
                  color="white" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Tasks List */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="list" size={22} color="#6366F1" />
                <Text style={styles.sectionTitle}>Today's Tasks</Text>
              </View>
              <Text style={styles.taskCount}>{userTasks.length} tasks</Text>
            </View>

            {userTasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle-outline" size={64} color="#D1D5DB" />
                <Text style={styles.emptyText}>No tasks logged yet</Text>
                <Text style={styles.emptySubtext}>Add your first task to get started</Text>
              </View>
            ) : (
              userTasks.map((task) => (
                <View 
                  key={task.id} 
                  style={styles.taskItem}
                >
                  <TouchableOpacity 
                    style={styles.completeButton}
                    onPress={() => handleToggleComplete(task.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={task.completed ? "checkmark-circle" : "ellipse-outline"} 
                      size={24} 
                      color={task.completed ? "#10B981" : "#9CA3AF"} 
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.taskContent}
                    onPress={() => handleEditTask(task)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.taskDescription,
                      task.completed && styles.completedTask
                    ]}>
                      {task.description}
                    </Text>
                    <Text style={styles.taskTime}>
                      {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteTask(task.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={['#56ccf2', '#2f80ed']}
            style={[styles.statCard, styles.statCardLeft]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.stat}>
              <Ionicons name="list-circle" size={20} color="white" style={styles.statIcon} />
              <Text style={styles.statNumber}>{userTasks.length}</Text>
              <Text style={styles.statLabel}>Total Tasks</Text>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={['#10B981', '#059669']}
            style={[styles.statCard, styles.statCardRight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.stat}>
              <Ionicons name="checkmark-circle" size={20} color="white" style={styles.statIcon} />
              <Text style={styles.statNumber}>
                {userTasks.filter(t => t.completed).length}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>

      {/* Edit Task Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsEditModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit Task</Text>
                <TextInput
                  style={styles.editInput}
                  value={editText}
                  onChangeText={setEditText}
                  autoFocus={true}
                  multiline={true}
                  numberOfLines={3}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setIsEditModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={handleSaveEdit}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 24,
  },
  inputCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: Platform.OS === 'ios' ? 16 : 14,
    borderRadius: 14,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addButton: {
    backgroundColor: '#6366F1',
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonDisabled: {
    backgroundColor: '#9CA3AF',
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
    minHeight: 200,
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
  taskCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  taskContent: {
    flex: 1,
    marginHorizontal: 12,
  },
  taskDescription: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 6,
    fontWeight: '500',
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  taskTime: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  completeButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
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
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statCardLeft: {
    borderLeftWidth: 4,
    borderLeftColor: '#56ccf2',
  },
  statCardRight: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  stat: {
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  editInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: '#6366F1',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default TaskLogScreen;