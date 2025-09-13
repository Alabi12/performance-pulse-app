// src/components/LogoutButton.js
import React from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';

const LogoutButton = () => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => dispatch(logoutUser()) }
      ]
    );
  };

  return (
    <TouchableOpacity onPress={handleLogout} style={{ padding: 10 }}>
      <Text style={{ color: '#dc3545', fontWeight: '500' }}>Logout</Text>
    </TouchableOpacity>
  );
};

export default LogoutButton;