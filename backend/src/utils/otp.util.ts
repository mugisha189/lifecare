import { createHash } from 'crypto';

/**
 * OTP Utility Functions
 * Best practices for OTP handling:
 * 1. Never store OTPs in plain text
 * 2. Use fast hashing (SHA-256) instead of slow hashing (bcrypt)
 * 3. OTPs should be time-limited and single-use
 */

/**
 * Hash an OTP using SHA-256
 * @param otp The plain text OTP to hash
 * @returns The hashed OTP
 */
export function hashOtp(otp: string): string {
  return createHash('sha256').update(otp).digest('hex');
}

/**
 * Verify an OTP against a hashed value
 * Uses constant-time comparison to prevent timing attacks
 * @param plainOtp The plain text OTP to verify
 * @param hashedOtp The hashed OTP to compare against
 * @returns True if the OTP matches
 */
export function verifyOtp(plainOtp: string, hashedOtp: string): boolean {
  const hash = hashOtp(plainOtp);

  // Constant-time comparison to prevent timing attacks
  if (hash.length !== hashedOtp.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < hash.length; i++) {
    result |= hash.charCodeAt(i) ^ hashedOtp.charCodeAt(i);
  }

  return result === 0;
}
