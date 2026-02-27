/**
 * Jotai Store - Central state management
 *
 * This file exports all atoms and utilities for state management.
 * Organized by domain for better maintainability.
 *
 * @see https://jotai.org/docs/introduction
 */

// Storage utilities
export { asyncStorage, STORAGE_KEYS } from './storage';

// Types
export type {
  IUser,
  IRole,
  IDriverRecord,
  IAccountSwitch,
  IJourney,
  IRiderJourney,
  ICoordinates,
  ILocationDetails,
  ISignupStep,
  IAuthState,
} from './types';

// Language atoms
export { languageAtom, translateAtom, isLanguageLoadingAtom } from './languageAtoms';

// Auth atoms
export {
  userAtom,
  authTokenAtom,
  defaultRoleAtom,
  isAuthenticatedAtom,
  currentRoleAtom,
  isDriverAtom,
  isRiderAtom,
  authLoadingAtom,
  passwordSetCodeAtom,
  signupStepsAtom,
  signinStepsAtom,
  logoutAtom,
} from './authAtoms';

// Onboarding atoms
export {
  showIntroScreenAtom,
  onboardingCompletedAtom,
  currentOnboardingSlideAtom,
  homeCurrentSlideAtom,
  homeStartSlideAtom,
  isOnboardingInProgressAtom,
  completeOnboardingAtom,
  resetOnboardingAtom,
} from './onboardingAtoms';

// Journey atoms
export {
  newJourneyAtom,
  fromLocationAtom,
  toLocationAtom,
  foundRidesAtom,
  activeJourneyAtom,
  journeyHistoryAtom,
  isCreatingJourneyAtom,
  hasValidLocationsAtom,
  resetJourneyAtom,
  updateJourneyLocationAtom,
  scheduleJourneyAtom,
} from './journeyAtoms';
