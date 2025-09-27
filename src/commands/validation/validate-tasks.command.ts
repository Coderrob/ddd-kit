import chalk from 'chalk';
import { Command } from 'commander';

import { listTasks } from '../../core/storage/todo';
import { ILogger } from '../../types/ILogger';
import { validateTasks } from '../../validators/validator';

/**
 * Modern command for validating all tasks in TODO.md against the task schema.
 *
 * This command loads all tasks from the TODO.md file and validates each one
 * against the defined JSON schema. It provides comprehensive validation
 * reporting and sets appropriate exit codes for CI/CD integration.
 *
 * @example
 * ```typescript
 * const logger = getLogger();
 * const command = new ValidateTasksCommand(logger);
 * await command.execute();
 * ```
 */
export class ValidateTasksCommand {
  /**
   * Creates a new ValidateTasksCommand instance.
   *
   * @param logger - Logger instance for command execution logging
   */
  constructor(private readonly logger: ILogger) {}

  /**
   * Executes the validate tasks command.
   *
   * Loads all tasks from TODO.md and validates them against the JSON schema.
   * Provides user feedback through console output and sets process exit codes
   * for automation tools.
   *
   * @returns Promise that resolves when validation is complete
   *
   * @example
   * ```typescript
   * try {
   *   await command.execute();
   *   console.log('All tasks are valid');
   * } catch (error) {
   *   console.error('Validation failed');
   * }
   * ```
   */
  execute(): Promise<void> {
    const tasks = listTasks(this.logger);
    const result = validateTasks(tasks);

    if (result.valid) {
      console.log(chalk.green(`All ${tasks.length} tasks validate against schema`));
      this.logger.info('All tasks validated successfully', { taskCount: tasks.length });
      return Promise.resolve();
    }

    this.logger.error('Validation errors:');
    this.logger.error('Task validation failed', { errorCount: result.errors?.length ?? 0 });
    for (const error of result.errors ?? []) {
      this.logger.error(`- ${error}`);
    }
    process.exitCode = 4;
    return Promise.resolve();
  }

  /**
   * Configures the validate tasks command for Commander.js.
   *
   * Sets up the CLI interface for the validate tasks command, defining the
   * command name, description, and action handler. This static method is
   * called during application initialization to register the command.
   *
   * @param parent - The parent Commander.js command to attach this command to
   *
   * @example
   * ```typescript
   * const program = new Command();
   * ValidateTasksCommand.configure(program);
   * ```
   */
  static configure(parent: Command, logger: ILogger): void {
    parent
      .command('tasks')
      .description('Validate all tasks')
      .action(async () => {
        const cmd = new ValidateTasksCommand(logger);
        await cmd.execute();
      });
  }
}
