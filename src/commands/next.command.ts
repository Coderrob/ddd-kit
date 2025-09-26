import { getLogger } from '../utils/logger';
import { hydrateTask } from '../utils/task-hydration';
import { TaskProviderFactory } from '../utils/task-provider.factory';
import { IHydrationOptions, ITask } from '../interfaces/ITask';

/**
 * Command for hydrating the next task.
 * Refactored to follow Clean Architecture and SOLID principles:
 * - SRP: Focuses only on command execution orchestration
 * - DIP: Uses factory for provider creation
 * - ISP: Specific options interface instead of generic object
 */
export class NextCommand {
  /**
   * Executes the next command.
   */
  async execute(options: IHydrationOptions): Promise<void> {
    const log = getLogger();
    log.info('Executing next command', { ...options });

    try {
      // Create provider using factory (DIP, OCP)
      const provider = TaskProviderFactory.create(options.provider ?? 'todo');

      // Find next eligible task
      const task = await provider.findNextEligible(options.filters);
      if (!task) {
        console.log('No eligible tasks found');
        return;
      }

      log.info('Selected task', { taskId: task.id });

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
      if (options.pin != null) {
        updatedTask.dddKitCommit = options.pin;
      }

      await provider.update(updatedTask);

      console.log(`Hydrated task ${task.id}`);
    } catch (error) {
      log.error('Failed to execute next command', { error: String(error) });
      throw error;
    }
  }
}
