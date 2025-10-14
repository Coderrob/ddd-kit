import { Command } from 'commander';

import { ConsoleOutputWriter } from '../../core/rendering';
import { TaskManager } from '../../core/storage';
import { CommandName, ILogger, IOutputWriter, AddTaskArgs, EXIT_CODES } from '../../types';
import { BaseCommand } from '../shared/base.command';

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

  constructor(
    logger: ILogger,
    protected override readonly outputWriter: IOutputWriter = new ConsoleOutputWriter(),
  ) {
    super(logger, outputWriter);
  }

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
      const manager = new TaskManager(this.logger);
      const added = manager.addTaskFromFile(args.file);

      if (added) {
        this.handleSuccessfulAddition(args.file);
        return Promise.resolve();
      }

      this.handleFailedAddition(args.file);
      return Promise.resolve();
    } catch (error: unknown) {
      this.handleAdditionError(error, args.file);
      return Promise.resolve();
    }
  }

  /**
   * Handles successful task addition.
   * @param filePath - The path of the file being processed
   */
  private handleSuccessfulAddition(filePath: string): void {
    this.outputWriter.success(`Task added to TODO.md from ${filePath}`);
    this.logger.info('Task added successfully', { file: filePath });
  }

  /**
   * Handles failed task addition.
   * @param filePath - The path of the file being processed
   */
  private handleFailedAddition(filePath: string): void {
    this.logger.error(`Failed to add task from ${filePath}`, { file: filePath });
    process.exitCode = EXIT_CODES.GENERAL_ERROR;
  }

  /**
   * Handles errors during task addition.
   * @param error - The error that occurred
   * @param filePath - The path of the file being processed
   */
  private handleAdditionError(error: unknown, filePath: string): void {
    const message = error instanceof Error ? error.message : String(error);
    this.logger.error(`Error adding task: ${message}`, { error: message, file: filePath });
    process.exitCode = EXIT_CODES.NOT_FOUND;
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
  static configure(parent: Command, logger: ILogger, outputWriter?: IOutputWriter): void {
    parent
      .command(CommandName.ADD)
      .argument('<file>', 'File containing the task to add')
      .description('Add a new task from a file')
      .action(async (file: string) => {
        const cmd = new AddTaskCommand(logger, outputWriter);
        await cmd.execute({ file });
      });
  }
}
