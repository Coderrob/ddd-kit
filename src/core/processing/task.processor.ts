import { ITaskFixer, IExclusionFilter, IValidationResultBuilder, ITask } from '../../types';
import { ValidationContext } from '../../validators/validation.context';
import { isTask } from '../helpers/type.helper';
import { TaskPersistenceService } from '../services/task-persistence.service';
import { TaskValidationService } from '../services/task-validation-processor.service';

export class TaskProcessor {
  /**
   * Creates a new TaskProcessor instance.
   * @param options - Options containing all dependencies for task processing.
   */
  constructor(
    private readonly options: {
      fixer: ITaskFixer;
      exclusionFilter: IExclusionFilter;
      resultBuilder: IValidationResultBuilder;
      context: ValidationContext;
      validationService: TaskValidationService;
      persistenceService: TaskPersistenceService;
    },
  ) {}

  /**
   * Processes a single task for validation and fixing.
   *
   * This method performs the complete validation and fixing workflow for one task:
   * 1. Checks if the task should be excluded from processing
   * 2. Validates the task against the schema
   * 3. Applies automatic fixes if validation fails
   * 4. Persists fixes if configured to do so
   * 5. Re-validates after fixes and reports results
   *
   * @param task - The task object to process
   * @param index - The index of this task in the processing batch (for error reporting)
   * @returns Promise that resolves when task processing is complete
   */
  async processTask(task: ITask, index: number): Promise<void> {
    if (!isTask(task)) {
      this.options.resultBuilder.addError(`Task[${index}] is not a valid ITask shape`);
      return;
    }

    // Work on a shallow copy to avoid unexpected external mutation
    const taskObj: ITask = { ...task };
    const taskId = taskObj.id;

    // Check exclusion filter
    if (this.options.exclusionFilter.shouldExclude(taskObj)) {
      return;
    }

    // Handle tasks without IDs
    if (!taskId) {
      this.options.resultBuilder.addError(`Task[${index}] has no id; cannot auto-fix`);
      return;
    }

    // Apply fixes to ensure all tasks have required default values
    await this.applyFixes(taskObj, taskId, index);

    // Validate the task after fixes using the validation service
    this.options.validationService.validateTask(taskObj, index);
  }

  /**
   * Applies fixes to a task object and handles persistence if enabled.
   *
   * This private method orchestrates the fixing process by:
   * 1. Requesting fixes from the fixer
   * 2. Recording fixes for reporting
   * 3. Persisting changes if applyFixes option is enabled
   * 4. Re-validating the task after fixes
   *
   * @param taskObj - The task object to fix (mutable)
   * @param taskId - The unique identifier of the task
   * @param index - The index of this task in the processing batch
   * @returns Promise that resolves when fixes are applied and persisted
   *
   * @example
   * ```typescript
   * await this.applyFixes(taskObj, 'TASK-123', 0);
   * ```
   */
  private async applyFixes(taskObj: ITask, taskId: string, index: number): Promise<void> {
    const localFixes = this.options.fixer.applyBasicFixes(taskObj);

    if (localFixes.length > 0) {
      this.options.resultBuilder.addFixes(localFixes);

      if (this.options.context.options.applyFixes) {
        const success = await this.options.persistenceService.persistTask(taskId, taskObj);
        if (success) {
          this.options.resultBuilder.incrementFixesApplied();
        }
      }

      this.options.validationService.revalidateAfterFixes(taskObj, index);
    }
  }
}
