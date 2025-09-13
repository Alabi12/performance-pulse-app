// src/features/auth/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { setCredentials, setLoading } from '../../../store/slices/authSlice';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { authApi } from '../../../services/authApi';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('admin@example.com'); // Pre-filled for testing
  const [password, setPassword] = useState('password123'); // Pre-filled for testing
  const [error, setError] = useState('');
  const dispatch = useDispatch();

  const handleLogin = async () => {
    setError('');
    dispatch(setLoading(true));
    
    try {
      const response = await authApi.login({ email, password });
      dispatch(setCredentials({ user: response.user, token: response.token }));
    } catch (error) {
      setError(error.message);
      alert('Login failed: ' + error.message);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        Performance Pulse
      </Text>
      
      <Input 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <Input 
        placeholder="Password" 
        value={password} 
        onChangeText={setPassword}
        secureTextEntry
      />
      
      {error ? (
        <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>
          {error}
        </Text>
      ) : null}
      
      <Button 
        title="Login" 
        onPress={handleLogin}
        isLoading={false} // You can connect this to Redux loading state if needed
      />
      
      <TouchableOpacity 
        onPress={() => navigation.navigate('SignUp')}
        style={{ marginTop: 15 }}
      >
        <Text style={{ textAlign: 'center', color: '#2E86DE' }}>
          Don't have an account? Sign Up
        </Text>
      </TouchableOpacity>

      {/* Test credentials hint */}
      <View style={{ marginTop: 30, padding: 15, backgroundColor: '#f0f0f0', borderRadius: 8 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Test Credentials:</Text>
        <Text>Email: admin@example.com</Text>
        <Text>Password: password123</Text>
      </View>
    </ScrollView>
  );
};

export default LoginScreen;