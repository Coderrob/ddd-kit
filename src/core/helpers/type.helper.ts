/**
 * Type guards and utility functions for defensive programming
 */

import { ITask } from '../../types';

/**
 * Type guard to check if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard to check if a value is an object (not null, not array)
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard to check if a value is an empty string
 * @param value The value to check
 * @returns True if the value is an empty string, false otherwise
 */
export function isEmptyString(value: unknown): value is '' {
  return value === '';
}

/**
 * Type guard to check if a value is a non-empty string
 * @param value The value to check
 * @returns True if the value is a non-empty string, false otherwise
 */
export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && !isEmptyString(value.trim());
}

/**
 * Type guard to check if a value is null or undefined
 * @param value The value to check
 * @returns True if the value is null or undefined, false otherwise
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || typeof value === 'undefined';
}

/**
 * Type guard to ensure a value conforms to ITask minimally by id being a string.
 * @param value The value to check
 * @returns True if the value is an ITask, false otherwise
 */
export function isTask(value: unknown): value is ITask {
  if (isNullOrUndefined(value) || !isObject(value)) {
    return false;
  }
  const obj = value as { id?: string };
  return isNonEmptyString(obj.id);
}
