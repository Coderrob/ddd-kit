export interface ITaskValidator {
  validate(task: unknown): { ok: boolean; errors?: unknown[] };
}
