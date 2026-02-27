import { SupportedLanguages } from './types';

export const languageSelection: Record<string, Record<SupportedLanguages, string>> = {
  welcome: {
    en: 'Welcome to LifeCare',
    fr: 'Bienvenue sur LifeCare',
    rw: 'Murakaza neza LifeCare',
  },
  selectLanguage: {
    en: 'Choose your language',
    fr: 'Choisissez votre langue',
    rw: 'Hitamo ururimi',
  },
  kinyarwanda: {
    en: 'Kinyarwanda',
    fr: 'Kinyarwanda',
    rw: 'Ikinyarwanda',
  },
  english: {
    en: 'English',
    fr: 'Anglais',
    rw: 'Icyongereza',
  },
  french: {
    en: 'French',
    fr: 'Français',
    rw: 'Igifaransa',
  },
};
