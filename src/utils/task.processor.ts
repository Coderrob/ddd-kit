import { IExclusionFilter } from '../interfaces/IExclusionFilter';
import { ITaskFixer } from '../interfaces/ITaskFixer';
import { ITaskValidator } from '../interfaces/ITaskValidator';
import { IValidationResultBuilder } from '../interfaces/IValidationResultBuilder';
import { ITask } from '../interfaces/ITask';
import { ValidationContext } from '../validators/validation.context';

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

  private async persistFixes(taskId: string, taskObj: Record<string, unknown>): Promise<boolean> {
    const taskStore = this.options.context.getTaskStore();
    const result = await taskStore.updateTaskById(taskId, taskObj as ITask);
    return result;
  }

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
