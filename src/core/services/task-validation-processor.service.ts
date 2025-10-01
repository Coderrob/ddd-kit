import { ITaskValidator } from '../../types/tasks';
import { IValidationResultBuilder } from '../../types/validation';

/**
 * Service responsible for task validation operations.
 * Follows Single Responsibility Principle (SRP).
 */
export class TaskValidationService {
  constructor(
    private readonly validator: ITaskValidator,
    private readonly resultBuilder: IValidationResultBuilder,
  ) {}

  /**
   * Validates a task and records any validation errors.
   * @param taskObj - The task object to validate
   * @param index - The index of this task in the processing batch
   * @returns True if validation passed, false otherwise
   */
  validateTask(taskObj: Record<string, unknown>, index: number): boolean {
    const validationResult = this.validator.validate(taskObj);

    if (!validationResult.ok) {
      this.addValidationError(index, validationResult);
      return false;
    }

    return true;
  }

  /**
   * Re-validates a task after fixes have been applied.
   * @param taskObj - The task object to re-validate after fixes
   * @param index - The index of this task in the processing batch
   * @returns True if validation passed, false otherwise
   */
  revalidateAfterFixes(taskObj: Record<string, unknown>, index: number): boolean {
    const recheck = this.validator.validate(taskObj);

    if (!recheck.ok) {
      const msg = (recheck.errors || [])
        .map((e: unknown) => {
          const error = e as { instancePath?: string; message?: string };
          return `${error.instancePath ?? ''} ${error.message ?? ''}`;
        })
        .join('; ');
      this.resultBuilder.addError(`Task[${index}] validation failed after fixes: ${msg}`);
      return false;
    }

    return true;
  }

  /**
   * Adds a validation error to the result builder.
   * @param index - The index of the task in the processing batch
   * @param validationResult - The validation result containing error details
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
    this.resultBuilder.addError(`Task[${index}] validation failed: ${msg}`);
  }
}
