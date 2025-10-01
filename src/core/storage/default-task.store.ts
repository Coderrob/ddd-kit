import { ITaskStore, ITask } from '../../types';

import { TodoManager } from './todo';

/**
 * Default implementation of ITaskStore that uses the TodoManager class.
 */
export class DefaultTaskStore implements ITaskStore {
  private readonly todoManager: TodoManager;

  constructor() {
    this.todoManager = new TodoManager();
  }

  /**
   * Lists all tasks from the TODO.md file.
   */
  listTasks(): ITask[] {
    return this.todoManager.listTasks();
  }

  /**
   * Finds a task by its ID from the TODO.md file.
   */
  findTaskById(id: string): ITask | null {
    return this.todoManager.findTaskById(id);
  }

  /**
   * Adds a task from a file to the TODO.md file.
   */
  addTaskFromFile(filePath: string): boolean {
    return this.todoManager.addTaskFromFile(filePath);
  }

  /**
   * Updates a task by its ID using the TodoManager.
   */
  updateTaskById(id: string, task: ITask): boolean {
    return this.todoManager.updateTaskById(id, task);
  }

  /**
   * Removes a task by ID from the TODO.md file.
   */
  removeTaskById(id: string): boolean {
    return this.todoManager.removeTaskById(id);
  }

  /**
   * Previews the completion of a task without actually performing the action.
   */
  previewComplete(id: string): string {
    return this.todoManager.previewComplete(id);
  }
}
