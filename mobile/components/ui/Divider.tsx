import React from 'react';
import { View, ViewProps } from 'react-native';

export interface DividerProps extends ViewProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: 'thin' | 'medium' | 'thick';
  color?: string;
  className?: string;
}

/**
 * Reusable Divider Component
 *
 * @example
 * <Divider orientation="horizontal" thickness="thin" />
 */
export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  thickness = 'thin',
  color,
  className = '',
  ...viewProps
}) => {
  const thicknessStyles = {
    thin: orientation === 'horizontal' ? 'h-[1px]' : 'w-[1px]',
    medium: orientation === 'horizontal' ? 'h-[2px]' : 'w-[2px]',
    thick: orientation === 'horizontal' ? 'h-[4px]' : 'w-[4px]',
  };

  const defaultColor = 'bg-gray-200';

  return (
    <View
      className={`${
        orientation === 'horizontal' ? 'w-full' : 'h-full'
      } ${thicknessStyles[thickness]} ${color ? '' : defaultColor} ${className}`}
      style={color ? { backgroundColor: color } : undefined}
      {...viewProps}
    />
  );
};
