import React, { useEffect, useRef } from 'react';
import { View, Animated, ViewStyle } from 'react-native';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  className?: string;
  style?: ViewStyle;
  animation?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  variant = 'rectangular',
  className = '',
  style,
  animation = true,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animation) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();

    return () => {
      pulse.stop();
    };
  }, [animation, animatedValue]);

  const opacity = animation
    ? animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
      })
    : 0.3;

  // Variant styles
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const containerStyle: ViewStyle = {
    width: width as number | `${number}%`,
    height: height as number | `${number}%`,
    backgroundColor: '#E5E7EB', // Gray-200
  };

  return (
    <Animated.View
      className={`${variantStyles[variant]} ${className}`}
      style={[containerStyle, { opacity }, style]}
    />
  );
};

/**
 * Pre-configured skeleton variants for common use cases
 */
export const SkeletonText: React.FC<Omit<SkeletonProps, 'variant'>> = props => (
  <Skeleton variant="text" {...props} />
);

export const SkeletonCircle: React.FC<Omit<SkeletonProps, 'variant'>> = props => (
  <Skeleton variant="circular" {...props} />
);

export const SkeletonRectangle: React.FC<Omit<SkeletonProps, 'variant'>> = props => (
  <Skeleton variant="rectangular" {...props} />
);

export const SkeletonRounded: React.FC<Omit<SkeletonProps, 'variant'>> = props => (
  <Skeleton variant="rounded" {...props} />
);
