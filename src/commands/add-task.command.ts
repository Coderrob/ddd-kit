import chalk from 'chalk';
import { Command } from 'commander';

import { ILogger } from '../interfaces/ILogger';
import { getLogger } from '../utils/logger';
import { addTaskFromFile } from '../utils/todo';
import { TodoAddCommandArgs } from '../interfaces/command-options';

/**
 * Modern command for adding a new task from a file to the TODO.md.
 */
export class AddTaskCommand {
  constructor(private readonly logger: ILogger) {}

  /**
   * Executes the add task command.
   * Reads a task from a file and adds it to the TODO.md file.
   */
  execute(args: TodoAddCommandArgs): Promise<void> {
    try {
      const added = addTaskFromFile(args.file, this.logger);
      if (added) {
        console.log(chalk.green(`Task added to TODO.md from ${args.file}`));
        this.logger.info('Task added successfully', { file: args.file });
      } else {
        console.error(chalk.red(`Failed to add task from ${args.file}`));
        this.logger.error('Failed to add task', { file: args.file });
        process.exitCode = 1;
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(chalk.red('Error adding task:'), message);
      this.logger.error('Error adding task', { error: message, file: args.file });
      process.exitCode = 2;
    }
    return Promise.resolve();
  }

  static configure(parent: Command): void {
    parent
      .command('add')
      .argument('<file>', 'File containing the task to add')
      .description('Add a new task from a file')
      .action(async (file: string) => {
        const cmd = new AddTaskCommand(getLogger());
        await cmd.execute({ file });
      });
  }
}
