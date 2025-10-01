import chalk from 'chalk';
import { Command } from 'commander';

import { ILogger } from '../../types/observability';
import { TodoManager } from '../../core/storage/todo';
import { AddTaskArgs } from '../../types/tasks';
import { EXIT_CODES } from '../../constants/exit-codes';
import { BaseCommand } from '../shared/base.command';
import { CommandName } from '../../types';

/**
 * Command for adding a new task from a file to the TODO.md.
 *
 * This command reads task definitions from external files and appends them
 * to the TODO.md file. It supports various file formats and provides
 * comprehensive error handling and logging.
 *
 * @example
 * ```typescript
 * const logger = getLogger();
 * const command = new AddTaskCommand(logger);
 * await command.execute({ file: 'tasks/new-feature.md' });
 * ```
 */
export class AddTaskCommand extends BaseCommand {
  readonly name = CommandName.ADD;
  readonly description = 'Add a new task from a file';

  /**
   * Executes the add task command.
   *
   * Reads a task from the specified file and adds it to the TODO.md file.
   * Provides user feedback through console output and structured logging.
   *
   * @param args - Command arguments containing the file path
   * @param args.file - Path to the file containing the task definition
   * @returns Promise that resolves when the command execution is complete
   *
   * @example
   * ```typescript
   * await command.execute({ file: 'tasks/implement-feature.md' });
   * ```
   */
  execute(args: AddTaskArgs): Promise<void> {
    try {
      const manager = new TodoManager(this.logger);
      const added = manager.addTaskFromFile(args.file);
      if (added) {
        console.log(chalk.green(`Task added to TODO.md from ${args.file}`));
        this.logger.info('Task added successfully', { file: args.file });
      } else {
        this.logger.error(`Failed to add task from ${args.file}`, { file: args.file });
        process.exitCode = EXIT_CODES.GENERAL_ERROR;
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error adding task: ${message}`, { error: message, file: args.file });
      process.exitCode = EXIT_CODES.NOT_FOUND;
    }
    return Promise.resolve();
  }

  /**
   * Configures the add task command for Commander.js.
   *
   * Sets up the CLI interface for the add task command, defining arguments,
   * options, and the action handler. This static method is called during
   * application initialization to register the command.
   *
   * @param parent - The parent Commander.js command to attach this command to
   *
   * @example
   * ```typescript
   * const program = new Command();
   * AddTaskCommand.configure(program);
   * ```
   */
  static configure(parent: Command, logger: ILogger): void {
    parent
      .command(CommandName.ADD)
      .argument('<file>', 'File containing the task to add')
      .description('Add a new task from a file')
      .action(async (file: string) => {
        const cmd = new AddTaskCommand(logger);
        await cmd.execute({ file });
      });
  }
}
