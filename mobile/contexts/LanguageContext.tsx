import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SupportedLanguages, translations } from '../translations';

const LANGUAGE_KEY = '@lifecare_language';
const DEFAULT_LANGUAGE: SupportedLanguages = 'en';

// Helper type to get nested value from object using dot notation
type NestedValue<T, K extends string> = K extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? T[Key] extends object
      ? NestedValue<T[Key], Rest>
      : never
    : never
  : K extends keyof T
    ? T[K]
    : never;

// Type for translation keys
type TranslationKey =
  | 'common.next'
  | 'common.skip'
  | 'common.getStarted'
  | 'common.back'
  | 'common.cancel'
  | 'common.save'
  | 'common.done'
  | 'common.loading'
  | 'common.error'
  | 'languageSelection.welcome'
  | 'languageSelection.selectLanguage'
  | 'languageSelection.kinyarwanda'
  | 'languageSelection.english'
  | 'languageSelection.french'
  | 'onboarding.slide1.title'
  | 'onboarding.slide1.description'
  | 'onboarding.slide1.overlay'
  | 'onboarding.slide2.title'
  | 'onboarding.slide2.description'
  | 'onboarding.slide2.overlay'
  | 'onboarding.slide3.title'
  | 'onboarding.slide3.description'
  | 'onboarding.slide3.overlay'
  | 'login.title'
  | 'login.subtitle'
  | 'login.phoneNumber'
  | 'login.enterPhoneNumber'
  | 'login.emailOrPhone'
  | 'login.enterEmailOrPhone'
  | 'login.password'
  | 'login.enterPassword'
  | 'login.forgotPassword'
  | 'login.signUp'
  | 'login.noAccount'
  | 'login.success'
  | 'signup.userDetails.title'
  | 'signup.userDetails.subtitle'
  | 'signup.userDetails.fullName'
  | 'signup.userDetails.fullNamePlaceholder'
  | 'signup.userDetails.email'
  | 'signup.userDetails.emailPlaceholder'
  | 'signup.userDetails.phoneNumber'
  | 'signup.userDetails.phoneNumberPlaceholder'
  | 'signup.userDetails.gender'
  | 'signup.userDetails.genderMale'
  | 'signup.userDetails.genderFemale'
  | 'signup.userDetails.genderOther'
  | 'signup.userDetails.continue'
  | 'signup.otp.title'
  | 'signup.otp.subtitle'
  | 'signup.otp.didntReceive'
  | 'signup.otp.resendCode'
  | 'signup.otp.resendIn'
  | 'signup.otp.seconds'
  | 'signup.otp.verify'
  | 'signup.otp.back'
  | 'signup.password.title'
  | 'signup.password.subtitle'
  | 'signup.password.newPassword'
  | 'signup.password.newPasswordPlaceholder'
  | 'signup.password.confirmPassword'
  | 'signup.password.confirmPasswordPlaceholder'
  | 'signup.password.strengthTitle'
  | 'signup.password.minLength'
  | 'signup.password.uppercase'
  | 'signup.password.lowercase'
  | 'signup.password.number'
  | 'signup.password.specialChar'
  | 'signup.password.terms'
  | 'signup.password.termsLink'
  | 'signup.password.privacyLink'
  | 'signup.password.continue'
  | 'signup.password.back'
  | 'signup.progressText'
  | 'signup.alreadyHaveAccount'
  | 'signup.loginLink'
  | 'signup.errors.fullNameRequired'
  | 'signup.errors.fullNameTooShort'
  | 'signup.errors.emailRequired'
  | 'signup.errors.emailInvalid'
  | 'signup.errors.phoneRequired'
  | 'signup.errors.phoneInvalid'
  | 'signup.errors.genderRequired'
  | 'signup.errors.otpIncomplete'
  | 'signup.errors.passwordRequired'
  | 'signup.errors.passwordTooShort'
  | 'signup.errors.passwordWeak'
  | 'signup.errors.confirmPasswordRequired'
  | 'signup.errors.passwordMismatch'
  | 'signup.errors.termsRequired'
  | 'signup.success'
  | 'vehicleOwnership.title'
  | 'vehicleOwnership.subtitle'
  | 'vehicleOwnership.yesOption'
  | 'vehicleOwnership.noOption'
  | 'vehicleOwnership.continueButton'
  | 'vehicleRegistration.progressText'
  | 'vehicleRegistration.steps.governmentID'
  | 'vehicleRegistration.steps.drivingLicense'
  | 'vehicleRegistration.steps.yelloCard'
  | 'vehicleRegistration.steps.vehicleImage'
  | 'vehicleRegistration.steps.vehicleInformation'
  | 'vehicleRegistration.steps.review'
  | 'vehicleRegistration.steps.success'
  | 'vehicleRegistration.stepIndicator'
  | 'vehicleRegistration.documentUpload.requirements.noPhotocopies'
  | 'vehicleRegistration.documentUpload.requirements.clearDetails'
  | 'vehicleRegistration.documentUpload.requirements.fileFormat'
  | 'vehicleRegistration.documentUpload.labels.governmentID'
  | 'vehicleRegistration.documentUpload.labels.drivingLicense'
  | 'vehicleRegistration.documentUpload.labels.yelloCard'
  | 'vehicleRegistration.documentUpload.labels.vehicleImage'
  | 'vehicleRegistration.documentUpload.chooseGallery'
  | 'vehicleRegistration.documentUpload.chooseGalleryHint'
  | 'vehicleRegistration.documentUpload.browseFiles'
  | 'vehicleRegistration.documentUpload.browseFilesHint'
  | 'vehicleRegistration.documentUpload.uploaded'
  | 'vehicleRegistration.documentUpload.continueHint'
  | 'vehicleRegistration.documentUpload.reupload'
  | 'vehicleRegistration.documentUpload.continue'
  | 'vehicleRegistration.documentUpload.back'
  | 'vehicleRegistration.vehicleInfo.subtitle'
  | 'vehicleRegistration.vehicleInfo.make'
  | 'vehicleRegistration.vehicleInfo.capacity'
  | 'vehicleRegistration.vehicleInfo.year'
  | 'vehicleRegistration.vehicleInfo.color'
  | 'vehicleRegistration.vehicleInfo.category'
  | 'vehicleRegistration.vehicleInfo.plateNumber'
  | 'vehicleRegistration.vehicleInfo.plateNumberPlaceholder'
  | 'vehicleRegistration.vehicleInfo.continue'
  | 'vehicleRegistration.review.question'
  | 'vehicleRegistration.review.documents'
  | 'vehicleRegistration.review.edit'
  | 'vehicleRegistration.review.nationalID'
  | 'vehicleRegistration.review.drivingLicense'
  | 'vehicleRegistration.review.vehicleImage'
  | 'vehicleRegistration.review.vehicleInformation'
  | 'vehicleRegistration.review.plateNumber'
  | 'vehicleRegistration.review.vehicleCategory'
  | 'vehicleRegistration.review.vehicleMake'
  | 'vehicleRegistration.review.vehicleCapacity'
  | 'vehicleRegistration.review.vehicleColor'
  | 'vehicleRegistration.review.warningMessage'
  | 'vehicleRegistration.review.submit'
  | 'vehicleRegistration.success.title'
  | 'vehicleRegistration.success.message'
  | 'vehicleRegistration.success.additionalInfo'
  | 'vehicleRegistration.success.exploreApp'
  | 'vehicleRegistration.errors.makeRequired'
  | 'vehicleRegistration.errors.capacityRequired'
  | 'vehicleRegistration.errors.yearRequired'
  | 'vehicleRegistration.errors.colorRequired'
  | 'vehicleRegistration.errors.categoryRequired'
  | 'vehicleRegistration.errors.plateNumberRequired'
  | 'vehicleRegistration.toast.submitSuccess'
  | 'vehicleRegistration.toast.submitError'
  | 'forgotPassword.phoneStep.title'
  | 'forgotPassword.phoneStep.subtitle'
  | 'forgotPassword.phoneStep.phoneLabel'
  | 'forgotPassword.phoneStep.phonePlaceholder'
  | 'forgotPassword.phoneStep.sendOTP'
  | 'forgotPassword.phoneStep.backToLogin'
  | 'forgotPassword.otpStep.title'
  | 'forgotPassword.otpStep.subtitle'
  | 'forgotPassword.otpStep.verifyOTP'
  | 'forgotPassword.otpStep.didntReceive'
  | 'forgotPassword.otpStep.resend'
  | 'forgotPassword.passwordStep.title'
  | 'forgotPassword.passwordStep.subtitle'
  | 'forgotPassword.passwordStep.newPassword'
  | 'forgotPassword.passwordStep.newPasswordPlaceholder'
  | 'forgotPassword.passwordStep.confirmPassword'
  | 'forgotPassword.passwordStep.confirmPasswordPlaceholder'
  | 'forgotPassword.passwordStep.resetPassword'
  | 'forgotPassword.errors.phoneRequired'
  | 'forgotPassword.errors.phoneInvalid'
  | 'forgotPassword.errors.otpIncomplete'
  | 'forgotPassword.errors.passwordRequired'
  | 'forgotPassword.errors.passwordTooShort'
  | 'forgotPassword.errors.passwordWeak'
  | 'forgotPassword.errors.confirmPasswordRequired'
  | 'forgotPassword.errors.passwordMismatch'
  | 'forgotPassword.toast.otpSent'
  | 'forgotPassword.toast.passwordReset';

