import { ITaskStore, ITask } from '../../types';

import { TaskManager } from './task.manager';

/**
 * Default implementation of ITaskStore that uses the TodoManager class.
 */
export class DefaultTaskStore implements ITaskStore {
  private readonly todoManager: TaskManager;

  constructor() {
    this.todoManager = new TaskManager();
  }

  /**
   * Lists all tasks from the TODO.md file.
   * @returns An array of tasks.
   */
  listTasks(): ITask[] {
    return this.todoManager.listTasks();
  }

  /**
   * Finds a task by its ID from the TODO.md file.
   * @param id The ID of the task to find.
   * @returns The task if found, otherwise null.
   */
  findTaskById(id: string): ITask | null {
    return this.todoManager.findTaskById(id);
  }

  /**
   * Adds a task from a file to the TODO.md file.
   * @param filePath The path to the file containing the task.
   * @returns True if the task was added successfully, otherwise false.
   */
  addTaskFromFile(filePath: string): boolean {
    return this.todoManager.addTaskFromFile(filePath);
  }

  /**
   * Updates a task by its ID using the TodoManager.
   * @param id The ID of the task to update.
   * @param task The updated task data.
   * @returns True if the task was updated successfully, otherwise false.
   */
  updateTaskById(id: string, task: ITask): boolean {
    return this.todoManager.updateTaskById(id, task);
  }

  /**
   * Removes a task by ID from the TODO.md file.
   * @param id The ID of the task to remove.
   * @returns True if the task was removed successfully, otherwise false.
   */
  removeTaskById(id: string): boolean {
    return this.todoManager.removeTaskById(id);
  }

  /**
   * Previews the completion of a task without actually performing the action.
   * @param id The ID of the task to preview completion for.
   * @returns A string preview of the completion action.
   */
  previewComplete(id: string): string {
    return this.todoManager.previewComplete(id);
  }
}
