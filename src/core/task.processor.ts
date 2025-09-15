import {
  IExclusionFilter,
  ITaskFixer,
  ITaskValidator,
  IValidationResultBuilder,
  Task,
} from '../types';

import { ValidationContext } from '../validation';

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
   *
   * @param validator - The validator to use for schema validation
   * @param fixer - The fixer to use for applying automatic corrections
   * @param exclusionFilter - Filter for excluding tasks from processing
   * @param resultBuilder - Builder for collecting validation results and fixes
   * @param context - Validation context containing configuration and services
   */
  constructor(
    private readonly validator: ITaskValidator,
    private readonly fixer: ITaskFixer,
    private readonly exclusionFilter: IExclusionFilter,
    private readonly resultBuilder: IValidationResultBuilder,
    private readonly context: ValidationContext,
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
  async processTask(task: Task, index: number): Promise<void> {
    const taskObj = { ...(task as Record<string, unknown>) };
    const taskId = String(taskObj.id ?? '');

    // Check exclusion filter
    if (this.exclusionFilter.shouldExclude(taskObj)) {
      return;
    }

    // Validate the task
    const validationResult = this.validator.validate(taskObj);
    if (validationResult.ok) {
      return; // Task is valid, nothing to do
    }

    // Handle tasks without IDs
    if (!taskId) {
      this.resultBuilder.addError(`Task[${index}] has no id; cannot auto-fix`);
      return;
    }

    // Apply fixes
    await this.applyFixes(taskObj, taskId, index, validationResult);
  }

  private async applyFixes(
    taskObj: Record<string, unknown>,
    taskId: string,
    index: number,
    validationResult: { ok: boolean; errors?: unknown[] },
  ): Promise<void> {
    const localFixes = this.fixer.applyBasicFixes(taskObj);

    if (localFixes.length > 0) {
      this.resultBuilder.addFixes(localFixes);

      if (this.context.applyFixes) {
        await this.persistFixes(taskId, taskObj);
      }

      this.revalidateAfterFixes(taskObj, index);
    } else {
      this.addValidationError(index, validationResult);
    }
  }

  private async persistFixes(taskId: string, taskObj: Record<string, unknown>): Promise<boolean> {
    const taskStore = this.context.getTaskStore();
    const result = await taskStore.updateTaskById(taskId, taskObj as Task);
    return result;
  }

  private revalidateAfterFixes(taskObj: Record<string, unknown>, index: number): void {
    const recheck = this.validator.validate(taskObj);
    if (!recheck.ok) {
      const msg = (recheck.errors || [])
        .map((e: unknown) => {
          const error = e as { instancePath?: string; message?: string };
          return `${error.instancePath ?? ''} ${error.message ?? ''}`;
        })
        .join('; ');
      this.resultBuilder.addError(`Task[${index}] validation failed after fixes: ${msg}`);
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
    this.resultBuilder.addError(`Task[${index}] validation failed: ${msg}`);
  }
}
