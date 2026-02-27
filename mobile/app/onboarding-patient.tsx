import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Input, Button, Text, Toast, useToast, DatePicker, Dropdown, Skeleton } from '@/components/ui';
import { ProfileService, PatientProfileData } from '@/services/profile.service';
import api from '@/services/api';

interface InsuranceProvider {
  id: string;
  name: string;
  active: boolean;
}

export default function PatientOnboardingScreen() {
  const { toast, showSuccess, showError, hideToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const [insuranceProviders, setInsuranceProviders] = useState<InsuranceProvider[]>([]);

  // Form data
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [insuranceProviderId, setInsuranceProviderId] = useState<string | null>(null);
  const [insuranceNumber, setInsuranceNumber] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch insurance providers on mount
  useEffect(() => {
    const fetchInsuranceProviders = async () => {
      try {
        setIsLoadingProviders(true);
        const response = await api.get<any>('/insurance-providers', {
          params: { active: true, limit: 100 },
        });
        
        if (response.data?.ok && response.data?.data?.insuranceProviders) {
          setInsuranceProviders(response.data.data.insuranceProviders);
        }
      } catch (error) {
        console.error('Error fetching insurance providers:', error);
      } finally {
        setIsLoadingProviders(false);
      }
    };

    fetchInsuranceProviders();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!emergencyContact.trim()) {
      newErrors.emergencyContact = 'Emergency contact name is required';
    }

    if (!emergencyPhone.trim()) {
      newErrors.emergencyPhone = 'Emergency contact phone is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const profileData: PatientProfileData = {
        dateOfBirth: dateOfBirth?.toISOString(),
        emergencyContact,
        emergencyPhone,
        insuranceProviderId: insuranceProviderId || undefined,
        insuranceNumber: insuranceNumber || undefined,
      };

      // Call patient profile creation endpoint
      const result = await ProfileService.createPatientProfile(profileData);

      if (result.ok) {
        showSuccess('Patient profile created successfully!');
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1500);
      } else {
        showError(result.message || 'Failed to create patient profile');
      }
    } catch (error: any) {
      console.error('Error creating patient profile:', error);
      showError(error.message || 'Failed to create patient profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="border-b border-gray-200 bg-white px-5 pt-4 pb-3">
            <Text className="mb-2 font-poppins-bold text-2xl text-gray-900">Patient Profile Setup</Text>
            <Text className="text-sm text-gray-600">
              Complete your profile to get started
            </Text>
          </View>

          {/* Content */}
          <View className="px-5 py-6">
            {/* Date of Birth */}
            <View className="mb-6">
              <Text className="mb-3 font-poppins-semibold text-base text-gray-900">Date of Birth</Text>
              {dateOfBirth ? (
                <DatePicker
                  value={dateOfBirth}
                  onChange={setDateOfBirth}
                  mode="date"
                  maximumDate={new Date()}
                />
              ) : (
                <TouchableOpacity
                  onPress={() => setDateOfBirth(new Date())}
                  className="rounded-xl border border-gray-200 bg-white p-4"
                >
                  <Text className="font-poppins-regular text-base text-gray-500">
                    Select date of birth
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Emergency Contact */}
            <View className="mb-6">
              <Text className="mb-3 font-poppins-semibold text-base text-gray-900">Emergency Contact Name</Text>
              <Input
                value={emergencyContact}
                onChangeText={text => {
                  setEmergencyContact(text);
                  if (errors.emergencyContact) setErrors({ ...errors, emergencyContact: '' });
                }}
                placeholder="Full name"
                error={errors.emergencyContact}
                variant="outlined"
              />
            </View>

            <View className="mb-6">
              <Text className="mb-3 font-poppins-semibold text-base text-gray-900">Emergency Contact Phone</Text>
              <Input
                value={emergencyPhone}
                onChangeText={text => {
                  setEmergencyPhone(text);
                  if (errors.emergencyPhone) setErrors({ ...errors, emergencyPhone: '' });
                }}
                placeholder="07XXXXXXXX"
                keyboardType="phone-pad"
                error={errors.emergencyPhone}
                variant="outlined"
              />
            </View>

            {/* Insurance Provider */}
            <View className="mb-6">
              <Text className="mb-3 font-poppins-semibold text-base text-gray-900">Insurance Provider (Optional)</Text>
              {isLoadingProviders ? (
                <View className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                  <View className="px-4 py-4">
                    <Skeleton
                      variant="rounded"
                      width="100%"
                      height={24}
                      className="rounded-lg mb-2"
                    />
                    <Skeleton
                      variant="rounded"
                      width="70%"
                      height={20}
                      className="rounded-lg"
                    />
                  </View>
                </View>
              ) : (
                <View className="rounded-xl border border-gray-200 bg-white">
                  <Dropdown
                    value={insuranceProviderId || ''}
                    onValueChange={(value) => setInsuranceProviderId(value || null)}
                    options={[
                      { label: 'Select insurance provider', value: '' },
                      ...insuranceProviders.map(provider => ({
                        label: provider.name,
                        value: provider.id,
                      })),
                    ]}
                    placeholder="Select insurance provider"
                  />
                </View>
              )}
            </View>

            <View className="mb-6">
              <Text className="mb-3 font-poppins-semibold text-base text-gray-900">Insurance Number (Optional)</Text>
              <Input
                value={insuranceNumber}
                onChangeText={setInsuranceNumber}
                placeholder="Insurance policy number"
                variant="outlined"
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View className="border-t border-gray-200 bg-white px-5 py-4">
          <Button
            title={isLoading ? 'Submitting...' : 'Complete Profile'}
            onPress={handleSubmit}
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          />
        </View>
      </KeyboardAvoidingView>

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />
    </SafeAreaView>
  );
}
