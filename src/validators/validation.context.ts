import { DefaultTaskStore } from '../utils/default-task.store';
import { getLogger } from '../utils/logger';
import { ITaskStore } from '../interfaces/ITaskStore';
import { ILogger } from '../interfaces/ILogger';

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
