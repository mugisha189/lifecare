import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Input, Button, Text, Toast, useToast } from '@/components/ui';
import { AuthService } from '@/services/auth.service';

export default function ChangePasswordScreen() {
  const { toast, showSuccess, showError, hideToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const canSubmit =
    currentPassword.trim().length > 0 &&
    newPassword.trim().length >= 8 &&
    newPassword === confirmPassword &&
    !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (newPassword.length < 8) {
      showError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('New password and confirmation do not match');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await AuthService.changePassword(currentPassword, newPassword);
      if (result.ok) {
        showSuccess('Password changed successfully. Please sign in again.');
        await AuthService.logout();
        setTimeout(() => router.replace('/login'), 1500);
      } else {
        showError(result.message || 'Failed to change password');
      }
    } catch (e: any) {
      showError(e?.message || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Change Password',
          headerBackTitle: 'Back',
          headerTitleStyle: { fontFamily: 'Poppins-SemiBold', fontSize: 18 },
        }}
      />
      <StatusBar style="dark" />
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        <Text className="mb-4 font-poppins-regular text-sm text-gray-600">
          Enter your current password and choose a new password. You will be signed out after changing your password.
        </Text>
        <View className="mb-4">
          <Text className="mb-2 font-poppins-medium text-sm text-gray-800">Current password</Text>
          <Input
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Current password"
            secureTextEntry={!showCurrent}
            variant="outlined"
          />
          <TouchableOpacity
            onPress={() => setShowCurrent((s) => !s)}
            className="mt-1 self-end"
          >
            <Text className="font-poppins-regular text-xs text-gray-500">
              {showCurrent ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>
        <View className="mb-4">
          <Text className="mb-2 font-poppins-medium text-sm text-gray-800">New password (min 8 characters)</Text>
          <Input
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New password"
            secureTextEntry={!showNew}
            variant="outlined"
          />
          <TouchableOpacity
            onPress={() => setShowNew((s) => !s)}
            className="mt-1 self-end"
          >
            <Text className="font-poppins-regular text-xs text-gray-500">
              {showNew ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>
        <View className="mb-6">
          <Text className="mb-2 font-poppins-medium text-sm text-gray-800">Confirm new password</Text>
          <Input
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            secureTextEntry
            variant="outlined"
          />
        </View>
        <Button
          title={isSubmitting ? 'Changing...' : 'Change Password'}
          onPress={handleSubmit}
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
          disabled={!canSubmit}
        />
      </ScrollView>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />
    </SafeAreaView>
  );
}
