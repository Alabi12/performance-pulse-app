// src/navigation/AppNavigator.js
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { createStackNavigator } from '@react-navigation/stack';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const Stack = createStackNavigator();

// Android-specific navigation configuration
const androidScreenOptions = {
  headerShown: false,
  gestureEnabled: true,
  gestureDirection: 'horizontal',
  cardStyle: {
    backgroundColor: 'white',
  },
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 300,
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 300,
      },
    },
  },
};

const AppNavigator = () => {
  const user = useSelector((state) => state.auth.user);
  const isLoading = useSelector((state) => state.auth.isLoading);
  const token = useSelector((state) => state.auth.token);
  
  console.log('Auth State - User:', user ? 'Logged In' : 'Not Logged In');
  console.log('Auth State - Token:', token ? 'Present' : 'Not Present');
  console.log('Auth State - Loading:', isLoading);
  
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#F8FAFC'
      }}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={{ marginTop: 16, color: '#6B7280' }}>Loading...</Text>
      </View>
    );
  }
  
  return (
    <Stack.Navigator 
      screenOptions={androidScreenOptions}
      initialRouteName={user ? "Main" : "Auth"}
    >
      <Stack.Screen 
        name="Auth" 
        component={AuthNavigator}
        options={{
          animationTypeForReplace: user ? 'pop' : 'push',
        }}
      />
      <Stack.Screen 
        name="Main" 
        component={MainNavigator}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;