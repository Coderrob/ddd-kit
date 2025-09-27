import { IExclusionFilter } from '../../types/IExclusionFilter';
import { ITaskFixer } from '../../types/ITaskFixer';
import { ITaskValidator } from '../../types/ITaskValidator';
import { IValidationResultBuilder } from '../../types/IValidationResultBuilder';
import { ITask } from '../../types/ITask';
import { ValidationContext } from '../../validators/validation.context';

/**
 * Processes individual tasks for validation and fixing.
 *
 * This class is responsible for orchestrating the validation and fixing process
 * for individual tasks. It coordinates between validators, fixers, exclusion filters,
 * and result builders to ensure comprehensive task processing.
 *
 * The processor handles:
 * - Task validation against schema requirements
 * - Automatic application of fixes for common issues
 * - Exclusion filtering based on patterns
 * - Result collection and reporting
 */

export class TaskProcessor {
  /**
   * Creates a new TaskProcessor instance.
   * @param options - Options containing all dependencies for task processing.
   */
  constructor(
    private readonly options: {
      validator: ITaskValidator;
      fixer: ITaskFixer;
      exclusionFilter: IExclusionFilter;
      resultBuilder: IValidationResultBuilder;
      context: ValidationContext;
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
  async processTask(task: unknown, index: number): Promise<void> {
    const taskObj = { ...(task as Record<string, unknown>) };
    const taskId = String(taskObj['id'] ?? '');

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

    // Validate the task after fixes
    const validationResult = this.options.validator.validate(taskObj);
    if (!validationResult.ok) {
      this.addValidationError(index, validationResult);
    }
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
  private async applyFixes(
    taskObj: Record<string, unknown>,
    taskId: string,
    index: number,
  ): Promise<void> {
    const localFixes = this.options.fixer.applyBasicFixes(taskObj);

    if (localFixes.length > 0) {
      this.options.resultBuilder.addFixes(localFixes);

      if (this.options.context.options.applyFixes) {
        await this.persistFixes(taskId, taskObj);
      }

      this.revalidateAfterFixes(taskObj, index);
    }
  }

  /**
   * Persists task fixes to the task store.
   *
   * This private method saves the modified task object back to persistent storage
   * using the task store from the validation context.
   *
   * @param taskId - The unique identifier of the task to update
   * @param taskObj - The updated task object with applied fixes
   * @returns Promise that resolves to true if the update was successful, false otherwise
   *
   * @example
   * ```typescript
   * const success = await this.persistFixes('TASK-123', modifiedTaskObj);
   * if (success) {
   *   console.log('Task saved successfully');
   * }
   * ```
   */
  private async persistFixes(taskId: string, taskObj: Record<string, unknown>): Promise<boolean> {
    const taskStore = this.options.context.getTaskStore();
    const result = await taskStore.updateTaskById(taskId, taskObj as ITask);
    return result;
  }

  /**
   * Re-validates a task after fixes have been applied.
   *
   * This private method performs validation on a task that has already been
   * processed by the fixer to ensure that the fixes resolved all validation
   * issues. Any remaining validation errors are recorded for reporting.
   *
   * @param taskObj - The task object to re-validate after fixes
   * @param index - The index of this task in the processing batch (for error reporting)
   *
   * @example
   * ```typescript
   * this.revalidateAfterFixes(fixedTaskObj, 0);
   * ```
   */
  private revalidateAfterFixes(taskObj: Record<string, unknown>, index: number): void {
    const recheck = this.options.validator.validate(taskObj);
    if (!recheck.ok) {
      const msg = (recheck.errors || [])
        .map((e: unknown) => {
          const error = e as { instancePath?: string; message?: string };
          return `${error.instancePath ?? ''} ${error.message ?? ''}`;
        })
        .join('; ');
      this.options.resultBuilder.addError(`Task[${index}] validation failed after fixes: ${msg}`);
    }
  }

  /**
   * Adds a validation error to the result builder.
   *
   * This private method formats validation errors from the validator into
   * human-readable error messages and adds them to the result builder for
   * later reporting.
   *
   * @param index - The index of the task in the processing batch
   * @param validationResult - The validation result containing error details
   * @param validationResult.ok - Whether validation passed
   * @param validationResult.errors - Array of validation error objects
   *
   * @example
   * ```typescript
   * const result = { ok: false, errors: [{ instancePath: '/title', message: 'is required' }] };
   * this.addValidationError(0, result);
   * ```
   */
  private addValidationError(
    index: number,
    validationResult: { ok: boolean; errors?: unknown[] },
  ): void {
    const msg = (validationResult.errors || [])
      .map((e: unknown) => {
        const error = e as { instancePath?: string; message?: string };
        return `${error.instancePath ?? ''} ${error.message ?? ''}`;
      })
      .join('; ');
    this.options.resultBuilder.addError(`Task[${index}] validation failed: ${msg}`);
  }
}
