import { Task, ILogger, ITaskStore } from '../types';
import { ValidationResult, ValidationContext, ValidationFactory } from '../validation';
import { TaskProcessor } from './task.processor';

/**
 * Main service for orchestrating task validation and fixing operations.
 */
export class TaskValidationService {
  /**
   * Validates and optionally fixes all tasks in the provided array.
   * @param tasks - Array of Task objects to validate and potentially fix.
   * @param applyFixes - Whether to apply automatic fixes to validation issues.
   * @param excludePattern - Optional glob-like pattern to exclude certain tasks from validation/fixes.
   * @param store - Optional task store implementation for persisting changes.
   * @param logger - Optional logger instance for operation logging.
   * @returns A Promise that resolves to a ValidationResult containing the outcome of the operation.
   */
  async validateAndFixTasks(
    tasks: Task[],
    applyFixes: boolean,
    excludePattern?: string,
    store?: ITaskStore,
    logger?: ILogger,
  ): Promise<ValidationResult> {
    const context = new ValidationContext(tasks, applyFixes, excludePattern, store, logger);

    const validator = ValidationFactory.createValidator();
    const fixer = ValidationFactory.createFixer(context.getLogger());
    const exclusionFilter = ValidationFactory.createExclusionFilter(excludePattern);
    const resultBuilder = ValidationFactory.createResultBuilder();

    const processor = new TaskProcessor(validator, fixer, exclusionFilter, resultBuilder, context);

    // Process all tasks
    const processPromises = tasks.map((task, index) => processor.processTask(task, index));
    await Promise.all(processPromises);

    return resultBuilder.build();
  }
}
