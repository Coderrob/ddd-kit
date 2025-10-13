import { ITask } from '../../types/tasks';
import { ITaskRepository } from '../../types/repository';
import { ILogger } from '../../types/observability';
import { isNullOrUndefined } from '../helpers/type-guards';

import { TaskManager } from './task.manager';

export class TaskProvider implements ITaskRepository {
  constructor(private readonly logger: ILogger) {}

  findById(id: string): Promise<ITask | null> {
    const todoManager = new TaskManager(this.logger);
    const tasks = todoManager.listTasks();
    const task = tasks.find(
      (t) => typeof t === 'object' && (t as Record<string, unknown>)['id'] === id,
    ) as ITask | null;
    return Promise.resolve(task);
  }

  findNextEligible(_filters?: string[]): Promise<ITask | null> {
    const todoManager = new TaskManager(this.logger);
    const tasks = todoManager.listTasks();
    const eligible = tasks.filter(
      (t) =>
        typeof t === 'object' &&
        typeof (t as Record<string, unknown>)['id'] === 'string' &&
        (isNullOrUndefined((t as Record<string, unknown>)['state']) ||
          (t as Record<string, unknown>)['state'] === 'pending'),
    );
    // Apply filters if any
    // For now, return first
    return Promise.resolve(eligible.length > 0 ? (eligible[0] as ITask) : null);
  }

  update(task: ITask): Promise<void> {
    const todoManager = new TaskManager(this.logger);
    todoManager.updateTaskById(task.id, task);
    return Promise.resolve();
  }

  findAll(): Promise<ITask[]> {
    const todoManager = new TaskManager(this.logger);
    return Promise.resolve(todoManager.listTasks() as ITask[]);
  }
}
