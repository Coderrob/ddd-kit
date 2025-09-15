/**
 * Interface for task validation operations.
 */

export interface ITaskValidator {
  validate(task: unknown): { ok: boolean; errors?: unknown[] };
}
