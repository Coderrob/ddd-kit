/**
 * Interface for service resolution operations.
 * Follows Interface Segregation Principle (ISP).
 */

export interface IServiceResolver {
  /**
   * Resolves a service by key.
   * @param key - The service key
   * @returns The resolved service instance
   */
  resolve<T>(key: string): T;

  /**
   * Checks if a service is registered.
   * @param key - The service key
   * @returns True if the service is registered
   */
  has(key: string): boolean;
}
