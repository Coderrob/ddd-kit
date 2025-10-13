import chalk from 'chalk';
import { Command } from 'commander';

import { CompleteTaskArgs, CompleteTaskOptions } from '../../types/tasks';
import { ILogger } from '../../types/observability';
import { EXIT_CODES } from '../../constants/exit-codes';
import { TaskManager } from '../../core/storage/task.manager';
import { CommandName, ICommand } from '../../types';

/**
 * Command for completing a task by removing it
 * from TODO.md and adding it to CHANGELOG.md.
 */
export class CompleteTaskCommand implements ICommand {
  readonly name = CommandName.COMPLETE;
  readonly description = 'Mark a task as completed';

  constructor(private readonly logger: ILogger) {}

  /**
   * Removes the task from TODO.md and adds an entry to CHANGELOG.md.
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
      console.log(chalk.yellow('Dry run preview:'));
      console.log(preview);
      this.logger.info('Dry run preview generated', { id: args.id });
      return Promise.resolve();
    }

    // Perform actual completion
    this.performTaskCompletion(args.id, changelogEntry, todoManager);
    return Promise.resolve();
  }

  /**
   * Performs the actual task completion by removing from TODO and adding to changelog.
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

  static configure(parent: Command, logger: ILogger): void {
    parent
      .command(CommandName.COMPLETE)
      .argument('<id>', 'Task ID to complete')
      .option('--message <message>', 'Completion message')
      .option('--dry-run', 'Perform dry run without making changes')
      .description('Mark a task as completed')
      .action((id: string, options: CompleteTaskOptions) => {
        const cmd = new CompleteTaskCommand(logger);
        return cmd.execute({ id }, options);
      });
  }
}
