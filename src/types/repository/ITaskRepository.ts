import { ITask } from '../tasks/ITask';

export interface ITaskRepository {
  findById(id: string): Promise<ITask | null>;
  findNextEligible(filters?: string[]): Promise<ITask | null>;
  update(task: ITask): Promise<void>;
  findAll(): Promise<ITask[]>;
}
