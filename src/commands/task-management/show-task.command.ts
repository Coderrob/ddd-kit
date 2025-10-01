import chalk from 'chalk';
import { Command } from 'commander';

import { ILogger } from '../../types/observability';
import { TodoManager } from '../../core/storage/todo';
import { EXIT_CODES } from '../../constants/exit-codes';
import { BaseCommand } from '../shared/base.command';
import { CommandName } from '../../types';

interface TaskDetails {
  detailed_requirements?: unknown;
  validations?: unknown;
}

/**
 * Arguments for the 'todo show' command
 */
export interface TodoShowCommandArgs {
  /** Task ID to show */
  id: string;
}

/**
 * Modern command for showing detailed information about a specific task.
 */
export class ShowTaskCommand extends BaseCommand {
  readonly name = CommandName.SHOW;
  readonly description = 'Show details of a specific task';

  /**
   * Executes the show task command.
   * Displays detailed information about a task including its status, owner, requirements, and validations.
   */
  execute(args: TodoShowCommandArgs): Promise<void> {
    const todoManager = new TodoManager(this.logger);
    const task = todoManager.findTaskById(args.id);

    if (!task) {
      const message = `Task ${args.id} not found`;
      this.logger.error(message, { id: args.id });
      process.exitCode = EXIT_CODES.NOT_FOUND;
      return Promise.reject(message);
    }

    this.logger.info('Task details displayed', { id: args.id, title: task.title });
    console.log(chalk.bold(`${task.id} — ${task.title ?? 'Untitled'}`));
    console.log(`Status: ${task.state ?? 'Unknown'}`);
    console.log(`Owner: ${task.owner ?? 'Unassigned'}`);
    console.log('\nDetailed requirements:');

    try {
      console.log(JSON.stringify((task as TaskDetails).detailed_requirements ?? {}, null, 2));
    } catch {
      console.log('(invalid or missing detailed_requirements)');
      this.logger.warn('Invalid detailed_requirements in task', { id: args.id });
    }

    console.log('\nValidations:');
    try {
      console.log(JSON.stringify((task as TaskDetails).validations ?? {}, null, 2));
    } catch {
      console.log('(invalid or missing validations)');
      this.logger.warn('Invalid validations in task', { id: args.id });
    }
    return Promise.resolve();
  }

  static configure(parent: Command, logger: ILogger): void {
    parent
      .command(CommandName.SHOW)
      .argument('<id>', 'Task ID to show')
      .description('Show details of a specific task')
      .action(async (id: string) => {
        const cmd = new ShowTaskCommand(logger);
        await cmd.execute({ id });
      });
  }
}
