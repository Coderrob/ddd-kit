import { ITask } from './ITask';
import { IHydrationOptions } from './IHydrationOptions';

/**
 * Use case for hydrating the next eligible task.
 */
export interface ITaskHydrationUseCase {
  execute(options: IHydrationOptions): Promise<ITask>;
}
