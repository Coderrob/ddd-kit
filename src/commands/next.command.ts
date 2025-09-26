import { Command } from 'commander';

import { ILogger } from '../interfaces/ILogger';
import { getLogger } from '../utils/logger';
import { hydrateTask } from '../utils/task-hydration';
import { TaskProviderFactory } from '../utils/task-provider.factory';
import { IHydrationOptions, ITask } from '../interfaces/ITask';
import { NextCommandOptions } from '../interfaces/command-options';
import { isNullOrUndefined } from '../utils/type-guards';

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
      // Create provider using factory (DIP, OCP)
      const provider = TaskProviderFactory.create(options.provider ?? 'todo');

      // Find next eligible task
      const task = await provider.findNextEligible(options.filters);
      if (!task) {
        console.log('No eligible tasks found');
        this.logger.info('No eligible tasks found for next command');
        return;
      }

      this.logger.info('Selected task', { taskId: task.id });

      // Get environment configuration
      const dddKitPath = process.env['DDDKIT_PATH'] ?? '.';
      const targetPath = process.env['TARGET_REPO_PATH'] ?? '.';

      // Hydrate the task
      await hydrateTask(task, dddKitPath, targetPath, options.pin);

      // Update task status (this should be part of the use case)
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

      console.log(`Hydrated task ${task.id}`);
      this.logger.info('Task hydrated and updated', { taskId: task.id });
    } catch (error) {
      this.logger.error('Failed to execute next command', { error: String(error) });
      throw error;
    }
  }

  static configure(program: Command): void {
    program
      .command('next')
      .description('Hydrate the next eligible task')
      .option('--provider <provider>', 'Task provider: todo, issues, projects', 'todo')
      .option('--filters <filters...>', 'Filters for task selection')
      .option('--branch-prefix <prefix>', 'Branch prefix', 'feature/')
      .option('--pin <sha>', 'Pin to specific ddd-kit commit/tag')
      .option('--open-pr', 'Open PR after hydration')
      .action(async (options: NextCommandOptions) => {
        const cmd = new NextCommand(getLogger());
        await cmd.execute(options);
      });
  }
}
