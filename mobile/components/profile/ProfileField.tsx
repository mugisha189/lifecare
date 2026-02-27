import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SkeletonCircle, SkeletonText } from '../ui/Skeleton';

interface ProfileFieldProps {
  label: string;
  value: string | null | undefined;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  editable?: boolean;
  isLoading?: boolean;
}

export const ProfileField: React.FC<ProfileFieldProps> = ({
  label,
  value,
  icon,
  onPress,
  editable = true,
  isLoading = false,
}) => {
  const displayValue = value || 'Not set';
  const isSet = !!value;

  if (isLoading) {
    return (
      <View className="flex-row items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
        <View className="flex-1 flex-row items-center">
          {icon && (
            <View className="mr-3">
              <SkeletonCircle width={40} height={40} />
            </View>
          )}
          <View className="flex-1">
            <SkeletonText width={80} height={12} className="mb-1" />
            <SkeletonText width={120} height={16} />
          </View>
        </View>
        {editable && onPress && <SkeletonText width={20} height={20} />}
      </View>
    );
  }

  const content = (
    <View className="flex-row items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
      <View className="flex-1 flex-row items-center">
        {icon && (
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <Ionicons name={icon} size={20} color="#6B7280" />
          </View>
        )}
        <View className="flex-1">
          <Text className="mb-0.5 font-poppins-medium text-xs text-text-muted">{label}</Text>
          <Text
            className={`font-poppins-regular text-[15px] ${
              !isSet ? 'italic text-gray-400' : 'text-gray-900'
            }`}
          >
            {displayValue}
          </Text>
        </View>
      </View>
      {editable && onPress && <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
    </View>
  );

  if (editable && onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};
