import chalk from 'chalk';
import { Command } from 'commander';

import { TodoCompleteCommandOptions, TodoCompleteCommandArgs } from '../../types/command-options';
import { ILogger } from '../../types/ILogger';
import { EXIT_CODES } from '../../constants/exit-codes';
import {
  findTaskById,
  previewComplete,
  removeTaskById,
  appendToChangelog,
} from '../../core/storage/todo';

/**
 * Command for completing a task by removing it
 * from TODO.md and adding it to CHANGELOG.md.
 */
export class CompleteTaskCommand {
  constructor(private readonly logger: ILogger) {}

  /**
   * Removes the task from TODO.md and adds an entry to CHANGELOG.md.
   */
  execute(args: TodoCompleteCommandArgs, options: TodoCompleteCommandOptions = {}): void {
    const task = findTaskById(args.id, this.logger);

    if (!task) {
      this.logger.error(`Task ${args.id} not found in TODO.md`, { id: args.id });
      process.exitCode = EXIT_CODES.NOT_FOUND;
      return;
    }

    const summary = options.message ?? task['summary'];
    const changelogEntry = `${task.id} — ${task['summary']} — ${summary}`;

    // Handle dry run
    if (options.dryRun === true) {
      const preview = previewComplete(args.id);
      console.log(chalk.yellow('Dry run preview:'));
      console.log(preview);
      this.logger.info('Dry run preview generated', { id: args.id });
      return;
    }

    // Perform actual completion
    this.performTaskCompletion(args.id, changelogEntry);
  }

  /**
   * Performs the actual task completion by removing from TODO and adding to changelog.
   */
  private performTaskCompletion(id: string, changelogEntry: string): void {
    const removed = removeTaskById(id, this.logger);
    if (removed !== true) {
      this.logger.error(`Failed to remove task ${id} from TODO.md`, { id });
      process.exitCode = EXIT_CODES.OPERATION_FAILED;
      return;
    }

    appendToChangelog(changelogEntry, this.logger);
    this.logger.info(`Task ${id} completed and moved to CHANGELOG.md Unreleased`, {
      changelogEntry,
      id,
    });
  }

  static configure(parent: Command, logger: ILogger): void {
    parent
      .command('complete')
      .argument('<id>', 'Task ID to complete')
      .option('--message <message>', 'Completion message')
      .option('--dry-run', 'Perform dry run without making changes')
      .description('Mark a task as completed')
      .action((id: string, options: TodoCompleteCommandOptions) => {
        const cmd = new CompleteTaskCommand(logger);
        cmd.execute({ id }, options);
      });
  }
}
