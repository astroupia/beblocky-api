import { Types } from 'mongoose';
import { BadRequestException } from '@nestjs/common';

/**
 * Safely creates an ObjectId from a string with proper validation
 * @param value - The string value to convert to ObjectId
 * @param fieldName - The name of the field for error messages
 * @returns ObjectId instance
 * @throws BadRequestException if the value is not a valid ObjectId string
 */
export function createObjectId(
  value: string,
  fieldName: string = 'id',
): Types.ObjectId {
  if (!value || typeof value !== 'string') {
    throw new BadRequestException(`${fieldName} must be a non-empty string`);
  }

  if (!Types.ObjectId.isValid(value)) {
    throw new BadRequestException(`Invalid ${fieldName}: ${value}`);
  }

  return new Types.ObjectId(value);
}

/**
 * Safely creates an ObjectId from a string if the value exists
 * @param value - The string value to convert to ObjectId (can be undefined/null)
 * @param fieldName - The name of the field for error messages
 * @returns ObjectId instance or undefined if value is falsy
 * @throws BadRequestException if the value is not a valid ObjectId string
 */
export function createObjectIdIfExists(
  value?: string,
  fieldName: string = 'id',
): Types.ObjectId | undefined {
  if (!value) {
    return undefined;
  }

  return createObjectId(value, fieldName);
}
