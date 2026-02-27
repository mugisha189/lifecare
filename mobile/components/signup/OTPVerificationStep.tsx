import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Button } from '@/components/ui/Button';
import type { SignupFormData } from '@/app/signup';
import { useLanguage } from '@/contexts/LanguageContext';

interface OTPVerificationStepProps {
  phoneNumber: string;
  formData: SignupFormData;
  updateFormData: (data: Partial<SignupFormData>) => void;
  onNext: () => void;
}

export default function OTPVerificationStep({
  phoneNumber,
  formData,
  updateFormData,
  onNext,
}: OTPVerificationStepProps) {
  const { t } = useLanguage();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(600); // 10 minutes = 600 seconds
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Format timer as MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (value: string, index: number) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    updateFormData({ otp: newOtp.join('') });
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = async () => {
    if (canResend && formData.email) {
      try {
        const { AuthService } = await import('@/services/auth.service');
        const result = await AuthService.resendOtp(formData.email);
        if (result.ok) {
          setTimer(600); // Reset to 10 minutes
          setCanResend(false);
          setOtp(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        } else {
          setError(result.message || 'Failed to resend OTP');
        }
      } catch (error) {
        console.error('Resend OTP error:', error);
        setError('Failed to resend OTP. Please try again.');
      }
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');

    if (otpValue.length !== 6) {
      setError(t('signup.errors.otpIncomplete') || 'Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const { AuthService } = await import('@/services/auth.service');
      const result = await AuthService.verifyOtp(otpValue);

      if (result.ok) {
        onNext();
      } else {
        setError(result.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const maskPhoneNumber = (phone: string) => {
    if (phone.length < 4) return phone;
    const lastTwo = phone.slice(-2);
    return `+250 78*******${lastTwo}`;
  };

  return (
    <View>
      {/* Header */}
      <View className="mb-8">
        <Text className="font-poppins-bold text-[22px] text-gray-900">{t('signup.otp.title')}</Text>
        <Text className="mt-2 font-poppins-regular text-[14px] text-gray-600">
          {t('signup.otp.subtitle')} {maskPhoneNumber(phoneNumber)}
        </Text>
      </View>

      {/* OTP Input Boxes - 6 digits to match backend */}
      <View className="mb-6 flex-row justify-center gap-2">
        {otp.map((digit, index) => (
          <View
            key={index}
            className={`h-12 w-12 items-center justify-center rounded-lg border-2 ${
              error
                ? 'border-red-400 bg-red-50'
                : digit
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 bg-gray-50'
            }`}
          >
            <TextInput
              ref={ref => {
                inputRefs.current[index] = ref;
              }}
              value={digit}
              onChangeText={value => handleOtpChange(value, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              className="text-center font-poppins-bold text-[20px] text-gray-900"
              selectTextOnFocus
            />
          </View>
        ))}
      </View>

      {/* Error Message */}
      {error ? (
        <Text className="mb-4 text-center font-poppins-regular text-[13px] text-red-500">
          {error}
        </Text>
      ) : null}

      {/* Resend Code */}
      <View className="mb-8 items-center">
        {canResend ? (
          <TouchableOpacity onPress={handleResendCode} activeOpacity={0.7}>
            <Text className="font-poppins-medium text-[14px] text-gray-600">
              {t('signup.otp.didntReceive')}{' '}
              <Text className="font-poppins-semibold text-primary underline">
                {t('signup.otp.resendCode')}
              </Text>
            </Text>
          </TouchableOpacity>
        ) : (
          <Text className="font-poppins-regular text-[14px] text-gray-600">
            {t('signup.otp.resendIn')}{' '}
            <Text className="font-poppins-semibold text-primary">{formatTimer(timer)}</Text>
          </Text>
        )}
      </View>

      {/* Verify Button */}
      <Button
        title={isVerifying ? 'Verifying...' : t('signup.otp.verify')}
        onPress={handleVerify}
        size="lg"
        disabled={isVerifying}
      />
    </View>
  );
}
