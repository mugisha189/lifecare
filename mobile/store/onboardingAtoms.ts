import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { asyncStorage, STORAGE_KEYS } from './storage';

/**
 * Show intro screen atom with AsyncStorage persistence
 * Tracks whether the user should see the intro/onboarding screens
 * Can be: true (show), false (don't show), or 'loading' (initial state)
 */
export const showIntroScreenAtom = atomWithStorage<boolean | 'loading'>(
  STORAGE_KEYS.SHOW_INTRO,
  'loading',
  asyncStorage
);

/**
 * Onboarding completed atom with AsyncStorage persistence
 * Tracks if user has completed the onboarding flow
 */
export const onboardingCompletedAtom = atomWithStorage<boolean>(
  STORAGE_KEYS.ONBOARDING_COMPLETED,
  false,
  asyncStorage
);

/**
 * Current onboarding slide atom
 * Tracks which slide the user is currently viewing
 * Not persisted - resets on app restart
 */
export const currentOnboardingSlideAtom = atom<number>(0);

/**
 * Home screen current slide atom
 * Tracks the current slide on the home screen
 */
export const homeCurrentSlideAtom = atom<number>(0);

/**
 * Home screen start slide atom
 * Tracks where the user started on home screen
 */
export const homeStartSlideAtom = atom<string>('');

/**
 * Derived atom to check if onboarding is in progress
 */
export const isOnboardingInProgressAtom = atom(get => {
  const showIntro = get(showIntroScreenAtom);
  const completed = get(onboardingCompletedAtom);
  return showIntro === true && !completed;
});

/**
 * Write-only atom to complete onboarding
 * Sets all relevant flags when onboarding is finished
 */
export const completeOnboardingAtom = atom(null, (get, set) => {
  set(onboardingCompletedAtom, true);
  set(showIntroScreenAtom, false);
  set(currentOnboardingSlideAtom, 0);
});

/**
 * Write-only atom to reset onboarding
 * Useful for testing or allowing users to replay onboarding
 */
export const resetOnboardingAtom = atom(null, (get, set) => {
  set(onboardingCompletedAtom, false);
  set(showIntroScreenAtom, true);
  set(currentOnboardingSlideAtom, 0);
});
