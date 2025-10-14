import { isNonEmptyString } from './type.helper';

/**
 * Safe environment variable accessor
 * @param key The environment variable key
 * @param defaultValue Optional default value if the env var is not set
 * @returns The environment variable value or the default value
 * @throws Error if the env var is not set and no default is provided
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
