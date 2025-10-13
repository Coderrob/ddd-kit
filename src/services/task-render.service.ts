import { Resolver } from '../core/helpers/uid-resolver';
import { TaskHydrationService } from '../core/processing/hydrate';
import { Renderer } from '../core/rendering/renderer';
import { TaskProviderFactory } from '../core/storage';
import { ITaskRenderUseCase, ILogger, IRenderOptions, TaskProviderType } from '../types';

export class TaskRenderService implements ITaskRenderUseCase {
  private readonly hydrationService: TaskHydrationService;

  constructor(private readonly logger: ILogger) {
    const dddKitPath = process.env['DDDKIT_PATH'] ?? '.';
    const targetPath = process.env['TARGET_REPO_PATH'] ?? '.';
    const resolver = new Resolver(dddKitPath);
    const renderer = new Renderer(targetPath);
    this.hydrationService = new TaskHydrationService(resolver, renderer, logger);
  }

  async execute(taskId: string, options: IRenderOptions): Promise<void> {
    const provider = TaskProviderFactory.create(TaskProviderType.TASK, this.logger);
    const task = await provider.findById(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    const dddKitPath = process.env['DDDKIT_PATH'] ?? '.';
    const targetPath = process.env['TARGET_REPO_PATH'] ?? '.';

    await this.hydrationService.hydrateTask(task, dddKitPath, targetPath, options.pin);
  }
}
