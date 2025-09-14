// src/components/ui/LogoutButton.js
import React from 'react';
import { TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { logoutUser } from '../../store/slices/authSlice';

const LogoutButton = () => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => console.log('Logout cancelled')
        },
        { 
          text: 'Logout', 
          onPress: () => {
            console.log('Logging out...');
            dispatch(logoutUser());
          },
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <TouchableOpacity 
      onPress={handleLogout} 
      style={styles.button}
      activeOpacity={0.7}
    >
      <Ionicons name="log-out-outline" size={20} color="#EF4444" />
      <Text style={styles.text}>Logout</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  text: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default LogoutButton;