import { SupportedLanguages } from './types';

export const onboarding = {
  slide1: {
    title: {
      en: 'Find a Ride Easily',
      fr: 'Trouvez un trajet',
      rw: 'Shaka imodoka',
    },
    description: {
      en: 'Book a ride in seconds and reach your destination safely',
      fr: 'Réservez en quelques secondes',
      rw: 'Fatira mu masegonda',
    },
    overlay: {
      en: 'Book in seconds and get going!',
      fr: 'Réservez en secondes et partez!',
      rw: 'Fatira mu masegonda ujye!',
    },
  },
  slide2: {
    title: {
      en: 'Drive & Earn Money',
      fr: 'Conduisez et gagnez',
      rw: 'Koresha wongere',
    },
    description: {
      en: 'Join as a driver and earn money with flexible hours',
      fr: 'Devenez chauffeur et gagnez',
      rw: "Kora nk'umushoferi",
    },
    overlay: {
      en: 'Get notified of nearby ride requests instantly.',
      fr: 'Recevez des notifications instantanées.',
      rw: 'Kirabira ibyo usaba byihuse.',
    },
  },
  slide3: {
    title: {
      en: 'Secure & Fast Payments',
      fr: 'Paiements sécurisés',
      rw: 'Kwishyura neza',
    },
    description: {
      en: 'Pay with Mobile Money, Cash, or Card—no hassle',
      fr: 'Payez par Mobile Money, espèces ou carte',
      rw: 'Kwishyura ukoresheje telefoni, amafaranga cyangwa ikarita',
    },
    overlay: {
      en: 'Pay seamlessly with your preferred method',
      fr: 'Payez facilement avec votre méthode préférée',
      rw: 'Kwishyura neza ukoresheje uburyo wihitiye',
    },
  },
} as const;
