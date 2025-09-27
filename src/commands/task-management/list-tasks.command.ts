import chalk from 'chalk';
import { Command } from 'commander';

import { ILogger } from '../../types/ILogger';
import { listTasks } from '../../core/storage/todo';

/**
 * Modern command for listing all tasks from the TODO.md file.
 */
export class ListTasksCommand {
  constructor(private readonly logger: ILogger) {}

  /**
   * Executes the list tasks command.
   * Retrieves all tasks from TODO.md and displays them in a formatted list.
   */
  execute(): Promise<void> {
    const tasks = listTasks(this.logger);

    if (!tasks.length) {
      console.log(chalk.yellow('No tasks found in TODO.md'));
      this.logger.info('No tasks found in TODO.md');
      return Promise.resolve();
    }

    this.logger.info('Listed tasks', { taskCount: tasks.length });
    for (const task of tasks) {
      console.log(`${chalk.cyan(task.id)}  ${task['priority'] ?? 'P2'}  ${task['summary'] ?? ''}`);
    }

    return Promise.resolve();
  }

  static configure(parent: Command, logger: ILogger): void {
    parent
      .command('list')
      .description('List all tasks')
      .action(async () => {
        const cmd = new ListTasksCommand(logger);
        await cmd.execute();
      });
  }
}
