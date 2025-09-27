import { ITaskStore, ITask } from '../../types';

import { updateTaskById } from './todo';

/**
 * Default implementation of ITaskStore that uses the todo module functions.
 */
export class DefaultTaskStore implements ITaskStore {
  /**
   * Updates a task by its ID using the todo module's updateTaskById function.
   * @param id - The task ID to update.
   * @param task - The updated Task object.
   * @returns A Promise that resolves to true if the update was successful, false otherwise.
   */
  updateTaskById(id: string, task: ITask): Promise<boolean> {
    const result = updateTaskById(id, task);
    return Promise.resolve(result);
  }
}
