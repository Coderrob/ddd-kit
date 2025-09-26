import type { ITaskRenderUseCase } from '../interfaces/ITaskRenderUseCase';
import { TaskProviderFactory } from '../utils/task-provider.factory';
import { hydrateTask } from '../utils/task-hydration';
import type { IRenderOptions } from '../interfaces/ITask';

export class TaskRenderService implements ITaskRenderUseCase {
  async execute(taskId: string, options: IRenderOptions): Promise<void> {
    const provider = TaskProviderFactory.create('todo');
    const task = await provider.findById(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    const dddKitPath = process.env['DDDKIT_PATH'] ?? '.';
    const targetPath = process.env['TARGET_REPO_PATH'] ?? '.';

    await hydrateTask(task, dddKitPath, targetPath, options.pin);
  }
}
