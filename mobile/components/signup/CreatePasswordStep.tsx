import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { SignupFormData } from '@/app/signup';
import { useLanguage } from '@/contexts/LanguageContext';

interface CreatePasswordStepProps {
  formData: SignupFormData;
  updateFormData: (data: Partial<SignupFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export default function CreatePasswordStep({
  formData,
  updateFormData,
  onNext,
  onBack,
  isLoading = false,
}: CreatePasswordStepProps) {
  const { t } = useLanguage();
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
    terms: '',
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const validatePasswordStrength = (password: string) => {
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const validateForm = () => {
    const newErrors = {
      password: '',
      confirmPassword: '',
      terms: '',
    };

    // Password validation
    if (!formData.password) {
      newErrors.password = t('signup.errors.passwordRequired');
    } else if (formData.password.length < 8) {
      newErrors.password = t('signup.errors.passwordTooShort');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = t('signup.errors.passwordWeak');
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('signup.errors.confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('signup.errors.passwordMismatch');
    }

    // Terms validation
    if (!acceptedTerms) {
      newErrors.terms = t('signup.errors.termsRequired');
    }

    setErrors(newErrors);

    // Return true if no errors
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handlePasswordChange = (text: string) => {
    updateFormData({ password: text });
    validatePasswordStrength(text);
    if (errors.password) setErrors({ ...errors, password: '' });
  };

  const handleConfirmPasswordChange = (text: string) => {
    updateFormData({ confirmPassword: text });
    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
  };

  const handleContinue = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <View>
      {/* Header */}
      <View className="mb-8">
        <Text className="font-poppins-bold text-[22px] text-gray-900">
          {t('signup.password.title')}
        </Text>
        <Text className="mt-2 font-poppins-regular text-[14px] text-gray-600">
          {t('signup.password.subtitle')}
        </Text>
      </View>

      {/* New Password Input */}
      <Input
        label={t('signup.password.newPassword')}
        placeholder={t('signup.password.newPasswordPlaceholder')}
        value={formData.password}
        onChangeText={handlePasswordChange}
        error={errors.password}
        secureTextEntry
        showPasswordToggle
        variant="outlined"
        autoCapitalize="none"
      />

      {/* Password Strength Indicators */}
      {formData.password && (
        <View className="mb-4 rounded-xl bg-gray-50 p-4">
          <Text className="mb-3 font-poppins-medium text-[13px] text-gray-700">
            {t('signup.password.strengthTitle')}
          </Text>

          <PasswordRequirement
            met={passwordStrength.hasMinLength}
            text={t('signup.password.minLength')}
          />
          <PasswordRequirement
            met={passwordStrength.hasUpperCase}
            text={t('signup.password.uppercase')}
          />
          <PasswordRequirement
            met={passwordStrength.hasLowerCase}
            text={t('signup.password.lowercase')}
          />
          <PasswordRequirement
            met={passwordStrength.hasNumber}
            text={t('signup.password.number')}
          />
          <PasswordRequirement
            met={passwordStrength.hasSpecialChar}
            text={t('signup.password.specialChar')}
          />
        </View>
      )}

      {/* Confirm Password Input */}
      <Input
        label={t('signup.password.confirmPassword')}
        placeholder={t('signup.password.confirmPasswordPlaceholder')}
        value={formData.confirmPassword}
        onChangeText={handleConfirmPasswordChange}
        error={errors.confirmPassword}
        secureTextEntry
        showPasswordToggle
        variant="outlined"
        autoCapitalize="none"
      />

      {/* Terms and Conditions */}
      <View className="mb-6">
        <TouchableOpacity
          onPress={() => {
            setAcceptedTerms(!acceptedTerms);
            if (errors.terms) setErrors({ ...errors, terms: '' });
          }}
          className="flex-row items-start"
          activeOpacity={0.7}
        >
          <View className="mr-3 mt-1">
            <View
              className={`h-5 w-5 items-center justify-center rounded border-2 ${
                acceptedTerms ? 'border-primary bg-primary' : 'border-gray-300 bg-white'
              }`}
            >
              {acceptedTerms && <Text className="font-poppins-bold text-[12px] text-white">✓</Text>}
            </View>
          </View>
          <Text className="flex-1 font-poppins-regular text-[13px] text-gray-600">
            {t('signup.password.terms')}{' '}
            <Text className="text-primary">{t('signup.password.termsLink')}</Text> and the{' '}
            <Text className="text-primary">{t('signup.password.privacyLink')}</Text>
          </Text>
        </TouchableOpacity>
        {errors.terms ? (
          <Text className="ml-8 mt-1 font-poppins-regular text-[12px] text-red-500">
            {errors.terms}
          </Text>
        ) : null}
      </View>

      {/* Submit Button */}
      <Button
        title={t('signup.password.continue')}
        onPress={handleContinue}
        size="lg"
        className="mb-3"
        loading={isLoading}
        disabled={isLoading}
      />

      {/* Back Button */}
      <TouchableOpacity
        onPress={onBack}
        className="items-center py-3"
        activeOpacity={0.7}
        disabled={isLoading}
      >
        <Text className="font-poppins-medium text-[15px] text-gray-600">{t('common.back')}</Text>
      </TouchableOpacity>
    </View>
  );
}

// Helper component for password requirements
function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <View className="mb-2 flex-row items-center">
      <View
        className={`mr-2 h-4 w-4 items-center justify-center rounded-full ${
          met ? 'bg-green-500' : 'bg-gray-300'
        }`}
      >
        {met && <Text className="font-poppins-bold text-[10px] text-white">✓</Text>}
      </View>
      <Text
        className={`font-poppins-regular text-[13px] ${met ? 'text-green-600' : 'text-gray-600'}`}
      >
        {text}
      </Text>
    </View>
  );
}
