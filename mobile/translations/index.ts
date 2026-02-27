import { SupportedLanguages } from './types';
import { common } from './common';
import { languageSelection } from './languageSelection';
import { onboarding } from './onboarding';
import { login } from './login';
import { signup } from './signup';
import { vehicleOwnership } from './vehicleOwnership';
import { vehicleRegistration } from './vehicleRegistration';
import { forgotPassword } from './forgotPassword';
import { homeTranslations } from './home';

// Merge all translation namespaces
export const translations = {
  common,
  languageSelection,
  onboarding,
  login,
  signup,
  vehicleOwnership,
  vehicleRegistration,
  forgotPassword,
  home: homeTranslations,
} as const;

// Export types
export type { SupportedLanguages, TranslationKey } from './types';
export type Translations = typeof translations;
