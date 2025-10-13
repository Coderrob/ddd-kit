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
 * const tasks = await store.listTasks();
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
   * Lists all tasks from storage.
   * @returns Array of all tasks
   */
  listTasks(): ITask[];

  /**
   * Finds a task by its ID.
   * @param id - The task ID to find
   * @returns The task if found, null otherwise
   */
  findTaskById(id: string): ITask | null;

  /**
   * Adds a task from a file to storage.
   * @param filePath - Path to the file containing the task
   * @returns True if the task was added successfully, false otherwise
   */
  addTaskFromFile(filePath: string): boolean;

  /**
   * Updates a task by its ID.
   * @param id - The task ID to update
   * @param task - The updated task object
   * @returns True if the update was successful, false otherwise
   */
  updateTaskById(id: string, task: ITask): boolean;

  /**
   * Removes a task by its ID.
   * @param id - The task ID to remove
   * @returns True if the task was removed successfully, false otherwise
   */
  removeTaskById(id: string): boolean;

  /**
   * Previews the completion of a task without performing the action.
   * @param id - The task ID to preview completion for
   * @returns A string describing what would happen if the task was completed
   */
  previewComplete(id: string): string;
}

/**
 * Interface for changelog operations.
 */
export interface IChangelogStore {
  /**
   * Appends an entry to the changelog.
   * @param entry - The changelog entry to append
   */
  appendToChangelog(entry: string): void;
}
