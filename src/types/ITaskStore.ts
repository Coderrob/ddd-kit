import { ITask } from './ITask';

/**
 * Interface for task storage operations.
 *
 * Provides methods for persisting and updating task data in the
 * underlying storage system. Handles atomic operations for task
 * state changes.
 *
 * @example
 * ```typescript
 * const store = container.resolve<ITaskStore>('TaskStore');
 * const success = await store.updateTaskById('task-123', updatedTask);
 *
 * if (success) {
 *   console.log('Task updated successfully');
 * } else {
 *   logger.error('Failed to update task');
 * }
 * ```
 */
export interface ITaskStore {
  /**
   * Updates a task by its unique identifier.
   *
   * Performs an atomic update operation, replacing the existing task
   * with the provided task object. The operation is idempotent and
   * will return false if the task doesn't exist.
   *
   * @param id - The unique identifier of the task to update
   * @param task - The updated task object to persist
   * @returns Promise that resolves to true if update succeeded, false otherwise
   *
   * @example
   * ```typescript
   * const updatedTask: ITask = {
   *   id: 'task-123',
   *   title: 'Updated task title',
   *   status: 'completed',
   *   priority: 'high'
   * };
   *
   * const result = await store.updateTaskById('task-123', updatedTask);
   * console.log(result ? 'Success' : 'Task not found or update failed');
   * ```
   */
  updateTaskById(id: string, task: ITask): Promise<boolean>;
}
