import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Input, Button, Toast, useToast } from '../components/ui';

type Step = 'phone' | 'otp' | 'newPassword';

export default function ForgotPasswordScreen() {
  const { toast, showSuccess, showError, hideToast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({
    phoneNumber: '',
    otp: '',
    password: '',
    confirmPassword: '',
  });

  const validatePhone = () => {
    const phoneRegex = /^07[0-9]{8}$/;
    if (!phoneNumber.trim()) {
      setErrors({ ...errors, phoneNumber: 'Phone number is required' });
      return false;
    } else if (!phoneRegex.test(phoneNumber.trim())) {
      setErrors({
        ...errors,
        phoneNumber: 'Enter a valid phone number (07XXXXXXXX)',
      });
      return false;
    }
    return true;
  };

  const handleSendOTP = () => {
    if (validatePhone()) {
      console.log('Sending OTP to:', phoneNumber);
      showSuccess('OTP sent to your phone number');
      setCurrentStep('otp');
    }
  };

  const validateOTP = () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 4) {
      setErrors({ ...errors, otp: 'Please enter complete OTP' });
      return false;
    }
    return true;
  };

  const handleVerifyOTP = () => {
    if (validateOTP()) {
      console.log('Verifying OTP:', otp.join(''));
      setCurrentStep('newPassword');
    }
  };

  const validatePassword = () => {
    const newErrors = {
      phoneNumber: '',
      otp: '',
      password: '',
      confirmPassword: '',
    };

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleResetPassword = () => {
    if (validatePassword()) {
      console.log('Resetting password');
      showSuccess('Password reset successfully!');
      setTimeout(() => {
        router.replace('/login');
      }, 2000);
    }
  };

  const renderPhoneStep = () => (
    <View>
      <View className="mb-8">
        <Text className="font-poppins-bold text-[22px] text-gray-900">
          Reset Password
        </Text>
        <Text className="mt-2 font-poppins-regular text-[14px] text-gray-600">
          Enter your phone number to receive a verification code
        </Text>
      </View>

      <Input
        label="Phone Number"
        placeholder="Enter your phone number"
        value={phoneNumber}
        onChangeText={text => {
          setPhoneNumber(text);
          if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: '' });
        }}
        error={errors.phoneNumber}
        keyboardType="phone-pad"
        leftIcon="call-outline"
        variant="outlined"
      />

      <Button
        title="Send OTP"
        onPress={handleSendOTP}
        size="lg"
        fullWidth
        className="mb-4"
      />

      <TouchableOpacity
        onPress={() => router.back()}
        className="flex-row items-center justify-center"
      >
        <Ionicons name="arrow-back" size={16} color="#16A34A" />
        <Text className="ml-2 font-poppins-medium text-[14px] text-primary">
          Back to Login
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderOTPStep = () => (
    <View>
      <View className="mb-8">
        <Text className="font-poppins-bold text-[22px] text-gray-900">
          Verify Code
        </Text>
        <Text className="mt-2 font-poppins-regular text-[14px] text-gray-600">
          Enter the 4-digit code sent to {phoneNumber}
        </Text>
      </View>

      <View className="mb-6 flex-row justify-center gap-3">
        {otp.map((digit, index) => (
          <View
            key={index}
            className={`h-16 w-16 items-center justify-center rounded-xl border-2 ${
              errors.otp
                ? 'border-red-400 bg-red-50'
                : digit
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 bg-gray-50'
            }`}
          >
            <Text className="font-poppins-bold text-[24px] text-gray-900">{digit}</Text>
          </View>
        ))}
      </View>

      {errors.otp && (
        <Text className="mb-4 text-center font-poppins-regular text-[13px] text-red-500">
          {errors.otp}
        </Text>
      )}

      <Button
        title="Verify OTP"
        onPress={handleVerifyOTP}
        size="lg"
        fullWidth
        className="mb-4"
      />

      <TouchableOpacity className="items-center">
        <Text className="font-poppins-medium text-[14px] text-gray-600">
          Didn't receive code?{' '}
          <Text className="font-poppins-semibold text-primary underline">
            Resend
          </Text>
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPasswordStep = () => (
    <View>
      <View className="mb-8">
        <Text className="font-poppins-bold text-[22px] text-gray-900">
          New Password
        </Text>
        <Text className="mt-2 font-poppins-regular text-[14px] text-gray-600">
          Create a strong password for your account
        </Text>
      </View>

      <Input
        label="New Password"
        placeholder="Enter your new password"
        value={password}
        onChangeText={text => {
          setPassword(text);
          if (errors.password) setErrors({ ...errors, password: '' });
        }}
        error={errors.password}
        secureTextEntry
        showPasswordToggle
        leftIcon="lock-closed-outline"
        variant="outlined"
      />

      <Input
        label="Confirm Password"
        placeholder="Confirm your new password"
        value={confirmPassword}
        onChangeText={text => {
          setConfirmPassword(text);
          if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
        }}
        error={errors.confirmPassword}
        secureTextEntry
        showPasswordToggle
        leftIcon="lock-closed-outline"
        variant="outlined"
      />

      <Button
        title="Reset Password"
        onPress={handleResetPassword}
        size="lg"
        fullWidth
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 py-8">
            {currentStep === 'phone' && renderPhoneStep()}
            {currentStep === 'otp' && renderOTPStep()}
            {currentStep === 'newPassword' && renderPasswordStep()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
