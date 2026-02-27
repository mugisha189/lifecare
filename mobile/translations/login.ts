import { SupportedLanguages } from './types';

export const login: Record<string, Record<SupportedLanguages, string>> = {
  title: {
    en: 'Login',
    fr: 'Connexion',
    rw: 'Injira',
  },
  subtitle: {
    en: 'Fill in your credentials to continue',
    fr: 'Entrez vos identifiants',
    rw: 'Andika amakuru yawe',
  },
  phoneNumber: {
    en: 'Phone Number',
    fr: 'Téléphone',
    rw: 'Telefoni',
  },
  enterPhoneNumber: {
    en: 'Enter your phone number',
    fr: 'Entrez votre numéro',
    rw: 'Andika numero yawe',
  },
  emailOrPhone: {
    en: 'Email or Phone Number',
    fr: 'Email ou Téléphone',
    rw: 'Imeyili cyangwa Telefoni',
  },
  enterEmailOrPhone: {
    en: 'Enter your email or phone number',
    fr: 'Entrez votre email ou numéro',
    rw: 'Andika imeyili cyangwa numero yawe',
  },
  password: {
    en: 'Password',
    fr: 'Mot de passe',
    rw: 'Ijambobanga',
  },
  enterPassword: {
    en: 'Enter your password',
    fr: 'Entrez votre mot de passe',
    rw: 'Andika ijambobanga',
  },
  forgotPassword: {
    en: 'Forgot Password?',
    fr: 'Mot de passe oublié?',
    rw: 'Wibagiwe?',
  },
  signUp: {
    en: 'Sign Up',
    fr: "S'inscrire",
    rw: 'Iyandikishe',
  },
  noAccount: {
    en: "Don't have an account?",
    fr: 'Pas de compte?',
    rw: 'Nta konti ufite?',
  },
  success: {
    en: 'Login successful!',
    fr: 'Connexion réussie!',
    rw: 'Winjiriye neza!',
  },
};
