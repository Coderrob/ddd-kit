export interface IContainer {
  register<T>(key: string, factory: () => T): void;
  registerSingleton<T>(key: string, instance: T): void;
  resolve<T>(key: string): T;
  has(key: string): boolean;
}
