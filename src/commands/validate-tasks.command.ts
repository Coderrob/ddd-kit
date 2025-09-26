import chalk from 'chalk';

import { ICommand } from '../interfaces/ICommand';
import { getLogger } from '../utils/logger';
import { listTasks } from '../utils/todo';
import { validateTasks } from '../validators/validator';

/**
 * Command for validating all tasks in TODO.md against the task schema.
 */
export class ValidateTasksCommand implements ICommand {
  name = 'todo:validate';
  description = 'Validate tasks';

  /**
   * Executes the validate tasks command.
   * Loads all tasks from TODO.md and validates them against the JSON schema.
   */
  execute(): Promise<void> {
    const log = getLogger();
    const tasks = listTasks(log);
    const result = validateTasks(tasks);
    if (result.valid) {
      console.log(chalk.green(`All ${tasks.length} tasks validate against schema`));
      return Promise.resolve();
    }
    console.error(chalk.red('Validation errors:'));
    for (const e of result.errors ?? []) console.error(`- ${e}`);
    process.exitCode = 4;
    return Promise.resolve();
  }
}
