import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SkeletonCircle, SkeletonText } from '../ui/Skeleton';
import { Avatar } from '../ui/Avatar';

interface ProfileHeaderProps {
  name: string;
  email: string;
  profilePicture?: string | null;
  onEditPress?: () => void;
  isLoading?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  email,
  profilePicture,
  onEditPress,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <View className="items-center border-b border-gray-200 bg-white px-5 py-6">
        <View className="relative mb-4">
          <SkeletonCircle width={96} height={96} />
        </View>
        <SkeletonText width={150} height={24} className="mb-2" />
        <SkeletonText width={200} height={16} />
      </View>
    );
  }

  return (
    <View className="items-center border-b border-gray-200 bg-white px-5 py-6">
      <View className="relative mb-4">
        <Avatar name={name} size="xl" variant="circle" />
        {onEditPress && (
          <TouchableOpacity
            className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary"
            onPress={onEditPress}
          >
            <Ionicons name="camera" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
      <Text className="mb-1 text-xl font-bold text-gray-900">{name}</Text>
      <Text className="text-sm text-gray-600">{email}</Text>
    </View>
  );
};
