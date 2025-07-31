/**
 * Utility functions for handling string user IDs from better-auth
 */

/**
 * Validates if a string is a valid user ID from better-auth
 * Better-auth typically uses base64-encoded strings
 */
export function isValidUserId(userId: string): boolean {
  if (!userId || typeof userId !== 'string') {
    return false;
  }

  // Better-auth user IDs are typically base64-encoded strings
  // They should be non-empty and contain valid base64 characters
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  return base64Regex.test(userId) && userId.length > 0;
}

/**
 * Creates a validated user ID string
 * @param userId - The user ID string from better-auth
 * @param fieldName - Field name for error messages
 * @returns The validated user ID string
 * @throws BadRequestException if the user ID is invalid
 */
export function createUserId(
  userId: string,
  fieldName: string = 'userId',
): string {
  if (!userId || typeof userId !== 'string') {
    throw new Error(`${fieldName} must be a non-empty string`);
  }

  if (!isValidUserId(userId)) {
    throw new Error(`Invalid ${fieldName}: ${userId}`);
  }

  return userId;
}

/**
 * Creates a user ID if it exists, otherwise returns undefined
 * @param userId - The user ID string from better-auth
 * @param fieldName - Field name for error messages
 * @returns The validated user ID string or undefined
 */
export function createUserIdIfExists(
  userId?: string,
  fieldName: string = 'userId',
): string | undefined {
  if (!userId) {
    return undefined;
  }
  return createUserId(userId, fieldName);
}
