import { Command } from 'commander';

import { ConsoleOutputWriter } from '../../core/rendering';
import { TaskManager } from '../../core/storage';
import {
  ICommand,
  CommandName,
  ILogger,
  IOutputWriter,
  CompleteTaskArgs,
  CompleteTaskOptions,
  EXIT_CODES,
} from '../../types';

/**
 * Command for completing a task by removing it
 * from TODO.md and adding it to CHANGELOG.md.
 */
export class CompleteTaskCommand implements ICommand {
  readonly name = CommandName.COMPLETE;
  readonly description = 'Mark a task as completed';

  constructor(
    private readonly logger: ILogger,
    private readonly outputWriter: IOutputWriter = new ConsoleOutputWriter(),
  ) {}

  /**
   * Removes the task from TODO.md and adds an entry to CHANGELOG.md.
   * @param args - Arguments containing the task ID to complete
   * @param options - Options for completion, including message and dry run flag
   * @returns Promise that resolves when the operation is complete
   *
   * @example
   * ```typescript
   * await command.execute({ id: 'TASK-123' }, { message: 'Fixed the issue', dryRun: false });
   * ```
   */
  execute(args: CompleteTaskArgs, options: CompleteTaskOptions = {}): Promise<void> {
    const todoManager = new TaskManager(this.logger);
    const task = todoManager.findTaskById(args.id);

    if (!task) {
      const message = `Task ${args.id} not found in TODO.md`;
      this.logger.error(message, { id: args.id });
      process.exitCode = EXIT_CODES.NOT_FOUND;
      return Promise.reject(message);
    }

    const summary = options.message ?? task['summary'];
    const changelogEntry = `${task.id} — ${task['summary']} — ${summary}`;

    // Handle dry run
    if (options.dryRun === true) {
      const preview = todoManager.previewComplete(args.id);
      this.outputWriter.warning('Dry run preview:');
      this.outputWriter.write(preview);
      this.logger.info('Dry run preview generated', { id: args.id });
      return Promise.resolve();
    }

    // Perform actual completion
    this.performTaskCompletion(args.id, changelogEntry, todoManager);
    return Promise.resolve();
  }

  /**
   * Performs the actual task completion by removing from TODO and adding to changelog.
   * @param id - The ID of the task to complete
   * @param changelogEntry - The entry to add to the changelog
   * @param todoManager - The TaskManager instance to use for operations
   */
  private performTaskCompletion(
    id: string,
    changelogEntry: string,
    todoManager: TaskManager,
  ): void {
    const removed = todoManager.removeTaskById(id);
    if (removed !== true) {
      this.logger.error(`Failed to remove task ${id} from TODO.md`, { id });
      process.exitCode = EXIT_CODES.OPERATION_FAILED;
      return;
    }

    todoManager.appendToChangelog(changelogEntry);
    this.logger.info(`Task ${id} completed and moved to CHANGELOG.md Unreleased`, {
      changelogEntry,
      id,
    });
  }

  /**
   * Configures the complete task command in the CLI program.
   * @param parent The parent Commander command to attach this command to.
   * @param logger Logger instance for command logging.
   * @param outputWriter Optional output writer for command output.
   */
  static configure(parent: Command, logger: ILogger, outputWriter?: IOutputWriter): void {
    parent
      .command(CommandName.COMPLETE)
      .argument('<id>', 'Task ID to complete')
      .option('--message <message>', 'Completion message')
      .option('--dry-run', 'Perform dry run without making changes')
      .description('Mark a task as completed')
      .action((id: string, options: CompleteTaskOptions) => {
        const cmd = new CompleteTaskCommand(logger, outputWriter);
        return cmd.execute({ id }, options);
      });
  }
}