interface LanguageContextType {
  language: SupportedLanguages;
  setLanguage: (lang: SupportedLanguages) => Promise<void>;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper function to get nested value from object using dot notation
function getNestedValue(obj: any, path: string): any {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current == null) return undefined;
    current = current[key];
  }
  return current;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguages>(DEFAULT_LANGUAGE);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (
        savedLanguage &&
        (savedLanguage === 'en' || savedLanguage === 'fr' || savedLanguage === 'rw')
      ) {
        setLanguageState(savedLanguage as SupportedLanguages);
      }
    } catch (error) {
      console.error('Error loading language:', error);
      // Fallback: continue with default language
    }
  };

  const setLanguage = async (lang: SupportedLanguages) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language:', error);
      // Still update state even if storage fails
      setLanguageState(lang);
    }
  };

  const t = (key: TranslationKey): string => {
    try {
      const value = getNestedValue(translations, key);

      if (value && typeof value === 'object') {
        // Check if it's a translation object with language keys
        if (language in value) {
          return value[language] || value[DEFAULT_LANGUAGE] || key;
        }
        // If not, it might be a nested object, return key as fallback
        console.warn(
          'Translation found but no language key for:',
          key,
          'Available keys:',
          Object.keys(value)
        );
        return key;
      }

      if (typeof value === 'string') {
        return value;
      }

      console.warn('Translation not found for key:', key);
      return key;
    } catch (error) {
      console.error('Translation error for key:', key, error);
      return key;
    }
  };

  // Always render the provider, even during loading
  // This ensures children can access the context immediately
  // Default language will be used until saved language loads
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
