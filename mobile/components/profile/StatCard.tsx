import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  iconColor = '#4F46E5',
}) => {
  return (
    <View className="mx-1 flex-1 items-center rounded-lg border border-gray-200 bg-white p-3">
      <View
        className="mb-2 h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: `${iconColor}15` }}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text className="mb-0.5 font-['Poppins-Bold'] text-base text-gray-900">{value}</Text>
      <Text className="text-center font-['Poppins-Regular'] text-[10px] text-gray-600">
        {label}
      </Text>
    </View>
  );
};
