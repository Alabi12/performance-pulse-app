// src/features/auth/screens/LoginScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StyleSheet 
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../../components/ui/Input';
import { login } from '../../../store/slices/authSlice';

const { width, height } = Dimensions.get('window');

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

  const handleQuickLogin = (type) => {
    const testAccounts = {
      employee: { email: 'employee@example.com', password: 'password123' },
      manager: { email: 'admin@example.com', password: 'password123' }
    };
    
    setCredentials(testAccounts[type]);
    Alert.alert('Credentials Filled', `${type.charAt(0).toUpperCase() + type.slice(1)} credentials loaded!`);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
          <View style={styles.logoContainer}>
            <Ionicons name="trending-up" size={32} color="#fff" />
          </View>
          <Text style={styles.title}>Performance Pulse</Text>
          <Text style={styles.subtitle}>Track your performance and achieve your goals</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Welcome Back</Text>
            <Text style={styles.formSubtitle}>Sign in to continue your journey</Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Input
            label="Email Address"
            value={credentials.email}
            onChangeText={(text) => setCredentials({ ...credentials, email: text })}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
            containerStyle={styles.input}
          />

          <Input
            label="Password"
            value={credentials.password}
            onChangeText={(text) => setCredentials({ ...credentials, password: text })}
            placeholder="Enter your password"
            secureTextEntry
            leftIcon="lock-closed-outline"
            containerStyle={styles.input}
          />

          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={() => Alert.alert('Password Reset', 'Please contact HR to reset your password')}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.loginButtonText}>Sign In</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          {/* Quick Login Buttons */}
          <View style={styles.quickLoginContainer}>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Quick Login</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.quickLoginButtons}>
              <TouchableOpacity 
                style={[styles.quickLoginButton, styles.employeeButton]}
                onPress={() => handleQuickLogin('employee')}
              >
                <Ionicons name="person-outline" size={16} color="#3B82F6" />
                <Text style={styles.quickLoginText}>Employee</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.quickLoginButton, styles.managerButton]}
                onPress={() => handleQuickLogin('manager')}
              >
                <Ionicons name="briefcase-outline" size={16} color="#10B981" />
                <Text style={styles.quickLoginText}>Manager</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Test Accounts Info */}
        <View style={styles.testAccountsContainer}>
          <Text style={styles.testAccountsTitle}>Test Credentials</Text>
          <View style={styles.testAccountItem}>
            <Ionicons name="person-outline" size={14} color="#3B82F6" />
            <Text style={styles.testAccountText}>Employee: employee@example.com / password123</Text>
          </View>
          <View style={styles.testAccountItem}>
            <Ionicons name="briefcase-outline" size={14} color="#10B981" />
            <Text style={styles.testAccountText}>Manager: admin@example.com / password123</Text>
          </View>
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
    height: height * 0.4,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
    marginBottom: 24,
  },
  formHeader: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#EF4444',
    marginLeft: 8,
    fontWeight: '500',
    flex: 1,
  },
  input: {
    marginBottom: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#3B82F6',
    fontWeight: '500',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
  quickLoginContainer: {
    marginBottom: 8,
  },
  quickLoginButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  quickLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    gap: 8,
  },
  employeeButton: {
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
  },
  managerButton: {
    borderColor: '#A7F3D0',
    backgroundColor: '#ECFDF5',
  },
  quickLoginText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  signUpText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 14,
  },
  testAccountsContainer: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  testAccountsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  testAccountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  testAccountText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
});

export default LoginScreen;