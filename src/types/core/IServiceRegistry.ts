/**
 * Interface for service registration operations.
 * Follows Interface Segregation Principle (ISP).
 */
export interface IServiceRegistry {
  /**
   * Registers a service factory function.
   * @param key - The service key
   * @param factory - Factory function to create the service instance
   */
  register<T>(key: string, factory: () => T): void;

  /**
   * Registers a singleton service instance.
   * @param key - The service key
   * @param instance - The service instance
   */
  registerSingleton<T>(key: string, instance: T): void;
}
