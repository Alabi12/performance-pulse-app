// src/features/auth/screens/SignUpScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StyleSheet 
} from 'react-native';
import { useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { signUp } from '../../../store/slices/authSlice';
import { authApi } from '../../../services/authApi';

const { width, height } = Dimensions.get('window');

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

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await authApi.signUp({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        employeeId: formData.employeeId.trim(),
        department: formData.department.trim(),
        position: formData.position.trim(),
        role: 'employee' // Default role for signups
      });

      dispatch(signUp(result));
      Alert.alert('Success', 'Account created successfully! Please login.');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Signup Failed', error.response?.data?.message || error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = (field) => {
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Ionicons name="person-add" size={32} color="#fff" />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Performance Pulse</Text>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Personal Information</Text>
            <Text style={styles.formSubtitle}>Fill in your details to get started</Text>
          </View>

          <Input
            label="Full Name *"
            value={formData.name}
            onChangeText={(text) => {
              setFormData({ ...formData, name: text });
              clearError('name');
            }}
            placeholder="Enter your full name"
            error={errors.name}
            leftIcon="person-outline"
            containerStyle={styles.input}
          />

          <Input
            label="Email Address *"
            value={formData.email}
            onChangeText={(text) => {
              setFormData({ ...formData, email: text });
              clearError('email');
            }}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            leftIcon="mail-outline"
            containerStyle={styles.input}
          />

          <Input
            label="Employee ID *"
            value={formData.employeeId}
            onChangeText={(text) => {
              setFormData({ ...formData, employeeId: text });
              clearError('employeeId');
            }}
            placeholder="Enter your employee ID"
            error={errors.employeeId}
            leftIcon="id-card-outline"
            containerStyle={styles.input}
          />

          <View style={styles.row}>
            <View style={[styles.input, styles.halfInput]}>
              <Input
                label="Department"
                value={formData.department}
                onChangeText={(text) => setFormData({ ...formData, department: text })}
                placeholder="Department"
                leftIcon="business-outline"
              />
            </View>
            <View style={[styles.input, styles.halfInput]}>
              <Input
                label="Position"
                value={formData.position}
                onChangeText={(text) => setFormData({ ...formData, position: text })}
                placeholder="Position"
                leftIcon="briefcase-outline"
              />
            </View>
          </View>

          <View style={styles.passwordSection}>
            <Text style={styles.sectionTitle}>Security</Text>
            
            <Input
              label="Password *"
              value={formData.password}
              onChangeText={(text) => {
                setFormData({ ...formData, password: text });
                clearError('password');
              }}
              placeholder="Create a strong password"
              secureTextEntry
              error={errors.password}
              leftIcon="lock-closed-outline"
              containerStyle={styles.input}
            />

            <Input
              label="Confirm Password *"
              value={formData.confirmPassword}
              onChangeText={(text) => {
                setFormData({ ...formData, confirmPassword: text });
                clearError('confirmPassword');
              }}
              placeholder="Confirm your password"
              secureTextEntry
              error={errors.confirmPassword}
              leftIcon="checkmark-circle-outline"
              containerStyle={styles.input}
            />

            <View style={styles.passwordRequirements}>
              <Text style={styles.requirementsTitle}>Password Requirements:</Text>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={formData.password.length >= 6 ? "checkmark-circle" : "ellipse"} 
                  size={14} 
                  color={formData.password.length >= 6 ? '#10B981' : '#9CA3AF'} 
                />
                <Text style={styles.requirementText}>At least 6 characters</Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={formData.password === formData.confirmPassword && formData.password ? "checkmark-circle" : "ellipse"} 
                  size={14} 
                  color={formData.password === formData.confirmPassword && formData.password ? '#10B981' : '#9CA3AF'} 
                />
                <Text style={styles.requirementText}>Passwords match</Text>
              </View>
            </View>
          </View>

          <Button
            title={isLoading ? "Creating Account..." : "Create Account"}
            onPress={handleSignUp}
            isLoading={isLoading}
            variant="primary"
            size="large"
            style={styles.signUpButton}
            icon={isLoading ? null : "person-add"}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy Notice */}
        <View style={styles.privacyContainer}>
          <Text style={styles.privacyText}>
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: height * 0.3,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 20,
  },
  formHeader: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  passwordSection: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  passwordRequirements: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  requirementText: {
    fontSize: 12,
    color: '#6B7280',
  },
  signUpButton: {
    marginTop: 24,
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  signInText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 14,
  },
  privacyContainer: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  privacyText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default SignUpScreen;