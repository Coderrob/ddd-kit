import { ILogger } from '../interfaces/ILogger';
import { ITaskStore } from '../interfaces/ITaskStore';
import { TaskProcessor } from '../utils/task.processor';
import { ValidationContext } from '../validators/validation.context';
import { ValidationFactory } from '../validators/validation.factory';
import { ValidationResult } from '../validators/validation.result';

/**
 * Main service for orchestrating task validation and fixing operations.
 */
export class TaskValidationService {
  /**
   * Validates and optionally fixes all tasks in the provided array.
   * @param tasks - Array of Task objects to validate and potentially fix.
   * @param options - Options for the validation operation.
   * @returns A Promise that resolves to a ValidationResult containing the outcome of the operation.
   */
  async validateAndFixTasks(
    tasks: unknown[],
    options: {
      applyFixes: boolean;
      excludePattern?: string;
      store?: ITaskStore;
      logger?: ILogger;
    },
  ): Promise<ValidationResult> {
    const context = new ValidationContext(tasks, options);

    const validator = ValidationFactory.createValidator();
    const fixer = ValidationFactory.createFixer(context.getLogger());
    const exclusionFilter = ValidationFactory.createExclusionFilter(options.excludePattern);
    const resultBuilder = ValidationFactory.createResultBuilder();

    const processor = new TaskProcessor({
      context,
      exclusionFilter,
      fixer,
      resultBuilder,
      validator,
    });

    // Process all tasks
    const processPromises = tasks.map((task, index) => processor.processTask(task, index));
    await Promise.all(processPromises);

    return resultBuilder.build();
  }
}
