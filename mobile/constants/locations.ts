/**
 * Location Constants
 * Centralized location data for the application
 */

export const COUNTRIES = {
  RWANDA: 'Rwanda',
} as const;

/**
 * Cities in Kigali, Rwanda
 * Source: Districts of Kigali City
 */
export const KIGALI_CITIES = ['Gasabo', 'Kicukiro', 'Nyarugenge'] as const;

/**
 * Default country for the application
 */
export const DEFAULT_COUNTRY = COUNTRIES.RWANDA;

/**
 * Get all available cities
 */
export const getAllCities = () => KIGALI_CITIES;

/**
 * City type
 */
export type City = (typeof KIGALI_CITIES)[number];
