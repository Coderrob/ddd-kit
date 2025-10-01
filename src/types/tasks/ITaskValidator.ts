/**
 * Interface for validating tasks against business rules and schemas.
 *
 * Provides validation functionality to ensure tasks meet required
 * structural and business constraints before processing or persistence.
 *
 * @example
 * ```typescript
 * const validator = container.resolve<ITaskValidator>('TaskValidator');
 * const result = validator.validate(taskData);
 *
 * if (result.ok) {
 *   console.log('Task is valid');
 * } else {
 *   console.log('Validation errors:', result.errors);
 * }
 * ```
 */
export interface ITaskValidator {
  /**
   * Validates a task object against defined rules and schemas.
   *
   * @param task - The task object to validate (can be any shape)
   * @returns Validation result object
   * @returns result.ok - True if validation passed, false otherwise
   * @returns result.errors - Array of validation errors (present only when ok is false)
   *
   * @example
   * ```typescript
   * const result = validator.validate({
   *   id: 'task-123',
   *   title: 'Complete documentation',
   *   status: 'pending'
   * });
   *
   * if (!result.ok) {
   *   result.errors?.forEach(error => logger.error(error));
   * }
   * ```
   */
  validate(task: unknown): { ok: boolean; errors?: unknown[] };
}
