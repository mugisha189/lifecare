import { SupportedLanguages } from './types';

export const signup = {
  // User Details Step
  userDetails: {
    title: {
      en: 'Join LIFECARE today',
      fr: "Rejoignez LIFECARE aujourd'hui",
      rw: 'Injira muri LIFECARE uyu munsi',
    },
    subtitle: {
      en: 'Enter your phone number to create your LifeCare account',
      fr: 'Entrez votre numéro de téléphone pour créer votre compte LifeCare',
      rw: 'Andika numero ya telefoni yawe kugirango ukore konti ya LifeCare',
    },
    fullName: {
      en: 'Full Name',
      fr: 'Nom complet',
      rw: 'Amazina yuzuye',
    },
    fullNamePlaceholder: {
      en: 'Enter your full names',
      fr: 'Entrez votre nom complet',
      rw: 'Andika amazina yawe yuzuye',
    },
    email: {
      en: 'Email',
      fr: 'Email',
      rw: 'Imeli',
    },
    emailPlaceholder: {
      en: 'Enter your email',
      fr: 'Entrez votre email',
      rw: 'Andika imeli yawe',
    },
    phoneNumber: {
      en: 'Phone Number',
      fr: 'Numéro de téléphone',
      rw: 'Numero ya telefoni',
    },
    phoneNumberPlaceholder: {
      en: 'Enter your phone number',
      fr: 'Entrez votre numéro de téléphone',
      rw: 'Andika numero ya telefoni yawe',
    },
    gender: {
      en: 'Gender',
      fr: 'Genre',
      rw: 'Igitsina',
    },
    genderMale: {
      en: 'Male',
      fr: 'Homme',
      rw: 'Gabo',
    },
    genderFemale: {
      en: 'Female',
      fr: 'Femme',
      rw: 'Gore',
    },
    genderOther: {
      en: 'Other',
      fr: 'Autre',
      rw: 'Ikindi',
    },
    continue: {
      en: 'Continue',
      fr: 'Continuer',
      rw: 'Komeza',
    },
  },

  // Role Selection Step
  role: {
    title: {
      en: 'Choose Your Role',
      fr: 'Choisissez votre rôle',
      rw: 'Hitamo uruhare rwawe',
    },
    subtitle: {
      en: 'Select how you want to use LifeCare',
      fr: 'Sélectionnez comment vous souhaitez utiliser LifeCare',
      rw: 'Hitamo uburyo ushaka gukoresha LifeCare',
    },
    noRoles: {
      en: 'No roles available',
      fr: 'Aucun rôle disponible',
      rw: 'Nta ruhare ruhari',
    },
    contactSupport: {
      en: 'Please contact support',
      fr: 'Veuillez contacter le support',
      rw: 'Nyamuneka vugana na serivisi ifasha',
    },
  },

  // OTP Step
  otp: {
    title: {
      en: 'Enter OTP Code',
      fr: 'Entrez le code OTP',
      rw: 'Andika kode ya OTP',
    },
    subtitle: {
      en: 'We sent a 4-digit code to your phone number',
      fr: 'Nous avons envoyé un code à 4 chiffres à votre numéro de téléphone',
      rw: "Twoherejwe kode y'imibare 4 kuri numero ya telefoni yawe",
    },
    didntReceive: {
      en: "Didn't receive the code?",
      fr: "Vous n'avez pas reçu le code?",
      rw: 'Ntiwakiriwe kode?',
    },
    resendCode: {
      en: 'Resend Code',
      fr: 'Renvoyer le code',
      rw: 'Ongera wohereze kode',
    },
    resendIn: {
      en: 'Resend code in',
      fr: 'Renvoyer le code dans',
      rw: 'Ongera wohereze kode nyuma ya',
    },
    seconds: {
      en: 'seconds',
      fr: 'secondes',
      rw: 'amasegonda',
    },
    verify: {
      en: 'Verify',
      fr: 'Vérifier',
      rw: 'Emeza',
    },
    back: {
      en: 'Back',
      fr: 'Retour',
      rw: 'Subira inyuma',
    },
  },

  // Password Step
  password: {
    title: {
      en: 'Create Password',
      fr: 'Créer un mot de passe',
      rw: 'Kora ijambo ryibanga',
    },
    subtitle: {
      en: 'Create a strong password for your account',
      fr: 'Créez un mot de passe fort pour votre compte',
      rw: 'Kora ijambo ryibanga rikomeye rya konti yawe',
    },
    newPassword: {
      en: 'Password',
      fr: 'Mot de passe',
      rw: 'Ijambo ryibanga',
    },
    newPasswordPlaceholder: {
      en: 'Enter your password',
      fr: 'Entrez votre mot de passe',
      rw: 'Andika ijambo ryibanga ryawe',
    },
    confirmPassword: {
      en: 'Confirm Password',
      fr: 'Confirmer le mot de passe',
      rw: 'Emeza ijambo ryibanga',
    },
    confirmPasswordPlaceholder: {
      en: 'Re-enter your password',
      fr: 'Ressaisissez votre mot de passe',
      rw: 'Ongera wandike ijambo ryibanga',
    },
    strengthTitle: {
      en: 'Password must contain:',
      fr: 'Le mot de passe doit contenir:',
      rw: 'Ijambo ryibanga rigomba kugira:',
    },
    minLength: {
      en: 'At least 8 characters',
      fr: 'Au moins 8 caractères',
      rw: 'Nibura inyuguti 8',
    },
    uppercase: {
      en: 'One uppercase letter',
      fr: 'Une lettre majuscule',
      rw: 'Inyuguti nkuru imwe',
    },
    lowercase: {
      en: 'One lowercase letter',
      fr: 'Une lettre minuscule',
      rw: 'Inyuguti ntoya imwe',
    },
    number: {
      en: 'One number',
      fr: 'Un chiffre',
      rw: 'Umubare umwe',
    },
    specialChar: {
      en: 'One special character',
      fr: 'Un caractère spécial',
      rw: 'Ikimenyetso cyihariye kimwe',
    },
    terms: {
      en: 'By signing up, you agree to our',
      fr: 'En vous inscrivant, vous acceptez nos',
      rw: 'Mu kwiyandikisha, wemera',
    },
    termsLink: {
      en: 'Terms & Conditions',
      fr: 'Conditions générales',
      rw: "Amabwiriza n'amategeko",
    },
    privacyLink: {
      en: 'Privacy Policy',
      fr: 'Politique de confidentialité',
      rw: "Politiki y'ibanga",
    },
    continue: {
      en: 'Create Account',
      fr: 'Créer un compte',
      rw: 'Kora konti',
    },
    back: {
      en: 'Back',
      fr: 'Retour',
      rw: 'Subira inyuma',
    },
  },

  // Common
  progressText: {
    en: 'Step {{current}} of {{total}}',
    fr: 'Étape {{current}} sur {{total}}',
    rw: 'Intambwe {{current}} kuri {{total}}',
  },
  alreadyHaveAccount: {
    en: 'Already have an account?',
    fr: 'Vous avez déjà un compte?',
    rw: 'Usanzwe ufite konti?',
  },
  loginLink: {
    en: 'Login',
    fr: 'Se connecter',
    rw: 'Injira',
  },

  // Validation Errors
  errors: {
    fullNameRequired: {
      en: 'Full name is required',
      fr: 'Le nom complet est requis',
      rw: 'Amazina yuzuye arakenewe',
    },
    fullNameTooShort: {
      en: 'Full name must be at least 2 characters',
      fr: 'Le nom complet doit contenir au moins 2 caractères',
      rw: 'Amazina yuzuye agomba kuba nibura inyuguti 2',
    },
    emailRequired: {
      en: 'Email is required',
      fr: "L'email est requis",
      rw: 'Imeli irakenewe',
    },
    emailInvalid: {
      en: 'Please enter a valid email address',
      fr: 'Veuillez entrer une adresse email valide',
      rw: 'Nyamuneka andika aderesi ya imeli nyayo',
    },
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
    genderRequired: {
      en: 'Please select a gender',
      fr: 'Veuillez sélectionner un genre',
      rw: 'Nyamuneka hitamo igitsina',
    },
    roleRequired: {
      en: 'Please select your role',
      fr: 'Veuillez sélectionner votre rôle',
      rw: 'Nyamuneka hitamo uruhare rwawe',
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
      en: 'Password must meet all requirements',
      fr: 'Le mot de passe doit répondre à toutes les exigences',
      rw: 'Ijambo ryibanga rigomba kuzuza ibisabwa byose',
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
    termsRequired: {
      en: 'You must agree to the terms and conditions',
      fr: 'Vous devez accepter les termes et conditions',
      rw: "Ugomba kwemera amabwiriza n'amategeko",
    },
  },

  // Success
  success: {
    en: 'Account created successfully!',
    fr: 'Compte créé avec succès!',
    rw: 'Konti yaremwe neza!',
  },
};
