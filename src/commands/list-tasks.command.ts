import chalk from 'chalk';
import { listTasks } from '../core';
import { getLogger } from '../lib/logger';
import { ICommand } from '../types';

/**
 * Command for listing all tasks from the TODO.md file.
 */
export class ListTasksCommand implements ICommand {
  name = 'todo:list';
  description = 'List tasks';

  /**
   * Executes the list tasks command.
   * Retrieves all tasks from TODO.md and displays them in a formatted list.
   */
  async execute(): Promise<void> {
    const log = getLogger();
    const tasks = listTasks(log);
    if (!tasks.length) {
      console.log(chalk.yellow('No tasks found in TODO.md'));
      return;
    }
    for (const t of tasks) {
      console.log(`${chalk.cyan(t.id)}  ${t.priority || 'P2'}  ${t.summary || ''}`);
    }
  }
}
