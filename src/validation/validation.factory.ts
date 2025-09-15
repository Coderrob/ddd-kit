import { ExclusionFilter } from '../core';
import {
  ITaskValidator,
  ILogger,
  ITaskFixer,
  IExclusionFilter,
  IValidationResultBuilder,
} from '../types';
import { SchemaLoader } from './schema.loader';
import { TaskFixer } from './task-fixer';
import { ValidationResultBuilder } from './validation-result.builder';
import { AjvValidator } from './validators';

/**
 * Factory for creating validation dependencies.
 */
export class ValidationFactory {
  /**
   * Creates a new task validator instance using AJV with the default schema loader.
   * @returns A configured ITaskValidator instance ready for task validation.
   */
  static createValidator(): ITaskValidator {
    const loader = new SchemaLoader();
    return new AjvValidator(loader);
  }

  /**
   * Creates a new task fixer instance with the provided logger.
   * @param logger - The logger instance to use for logging fix operations.
   * @returns A configured ITaskFixer instance ready for applying automatic fixes.
   */
  static createFixer(logger: ILogger): ITaskFixer {
    return new TaskFixer(logger);
  }

  /**
   * Creates a new exclusion filter instance with the provided pattern.
   * @param pattern - Optional glob-like pattern for excluding tasks from validation/fixes.
   * @returns A configured IExclusionFilter instance for filtering tasks.
   */
  static createExclusionFilter(pattern?: string): IExclusionFilter {
    return new ExclusionFilter(pattern);
  }

  /**
   * Creates a new validation result builder instance.
   * @returns A configured IValidationResultBuilder instance for building validation results.
   */
  static createResultBuilder(): IValidationResultBuilder {
    return new ValidationResultBuilder();
  }
}
