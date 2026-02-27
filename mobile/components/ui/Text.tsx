import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

export interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'muted' | 'error' | 'success' | 'warning';
  align?: 'left' | 'center' | 'right';
  children?: React.ReactNode;
  className?: string;
}

/**
 * Reusable Text Component
 *
 * @example
 * <Text variant="h1" weight="bold" color="primary">
 *   Welcome Back
 * </Text>
 */
export const Text: React.FC<TextProps> = ({
  variant = 'body',
  weight = 'regular',
  color,
  align = 'left',
  children,
  className = '',
  ...textProps
}) => {
  // Variant styles
  const variantStyles = {
    h1: 'text-[32px]',
    h2: 'text-[24px]',
    h3: 'text-[20px]',
    h4: 'text-[18px]',
    body: 'text-[15px]',
    caption: 'text-[13px]',
    label: 'text-[12px]',
  };

  // Weight styles
  const weightStyles = {
    regular: 'font-poppins-regular',
    medium: 'font-poppins-medium',
    semibold: 'font-poppins-semibold',
    bold: 'font-poppins-bold',
  };

  // Color styles
  const colorStyles = {
    primary: 'text-primary',
    secondary: 'text-gray-700',
    muted: 'text-gray-500',
    error: 'text-red-500',
    success: 'text-green-600',
    warning: 'text-yellow-600',
  };

  // Align styles
  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <RNText
      className={`${variantStyles[variant]} ${weightStyles[weight]} ${
        color ? colorStyles[color] : 'text-gray-900'
      } ${alignStyles[align]} ${className}`}
      {...textProps}
    >
      {children}
    </RNText>
  );
};
