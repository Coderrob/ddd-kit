import chalk from 'chalk';
import { Command } from 'commander';

import { TodoCompleteCommandOptions, TodoCompleteCommandArgs } from '../interfaces/command-options';
import { ILogger } from '../interfaces/ILogger';
import { getLogger } from '../utils/logger';
import { findTaskById, previewComplete, removeTaskById, appendToChangelog } from '../utils/todo';

/**
 * Modern command for completing a task by removing it from TODO.md and adding it to CHANGELOG.md.
 */
export class CompleteTaskCommand {
  constructor(private readonly logger: ILogger) {}

  /**
   * Executes the complete task command.
   * Removes the task from TODO.md and adds an entry to CHANGELOG.md.
   */
  execute(args: TodoCompleteCommandArgs, options: TodoCompleteCommandOptions = {}): void {
    const task = findTaskById(args.id, this.logger);

    if (!task) {
      console.error(chalk.red(`Task ${args.id} not found in TODO.md`));
      this.logger.error('Task not found for completion', { id: args.id });
      process.exitCode = 2;
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
    this.performTaskCompletion(args.id, changelogEntry, this.logger);
  }

  /**
   * Performs the actual task completion by removing from TODO and adding to changelog.
   */
  private performTaskCompletion(id: string, changelogEntry: string, log: ILogger): void {
    const removed = removeTaskById(id, log);
    if (removed !== true) {
      console.error(chalk.red(`Failed to remove task ${id} from TODO.md`));
      log.error('Failed to remove task from TODO.md', { id });
      process.exitCode = 3;
      return;
    }

    appendToChangelog(changelogEntry, log);
    log.info('Task completed and moved to changelog', { changelogEntry, id });
    console.log(chalk.green(`Task ${id} completed and moved to CHANGELOG.md Unreleased`));
  }

  static configure(parent: Command): void {
    parent
      .command('complete')
      .argument('<id>', 'Task ID to complete')
      .option('--message <message>', 'Completion message')
      .option('--dry-run', 'Perform dry run without making changes')
      .description('Mark a task as completed')
      .action((id: string, options: TodoCompleteCommandOptions) => {
        const cmd = new CompleteTaskCommand(getLogger());
        cmd.execute({ id }, options);
      });
  }
}
