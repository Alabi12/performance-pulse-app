// src/components/ui/Button.js
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '../../constants/AppColors';

const Button = ({ title, onPress, variant = 'primary', isLoading = false, ...props }) => {
  const COLORS = useTheme(); // Assume this hook provides your app's color scheme

  const getBgColor = () => {
    switch (variant) {
      case 'primary': return COLORS.primary;
      case 'secondary': return COLORS.secondary;
      case 'danger': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading}
      style={{
        backgroundColor: getBgColor(),
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isLoading ? 0.6 : 1,
        ...props.style,
      }}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={{ color: 'white', fontWeight: 'bold' }}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;