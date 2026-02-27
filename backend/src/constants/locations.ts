/**
 * Location Constants
 * Centralized location data for the backend
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
export const getAllCities = () => [...KIGALI_CITIES];

/**
 * Validate if a city is in the list
 */
export const isValidCity = (city: string): boolean => {
  return KIGALI_CITIES.includes(city as any);
};

/**
 * Validate if a country is in the list
 */
export const isValidCountry = (country: string): boolean => {
  return Object.values(COUNTRIES).includes(country as any);
};
