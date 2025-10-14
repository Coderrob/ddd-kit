import { ITask, TaskState } from '../../types/tasks';
import { ITaskRepository } from '../../types/repository';
import { ILogger } from '../../types/observability';
import { isNullOrUndefined, isObject, isString } from '../helpers/type.helper';

import { TaskManager } from './task.manager';

export class TaskProvider implements ITaskRepository {
  constructor(private readonly logger: ILogger) {}

  findById(id: string): Promise<ITask | null> {
    const todoManager = new TaskManager(this.logger);
    const tasks = todoManager.listTasks();
    const task: ITask | undefined = tasks.find(
      (t) => isObject(t) && (t as Record<string, unknown>)['id'] === id,
    );
    return Promise.resolve(task ?? null);
  }

  /**
   * Finds the next eligible task for processing.
   * Eligible tasks are those that are either pending or have no state defined.
   * Optional filters can be applied to further refine the selection.
   * @param _filters Optional array of filters to apply when searching for tasks.
   * @return A promise that resolves to the next eligible task or null if none found.
   */
  findNextEligible(_filters?: string[]): Promise<ITask | null> {
    const todoManager = new TaskManager(this.logger);
    const tasks = todoManager.listTasks();
    const eligibleTasks = this.filterEligibleTasks(tasks);

    // Apply filters if any
    // For now, return first
    const firstEligible = eligibleTasks.at(0) ?? null;
    return Promise.resolve(firstEligible);
  }

  /**
   * Updates an existing task.
   * @param task The task to update.
   * @returns A promise that resolves when the update is complete.
   */
  update(task: ITask): Promise<void> {
    const todoManager = new TaskManager(this.logger);
    todoManager.updateTaskById(task.id, task);
    return Promise.resolve();
  }

  /**
   * Retrieves all tasks.
   * @returns A promise that resolves to an array of all tasks.
   */
  findAll(): Promise<ITask[]> {
    const todoManager = new TaskManager(this.logger);
    return Promise.resolve(todoManager.listTasks());
  }

  /**
   * Filters tasks to find only eligible ones (pending or without state).
   * @param tasks Array of tasks to filter.
   * @return Array of eligible tasks.
   */
  private filterEligibleTasks(tasks: ITask[]): ITask[] {
    return tasks.filter((task) => this.isTaskEligible(task));
  }

  /**
   * Checks if a task is eligible for processing.
   * @param task The task to check.
   * @return True if the task is eligible, false otherwise.
   */
  private isTaskEligible(task: ITask): boolean {
    if (!isObject(task)) return false;
    if (!this.hasValidId(task)) return false;

    const state = (task as Record<string, unknown>)['state'];
    return this.isStateEligible(state);
  }

  /**
   * Checks if a task has a valid string ID.
   * @param task The task to check.
   * @return True if the task has a valid ID, false otherwise.
   */
  private hasValidId(task: ITask): boolean {
    const id = (task as Record<string, unknown>)['id'];
    return isString(id);
  }

  /**
   * Checks if a task state is eligible for processing.
   * @param state The state to check.
   * @return True if the state is eligible (null, undefined, or 'pending'), false otherwise.
   */
  private isStateEligible(state: unknown): boolean {
    return isNullOrUndefined(state) || state === TaskState.Pending;
  }
}
