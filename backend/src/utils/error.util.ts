/**
 * Extract error message from unknown error types
 * @param error The error object (unknown type)
 * @returns A string representation of the error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error';
}

/**
 * Extract error stack from unknown error types
 * @param error The error object (unknown type)
 * @returns The error stack if available, undefined otherwise
 */
export function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }
  return undefined;
}

/**
 * Format error for logging
 * @param error The error object (unknown type)
 * @returns An object with message and stack
 */
export function formatError(error: unknown): { message: string; stack?: string } {
  return {
    message: getErrorMessage(error),
    stack: getErrorStack(error),
  };
}
