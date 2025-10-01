import { DomainError } from './domain.error';

export class TaskNotFoundError extends DomainError {
  readonly code = 'TASK_NOT_FOUND';

  constructor(taskId: string, correlationId?: string) {
    super(
      `Task with ID '${taskId}' not found`,
      {
        taskId,
        searchContext: 'task_repository_lookup',
        impact: 'operation_blocked',
      },
      correlationId,
    );
    Object.setPrototypeOf(this, TaskNotFoundError.prototype);
  }

  /**
   * Gets specific metrics for task not found errors.
   */
  override toMetrics(): Record<string, string | number> {
    return {
      ...super.toMetrics(),
      task_id: this.details?.['taskId'] as string,
      search_context: this.details?.['searchContext'] as string,
    };
  }
}
