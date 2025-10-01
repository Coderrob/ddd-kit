import { Command } from 'commander';

import { ILogger } from '../../types/observability';
import { TodoManager } from '../../core/storage/todo';
import { BaseCommand } from '../shared/base.command';
import { CommandName } from '../../types';

/**
 * Modern command for listing all tasks from the TODO.md file.
 */
export class ListTasksCommand extends BaseCommand {
  readonly name = CommandName.LIST;
  readonly description = 'List all tasks';

  /**
   * Executes the list tasks command.
   * Retrieves all tasks from TODO.md and displays them in a formatted list.
   */
  execute(): Promise<void> {
    const todoManager = new TodoManager(this.logger);
    const tasks = todoManager.listTasks();

    if (!tasks.length) {
      console.log('No tasks found in TODO.md');
      return Promise.resolve();
    }

    for (const task of tasks) {
      console.log(`${task.id}  ${task['priority'] ?? 'P2'}  ${task['summary'] ?? ''}`);
    }

    return Promise.resolve();
  }

  static configure(parent: Command, logger: ILogger): void {
    parent
      .command(CommandName.LIST)
      .description('List all tasks')
      .action(async () => {
        const cmd = new ListTasksCommand(logger);
        await cmd.execute();
      });
  }
}
