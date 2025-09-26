import chalk from 'chalk';

import { listTasks } from '../utils/todo';

import { BaseCommand } from './base.command';

/**
 * Command for listing all tasks from the TODO.md file.
 */
export class ListTasksCommand extends BaseCommand {
  name = 'todo:list';
  description = 'List tasks';

  /**
   * Executes the list tasks command.
   * Retrieves all tasks from TODO.md and displays them in a formatted list.
   */
  execute(): Promise<void> {
    const log = this.logger;
    const tasks = listTasks(log);
    if (!tasks.length) {
      this.logInfo(chalk.yellow('No tasks found in TODO.md'));
      return Promise.resolve();
    }
    for (const t of tasks) {
      this.logInfo(`${chalk.cyan(t.id)}  ${t['priority'] ?? 'P2'}  ${t['summary'] ?? ''}`);
    }
    return Promise.resolve();
  }
}
