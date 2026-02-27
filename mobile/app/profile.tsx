import React, { useState } from 'react';
import { View, ScrollView, RefreshControl, Alert, TouchableOpacity, Text } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAtom } from 'jotai';
import { userAtom } from '../store/authAtoms';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileSection } from '../components/profile/ProfileSection';
import { ProfileField } from '../components/profile/ProfileField';
import { StatCard } from '../components/profile/StatCard';
import { AuthService } from '../services/auth.service';
import { User } from '../types/user.types';

export default function ProfileScreen() {
  const [user, setUser] = useAtom(userAtom);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      const result = await AuthService.getCurrentUser();
      if (result.ok && result.data) {
        setUser(result.data as any);
      } else {
        Alert.alert('Error', result.message || 'Failed to refresh profile');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to refresh profile. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!user) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Profile',
            headerBackTitle: 'Back',
            headerTitleStyle: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 17,
            },
            headerStyle: {
              backgroundColor: '#FFFFFF',
            },
            headerShadowVisible: true,
          }}
        />
        <View className="flex-1 bg-gray-50">
          <StatusBar style="dark" />
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <ProfileHeader name="" email="" isLoading={true} />

            <ProfileSection title="Personal Information">
              <ProfileField label="Full Name" value="" icon="person" isLoading={true} />
              <ProfileField label="Email" value="" icon="mail" isLoading={true} />
              <ProfileField label="Phone Number" value="" icon="call" isLoading={true} />
              <ProfileField label="Gender" value="" icon="male-female" isLoading={true} />
              <ProfileField label="National ID" value="" icon="card" isLoading={true} />
            </ProfileSection>

            <ProfileSection title="Location">
              <ProfileField label="Country" value="" icon="globe" isLoading={true} />
              <ProfileField label="City" value="" icon="location" isLoading={true} />
            </ProfileSection>

            <ProfileSection title="Account">
              <ProfileField label="Account Status" value="" icon="power" isLoading={true} />
              <ProfileField label="Email Verified" value="" icon="mail" isLoading={true} />
              <ProfileField
                label="Verification Status"
                value=""
                icon="shield-checkmark"
                isLoading={true}
              />
            </ProfileSection>

            <View className="h-8" />
          </ScrollView>
        </View>
      </>
    );
  }

  // Cast to User type for profile display (API returns User type with role/doctorProfile/patientProfile)
  const profileUser = user as unknown as User;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Profile',
          headerBackTitle: 'Back',
          headerTitleStyle: {
            fontFamily: 'Poppins-SemiBold',
            fontSize: 24,
          },
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerShadowVisible: true,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/edit-profile')}
              className="mr-2 h-10 w-10 items-center justify-center"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="pencil" size={22} color="#002D62" />
            </TouchableOpacity>
          ),
        }}
      />
      <View className="flex-1 bg-gray-50">
        <StatusBar style="dark" />
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#002D62']} />
          }
        >
          <ProfileHeader
            name={profileUser.name}
            email={profileUser.email}
            profilePicture={profileUser.profilePicture}
          />

          {/* Patient Stats (mobile app is patient-only) */}
          {profileUser.patientProfile && (
            <View className="flex-row px-4 py-3">
              <StatCard
                icon="calendar"
                label="Consultations"
                value={profileUser.patientProfile.totalConsultations || 0}
                iconColor="#10B981"
              />
              <StatCard
                icon="medical"
                label="Prescriptions"
                value={profileUser.patientProfile.totalPrescriptions || 0}
                iconColor="#3B82F6"
              />
              <StatCard
                icon="heart"
                label="Blood Type"
                value={profileUser.patientProfile.bloodType || 'N/A'}
                iconColor="#EF4444"
              />
            </View>
          )}
          <ProfileSection title="Personal Information">
            <ProfileField label="Full Name" value={profileUser.name} icon="person" />
            <ProfileField label="Email" value={profileUser.email} icon="mail" />
            <ProfileField label="Phone Number" value={profileUser.phoneNumber} icon="call" />
            <ProfileField label="Gender" value={profileUser.gender} icon="male-female" />
            <ProfileField label="National ID" value={profileUser.nid} icon="card" />
          </ProfileSection>

          {/* Location Information */}
          <ProfileSection title="Location">
            <ProfileField label="Country" value={profileUser.country} icon="globe" />
            <ProfileField label="City" value={profileUser.city} icon="location" />
          </ProfileSection>

          {profileUser.patientProfile && (
            <>
              <ProfileSection title="Medical Information">
                <ProfileField
                  label="Blood Type"
                  value={profileUser.patientProfile.bloodType || 'N/A'}
                  icon="heart"
                />
                <ProfileField
                  label="Date of Birth"
                  value={profileUser.patientProfile.dateOfBirth || 'N/A'}
                  icon="calendar"
                />
              </ProfileSection>

              <ProfileSection title="Insurance Information">
                <ProfileField
                  label="Insurance Provider"
                  value={profileUser.patientProfile.insuranceProvider?.name || 'N/A'}
                  icon="shield"
                />
                <ProfileField
                  label="Insurance Number"
                  value={profileUser.patientProfile.insuranceNumber || 'N/A'}
                  icon="card"
                />
              </ProfileSection>

              {profileUser.patientProfile.emergencyContact && (
                <ProfileSection title="Emergency Contact">
                  <ProfileField
                    label="Name"
                    value={profileUser.patientProfile.emergencyContact}
                    icon="person"
                  />
                  <ProfileField
                    label="Phone"
                    value={profileUser.patientProfile.emergencyPhone || 'N/A'}
                    icon="call"
                  />
                </ProfileSection>
              )}
            </>
          )}

          <ProfileSection title="Account">
            <ProfileField
              label="Account Status"
              value={profileUser.active ? 'Active' : 'Inactive'}
              icon="power"
              editable={false}
            />
            <ProfileField
              label="Email Verified"
              value={profileUser.isEmailVerified ? 'Yes' : 'No'}
              icon="mail"
              editable={false}
            />
            <ProfileField
              label="Verification Status"
              value={profileUser.verificationStatus}
              icon="shield-checkmark"
              editable={false}
            />
          </ProfileSection>

          <View className="h-8" />
        </ScrollView>
      </View>
    </>
  );
}
