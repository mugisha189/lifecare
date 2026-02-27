import { SupportedLanguages } from './types';

export const vehicleOwnership: Record<string, Record<SupportedLanguages, string>> = {
  title: {
    en: 'Do you own a vehicle?',
    fr: 'Possédez-vous un véhicule?',
    rw: 'Ufite imodoka?',
  },
  subtitle: {
    en: 'To have a better personalized experience with your app, please answer the following questions.',
    fr: 'Pour avoir une meilleure expérience personnalisée avec votre application, veuillez répondre aux questions suivantes.',
    rw: 'Kugira ngo ubone uburambe bwiza bwo gukoresha porogaramu, nyamuneka subiza ibibazo bikurikira.',
  },
  yesOption: {
    en: 'Yes, I do',
    fr: 'Oui',
    rw: 'Yego, mfite',
  },
  noOption: {
    en: "No, I don't",
    fr: 'Non',
    rw: 'Oya, simfite',
  },
  continueButton: {
    en: 'Continue',
    fr: 'Continuer',
    rw: 'Komeza',
  },
};
