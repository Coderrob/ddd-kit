import { ILogger } from '../types/observability';
import { ITask, ITaskStore } from '../types/tasks';
import { TaskProcessor } from '../core/processing/task.processor';
import { ValidationContext } from '../validators/validation.context';
import { ValidationFactory } from '../validators/validation.factory';
import { ValidationResult } from '../validators/validation.result';
import { TaskValidationService as TaskValidationProcessorService } from '../core/services/task-validation-processor.service';
import { TaskPersistenceService } from '../core/services/task-persistence.service';

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
