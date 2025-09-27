import chalk from 'chalk';
import { Command } from 'commander';

import { ILogger } from '../../types/ILogger';
import { addTaskFromFile } from '../../core/storage/todo';
import { TodoAddCommandArgs } from '../../types/command-options';
import { EXIT_CODES } from '../../constants/exit-codes';

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
export class AddTaskCommand {
  /**
   * Creates a new AddTaskCommand instance.
   *
   * @param logger - Logger instance for command execution logging
   */
  constructor(private readonly logger: ILogger) {}

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
  execute(args: TodoAddCommandArgs): Promise<void> {
    try {
      const added = addTaskFromFile(args.file, this.logger);
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
      .command('add')
      .argument('<file>', 'File containing the task to add')
      .description('Add a new task from a file')
      .action(async (file: string) => {
        const cmd = new AddTaskCommand(logger);
        await cmd.execute({ file });
      });
  }
}
