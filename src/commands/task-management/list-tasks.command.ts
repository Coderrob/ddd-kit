import { Command } from 'commander';

import { ILogger } from '../../types/observability';
import { TaskManager } from '../../core/storage/task.manager';
import { BaseCommand } from '../shared/base.command';
import { CommandName } from '../../types';
import { IOutputWriter } from '../../types/rendering';

/**
 * Modern command for listing all tasks from the TODO.md file.
 */
export class ListTasksCommand extends BaseCommand {
  readonly name = CommandName.LIST;
  readonly description = 'List all tasks';

  constructor(logger: ILogger, outputWriter?: IOutputWriter) {
    super(logger, outputWriter);
  }

  /**
   * Executes the list tasks command that retrieves all tasks from
   * TODO.md and displays them in a formatted list.
   * @returns Promise that resolves when the operation is complete
   *
   * @example
   * ```typescript
   * await command.execute();
   * ```
   */
  execute(): Promise<void> {
    const todoManager = new TaskManager(this.logger);
    const tasks = todoManager.listTasks();

    if (!tasks.length) {
      this.outputWriter.warning('No tasks found in TODO.md');
      return Promise.resolve();
    }

    for (const task of tasks) {
      this.outputWriter.write(`${task.id}  ${task['priority'] ?? 'P2'}  ${task['summary'] ?? ''}`);
    }

    return Promise.resolve();
  }

  /**
   * Configures the list tasks command in the CLI program.
   * @param parent The parent Commander command to attach this command to.
   * @param logger Logger instance for command logging.
   * @param outputWriter Optional output writer for command output.
   */
  static configure(parent: Command, logger: ILogger, outputWriter?: IOutputWriter): void {
    parent
      .command(CommandName.LIST)
      .description('List all tasks')
      .action(async () => {
        const cmd = new ListTasksCommand(logger, outputWriter);
        await cmd.execute();
      });
  }
}
