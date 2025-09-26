import { DomainError } from './domain.error';

export class TaskNotFoundError extends DomainError {
  readonly code = 'TASK_NOT_FOUND';

  constructor(taskId: string) {
    super(`Task with ID '${taskId}' not found`);
    Object.setPrototypeOf(this, TaskNotFoundError.prototype);
  }
}
