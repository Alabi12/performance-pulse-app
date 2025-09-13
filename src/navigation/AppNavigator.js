// src/navigation/AppNavigator.js
import React from 'react';
import { useSelector } from 'react-redux';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const AppNavigator = () => {
  // Get the user from Redux store
  const user = useSelector((state) => state.auth.user);
  
  // For testing: uncomment one of these lines to force a state
  // const user = null; // Show login screen
  // const user = {};   // Show main app

  console.log('Current user:', user); // Debug log

  return user ? <MainNavigator /> : <AuthNavigator />;
};

export default AppNavigator;