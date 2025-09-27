import { ITask } from '../../types/ITask';
import { ITaskRepository } from '../../types/ITaskRepository';
import { isNullOrUndefined } from '../helpers/type-guards';

import { listTasks, updateTaskById } from './todo';

export class TodoProvider implements ITaskRepository {
  findById(id: string): Promise<ITask | null> {
    const tasks = listTasks();
    const task = tasks.find(
      (t) => typeof t === 'object' && (t as Record<string, unknown>)['id'] === id,
    ) as ITask | null;
    return Promise.resolve(task);
  }

  findNextEligible(_filters?: string[]): Promise<ITask | null> {
    const tasks = listTasks();
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
    updateTaskById(task.id, task);
    return Promise.resolve();
  }

  findAll(): Promise<ITask[]> {
    return Promise.resolve(listTasks() as ITask[]);
  }
}
