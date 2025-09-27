import { IHydrationOptions, ITask } from './ITask';

/**
 * Use case for hydrating the next eligible task.
 */
export interface ITaskHydrationUseCase {
  execute(options: IHydrationOptions): Promise<ITask>;
}
