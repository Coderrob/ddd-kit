import { isObject } from './type.helper';

/**
 * Safe property accessor for objects with index signatures
 * @param obj The object to access
 * @param key The property key to access
 * @returns The property value or undefined if not found or obj is not an object
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
 * @param obj The object to access
 * @param key The property key to access
 * @param errorMessage Optional custom error message if the property is missing
 * @returns The property value
 * @throws Error if the property is missing
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
