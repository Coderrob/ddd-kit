import { DefaultTaskStore } from '../core';
import { getLogger } from '../lib/logger';
import { Task, ITaskStore, ILogger } from '../types';

/**
 * Context object for task validation operations.
 */
export class ValidationContext {
  /**
   * Creates a new ValidationContext instance.
   * @param tasks - Array of Task objects to be validated.
   * @param applyFixes - Whether automatic fixes should be applied to validation issues.
   * @param excludePattern - Optional glob-like pattern for excluding tasks from validation.
   * @param store - Optional task store implementation for persisting changes.
   * @param logger - Optional logger instance for operation logging.
   */
  constructor(
    public readonly tasks: Task[],
    public readonly applyFixes: boolean,
    public readonly excludePattern?: string,
    public readonly store?: ITaskStore,
    public readonly logger?: ILogger,
  ) {}

  /**
   * Gets the logger instance, falling back to the default logger if none was provided.
   * @returns The configured logger instance.
   */
  getLogger(): ILogger {
    return this.logger ?? getLogger();
  }

  /**
   * Gets the task store instance, falling back to the default store if none was provided.
   * @returns The configured task store instance.
   */
  getTaskStore(): ITaskStore {
    return this.store ?? new DefaultTaskStore();
  }
}
