import { isEmptyString, isNullOrUndefined, isString } from './type.helper';

/**
 * Checks if a string is a valid date.
 * @param value The string to check.
 * @returns True if the string is a valid date, false otherwise.
 */
function isValidDate(value: string | undefined): boolean {
  if (isNullOrUndefined(value) || isEmptyString(value)) return false;
  const t = Date.parse(value);
  return !Number.isNaN(t);
}

/**
 * Normalizes a date string to ISO format, or returns the current date in ISO format if invalid.
 * @param nowIso The current date in ISO format to use as fallback.
 * @param value The date string to normalize.
 * @returns The normalized date string in ISO format, or nowIso if the input is invalid.
 */
export function normalizeToIso(nowIso: string, value: string | undefined): string {
  if (!isString(value) || !isValidDate(value)) return nowIso;
  return new Date(value).toISOString();
}
