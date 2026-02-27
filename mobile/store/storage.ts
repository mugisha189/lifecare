import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'jotai/utils';

/**
 * Custom AsyncStorage adapter for Jotai
 * Provides type-safe storage operations with AsyncStorage
 */
export const asyncStorage = createJSONStorage<any>(() => ({
  getItem: async (key: string) => {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },
  setItem: async (key: string, value: any) => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  removeItem: async (key: string) => {
    await AsyncStorage.removeItem(key);
  },
}));

/**
 * Storage keys used throughout the app
 * Centralized to avoid typos and make refactoring easier
 */
export const STORAGE_KEYS = {
  LANGUAGE: '@lifecare_language',
  USER: '@lifecare_user',
  AUTH_TOKEN: '@lifecare_auth_token',
  DEFAULT_ROLE: '@lifecare_default_role',
  SHOW_INTRO: '@lifecare_show_intro',
  ONBOARDING_COMPLETED: '@lifecare_onboarding_completed',
} as const;
