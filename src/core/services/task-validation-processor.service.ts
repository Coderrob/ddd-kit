import { ITaskValidator, IValidationResultBuilder, ITask, IValidationResult } from '../../types';

/**
 * Service responsible for task validation operations.
 * Follows Single Responsibility Principle (SRP).
 */
export class TaskValidationProcessorService {
  constructor(
    private readonly validator: ITaskValidator,
    private readonly resultBuilder: IValidationResultBuilder,
  ) {}

  /**
   * Validates a task and records any validation errors.
   * @param task - The task object to validate
   * @param index - The index of this task in the processing batch
   * @returns True if validation passed, false otherwise
   */
  validateTask(task: ITask, index: number): boolean {
    const validationResult = this.validator.validate(task);

    if (!validationResult.isValid) {
      this.addValidationError(index, validationResult);
      return false;
    }

    return true;
  }

  /**
   * Re-validates a task after fixes have been applied.
   * @param task - The task object to re-validate after fixes
   * @param index - The index of this task in the processing batch
   * @returns True if validation passed, false otherwise
   */
  revalidateAfterFixes(task: ITask, index: number): boolean {
    const recheck = this.validator.validate(task);

    if (!recheck.isValid) {
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
  private addValidationError(index: number, validationResult: IValidationResult): void {
    const msg = (validationResult.errors || [])
      .map((e: unknown) => {
        const error = e as { instancePath?: string; message?: string };
        return `${error.instancePath ?? ''} ${error.message ?? ''}`;
      })
      .join('; ');
    this.resultBuilder.addError(`Task[${index}] validation failed: ${msg}`);
  }
}
