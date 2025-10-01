import { IServiceRegistry, IServiceResolver } from '../../types/core';

import { ContainerBootstrap } from './bootstrap';

let containerInstance: (IServiceRegistry & IServiceResolver) | null = null;

class Container implements IServiceRegistry, IServiceResolver {
  private readonly services = new Map<string, unknown>();

  register<T>(key: string, factory: () => T): void {
    this.services.set(key, factory);
  }

  registerSingleton<T>(key: string, instance: T): void {
    this.services.set(key, () => instance);
  }

  resolve<T>(key: string): T {
    if (!this.services.has(key)) {
      throw new Error(`Service not registered: ${key}`);
    }
    const factory = this.services.get(key) as () => T;
    return factory();
  }

  has(key: string): boolean {
    return this.services.has(key);
  }

  static getInstance(): IServiceRegistry & IServiceResolver {
    if (containerInstance === null) {
      containerInstance = new Container();
    }
    return containerInstance;
  }
}

// Initialize container with default services
const container: IServiceRegistry & IServiceResolver = Container.getInstance();
ContainerBootstrap.initialize(container);

export { container };
