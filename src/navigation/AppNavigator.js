// src/navigation/AppNavigator.js
import React from 'react';
import { View, Text } from 'react-native'; // Add these imports
import { useSelector } from 'react-redux';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const AppNavigator = () => {
  const user = useSelector((state) => state.auth.user);
  const isLoading = useSelector((state) => state.auth.isLoading);
  
  console.log('Auth State - User:', user);
  console.log('Auth State - Loading:', isLoading);
  
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }
  
  return user ? <MainNavigator /> : <AuthNavigator />;
};

export default AppNavigator;