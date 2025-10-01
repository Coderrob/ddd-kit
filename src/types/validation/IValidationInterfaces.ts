import { ILogger } from '../observability/ILogger';
import { IExclusionFilter } from '../repository/IExclusionFilter';
import { ITaskFixer, ITaskValidator } from '../tasks';

import { IValidationResultBuilder } from './IValidationResultBuilder';

/**
 * Interface for validation factory operations.
 * Follows Dependency Inversion Principle (DIP).
 */
export interface IValidationFactory {
  /**
   * Creates a task validator instance.
   */
  createValidator(): ITaskValidator;

  /**
   * Creates a task fixer instance.
   */
  createFixer(logger: ILogger): ITaskFixer;

  /**
   * Creates an exclusion filter instance.
   */
  createExclusionFilter(pattern?: string): IExclusionFilter;

  /**
   * Creates a validation result builder instance.
   */
  createResultBuilder(): IValidationResultBuilder;
}

/**
 * Interface for task processing operations.
 * Follows Single Responsibility Principle (SRP).
 */
export interface ITaskProcessor {
  /**
   * Processes a single task for validation and fixing.
   */
  processTask(task: unknown, index: number): Promise<void>;
}
