import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind CSS classes
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Get current network status
export const getNetworkStatus = (): boolean => {
  return window.navigator.onLine;
};

// Log errors (can be extended for error reporting services)
export const logError = (error: unknown, context?: string): void => {
  if (error instanceof Error) {
    console.error(`[${context || 'Error'}]:`, error.message, error.stack);
  } else {
    console.error(`[${context || 'Error'}]:`, error);
  }
};
