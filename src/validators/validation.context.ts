import { DefaultTaskStore } from '../core/storage/default-task.store';
import { getLogger } from '../core/system/logger';
import { ITaskStore } from '../types/tasks';
import { ILogger } from '../types/observability';

/**
 * Context object for task validation operations.
 */
export class ValidationContext {
  /**
   * Creates a new ValidationContext instance.
   * @param tasks - Array of Task objects to be validated.
   * @param options - Options for the validation context.
   */
  constructor(
    public readonly tasks: unknown[],
    public readonly options: {
      applyFixes: boolean;
      excludePattern?: string;
      store?: ITaskStore;
      logger?: ILogger;
    },
  ) {}

  /**
   * Gets the logger instance, falling back to the default logger if none was provided.
   * @returns The configured logger instance.
   */
  getLogger(): ILogger {
    return this.options.logger ?? getLogger();
  }

  /**
   * Gets the task store instance, falling back to the default store if none was provided.
   * @returns The configured task store instance.
   */
  getTaskStore(): ITaskStore {
    return this.options.store ?? new DefaultTaskStore();
  }
}
