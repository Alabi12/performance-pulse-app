// src/components/ui/Input.js
import React from 'react';
import { TextInput, View, Text } from 'react-native';

const Input = ({ label, error, ...props }) => {
  return (
    <View style={{ marginBottom: 15 }}>
      {label && <Text style={{ marginBottom: 5, fontWeight: '500' }}>{label}</Text>}
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: error ? 'red' : '#ddd',
          borderRadius: 8,
          padding: 12,
          fontSize: 16,
        }}
        placeholderTextColor="#999"
        {...props}
      />
      {error && <Text style={{ color: 'red', fontSize: 12, marginTop: 3 }}>{error}</Text>}
    </View>
  );
};

export default Input;