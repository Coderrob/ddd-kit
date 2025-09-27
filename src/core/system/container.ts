import { ReferenceAuditService } from '../../services/reference-audit.service';
import { TaskRenderService } from '../../services/task-render.service';
import { UidSupersedeService } from '../../services/uid-supersede.service';
import { IContainer } from '../../types';
import { Resolver } from '../helpers/uid-resolver';

import { getLogger } from './logger';

let containerInstance: IContainer | null = null;

export class Container implements IContainer {
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

  static getInstance(): IContainer {
    if (!containerInstance) {
      containerInstance = new Container();
    }
    return containerInstance;
  }
}

// Service keys
export const SERVICE_KEYS = {
  EXCLUSION_FILTER: 'IExclusionFilter',
  LOGGER: 'ILogger',
  REFERENCE_AUDIT: 'IReferenceAuditUseCase',
  RESOLVER: 'IResolver',
  RESULT_BUILDER: 'IValidationResultBuilder',
  TASK_FIXER: 'ITaskFixer',
  TASK_RENDERER: 'ITaskRenderUseCase',
  TASK_STORE: 'ITaskStore',
  TASK_VALIDATOR: 'ITaskValidator',
  UID_SUPERSEDE: 'IUIdSupersedeUseCase',
} as const;

// Initialize container with default services
const container: IContainer = Container.getInstance();
container.registerSingleton(SERVICE_KEYS.LOGGER, getLogger());

// Try registering high-level services. Use static imports — they should be available in the repo.
// Wrapped in try/catch to avoid hard failures during early editing or partial checkouts.
try {
  const dddKitPath = process.env['DDDKIT_PATH'] ?? '.';
  const resolver = new Resolver(dddKitPath);
  container.registerSingleton(SERVICE_KEYS.RESOLVER, resolver);
  container.registerSingleton(SERVICE_KEYS.TASK_RENDERER, new TaskRenderService());
  container.registerSingleton(SERVICE_KEYS.REFERENCE_AUDIT, new ReferenceAuditService(resolver));
  container.registerSingleton(SERVICE_KEYS.UID_SUPERSEDE, new UidSupersedeService(resolver));
} catch {
  // If services are not present yet, skip registration — callers will get a clear error.
}

export { container };
