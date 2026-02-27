import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Toast, useToast } from '@/components/ui';
import { AuthService } from '@/services/auth.service';
import { useAtom, useSetAtom } from 'jotai';
import { userAtom, authTokenAtom } from '@/store/authAtoms';
import { onboardingCompletedAtom } from '@/store/onboardingAtoms';

import UserDetailsStep from '@/components/signup/UserDetailsStep';
import CreatePasswordStep from '@/components/signup/CreatePasswordStep';

export type SignupFormData = {
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  country: string;
  city: string;
  otp: string;
  password: string;
  confirmPassword: string;
  roleId: string | null;
  roleName: string | null;
};

export default function SignupScreen() {
  const { toast, showSuccess, showError, hideToast } = useToast();
  const [, setUser] = useAtom(userAtom);
  const [, setAuthToken] = useAtom(authTokenAtom);
  const setOnboardingCompleted = useSetAtom(onboardingCompletedAtom);

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [patientRoleId, setPatientRoleId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    country: '',
    city: '',
    otp: '',
    password: '',
    confirmPassword: '',
    roleId: null,
    roleName: 'PATIENT', // Always PATIENT for mobile app
  });

  // Fetch PATIENT role ID on mount
  useEffect(() => {
    const fetchPatientRole = async () => {
      try {
        const { RolesService } = await import('@/services/roles.service');
        const result = await RolesService.getRoleByName('PATIENT');
        if (result.ok && result.data) {
          setPatientRoleId(result.data.id);
          setFormData(prev => ({ ...prev, roleId: result.data!.id }));
        }
      } catch (error) {
        console.error('Error fetching PATIENT role:', error);
      }
    };
    fetchPatientRole();
  }, []);

  const updateFormData = (data: Partial<SignupFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const goToNextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle registration after password step
  const handleRegister = async () => {
    // Note: roleId is now optional - backend will default to PATIENT if not provided
    setIsLoading(true);
    try {
      // Map gender from frontend format to backend enum
      const genderMap: Record<string, 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'> = {
        Male: 'MALE',
        Female: 'FEMALE',
        Other: 'OTHER',
      };

      const registrationData: any = {
        name: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        gender: genderMap[formData.gender] || 'PREFER_NOT_TO_SAY',
        country: formData.country,
        city: formData.city,
      };
      
      // Add roleId only if available (backend will default to PATIENT if not provided)
      if (patientRoleId) {
        registrationData.roleId = patientRoleId;
      }
      
      const registerResult = await AuthService.register(registrationData);

      if (registerResult.ok && registerResult.data) {
        // Store user and token
        setUser(registerResult.data.user as any);
        setAuthToken(registerResult.data.accessToken);

        // Mark onboarding as completed
        setOnboardingCompleted(true);

        // Skip OTP verification - go directly to patient profile setup
        showSuccess('Registration successful! Please complete your profile.');
        
        setTimeout(() => {
          router.replace('/onboarding-patient' as any);
        }, 1500);
      } else {
        showError(registerResult.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showError('An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP verification removed - users are auto-verified

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <UserDetailsStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={goToNextStep}
          />
        );
      case 2:
        return (
          <CreatePasswordStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleRegister}
            onBack={goToPreviousStep}
            isLoading={isLoading}
          />
        );
      case 3:
        return (
          <OTPVerificationStep
            phoneNumber={formData.phoneNumber}
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleSignupComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="dark" />

        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            className="flex-1"
            contentContainerClassName="px-6 py-8"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="mb-8">
              <View className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <View
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(currentStep / 2) * 100}%` }}
                />
              </View>
              <Text className="mt-2 text-center font-poppins-medium text-[12px] text-gray-600">
                Step {currentStep} of 2
              </Text>
            </View>

            {renderStep()}

            <View className="mt-6 flex-row items-center justify-center">
              <Text className="font-poppins-regular text-[14px] text-gray-600">
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text className="font-poppins-semibold text-[14px] text-primary">
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
