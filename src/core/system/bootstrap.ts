import { ReferenceAuditService } from '../../services/reference-audit.service';
import { TaskRenderService } from '../../services/task-render.service';
import { UidSupersedeService } from '../../services/uid-supersede.service';
import { SERVICE_KEYS, IServiceRegistry } from '../../types/core';
import { Resolver } from '../helpers/uid-resolver';
import { getLogger } from '../system/logger';

/**
 * Bootstrap class responsible for initializing the container with services.
 * Follows Single Responsibility Principle (SRP) and Dependency Inversion Principle (DIP).
 */
export class ContainerBootstrap {
  /**
   * Initializes the container with default services.
   * @param container - The service registry to initialize
   */
  static initialize(container: IServiceRegistry): void {
    // Register core services
    container.registerSingleton(SERVICE_KEYS.LOGGER, getLogger());

    // Try registering high-level services. Use static imports — they should be available in the repo.
    // Wrapped in try/catch to avoid hard failures during early editing or partial checkouts.
    try {
      const dddKitPath = process.env['DDDKIT_PATH'] ?? '.';
      const resolver = new Resolver(dddKitPath);
      container.registerSingleton(SERVICE_KEYS.RESOLVER, resolver);
      container.registerSingleton(SERVICE_KEYS.TASK_RENDERER, new TaskRenderService(getLogger()));
      container.registerSingleton(
        SERVICE_KEYS.REFERENCE_AUDIT,
        new ReferenceAuditService(resolver),
      );
      container.registerSingleton(SERVICE_KEYS.UID_SUPERSEDE, new UidSupersedeService(resolver));
    } catch {
      // If services are not present yet, skip registration — callers will get a clear error.
    }
  }
}
