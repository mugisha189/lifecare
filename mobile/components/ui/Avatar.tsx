import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface AvatarProps {
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circle' | 'rounded' | 'square';
  icon?: keyof typeof Ionicons.glyphMap;
  backgroundColor?: string;
  textColor?: string;
  className?: string;
}

/**
 * Reusable Avatar Component - Shows initials from name
 *
 * @example
 * <Avatar name="John Doe" size="lg" variant="circle" />
 * <Avatar name="Jane Smith" size="md" />
 */
export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 'md',
  variant = 'circle',
  icon,
  backgroundColor,
  textColor,
  className = '',
}) => {
  // Size styles
  const sizeStyles = {
    sm: {
      container: 'w-8 h-8',
      text: 'text-[12px]',
      icon: 16,
    },
    md: {
      container: 'w-12 h-12',
      text: 'text-[16px]',
      icon: 24,
    },
    lg: {
      container: 'w-16 h-16',
      text: 'text-[20px]',
      icon: 32,
    },
    xl: {
      container: 'w-24 h-24',
      text: 'text-[28px]',
      icon: 48,
    },
  };

  // Variant styles
  const variantStyles = {
    circle: 'rounded-full',
    rounded: 'rounded-lg',
    square: 'rounded-none',
  };

  const currentSize = sizeStyles[size];

  // Get initials from name
  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  // Use inline styles to ensure colors apply correctly
  // Fallback to primary color (#062F71) if backgroundColor is not provided
  const bgColorStyle = backgroundColor || '#062F71';
  const textColorStyle = textColor || '#FFFFFF';

  // Render initials or icon
  return (
    <View
      className={`${currentSize.container} ${variantStyles[variant]} items-center justify-center ${className}`}
      style={{ backgroundColor: bgColorStyle }}
    >
      {icon ? (
        <Ionicons name={icon} size={currentSize.icon} color={textColorStyle} />
      ) : name ? (
        <Text className={`${currentSize.text} font-poppins-bold`} style={{ color: textColorStyle }}>
          {getInitials(name)}
        </Text>
      ) : (
        <Ionicons name="person" size={currentSize.icon} color={textColorStyle} />
      )}
    </View>
  );
};
