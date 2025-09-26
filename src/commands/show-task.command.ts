import chalk from 'chalk';

import { findTaskById } from '../utils/todo';

import { BaseCommand } from './base.command';

interface TaskDetails {
  detailed_requirements?: unknown;
  validations?: unknown;
}

/**
 * Command for showing detailed information about a specific task.
 */
export class ShowTaskCommand extends BaseCommand {
  name = 'todo:show';
  description = 'Show task';

  /**
   * Creates a new ShowTaskCommand instance.
   * @param id - Optional task ID to show. Can also be provided in execute args.
   */
  constructor(private readonly id?: string) {
    super();
  }

  /**
   * Executes the show task command.
   * Displays detailed information about a task including its status, owner, requirements, and validations.
   * @param args - Optional arguments containing the task ID to show.
   */
  execute(args?: Record<string, unknown>): Promise<void> {
    const id = args?.['id'] != null ? (args['id'] as string) : this['id'];
    const log = this.logger;
    if (id == null) {
      this.logError('No id provided');
      return Promise.resolve();
    }
    const task = findTaskById(id, log);
    if (task == null) {
      this.logError(`Task ${id} not found`);
      process.exitCode = 2;
      return Promise.resolve();
    }
    log.info('showTaskCmd fetched task', { id });
    this.logInfo(chalk.bold(`${String(task.id)} — ${String(task.title)}`));
    this.logInfo(`Status: ${String(task.state ?? '')}`);
    this.logInfo(`Owner: ${String(task.owner ?? 'Unassigned')}`);
    this.logInfo('\nDetailed requirements:');
    try {
      this.logInfo(JSON.stringify((task as TaskDetails).detailed_requirements ?? {}, null, 2));
    } catch {
      this.logInfo('(invalid or missing detailed_requirements)');
    }
    this.logInfo('\nValidations:');
    try {
      this.logInfo(JSON.stringify((task as TaskDetails).validations ?? {}, null, 2));
    } catch {
      this.logInfo('(invalid or missing validations)');
    }
    return Promise.resolve();
  }
}
