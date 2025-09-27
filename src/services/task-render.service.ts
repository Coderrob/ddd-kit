import type { ITaskRenderUseCase } from '../types/ITaskRenderUseCase';
import { TaskProviderType } from '../types';
import { TaskProviderFactory } from '../core/storage/task-provider.factory';
import { hydrateTask } from '../core/processing/task-hydration';
import type { IRenderOptions } from '../types/ITask';

export class TaskRenderService implements ITaskRenderUseCase {
  async execute(taskId: string, options: IRenderOptions): Promise<void> {
    const provider = TaskProviderFactory.create(TaskProviderType.TODO);
    const task = await provider.findById(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    const dddKitPath = process.env['DDDKIT_PATH'] ?? '.';
    const targetPath = process.env['TARGET_REPO_PATH'] ?? '.';

    await hydrateTask(task, dddKitPath, targetPath, options.pin);
  }
}
