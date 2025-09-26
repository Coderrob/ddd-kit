import { ITask } from './ITask';

export interface ITaskStore {
  updateTaskById(id: string, task: ITask): Promise<boolean>;
}
