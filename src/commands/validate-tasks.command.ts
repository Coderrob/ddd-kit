import chalk from 'chalk';
import { Command } from 'commander';

import { ILogger } from '../interfaces/ILogger';
import { getLogger } from '../utils/logger';
import { listTasks } from '../utils/todo';
import { validateTasks } from '../validators/validator';

/**
 * Modern command for validating all tasks in TODO.md against the task schema.
 */
export class ValidateTasksCommand {
  constructor(private readonly logger: ILogger) {}

  /**
   * Executes the validate tasks command.
   * Loads all tasks from TODO.md and validates them against the JSON schema.
   */
  execute(): Promise<void> {
    const tasks = listTasks(this.logger);
    const result = validateTasks(tasks);

    if (result.valid) {
      console.log(chalk.green(`All ${tasks.length} tasks validate against schema`));
      this.logger.info('All tasks validated successfully', { taskCount: tasks.length });
      return Promise.resolve();
    }

    console.error(chalk.red('Validation errors:'));
    this.logger.error('Task validation failed', { errorCount: result.errors?.length ?? 0 });
    for (const error of result.errors ?? []) {
      console.error(`- ${error}`);
    }
    process.exitCode = 4;
    return Promise.resolve();
  }

  static configure(parent: Command): void {
    parent
      .command('tasks')
      .description('Validate all tasks')
      .action(async () => {
        const cmd = new ValidateTasksCommand(getLogger());
        await cmd.execute();
      });
  }
}
