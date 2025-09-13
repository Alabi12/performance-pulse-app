// src/features/auth/screens/SignUpScreen.js
import React from 'react';
import { View, Text, Button } from 'react-native';

const SignUpScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Sign Up Screen</Text>
      <Button
        title="Back to Login"
        onPress={() => navigation.goBack()}
      />
    </View>
  );
};

export default SignUpScreen;