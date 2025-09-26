import chalk from 'chalk';
import { Command } from 'commander';

import { ILogger } from '../interfaces/ILogger';
import { findTaskById } from '../utils/todo';
import { getLogger } from '../utils/logger';
import { TodoShowCommandArgs } from '../interfaces/command-options';

interface TaskDetails {
  detailed_requirements?: unknown;
  validations?: unknown;
}

/**
 * Modern command for showing detailed information about a specific task.
 */
export class ShowTaskCommand {
  constructor(private readonly logger: ILogger) {}

  /**
   * Executes the show task command.
   * Displays detailed information about a task including its status, owner, requirements, and validations.
   */
  execute(args: TodoShowCommandArgs): Promise<void> {
    const task = findTaskById(args.id, this.logger);

    if (!task) {
      console.error(chalk.red(`Task ${args.id} not found`));
      this.logger.error('Task not found', { id: args.id });
      process.exitCode = 2;
      return Promise.resolve();
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

  static configure(parent: Command): void {
    parent
      .command('show')
      .argument('<id>', 'Task ID to show')
      .description('Show details of a specific task')
      .action(async (id: string) => {
        const cmd = new ShowTaskCommand(getLogger());
        await cmd.execute({ id });
      });
  }
}
