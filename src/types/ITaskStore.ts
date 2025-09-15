import { Task } from './Task';

export interface ITaskStore {
  updateTaskById(id: string, task: Task): Promise<boolean>; // eslint-disable-line no-unused-vars
}
