import React, { useState, forwardRef } from 'react';
import { View, TextInput, Text as RNText, TouchableOpacity, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
  variant?: 'outlined' | 'filled' | 'underlined';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  showPasswordToggle?: boolean;
}

/**
 * Reusable Input Component
 *
 * @example
 * <Input
 *   label="Email"
 *   placeholder="Enter your email"
 *   value={email}
 *   onChangeText={setEmail}
 *   leftIcon="mail-outline"
 *   error={emailError}
 * />
 */
export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconPress,
      containerClassName = '',
      inputClassName = '',
      labelClassName = '',
      variant = 'outlined',
      size = 'md',
      disabled = false,
      showPasswordToggle = false,
      secureTextEntry,
      ...textInputProps
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // Determine if this is a password field
    const isPassword = secureTextEntry || showPasswordToggle;
    const actuallySecure = isPassword && !isPasswordVisible;

    // Size styles
    const sizeStyles = {
      sm: 'py-2 text-[13px]',
      md: 'py-4 text-[15px]',
      lg: 'py-5 text-[17px]',
    };

    // Variant styles
    const getVariantStyles = () => {
      const baseStyles = 'rounded-xl px-4';

      if (disabled) {
        return `${baseStyles} bg-gray-100 border border-gray-200`;
      }

      switch (variant) {
        case 'outlined':
          return `${baseStyles} bg-white border ${
            error ? 'border-red-400' : isFocused ? 'border-primary' : 'border-gray-300'
          }`;
        case 'filled':
          return `${baseStyles} bg-gray-50 border ${
            error ? 'border-red-400' : isFocused ? 'border-primary' : 'border-gray-200'
          }`;
        case 'underlined':
          return (
            'rounded-none border-b-2 px-1 bg-transparent ' +
            (error ? 'border-red-400' : isFocused ? 'border-primary' : 'border-gray-300')
          );
        default:
          return baseStyles;
      }
    };

    return (
      <View className={`mb-4 ${containerClassName}`}>
        {/* Label */}
        {label && (
          <RNText
            className={`mb-2 font-poppins-medium text-[13px] text-gray-700 ${labelClassName}`}
          >
            {label}
          </RNText>
        )}

        {/* Input Container */}
        <View className={`flex-row items-center ${getVariantStyles()}`}>
          {/* Left Icon */}
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={20}
              color={error ? '#F87171' : isFocused ? '#16A34A' : '#9CA3AF'}
              style={{ marginRight: 12 }}
            />
          )}

          {/* Text Input */}
          <TextInput
            ref={ref}
            className={`flex-1 font-poppins-regular ${sizeStyles[size]} ${
              disabled ? 'text-gray-400' : 'text-gray-900'
            } ${inputClassName}`}
            placeholderTextColor="#9CA3AF"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            secureTextEntry={actuallySecure}
            editable={!disabled}
            {...textInputProps}
          />

          {/* Password Toggle or Right Icon */}
          {isPassword && showPasswordToggle ? (
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              className="ml-2"
              activeOpacity={0.7}
            >
              <Ionicons
                name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          ) : rightIcon ? (
            <TouchableOpacity
              onPress={onRightIconPress}
              className="ml-2"
              activeOpacity={0.7}
              disabled={!onRightIconPress}
            >
              <Ionicons name={rightIcon} size={20} color={error ? '#F87171' : '#6B7280'} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Error Message */}
        {error && (
          <View className="mt-1 flex-row items-center">
            <Ionicons name="alert-circle" size={14} color="#EF4444" />
            <RNText className="ml-1 font-poppins-regular text-[12px] text-red-500">{error}</RNText>
          </View>
        )}

        {/* Hint Message */}
        {hint && !error && (
          <RNText className="mt-1 font-poppins-regular text-[12px] text-gray-500">{hint}</RNText>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
