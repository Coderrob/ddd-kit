import { Command } from 'commander';

import { TaskManager } from '../core/storage';
import { EXIT_CODES, ILogger, CommandName } from '../types';
import { validateTasks } from '../validators/validator';

import { BaseCommand } from './base.command';

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
export class ValidateTasksCommand extends BaseCommand {
  override name = CommandName.VALIDATE;
  override description = 'Validate all tasks';

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
    const todoManager = new TaskManager(this.logger);
    const tasks = todoManager.listTasks();
    const result = validateTasks(tasks);

    if (result.isValid) {
      this.logger.info(`All ${tasks.length} tasks validate against schema`);
      return Promise.resolve();
    }

    this.logger.error('Validation errors:');
    for (const error of result.errors ?? []) {
      this.logger.error(`- ${error}`);
    }
    process.exitCode = EXIT_CODES.VALIDATION_FAILED;
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
      .command('validate')
      .description('Validate all tasks')
      .action(async () => {
        const cmd = new ValidateTasksCommand(logger);
        await cmd.execute();
      });
  }
}
