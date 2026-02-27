import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { IUser } from './types';
import { asyncStorage, STORAGE_KEYS } from './storage';

/**
 * User atom with AsyncStorage persistence
 * Stores the current user data
 */
export const userAtom = atomWithStorage<IUser | null>(STORAGE_KEYS.USER, null, asyncStorage);

/**
 * Auth token atom with AsyncStorage persistence
 * Stores the authentication token
 */
export const authTokenAtom = atomWithStorage<string | null>(
  STORAGE_KEYS.AUTH_TOKEN,
  null,
  asyncStorage
);

/**
 * Default role atom with AsyncStorage persistence
 * Stores the user's default role preference
 */
export const defaultRoleAtom = atomWithStorage<number | null>(
  STORAGE_KEYS.DEFAULT_ROLE,
  null,
  asyncStorage
);

/**
 * Derived atom to check if user is authenticated
 * Returns true if both user and token exist
 */
export const isAuthenticatedAtom = atom(async get => {
  const user = await get(userAtom);
  const token = await get(authTokenAtom);
  return !!(user && token);
});

/**
 * Derived atom to get current user's role
 * Returns the role information from the user object
 */
export const currentRoleAtom = atom(async get => {
  const user = await get(userAtom);
  if (!user) return null;
  return {
    roleId: user.roleId,
    roleName: user.currentRole?.name || 'unknown',
    role: user.currentRole,
  };
});

/**
 * Derived atom to check if user is a driver
 */
export const isDriverAtom = atom(async get => {
  const role = await get(currentRoleAtom);
  return role?.roleName?.toLowerCase() === 'driver';
});

/**
 * Derived atom to check if user is a rider
 */
export const isRiderAtom = atom(async get => {
  const role = await get(currentRoleAtom);
  return role?.roleName?.toLowerCase() === 'rider';
});

/**
 * Auth loading state atom
 * Used to track authentication operations in progress
 */
export const authLoadingAtom = atom<boolean>(false);

/**
 * Password set code atom (for password reset flow)
 * Temporary state, not persisted
 */
export const passwordSetCodeAtom = atom<string>('');

/**
 * Login/Signup steps tracking
 */
export const signupStepsAtom = atom([
  { step: 0, completed: false },
  { step: 1, completed: false },
  { step: 2, completed: false },
  { step: 3, completed: false },
]);

export const signinStepsAtom = atom([
  { step: 0, completed: false },
  { step: 1, completed: false },
]);

/**
 * Write-only atom to logout user
 * Clears all auth-related data from storage
 */
export const logoutAtom = atom(null, async (get, set) => {
  set(userAtom, null);
  set(authTokenAtom, null);
  set(defaultRoleAtom, null);
  set(authLoadingAtom, false);
});
