// src/features/auth/screens/SignUpScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { signUp } from '../../../store/slices/authSlice';
import { authApi } from '../../../services/authApi';

const SignUpScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    employeeId: '',
    department: '',
    position: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.employeeId) newErrors.employeeId = 'Employee ID is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await authApi.signUp({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        employeeId: formData.employeeId,
        department: formData.department,
        position: formData.position,
        role: 'employee' // Default role for signups
      });

      dispatch(signUp(result));
      Alert.alert('Success', 'Account created successfully! Please login.');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, backgroundColor: '#f5f5f5' }}>
      <View style={{ alignItems: 'center', marginBottom: 30 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}>
          Create Account
        </Text>
        <Text style={{ color: '#666', marginTop: 5 }}>
          Join Performance Pulse
        </Text>
      </View>

      <Input
        label="Full Name *"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
        placeholder="Enter your full name"
        error={errors.name}
      />

      <Input
        label="Email Address *"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />

      <Input
        label="Employee ID *"
        value={formData.employeeId}
        onChangeText={(text) => setFormData({ ...formData, employeeId: text })}
        placeholder="Enter your employee ID"
        error={errors.employeeId}
      />

      <Input
        label="Department"
        value={formData.department}
        onChangeText={(text) => setFormData({ ...formData, department: text })}
        placeholder="Enter your department"
      />

      <Input
        label="Position"
        value={formData.position}
        onChangeText={(text) => setFormData({ ...formData, position: text })}
        placeholder="Enter your position"
      />

      <Input
        label="Password *"
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        placeholder="Create a password"
        secureTextEntry
        error={errors.password}
      />

      <Input
        label="Confirm Password *"
        value={formData.confirmPassword}
        onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
        placeholder="Confirm your password"
        secureTextEntry
        error={errors.confirmPassword}
      />

      <Button
        title="Create Account"
        onPress={handleSignUp}
        isLoading={isLoading}
        style={{ marginTop: 10 }}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
        <Text style={{ color: '#666' }}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={{ color: '#2E86DE', fontWeight: '500' }}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default SignUpScreen;