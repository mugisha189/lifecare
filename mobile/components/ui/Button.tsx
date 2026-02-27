import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface ButtonProps extends TouchableOpacityProps {
  title?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
  className?: string;
  textClassName?: string;
}

/**
 * Reusable Button Component
 *
 * @example
 * <Button
 *   title="Login"
 *   variant="primary"
 *   size="lg"
 *   onPress={handleLogin}
 *   loading={isLoading}
 *   leftIcon="log-in-outline"
 * />
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  textClassName = '',
  ...touchableProps
}) => {
  const isDisabled = disabled || loading;

  // Size styles
  const sizeStyles = {
    sm: {
      container: 'py-1 px-4',
      text: 'text-[12px]',
      icon: 16,
    },
    md: {
      container: 'py-2 px-6',
      text: 'text-[14px]',
      icon: 20,
    },
    lg: {
      container: 'py-3 px-8',
      text: 'text-[16px]',
      icon: 24,
    },
  };

  // Variant styles
  const getVariantStyles = () => {
    const baseStyles = 'rounded-xl items-center justify-center';

    if (isDisabled) {
      return {
        container: `${baseStyles} bg-gray-300`,
        text: 'text-gray-500',
        icon: '#9CA3AF',
      };
    }

    switch (variant) {
      case 'primary':
        return {
          container: `${baseStyles} bg-primary`,
          text: 'text-white',
          icon: '#FFFFFF',
        };
      case 'secondary':
        return {
          container: `${baseStyles} bg-gray-700`,
          text: 'text-white',
          icon: '#FFFFFF',
        };
      case 'outline':
        return {
          container: `${baseStyles} bg-transparent border-2 border-primary`,
          text: 'text-primary',
          icon: '#16A34A',
        };
      case 'ghost':
        return {
          container: `${baseStyles} bg-transparent`,
          text: 'text-primary',
          icon: '#16A34A',
        };
      case 'danger':
        return {
          container: `${baseStyles} bg-red-500`,
          text: 'text-white',
          icon: '#FFFFFF',
        };
      case 'success':
        return {
          container: `${baseStyles} bg-green-600`,
          text: 'text-white',
          icon: '#FFFFFF',
        };
      default:
        return {
          container: baseStyles,
          text: 'text-white',
          icon: '#FFFFFF',
        };
    }
  };

  const styles = getVariantStyles();
  const currentSize = sizeStyles[size];

  return (
    <TouchableOpacity
      className={`${styles.container} ${currentSize.container} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={isDisabled}
      activeOpacity={0.85}
      {...touchableProps}
    >
      <View className="flex-row items-center justify-center">
        {/* Left Icon */}
        {leftIcon && !loading && (
          <Ionicons
            name={leftIcon}
            size={currentSize.icon}
            color={styles.icon}
            style={{ marginRight: 8 }}
          />
        )}

        {/* Loading Indicator */}
        {loading && (
          <ActivityIndicator
            color={styles.icon}
            size="small"
            style={{ marginRight: title || children ? 8 : 0 }}
          />
        )}

        {/* Text/Children */}
        {title ? (
          <Text className={`font-poppins-bold ${currentSize.text} ${styles.text} ${textClassName}`}>
            {title}
          </Text>
        ) : (
          children
        )}

        {/* Right Icon */}
        {rightIcon && !loading && (
          <Ionicons
            name={rightIcon}
            size={currentSize.icon}
            color={styles.icon}
            style={{ marginLeft: 8 }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};
