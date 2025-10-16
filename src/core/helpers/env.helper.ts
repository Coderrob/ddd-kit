import { isNonEmptyString } from './type.helper';

/**
 * Contract for environment access. Enables test doubles to control env lookups.
 */
export interface EnvironmentAccessor {
  get(key: string): string | undefined;
  getOrDefault(key: string, defaultValue: string): string;
  require(key: string, defaultValue?: string): string;
}

/**
 * Default implementation that reads from process.env.
 */
export class ProcessEnvironmentAccessor implements EnvironmentAccessor {
  constructor(private readonly env: Record<string, string | undefined> = process.env) {}

  get(key: string): string | undefined {
    // eslint-disable-next-line security/detect-object-injection
    const value = this.env[key];
    return isNonEmptyString(value) ? value : void 0;
  }

  getOrDefault(key: string, defaultValue: string): string {
    return this.get(key) ?? defaultValue;
  }

  require(key: string, defaultValue?: string): string {
    const value = this.get(key);
    if (isNonEmptyString(value)) {
      return value;
    }
    if (defaultValue !== void 0) {
      return defaultValue;
    }
    throw new Error(`Environment variable '${key}' is not set or empty`);
  }
}

const defaultEnvironmentAccessor = new ProcessEnvironmentAccessor();

/**
 * Safe environment variable accessor
 * @param key The environment variable key
 * @param defaultValue Optional default value if the env var is not set
 * @returns The environment variable value or the default value
 * @throws Error if the env var is not set and no default is provided
 */
export function safeEnv(key: string, defaultValue?: string): string {
  return defaultEnvironmentAccessor.require(key, defaultValue);
}

/**
 * Safe environment variable accessor that returns undefined if not set
 */
export function safeEnvOptional(key: string): string | undefined {
  return defaultEnvironmentAccessor.get(key);
}
