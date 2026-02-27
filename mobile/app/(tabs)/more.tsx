import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { ProfileService } from '@/services/profile.service';
import { useAtom } from 'jotai';
import { userAtom } from '@/store/authAtoms';
import { useUserRole } from '@/hooks/useUserRole';

export default function MoreScreen() {
  const [user] = useAtom(userAtom);
  const { isPatient } = useUserRole();
  const [hasProfile, setHasProfile] = useState(true);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  useEffect(() => {
    checkProfileCompletion();
  }, []);

  const checkProfileCompletion = async () => {
    try {
      const result = await ProfileService.checkProfileCompletion();
      if (result.ok && result.data) {
        setHasProfile(result.data.hasProfile);
      }
    } catch (error) {
      console.error('Profile check error:', error);
    } finally {
      setIsCheckingProfile(false);
    }
  };

  const handleCompleteProfile = () => {
    // Mobile app is patient-only
    if (!user) return;
    router.push('/onboarding-patient' as any);
  };

  const menuItems = [
    {
      icon: 'person-outline',
      label: 'Profile',
      route: '/profile',
      color: '#002D62',
    },
    ...(!hasProfile && !isCheckingProfile
      ? [
          {
            icon: 'checkmark-circle-outline',
            label: 'Complete Profile',
            onPress: handleCompleteProfile,
            color: '#EF4444',
            badge: true,
          },
        ]
      : []),
    {
      icon: 'settings-outline',
      label: 'Settings',
      route: '/settings',
      color: '#002D62',
    },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <StatusBar style="dark" />
        {/* Custom Header */}
        <View className="border-b border-gray-100 bg-white px-5 pb-5 pt-4">
          <Text className="mb-1 font-poppins-bold text-2xl text-gray-800">More</Text>
          <Text className="font-poppins-regular text-sm leading-5 text-gray-600">
            Manage your profile and preferences
          </Text>
        </View>

        <ScrollView className="flex-1 bg-background-gray" showsVerticalScrollIndicator={false}>
          {/* Menu Items */}
          <View className="mt-4 px-5 pb-5">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                className="mb-3 flex-row items-center justify-between rounded-xl bg-white px-4 py-4"
                onPress={() =>
                  (item as any).onPress ? (item as any).onPress() : router.push((item as any).route)
                }
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <View
                    className="mr-3.5 h-10 w-10 items-center justify-center rounded-[10px]"
                    style={{ backgroundColor: `${item.color}10` }}
                  >
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Text
                    className={`font-poppins-semibold text-base ${
                      (item as any).badge ? 'text-error' : 'text-gray-800'
                    }`}
                  >
                    {item.label}
                  </Text>
                  {(item as any).badge && <View className="ml-2 h-2 w-2 rounded-full bg-error" />}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
