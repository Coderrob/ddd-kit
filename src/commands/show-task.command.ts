import chalk from 'chalk';
import { findTaskById } from '../core';
import { getLogger } from '../lib/logger';
import { ICommand } from '../types';

/**
 * Command for showing detailed information about a specific task.
 */
export class ShowTaskCommand implements ICommand {
  name = 'todo:show';
  description = 'Show task';

  /**
   * Creates a new ShowTaskCommand instance.
   * @param id - Optional task ID to show. Can also be provided in execute args.
   */
  constructor(private id?: string) {} // eslint-disable-line no-unused-vars

  /**
   * Executes the show task command.
   * Displays detailed information about a task including its status, owner, requirements, and validations.
   * @param args - Optional arguments containing the task ID to show.
   */
  async execute(args?: { id?: string }): Promise<void> {
    const id = args?.id ?? this.id;
    const log = getLogger();
    if (!id) {
      console.error(chalk.red('No id provided'));
      return;
    }
    const task = findTaskById(id, log);
    if (!task) {
      console.error(chalk.red(`Task ${id} not found`));
      process.exitCode = 2;
      return;
    }
    log.info('showTaskCmd fetched task', { id });
    console.log(chalk.bold(`${String(task.id)} — ${String(task.summary)}`));
    console.log('Status:', String((task as Record<string, unknown>).status ?? ''));
    console.log('Owner:', String((task as Record<string, unknown>).owner ?? 'Unassigned'));
    console.log('\nDetailed requirements:');
    try {
      console.log(
        JSON.stringify((task as Record<string, unknown>).detailed_requirements ?? {}, null, 2),
      );
    } catch (e) {
      console.log('(invalid or missing detailed_requirements)');
    }
    console.log('\nValidations:');
    try {
      console.log(JSON.stringify((task as Record<string, unknown>).validations ?? {}, null, 2));
    } catch (e) {
      console.log('(invalid or missing validations)');
    }
  }
}
