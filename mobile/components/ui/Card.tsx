import React from 'react';
import { View, ViewProps } from 'react-native';

export interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children?: React.ReactNode;
  className?: string;
}

/**
 * Reusable Card Component
 *
 * @example
 * <Card variant="elevated" padding="md" rounded="xl">
 *   <Text>Card Content</Text>
 * </Card>
 */
export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  padding = 'md',
  rounded = 'xl',
  children,
  className = '',
  ...viewProps
}) => {
  // Padding styles
  const paddingStyles = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };

  // Rounded styles
  const roundedStyles = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  // Variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return 'bg-white shadow-lg shadow-gray-200/50';
      case 'outlined':
        return 'bg-white border border-gray-200';
      case 'filled':
        return 'bg-gray-50';
      default:
        return 'bg-white';
    }
  };

  return (
    <View
      className={`${getVariantStyles()} ${paddingStyles[padding]} ${
        roundedStyles[rounded]
      } ${className}`}
      {...viewProps}
    >
      {children}
    </View>
  );
};
