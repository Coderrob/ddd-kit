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
 * Type guard to check if a value is an empty array
 */
export function isEmptyArray(value: unknown): boolean {
  return Array.isArray(value) && value.length === 0;
}

/**
 * Type guard to check if a value is an empty string
 */
export function isEmptyString(value: unknown): value is '' {
  return value === '';
}

/**
 * Type guard to check if a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && !isEmptyString(value.trim());
}

/**
 * Type guard to check if a value is null or undefined
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || typeof value === 'undefined';
}

/** Type guard to ensure a value conforms to ITask minimally by id being a string. */
export function isTask(value: unknown): value is ITask {
  if (isNullOrUndefined(value) || !isObject(value)) return false;
  const obj = value as { id?: string };
  return isNonEmptyString(obj.id);
}

/**
 * Safe property accessor for objects with index signatures
 */
export function safeGet<T = unknown>(
  obj: Record<string, unknown> | undefined | null,
  key: string,
): T | undefined {
  if (!isObject(obj)) {
    return void 0;
  }
  // eslint-disable-next-line security/detect-object-injection
  return obj[key] as T | undefined;
}

/**
 * Safe property accessor that throws if property doesn't exist
 */
export function safeGetRequired<T = unknown>(
  obj: Record<string, unknown> | undefined | null,
  key: string,
  errorMessage = `Required property '${key}' is missing`,
): T {
  const value = safeGet<T>(obj, key);
  if (value === void 0) {
    throw new Error(errorMessage);
  }
  return value;
}

/**
 * Safe environment variable accessor
 */
export function safeEnv(key: string, defaultValue?: string): string {
  // eslint-disable-next-line security/detect-object-injection
  const value = process.env[key];
  if (isNonEmptyString(value)) {
    return value;
  }
  if (defaultValue !== void 0) {
    return defaultValue;
  }
  throw new Error(`Environment variable '${key}' is not set or empty`);
}

/**
 * Safe environment variable accessor that returns undefined if not set
 */
export function safeEnvOptional(key: string): string | undefined {
  // eslint-disable-next-line security/detect-object-injection
  const value = process.env[key];
  return isNonEmptyString(value) ? value : void 0;
}
