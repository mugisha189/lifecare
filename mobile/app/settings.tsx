import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from '../services/auth.service';
import { useAtom } from 'jotai';
import { userAtom } from '../store/authAtoms';

export default function SettingsScreen() {
  const [, setUser] = useAtom(userAtom);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              console.log('[Settings] Logging out user...');

              // Call backend logout
              const response = await AuthService.logout();

              // Clear user from Jotai atom
              setUser(null);

              console.log('[Settings] Logout complete, user cleared from state');

              if (response.ok) {
                // Navigate to login
                router.replace('/login');
              } else {
                // Show error but still navigate as tokens are cleared
                Alert.alert('Error', response.message || 'Logout failed');
                router.replace('/login');
              }
            } catch (error) {
              console.error('[Settings] Error during logout:', error);
              // Clear user anyway and navigate
              setUser(null);
              router.replace('/login');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const settingsItems = [
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      type: 'toggle' as const,
      value: notificationsEnabled,
      onToggle: setNotificationsEnabled,
    },
  ];

  const [isDeleting, setIsDeleting] = React.useState(false);

  const accountItems = [
    {
      icon: 'lock-closed-outline',
      label: 'Change Password',
      type: 'navigation' as const,
      onPress: () => router.push('/change-password'),
    },
    {
      icon: 'trash-outline',
      label: 'Delete Account',
      type: 'destructive' as const,
      onPress: () => {
        Alert.alert(
          'Delete Account',
          'Are you sure you want to permanently delete your account? This action cannot be undone.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                setIsDeleting(true);
                try {
                  const response = await AuthService.deleteAccount();
                  setUser(null);
                  await AuthService.logout();
                  if (response.ok) {
                    router.replace('/login');
                  } else {
                    Alert.alert('Error', response.message || 'Failed to delete account');
                  }
                } catch (error: any) {
                  Alert.alert('Error', error?.message || 'Failed to delete account');
                } finally {
                  setIsDeleting(false);
                }
              },
            },
          ]
        );
      },
    },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle:
            'Settings',
          headerBackTitle: 'Back',
          headerTitleStyle: {
            fontFamily: 'Poppins-SemiBold',
            fontSize: 24,
          },
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerShadowVisible: true,
        }}
      />
      <View className="flex-1 bg-background-gray">
        <StatusBar style="dark" />
        <ScrollView className="flex-1 pb-5" showsVerticalScrollIndicator={false}>
          {/* General Settings Section */}
          <Text className="px-4 pb-2 pt-6 font-poppins-semibold text-[13px] tracking-wide text-gray-600">
            GENERAL
          </Text>
          <View className="mx-4 overflow-hidden rounded-xl bg-white shadow-sm">
            {settingsItems.map((item, index) => (
              <View key={index}>
                <TouchableOpacity
                  className="min-h-[44px] flex-row items-center justify-between px-4 py-3"
                  onPress={item.type !== 'toggle' && 'onPress' in item ? (item as any).onPress : undefined}
                  activeOpacity={0.7}
                  disabled={item.type === 'toggle'}
                >
                  <View className="flex-1 flex-row items-center">
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color="#6B7280"
                      className="mr-3 w-5"
                    />
                    <View className="flex-1">
                      <Text className="font-poppins-regular text-base text-gray-800">
                        {item.label}
                      </Text>
                      {item.type !== 'toggle' && 'value' in item && item.value && typeof item.value === 'string' && (
                        <Text className="mt-0.5 font-poppins-regular text-[15px] text-gray-500">
                          {item.value as string}
                        </Text>
                      )}
                    </View>
                  </View>
                  {item.type === 'toggle' ? (
                    <Switch
                      value={(item as any).value as boolean}
                      onValueChange={(item as any).onToggle}
                      trackColor={{ false: '#D1D5DB', true: '#002D62' }}
                      thumbColor="#FFFFFF"
                      ios_backgroundColor="#D1D5DB"
                    />
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
                  )}
                </TouchableOpacity>
                {index < settingsItems.length - 1 && (
                  <View className="ml-12 h-[0.5px] bg-gray-200" />
                )}
              </View>
            ))}
          </View>

          {/* Account Section */}
          <Text className="px-4 pb-2 pt-6 font-poppins-semibold text-[13px] tracking-wide text-gray-600">
            ACCOUNT
          </Text>
          <View className="mx-4 overflow-hidden rounded-xl bg-white shadow-sm">
            {accountItems.map((item, index) => (
              <View key={index}>
                <TouchableOpacity
                  className="min-h-[44px] flex-row items-center justify-between px-4 py-3"
                  onPress={item.onPress}
                  activeOpacity={0.7}
                  disabled={item.type === 'destructive' && isDeleting}
                >
                  <View className="flex-1 flex-row items-center">
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={item.type === 'destructive' ? '#EF4444' : '#6B7280'}
                      className="mr-3 w-5"
                    />
                    <Text
                      className={`font-poppins-regular text-base ${
                        item.type === 'destructive' ? 'text-error' : 'text-gray-800'
                      }`}
                    >
                      {item.label}
                    </Text>
                  </View>
                  {item.type === 'destructive' && isDeleting ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
                  )}
                </TouchableOpacity>
                {index < accountItems.length - 1 && (
                  <View className="ml-12 h-[0.5px] bg-gray-200" />
                )}
              </View>
            ))}
          </View>

          {/* Logout Section */}
          <View className="mx-4 overflow-hidden rounded-xl bg-white shadow-sm">
            <TouchableOpacity
              className="min-h-[44px] flex-row items-center justify-between px-4 py-3"
              onPress={handleLogout}
              activeOpacity={0.7}
              disabled={isLoggingOut}
            >
              <View className="flex-1 flex-row items-center">
                {isLoggingOut ? (
                  <ActivityIndicator size="small" color="#EF4444" className="mr-3 w-5" />
                ) : (
                  <Ionicons name="log-out-outline" size={20} color="#EF4444" className="mr-3 w-5" />
                )}
                <Text className="font-poppins-medium text-base text-error">
                  Logout
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Version Footer */}
          <View className="items-center py-8">
            <Text className="font-poppins-regular text-sm text-gray-400">
              Version {appVersion}
            </Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
