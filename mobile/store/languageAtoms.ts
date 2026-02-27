import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { SupportedLanguages, translations } from '../translations';
import { asyncStorage, STORAGE_KEYS } from './storage';

/**
 * Default language constant
 */
const DEFAULT_LANGUAGE: SupportedLanguages = 'en';

/**
 * Language atom with AsyncStorage persistence
 * Automatically syncs language preference to device storage
 */
export const languageAtom = atomWithStorage<SupportedLanguages>(
  STORAGE_KEYS.LANGUAGE,
  DEFAULT_LANGUAGE,
  asyncStorage
);

/**
 * Helper function to get nested value from object using dot notation
 * Example: getNestedValue(obj, 'common.next') -> obj.common.next
 */
function getNestedValue(obj: any, path: string): any {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current == null) return undefined;
    current = current[key];
  }
  return current;
}

/**
 * Translation function atom
 * Provides a function to translate keys based on current language
 *
 * Usage:
 * const t = useAtomValue(translateAtom);
 * const text = t('common.next');
 */
export const translateAtom = atom(async get => {
  const currentLanguage = await get(languageAtom);

  return (key: string): string => {
    try {
      const value = getNestedValue(translations, key);
      if (value && typeof value === 'object') {
        // Check if it's a translation object with language keys
        if (currentLanguage in value) {
          return value[currentLanguage] || value[DEFAULT_LANGUAGE] || key;
        }
        // If not, it might be a nested object, return key as fallback
        return key;
      }
      // If value is a string, return it directly
      if (typeof value === 'string') {
        return value;
      }
      return key;
    } catch (error) {
      console.error('Translation error for key:', key, error);
      return key;
    }
  };
});

/**
 * Derived atom to check if language is loading
 */
export const isLanguageLoadingAtom = atom<boolean>(false);
