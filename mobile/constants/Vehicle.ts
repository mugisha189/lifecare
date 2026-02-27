/**
 * Vehicle Constants
 * Configuration for vehicle makes, capacities, years, colors, and categories
 */

const CURRENT_YEAR = new Date().getFullYear();
const YEARS_RANGE = 25; // Show vehicles from the last 25 years

export const VehicleConfig = {
  // Vehicle Makes/Manufacturers
  MAKES: ['Toyota', 'Honda', 'Hyundai', 'Nissan', 'Suzuki', 'Other'] as string[],

  // Vehicle Seating Capacities
  CAPACITIES: ['2 seats', '4 seats', '5 seats', '7 seats', '8 seats', '10+ seats'] as string[],

  // Vehicle Years (dynamically generated for the last 25 years)
  YEARS: Array.from({ length: YEARS_RANGE }, (_, i) => (CURRENT_YEAR - i).toString()) as string[],

  // Vehicle Colors
  COLORS: ['White', 'Black', 'Silver', 'Gray', 'Red', 'Blue', 'Other'] as string[],

  // Vehicle Categories/Classes
  CATEGORIES: ['Basic', 'Standard', 'Premium', 'Luxury'] as string[],
};

export default VehicleConfig;
