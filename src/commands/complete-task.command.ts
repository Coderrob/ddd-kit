import chalk from 'chalk';

import { ICommand } from '../interfaces/ICommand';
import { ILogger } from '../interfaces/ILogger';
import { getLogger } from '../utils/logger';
import { findTaskById, previewComplete, removeTaskById, appendToChangelog } from '../utils/todo';

/**
 * Command for completing a task by removing it from TODO.md and adding it to CHANGELOG.md.
 */
export class CompleteTaskCommand implements ICommand {
  name = 'todo:complete';
  description = 'Complete task';

  /**
   * Creates a new CompleteTaskCommand instance.
   * @param id - Optional task ID to complete. Can also be provided in execute args.
   * @param opts - Optional configuration options for the completion.
   */
  constructor(
    private readonly id?: string, // eslint-disable-line no-unused-vars
    private readonly opts?: { message?: string; dryRun?: boolean }, // eslint-disable-line no-unused-vars
  ) {}

  /**
   * Executes the complete task command.
   * Removes the task from TODO.md and adds an entry to CHANGELOG.md.
   * @param args - Optional arguments containing the task ID and completion options.
   */
  execute(args?: { id?: string; opts?: { message?: string; dryRun?: boolean } }): void {
    const id = args?.id ?? this.id;
    const opts = args?.opts ?? this.opts ?? {};
    const log = getLogger();

    // Early return for missing ID
    if (id == null) {
      console.error(chalk.red('No id provided'));
      return;
    }

    const task = findTaskById(id, log);

    // Early return for task not found
    if (!task) {
      console.error(chalk.red(`Task ${id} not found in TODO.md`));
      process.exitCode = 2;
      return;
    }

    const summary = opts.message ?? task['summary'];
    const changelogEntry = `${task.id} — ${task['summary']} — ${summary}`;

    // Handle dry run
    if (opts.dryRun === true) {
      const preview = previewComplete(id);
      console.log(chalk.yellow('Dry run preview:'));
      console.log(preview);
      return;
    }

    // Perform actual completion
    this.performTaskCompletion(id, changelogEntry, log);
  }

  /**
   * Performs the actual task completion by removing from TODO and adding to changelog.
   */
  private performTaskCompletion(id: string, changelogEntry: string, log: ILogger): void {
    const removed = removeTaskById(id, log);
    if (removed !== true) {
      console.error(chalk.red(`Failed to remove task ${id} from TODO.md`));
      process.exitCode = 3;
      return;
    }

    appendToChangelog(changelogEntry, log);
    log.info('completeTaskCmd moved task to changelog', { changelogEntry, id });
    console.log(chalk.green(`Task ${id} completed and moved to CHANGELOG.md Unreleased`));
  }
}
