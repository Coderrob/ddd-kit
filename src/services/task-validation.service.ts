import { TaskProcessor } from '../core/processing/task.processor';
import { TaskPersistenceService } from '../core/services/task-persistence.service';
import { TaskValidationProcessorService } from '../core/services/task-validation-processor.service';
import { ITask, IValidationOptions } from '../types';
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
    tasks: ITask[],
    options: IValidationOptions,
  ): Promise<ValidationResult> {
    const context = new ValidationContext(tasks, options);

    const validator = ValidationFactory.createValidator();
    const fixer = ValidationFactory.createFixer();
    const exclusionFilter = ValidationFactory.createExclusionFilter(options.excludePattern);
    const resultBuilder = ValidationFactory.createResultBuilder();

    // Create service dependencies for TaskProcessor
    const validationService = new TaskValidationProcessorService(validator, resultBuilder);
    const persistenceService = new TaskPersistenceService(
      context.getTaskStore(),
      context.getLogger(),
    );

    const processor = new TaskProcessor({
      context,
      exclusionFilter,
      fixer,
      persistenceService,
      resultBuilder,
      validationService,
    });

    // Process all tasks
    const processPromises = tasks.map((task, index) => processor.processTask(task, index));
    await Promise.all(processPromises);

    return resultBuilder.build();
  }
}
