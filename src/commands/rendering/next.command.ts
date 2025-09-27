import { Command } from 'commander';

import { ILogger } from '../../types/ILogger';
import { TaskProviderType } from '../../types';
import { ITaskRepository } from '../../types/ITaskRepository';
import { hydrateTask } from '../../core/processing/task-hydration';
import { TaskProviderFactory } from '../../core/storage/task-provider.factory';
import { IHydrationOptions, ITask } from '../../types/ITask';
import { NextCommandOptions } from '../../types/command-options';
import { isNullOrUndefined } from '../../core/helpers/type-guards';

/**
 * Command for hydrating the next task.
 * Refactored to follow Clean Architecture and SOLID principles:
 * - SRP: Focuses only on command execution orchestration
 * - DIP: Uses factory for provider creation
 * - ISP: Specific options interface instead of generic object
 */
export class NextCommand {
  constructor(private readonly logger: ILogger) {}

  /**
   * Executes the next command.
   */
  async execute(options: IHydrationOptions): Promise<void> {
    this.logger.info('Executing next command', { ...options });

    try {
      const provider = this.createProvider(options.provider ?? 'todo');
      const task = await this.findNextTask(provider, options);

      if (!task) {
        console.log('No eligible tasks found');
        this.logger.info('No eligible tasks found for next command');
        return;
      }

      await this.hydrateAndUpdateTask(task, options, provider);
      console.log(`Hydrated task ${task.id}`);
      this.logger.info('Task hydrated and updated', { taskId: task.id });
    } catch (error) {
      this.logger.error('Failed to execute next command', { error: String(error) });
      throw error;
    }
  }

  /**
   * Creates a task provider based on the provider type.
   */
  private createProvider(providerType: string): ITaskRepository {
    let taskProviderType: TaskProviderType;
    switch (providerType) {
      case 'issues':
        taskProviderType = TaskProviderType.ISSUES;
        break;
      case 'projects':
        taskProviderType = TaskProviderType.PROJECTS;
        break;
      default:
        taskProviderType = TaskProviderType.TODO;
    }
    return TaskProviderFactory.create(taskProviderType);
  }

  /**
   * Finds the next eligible task.
   */
  private async findNextTask(
    provider: ITaskRepository,
    options: IHydrationOptions,
  ): Promise<ITask | null> {
    const task = await provider.findNextEligible(options.filters);
    if (task !== null) {
      this.logger.info('Selected task', { taskId: task.id });
    }
    return task;
  }

  /**
   * Hydrates and updates the task.
   */
  private async hydrateAndUpdateTask(
    task: ITask,
    options: IHydrationOptions,
    provider: ITaskRepository,
  ): Promise<void> {
    // Get environment configuration
    const dddKitPath = process.env['DDDKIT_PATH'] ?? '.';
    const targetPath = process.env['TARGET_REPO_PATH'] ?? '.';

    // Hydrate the task
    await hydrateTask(task, dddKitPath, targetPath, options.pin);

    // Update task status
    const updatedTask: ITask = {
      ...task,
      branch: `${options.branchPrefix ?? 'feature/'}${task.id}`,
      resolvedReferences: [], // TODO: get from hydrate
      state: 'in-progress' as const,
    };

    if (!isNullOrUndefined(options.pin)) {
      updatedTask.dddKitCommit = options.pin;
    }

    await provider.update(updatedTask);
  }

  static configure(program: Command, logger: ILogger): void {
    program
      .command('next')
      .description('Hydrate the next eligible task')
      .option('--provider <provider>', 'Task provider: todo, issues, projects', 'todo')
      .option('--filters <filters...>', 'Filters for task selection')
      .option('--branch-prefix <prefix>', 'Branch prefix', 'feature/')
      .option('--pin <sha>', 'Pin to specific ddd-kit commit/tag')
      .option('--open-pr', 'Open PR after hydration')
      .action(async (options: NextCommandOptions) => {
        const cmd = new NextCommand(logger);
        await cmd.execute(options);
      });
  }
}
