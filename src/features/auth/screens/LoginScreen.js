// src/features/auth/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Input from '../../../components/ui/Input';
import { login } from '../../../store/slices/authSlice';

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [credentials, setCredentials] = useState({
    email: 'employee@example.com',
    password: 'password123'
  });

  const handleLogin = async () => {
    if (!credentials.email || !credentials.password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    console.log('Dispatching login action...');
    dispatch(login(credentials));
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' }}>
      <View style={{ alignItems: 'center', marginBottom: 40 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#2E86DE' }}>
          Performance Pulse
        </Text>
        <Text style={{ color: '#666', marginTop: 5 }}>
          Track your performance and achieve your goals
        </Text>
      </View>

      <View style={{ backgroundColor: 'white', padding: 25, borderRadius: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
        <Text style={{ fontSize: 22, fontWeight: '600', marginBottom: 25, textAlign: 'center', color: '#333' }}>
          Welcome Back
        </Text>

        {error && (
          <Text style={{ color: 'red', textAlign: 'center', marginBottom: 15, backgroundColor: '#ffe6e6', padding: 10, borderRadius: 5 }}>
            Error: {error}
          </Text>
        )}

        <Input
          label="Email Address"
          value={credentials.email}
          onChangeText={(text) => setCredentials({ ...credentials, email: text })}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Password"
          value={credentials.password}
          onChangeText={(text) => setCredentials({ ...credentials, password: text })}
          placeholder="Enter your password"
          secureTextEntry
        />

        <TouchableOpacity
          onPress={handleLogin}
          disabled={isLoading}
          style={{
            backgroundColor: '#2E86DE',
            padding: 15,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 20,
            marginBottom: 15,
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Alert.alert('Info', 'Please contact HR to reset your password')}>
          <Text style={{ color: '#2E86DE', textAlign: 'center' }}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 30 }}>
        <Text style={{ color: '#666' }}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={{ color: '#2E86DE', fontWeight: '500' }}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      {/* Test Accounts */}
      <View style={{ marginTop: 40, padding: 15, backgroundColor: '#e8f4ff', borderRadius: 10 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 10, color: '#2E86DE' }}>Test Accounts:</Text>
        <Text style={{ fontSize: 12, color: '#666', marginBottom: 3 }}>👨‍💼 Employee: employee@example.com / password123</Text>
        <Text style={{ fontSize: 12, color: '#666' }}>👨‍💼 Manager: admin@example.com / password123</Text>
      </View>
    </ScrollView>
  );
};

export default LoginScreen;