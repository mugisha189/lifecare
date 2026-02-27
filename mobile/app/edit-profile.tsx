import React, { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Input, Button, Text, Toast, useToast, DatePicker, Dropdown } from '@/components/ui';
import { useAtom } from 'jotai';
import { userAtom } from '@/store/authAtoms';
import { ProfileService } from '@/services/profile.service';
import { AuthService } from '@/services/auth.service';
import api from '@/services/api';
import { User } from '@/types/user.types';

interface InsuranceProvider {
  id: string;
  name: string;
  active: boolean;
}

export default function EditProfileScreen() {
  const [user, setUser] = useAtom(userAtom);
  const { toast, showSuccess, showError, hideToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [insuranceProviders, setInsuranceProviders] = useState<InsuranceProvider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);

  const profileUser = user as unknown as User;

  const [name, setName] = useState(profileUser?.name ?? '');
  const [phoneNumber, setPhoneNumber] = useState(profileUser?.phoneNumber ?? '');
  const [gender, setGender] = useState<string>(profileUser?.gender ?? '');
  const [country, setCountry] = useState(profileUser?.country ?? '');
  const [city, setCity] = useState(profileUser?.city ?? '');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(
    profileUser?.patientProfile?.dateOfBirth
      ? new Date(profileUser.patientProfile.dateOfBirth)
      : null
  );
  const [insuranceProviderId, setInsuranceProviderId] = useState<string>(
    profileUser?.patientProfile?.insuranceProviderId ?? ''
  );
  const [insuranceNumber, setInsuranceNumber] = useState(
    profileUser?.patientProfile?.insuranceNumber ?? ''
  );

  useEffect(() => {
    if (profileUser?.name !== undefined) setName(profileUser.name);
    if (profileUser?.phoneNumber !== undefined) setPhoneNumber(profileUser.phoneNumber);
    if (profileUser?.gender !== undefined) setGender(profileUser.gender);
    if (profileUser?.country !== undefined) setCountry(profileUser.country);
    if (profileUser?.city !== undefined) setCity(profileUser.city);
    if (profileUser?.patientProfile) {
      const pp = profileUser.patientProfile;
      if (pp.dateOfBirth) setDateOfBirth(new Date(pp.dateOfBirth));
      if (pp.insuranceProviderId) setInsuranceProviderId(pp.insuranceProviderId);
      if (pp.insuranceNumber) setInsuranceNumber(pp.insuranceNumber);
    }
  }, [profileUser]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await api.get<any>('/insurance-providers', {
          params: { active: true, limit: 100 },
        });
        if (response.data?.ok && response.data?.data?.insuranceProviders) {
          setInsuranceProviders(response.data.data.insuranceProviders);
        }
      } catch (e) {
        console.error('Error fetching insurance providers:', e);
      } finally {
        setLoadingProviders(false);
      }
    };
    fetchProviders();
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) {
      showError('Name is required');
      return;
    }
    setIsSubmitting(true);
    try {
      const userResult = await ProfileService.updateUserProfile({
        name: name.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        gender: gender as 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY',
        country: country.trim() || undefined,
        city: city.trim() || undefined,
      });
      if (!userResult.ok) {
        showError(userResult.message || 'Failed to update profile');
        setIsSubmitting(false);
        return;
      }

      if (profileUser?.patientProfile) {
        const patientResult = await ProfileService.updatePatientProfile({
          dateOfBirth: dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : undefined,
          insuranceProviderId: insuranceProviderId || undefined,
          insuranceNumber: insuranceNumber.trim() || undefined,
        });
        if (!patientResult.ok) {
          showError(patientResult.message || 'Failed to update patient profile');
          setIsSubmitting(false);
          return;
        }
      }

      const refreshed = await AuthService.getCurrentUser();
      if (refreshed.ok && refreshed.data) {
        setUser(refreshed.data as any);
      }
      showSuccess('Profile updated successfully');
      setTimeout(() => router.back(), 800);
    } catch (e: any) {
      showError(e?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Stack.Screen options={{ title: 'Edit Profile', headerBackTitle: 'Back' }} />
        <View className="flex-1 items-center justify-center p-4">
          <Text className="font-poppins-regular text-gray-600">Please sign in to edit your profile.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ title: 'Edit Profile', headerBackTitle: 'Back' }} />
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
          <Text className="mb-3 font-poppins-semibold text-base text-gray-800">Personal information</Text>
          <View className="mb-4">
            <Text className="mb-1 font-poppins-regular text-sm text-gray-600">Full name</Text>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Full name"
              variant="outlined"
            />
          </View>
          <View className="mb-4">
            <Text className="mb-1 font-poppins-regular text-sm text-gray-600">Phone number</Text>
            <Input
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Phone number"
              variant="outlined"
              keyboardType="phone-pad"
            />
          </View>
          <View className="mb-4">
            <Text className="mb-1 font-poppins-regular text-sm text-gray-600">Gender</Text>
            <Dropdown
              value={gender}
              onValueChange={setGender}
              options={[
                { label: 'Select gender', value: '' },
                { label: 'Male', value: 'MALE' },
                { label: 'Female', value: 'FEMALE' },
                { label: 'Other', value: 'OTHER' },
                { label: 'Prefer not to say', value: 'PREFER_NOT_TO_SAY' },
              ]}
              placeholder="Select gender"
            />
          </View>
          <View className="mb-4">
            <Text className="mb-1 font-poppins-regular text-sm text-gray-600">Country</Text>
            <Input
              value={country}
              onChangeText={setCountry}
              placeholder="Country"
              variant="outlined"
            />
          </View>
          <View className="mb-6">
            <Text className="mb-1 font-poppins-regular text-sm text-gray-600">City</Text>
            <Input
              value={city}
              onChangeText={setCity}
              placeholder="City"
              variant="outlined"
            />
          </View>

          {profileUser?.patientProfile && (
            <>
              <Text className="mb-3 font-poppins-semibold text-base text-gray-800">Patient information</Text>
              <View className="mb-4">
                <Text className="mb-1 font-poppins-regular text-sm text-gray-600">Date of birth</Text>
                <DatePicker
                  value={dateOfBirth || new Date()}
                  onChange={(d) => setDateOfBirth(d)}
                  mode="date"
                  maximumDate={new Date()}
                />
              </View>
              <View className="mb-4">
                <Text className="mb-1 font-poppins-regular text-sm text-gray-600">Insurance provider</Text>
                <Dropdown
                  value={insuranceProviderId}
                  onValueChange={setInsuranceProviderId}
                  options={[
                    { label: 'None', value: '' },
                    ...insuranceProviders.map((p) => ({ label: p.name, value: p.id })),
                  ]}
                  placeholder={loadingProviders ? 'Loading...' : 'Select insurance provider'}
                />
              </View>
              <View className="mb-6">
                <Text className="mb-1 font-poppins-regular text-sm text-gray-600">Insurance number</Text>
                <Input
                  value={insuranceNumber}
                  onChangeText={setInsuranceNumber}
                  placeholder="Insurance number"
                  variant="outlined"
                />
              </View>
            </>
          )}

          <Button
            title={isSubmitting ? 'Saving...' : 'Save changes'}
            onPress={handleSubmit}
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />
    </SafeAreaView>
  );
}
