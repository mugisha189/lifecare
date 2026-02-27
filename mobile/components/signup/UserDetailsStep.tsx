import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import type { SignupFormData } from '@/app/signup';
import { useLanguage } from '@/contexts/LanguageContext';
import { DEFAULT_COUNTRY, KIGALI_CITIES } from '@/constants/locations';

interface UserDetailsStepProps {
  formData: SignupFormData;
  updateFormData: (data: Partial<SignupFormData>) => void;
  onNext: () => void;
}

export default function UserDetailsStep({
  formData,
  updateFormData,
  onNext,
}: UserDetailsStepProps) {
  const { t } = useLanguage();
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    city: '',
  });

  // Set default country to Rwanda
  React.useEffect(() => {
    if (!formData.country) {
      updateFormData({ country: DEFAULT_COUNTRY });
    }
  }, []);

  const genderOptions = [
    { value: 'Male', label: t('signup.userDetails.genderMale') },
    { value: 'Female', label: t('signup.userDetails.genderFemale') },
    { value: 'Other', label: t('signup.userDetails.genderOther') },
  ];

  const validateForm = () => {
    const newErrors = {
      fullName: '',
      email: '',
      phoneNumber: '',
      gender: '',
      city: '',
    };

    if (!formData.fullName.trim()) {
      newErrors.fullName = t('signup.errors.fullNameRequired');
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = t('signup.errors.fullNameTooShort');
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email.trim()) {
      newErrors.email = t('signup.errors.emailRequired');
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = t('signup.errors.emailInvalid');
    }

    const phoneRegex = /^07[0-9]{8}$/;
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = t('signup.errors.phoneRequired');
    } else if (!phoneRegex.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = t('signup.errors.phoneInvalid');
    }

    if (!formData.gender) {
      newErrors.gender = t('signup.errors.genderRequired');
    }

    if (!formData.city) {
      newErrors.city = 'Please select your city';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <View>
      {/* Header */}
      <View className="mb-8">
        <Text className="font-poppins-bold text-[22px] text-gray-900">
          {t('signup.userDetails.title')}
        </Text>
        <Text className="mt-2 font-poppins-regular text-[14px] text-gray-600">
          {t('signup.userDetails.subtitle')}
        </Text>
      </View>

      {/* Full Name Input */}
      <Input
        label={t('signup.userDetails.fullName')}
        placeholder={t('signup.userDetails.fullNamePlaceholder')}
        value={formData.fullName}
        onChangeText={text => {
          updateFormData({ fullName: text });
          if (errors.fullName) setErrors({ ...errors, fullName: '' });
        }}
        error={errors.fullName}
        autoCapitalize="words"
        variant="outlined"
      />

      {/* Email Input */}
      <Input
        label={t('signup.userDetails.email')}
        placeholder={t('signup.userDetails.emailPlaceholder')}
        value={formData.email}
        onChangeText={text => {
          updateFormData({ email: text });
          if (errors.email) setErrors({ ...errors, email: '' });
        }}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        variant="outlined"
      />

      {/* Phone Number Input */}
      <Input
        label={t('signup.userDetails.phoneNumber')}
        placeholder={t('signup.userDetails.phoneNumberPlaceholder')}
        value={formData.phoneNumber}
        onChangeText={text => {
          updateFormData({ phoneNumber: text });
          if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: '' });
        }}
        error={errors.phoneNumber}
        keyboardType="phone-pad"
        leftIcon="call-outline"
        variant="outlined"
      />

      {/* Gender Selection */}
      <View className="mb-4">
        <Text className="mb-2 font-poppins-medium text-[13px] text-gray-700">
          {t('signup.userDetails.gender')}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {genderOptions.map(option => (
            <TouchableOpacity
              key={option.value}
              onPress={() => {
                updateFormData({ gender: option.value });
                if (errors.gender) setErrors({ ...errors, gender: '' });
              }}
              className={`rounded-xl border px-4 py-2 ${
                formData.gender === option.value
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-300 bg-white'
              }`}
            >
              <Text
                className={`font-poppins-medium text-[14px] ${
                  formData.gender === option.value ? 'text-primary' : 'text-gray-700'
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.gender ? (
          <Text className="mt-1 font-poppins-regular text-[12px] text-red-500">
            {errors.gender}
          </Text>
        ) : null}
      </View>

      {/* Country Display (Read-only) */}
      <View className="mb-4">
        <Text className="mb-2 font-poppins-medium text-[13px] text-gray-700">Country</Text>
        <View className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3">
          <Text className="font-poppins-medium text-[14px] text-gray-700">{DEFAULT_COUNTRY}</Text>
        </View>
      </View>

      {/* City Dropdown */}
      <Dropdown
        label="City"
        value={formData.city}
        options={[...KIGALI_CITIES]}
        onSelect={city => {
          updateFormData({ city });
          if (errors.city) setErrors({ ...errors, city: '' });
        }}
        placeholder="Select your city"
        error={errors.city}
      />

      {/* Continue Button */}
      <Button
        title={t('signup.userDetails.continue')}
        onPress={handleNext}
        className="mb-4"
        size="lg"
      />
    </View>
  );
}
