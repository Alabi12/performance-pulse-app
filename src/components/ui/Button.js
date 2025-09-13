// src/components/ui/Button.js
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants/AppColors';

const Button = ({ title, onPress, variant = 'primary', isLoading = false, disabled = false, style, ...props }) => {
  const getBgColor = () => {
    if (disabled) return '#cccccc';
    
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
      disabled={disabled || isLoading}
      style={{
        backgroundColor: getBgColor(),
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: (disabled || isLoading) ? 0.6 : 1,
        ...style,
      }}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;