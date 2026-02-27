import { SupportedLanguages } from './types';

export const forgotPassword = {
  // Phone Step
  phoneStep: {
    title: {
      en: 'Forgot Password?',
      fr: 'Mot de passe oublié?',
      rw: 'Wibagiwe ijambo ryibanga?',
    },
    subtitle: {
      en: "Enter your phone number and we'll send you an OTP to reset your password",
      fr: 'Entrez votre numéro de téléphone et nous vous enverrons un OTP pour réinitialiser votre mot de passe',
      rw: 'Andika numero ya telefoni yawe tuzakwohereza OTP kugirango usubize ijambo ryibanga',
    },
    phoneLabel: {
      en: 'Phone Number',
      fr: 'Numéro de téléphone',
      rw: 'Numero ya telefoni',
    },
    phonePlaceholder: {
      en: 'Enter your phone number',
      fr: 'Entrez votre numéro de téléphone',
      rw: 'Andika numero ya telefoni yawe',
    },
    sendOTP: {
      en: 'Send OTP',
      fr: 'Envoyer OTP',
      rw: 'Ohereza OTP',
    },
    backToLogin: {
      en: 'Back to Login',
      fr: 'Retour à la connexion',
      rw: 'Garuka kwinjira',
    },
  },

  // OTP Step
  otpStep: {
    title: {
      en: 'Enter OTP Code',
      fr: 'Entrez le code OTP',
      rw: 'Andika kode ya OTP',
    },
    subtitle: {
      en: "We've sent a 4-digit code to {{phoneNumber}}. Enter it below to continue",
      fr: 'Nous avons envoyé un code à 4 chiffres au {{phoneNumber}}. Entrez-le ci-dessous pour continuer',
      rw: "Twoherejwe kode y'imibare 4 kuri {{phoneNumber}}. Yandike hepfo kugirango ukomeze",
    },
    verifyOTP: {
      en: 'Verify OTP',
      fr: 'Vérifier OTP',
      rw: 'Emeza OTP',
    },
    didntReceive: {
      en: "Didn't receive the code?",
      fr: "Vous n'avez pas reçu le code?",
      rw: 'Ntiwakiriwe kode?',
    },
    resend: {
      en: 'Resend',
      fr: 'Renvoyer',
      rw: 'Ongera wohereze',
    },
  },

  // Password Step
  passwordStep: {
    title: {
      en: 'Create New Password',
      fr: 'Créer un nouveau mot de passe',
      rw: 'Kora ijambo ryibanga rishya',
    },
    subtitle: {
      en: 'Enter a new password for your account',
      fr: 'Entrez un nouveau mot de passe pour votre compte',
      rw: 'Andika ijambo ryibanga rishya rya konti yawe',
    },
    newPassword: {
      en: 'New Password',
      fr: 'Nouveau mot de passe',
      rw: 'Ijambo ryibanga rishya',
    },
    newPasswordPlaceholder: {
      en: 'Enter new password',
      fr: 'Entrez le nouveau mot de passe',
      rw: 'Andika ijambo ryibanga rishya',
    },
    confirmPassword: {
      en: 'Confirm Password',
      fr: 'Confirmer le mot de passe',
      rw: 'Emeza ijambo ryibanga',
    },
    confirmPasswordPlaceholder: {
      en: 'Re-enter new password',
      fr: 'Ressaisissez le nouveau mot de passe',
      rw: 'Ongera wandike ijambo ryibanga rishya',
    },
    resetPassword: {
      en: 'Reset Password',
      fr: 'Réinitialiser le mot de passe',
      rw: 'Subiza ijambo ryibanga',
    },
  },

  // Errors
  errors: {
    phoneRequired: {
      en: 'Phone number is required',
      fr: 'Le numéro de téléphone est requis',
      rw: 'Numero ya telefoni irakenewe',
    },
    phoneInvalid: {
      en: 'Enter valid Rwandan number (07XXXXXXXX - 10 digits)',
      fr: 'Entrez un numéro rwandais valide (07XXXXXXXX - 10 chiffres)',
      rw: "Andika numero y'u Rwanda nyayo (07XXXXXXXX - imibare 10)",
    },
    otpIncomplete: {
      en: 'Please enter the complete OTP code',
      fr: 'Veuillez entrer le code OTP complet',
      rw: 'Nyamuneka andika kode ya OTP yuzuye',
    },
    passwordRequired: {
      en: 'Password is required',
      fr: 'Le mot de passe est requis',
      rw: 'Ijambo ryibanga rirakenewe',
    },
    passwordTooShort: {
      en: 'Password must be at least 8 characters',
      fr: 'Le mot de passe doit contenir au moins 8 caractères',
      rw: 'Ijambo ryibanga rigomba kuba nibura inyuguti 8',
    },
    passwordWeak: {
      en: 'Password must contain uppercase, lowercase, and number',
      fr: 'Le mot de passe doit contenir majuscule, minuscule et chiffre',
      rw: "Ijambo ryibanga rigomba kugira inyuguti nkuru, ntoya, n'umubare",
    },
    confirmPasswordRequired: {
      en: 'Please confirm your password',
      fr: 'Veuillez confirmer votre mot de passe',
      rw: 'Nyamuneka emeza ijambo ryibanga ryawe',
    },
    passwordMismatch: {
      en: 'Passwords do not match',
      fr: 'Les mots de passe ne correspondent pas',
      rw: 'Amagambo yibanga ntabwo ahuye',
    },
  },

  // Toast
  toast: {
    otpSent: {
      en: 'OTP sent to your phone number',
      fr: 'OTP envoyé à votre numéro de téléphone',
      rw: 'OTP yoherejwe kuri numero ya telefoni yawe',
    },
    passwordReset: {
      en: 'Password reset successfully!',
      fr: 'Mot de passe réinitialisé avec succès!',
      rw: 'Ijambo ryibanga ryasubijwe neza!',
    },
  },
};
