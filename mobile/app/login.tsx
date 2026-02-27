import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Input, Button, Text, Toast, useToast } from '../components/ui';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';
import { useAtom, useSetAtom } from 'jotai';
import { userAtom } from '../store/authAtoms';
import { onboardingCompletedAtom } from '../store/onboardingAtoms';

export default function LoginScreen() {
  const { toast, showError, showSuccess, hideToast } = useToast();
  const [, setUser] = useAtom(userAtom);
  const setOnboardingCompleted = useSetAtom(onboardingCompletedAtom);
  const router = useRouter();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    emailOrPhone: '',
    password: '',
  });

  const validateForm = () => {
    const newErrors = {
      emailOrPhone: '',
      password: '',
    };

    const phoneRegex = /^07[0-9]{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailOrPhone.trim()) {
      newErrors.emailOrPhone = 'Email or phone number is required';
    } else if (!phoneRegex.test(emailOrPhone.trim()) && !emailRegex.test(emailOrPhone.trim())) {
      newErrors.emailOrPhone = 'Enter valid email or phone number (07XXXXXXXX)';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);

    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await AuthService.login(emailOrPhone.trim(), password);

      if (result.ok && result.data) {
        console.log('[Login] Login successful, setting user in Jotai atom');

        // Store user in Jotai atom (which will sync to AsyncStorage)
        setUser(result.data.user as any);
        setOnboardingCompleted(true);
        showSuccess('Login successful!');

        // Refetch full user from /auth/me so patientProfile and other profile data are reflected immediately
        try {
          const meResult = await AuthService.getCurrentUser();
          if (meResult.ok && meResult.data) {
            setUser(meResult.data as any);
          }
        } catch (_) {
          // Keep login user if /auth/me fails (e.g. network); token is already set
        }

        // Check profile completion and navigate
        setTimeout(async () => {
          try {
            const profileCheck = await ProfileService.checkProfileCompletion();

            if (profileCheck.ok && profileCheck.data) {
              const { hasProfile, roleName } = profileCheck.data;

              if (!hasProfile && roleName === 'PATIENT') {
                router.replace('/onboarding-patient' as any);
              } else {
                router.replace('/(tabs)');
              }
            } else {
              router.replace('/(tabs)');
            }
          } catch (error) {
            console.error('Profile check error:', error);
            router.replace('/(tabs)');
          }
        }, 300);
      } else {
        showError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (error: any) {
      // Error is already handled by AuthService and shown via toast
      // AuthService.login() should never throw - it always returns { ok: false, message }
      // This catch is only for truly unexpected errors
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'An error occurred during login. Please try again.';
      showError(errorMessage);

      // Only log in development for debugging unexpected errors
      if (__DEV__ && !error?.response) {
        console.warn('[Login] Unexpected error (not from API):', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 py-8">
          <View className="mb-8 items-center">
            <Text variant="h2" weight="bold" align="center" className="mb-2">
              Welcome Back
            </Text>
            <Text variant="caption" color="muted" align="center">
              Sign in to your LifeCare account
            </Text>
          </View>

          <View>
            <Input
              label="Email or Phone Number"
              placeholder="Enter your email or phone number"
              value={emailOrPhone}
              onChangeText={text => {
                setEmailOrPhone(text);
                if (errors.emailOrPhone) setErrors({ ...errors, emailOrPhone: '' });
              }}
              error={errors.emailOrPhone}
              keyboardType="email-address"
              autoComplete="email"
              autoCapitalize="none"
              leftIcon="mail-outline"
              variant="outlined"
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={text => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              error={errors.password}
              secureTextEntry
              showPasswordToggle
              autoComplete="password"
              leftIcon="lock-closed-outline"
              variant="outlined"
            />

            <TouchableOpacity
              onPress={handleForgotPassword}
              className="mb-8 self-end"
              activeOpacity={0.7}
            >
              <Text weight="medium" color="primary">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              variant="primary"
              size="lg"
              fullWidth
              leftIcon="log-in-outline"
              className="mb-6"
              loading={isLoading}
              disabled={isLoading}
            />

            <View className="mt-4 flex-row items-center justify-center">
              <Text color="secondary">Don't have an account? </Text>
              <TouchableOpacity onPress={handleSignUp} activeOpacity={0.7}>
                <Text weight="bold" color="primary">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Toast Notification */}
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />
    </KeyboardAvoidingView>
  );
}
