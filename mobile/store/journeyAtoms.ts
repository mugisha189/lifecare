import { atom } from 'jotai';
import { IJourney, IRiderJourney } from './types';

/**
 * Default journey state
 */
const DEFAULT_JOURNEY: IJourney = {
  from: '',
  to: '',
  locationDetails: undefined,
  passengers: 1,
  pickupTime: null,
  isScheduled: false,
  price: 0,
  distance: 0,
  duration: 0,
};

/**
 * New journey atom
 * Stores the current journey being created by the user
 * Can be either a basic journey or a rider journey with additional preferences
 */
export const newJourneyAtom = atom<IJourney | IRiderJourney>(DEFAULT_JOURNEY);

/**
 * From location atom
 * Stores the departure location string
 */
export const fromLocationAtom = atom<string>('');

/**
 * To location atom
 * Stores the destination location string
 */
export const toLocationAtom = atom<string>('');

/**
 * Found rides atom
 * Stores the list of available rides found for the user's search
 */
export const foundRidesAtom = atom<any[]>([]);

/**
 * Active journey atom
 * Stores the journey that is currently in progress
 */
export const activeJourneyAtom = atom<IJourney | null>(null);

/**
 * Journey history atom
 * Stores the user's past journeys
 * Note: In production, this should be fetched from the backend
 */
export const journeyHistoryAtom = atom<IJourney[]>([]);

/**
 * Derived atom to check if a journey is being created
 */
export const isCreatingJourneyAtom = atom(get => {
  const journey = get(newJourneyAtom);
  return !!(journey.from || journey.to);
});

/**
 * Derived atom to check if journey has valid locations
 */
export const hasValidLocationsAtom = atom(get => {
  const journey = get(newJourneyAtom);
  return !!(journey.from && journey.to);
});

/**
 * Write-only atom to reset journey
 * Clears all journey-related data
 */
export const resetJourneyAtom = atom(null, (get, set) => {
  set(newJourneyAtom, DEFAULT_JOURNEY);
  set(fromLocationAtom, '');
  set(toLocationAtom, '');
  set(foundRidesAtom, []);
});

/**
 * Write-only atom to update journey location
 * Updates both the journey object and the individual location atoms
 */
export const updateJourneyLocationAtom = atom(
  null,
  (get, set, update: { from?: string; to?: string }) => {
    const currentJourney = get(newJourneyAtom);

    if (update.from !== undefined) {
      set(fromLocationAtom, update.from);
      set(newJourneyAtom, { ...currentJourney, from: update.from });
    }

    if (update.to !== undefined) {
      set(toLocationAtom, update.to);
      set(newJourneyAtom, { ...currentJourney, to: update.to });
    }
  }
);

/**
 * Write-only atom to set journey as scheduled
 * Updates the journey with scheduling information
 */
export const scheduleJourneyAtom = atom(null, (get, set, pickupTime: Date | null) => {
  const currentJourney = get(newJourneyAtom);
  set(newJourneyAtom, {
    ...currentJourney,
    pickupTime,
    isScheduled: !!pickupTime,
  });
});
