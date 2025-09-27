import type { IRenderOptions } from './ITask';

/**
 * Use case for re-rendering guidance for a specific task.
 */
export interface ITaskRenderUseCase {
  execute(taskId: string, options: IRenderOptions): Promise<void>;
}
