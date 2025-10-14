/**
 * Type guard to check if a value is an empty array
 * @param value The value to check
 * @returns True if the value is an empty array, false otherwise
 */
export function isEmptyArray(value: unknown): boolean {
  return Array.isArray(value) && value.length === 0;
}
