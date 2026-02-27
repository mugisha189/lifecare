import React from 'react';
import { View, Text, ViewProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface BadgeProps extends ViewProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  icon?: keyof typeof Ionicons.glyphMap;
  rounded?: boolean;
  className?: string;
}

/**
 * Reusable Badge Component
 *
 * @example
 * <Badge label="New" variant="success" size="sm" icon="checkmark-circle" />
 */
export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  rounded = false,
  className = '',
  ...viewProps
}) => {
  // Size styles
  const sizeStyles = {
    sm: {
      container: 'px-2 py-1',
      text: 'text-[10px]',
      icon: 12,
    },
    md: {
      container: 'px-3 py-1',
      text: 'text-[12px]',
      icon: 14,
    },
    lg: {
      container: 'px-4 py-2',
      text: 'text-[14px]',
      icon: 16,
    },
  };

  // Variant styles
  const variantStyles = {
    primary: {
      bg: 'bg-primary/10',
      text: 'text-primary',
      icon: '#16A34A',
    },
    secondary: {
      bg: 'bg-gray-200',
      text: 'text-gray-700',
      icon: '#374151',
    },
    success: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      icon: '#15803D',
    },
    warning: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      icon: '#A16207',
    },
    danger: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      icon: '#B91C1C',
    },
    info: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      icon: '#1D4ED8',
    },
  };

  const currentSize = sizeStyles[size];
  const currentVariant = variantStyles[variant];

  return (
    <View
      className={`${currentVariant.bg} ${currentSize.container} ${
        rounded ? 'rounded-full' : 'rounded-md'
      } flex-row items-center ${className}`}
      {...viewProps}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={currentSize.icon}
          color={currentVariant.icon}
          style={{ marginRight: 4 }}
        />
      )}
      <Text className={`${currentSize.text} ${currentVariant.text} font-poppins-semibold`}>
        {label}
      </Text>
    </View>
  );
};
