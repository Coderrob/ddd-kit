import { AddTaskCommand } from '../commands/task-management/add-task.command';
import { CompleteTaskCommand } from '../commands/task-management/complete-task.command';
import { ListTasksCommand } from '../commands/task-management/list-tasks.command';
import { ShowTaskCommand } from '../commands/task-management/show-task.command';
import { ValidateAndFixCommand } from '../commands/validation/validate-and-fix.command';
import { ValidateTasksCommand } from '../commands/validation/validate-tasks.command';
import { ILogger } from '../types/ILogger';
import { getLogger } from '../core/system/logger';
import { ValidationResultRenderer } from '../core/rendering/validation-result.renderer';

/**
 * Command options interface for common command parameters.
 *
 * @interface CommandOptions
 * @property logger - Optional logger instance for command execution logging
 */
interface CommandOptions {
  logger?: ILogger;
}

/**
 * Modern compatibility function for listing tasks.
 *
 * Executes the list tasks command to display all tasks from TODO.md in a
 * formatted console output.
 *
 * @param options - Command execution options
 * @param options.logger - Optional logger instance for command execution logging
 *
 * @example
 * ```typescript
 * // Basic usage
 * listTasksCmd();
 *
 * // With custom logger
 * listTasksCmd({ logger: customLogger });
 * ```
 */
export function listTasksCmd(options: CommandOptions = {}): void {
  const logger = options.logger ?? getLogger();
  new ListTasksCommand(logger).execute();
}

/**
 * Modern compatibility function for showing a task.
 *
 * Executes the show task command to display detailed information about a
 * specific task including its status, owner, requirements, and validations.
 *
 * @param id - The unique identifier of the task to display
 * @param options - Command execution options
 * @param options.logger - Optional logger instance for command execution logging
 *
 * @example
 * ```typescript
 * // Basic usage
 * showTaskCmd('TASK-123');
 *
 * // With custom logger
 * showTaskCmd('TASK-123', { logger: customLogger });
 * ```
 */
export function showTaskCmd(id: string, options: CommandOptions = {}): void {
  const logger = options.logger ?? getLogger();
  new ShowTaskCommand(logger).execute({ id });
}

/**
 * Modern compatibility function for completing a task.
 *
 * Executes the complete task command to remove a task from TODO.md and
 * add it to CHANGELOG.md as a completed entry.
 *
 * @param id - The unique identifier of the task to complete
 * @param opts - Task completion options combined with command options
 * @param opts.message - Optional completion message (defaults to task summary)
 * @param opts.dryRun - If true, shows preview without making changes
 * @param opts.logger - Optional logger instance for command execution logging
 *
 * @example
 * ```typescript
 * // Basic completion
 * completeTaskCmd('TASK-123');
 *
 * // With custom message
 * completeTaskCmd('TASK-123', { message: 'Feature implemented successfully' });
 *
 * // Dry run preview
 * completeTaskCmd('TASK-123', { dryRun: true });
 * ```
 */
export function completeTaskCmd(
  id: string,
  opts: { message?: string; dryRun?: boolean } & CommandOptions = {},
): void {
  const logger = opts.logger ?? getLogger();
  new CompleteTaskCommand(logger).execute({ id }, opts);
}

/**
 * Modern compatibility function for adding a task from a file.
 *
 * Executes the add task command to read a task definition from a file
 * and append it to the TODO.md file.
 *
 * @param file - Path to the file containing the task definition
 * @param options - Command execution options
 * @param options.logger - Optional logger instance for command execution logging
 *
 * @example
 * ```typescript
 * // Basic usage
 * addTaskCmd('tasks/new-feature.md');
 *
 * // With custom logger
 * addTaskCmd('tasks/bugfix.md', { logger: customLogger });
 * ```
 */
export function addTaskCmd(file: string, options: CommandOptions = {}): void {
  const logger = options.logger ?? getLogger();
  new AddTaskCommand(logger).execute({ file });
}

/**
 * Modern compatibility function for validating tasks.
 *
 * Executes the validate tasks command to check all tasks in TODO.md
 * against the task schema and report any validation errors.
 *
 * @param options - Command execution options
 * @param options.logger - Optional logger instance for command execution logging
 *
 * @example
 * ```typescript
 * // Basic usage
 * validateTasksCmd();
 *
 * // With custom logger
 * validateTasksCmd({ logger: customLogger });
 * ```
 */
export function validateTasksCmd(options: CommandOptions = {}): void {
  const logger = options.logger ?? getLogger();
  new ValidateTasksCommand(logger).execute();
}

/**
 * Options for the validateAndFixCmd function.
 *
 * @interface ValidateAndFixOptions
 * @extends CommandOptions
 * @property fix - Whether to automatically apply fixes to validation errors
 * @property dryRun - If true, shows planned fixes without applying them
 * @property format - Output format for results ('json' or 'csv')
 * @property excludePattern - Pattern to exclude certain tasks from processing
 */
interface ValidateAndFixOptions extends CommandOptions {
  fix: boolean;
  dryRun: boolean;
  format?: 'json' | 'csv';
  excludePattern?: string;
}

/**
 * Modern compatibility function for validating and fixing tasks.
 *
 * Executes the validate and fix command to check all tasks against the schema
 * and optionally apply automatic fixes for common validation issues.
 *
 * @param options - Validation and fixing options
 * @param options.fix - Whether to automatically apply fixes to validation errors
 * @param options.dryRun - If true, shows planned fixes without applying them
 * @param options.format - Output format for results ('json' or 'csv')
 * @param options.excludePattern - Pattern to exclude certain tasks from processing
 * @param options.logger - Optional logger instance for command execution logging
 *
 * @example
 * ```typescript
 * // Validate only (no fixes)
 * validateAndFixCmd({ fix: false, dryRun: false });
 *
 * // Dry run with fixes preview
 * validateAndFixCmd({ fix: true, dryRun: true });
 *
 * // Apply fixes with JSON output
 * validateAndFixCmd({
 *   fix: true,
 *   dryRun: false,
 *   format: 'json'
 * });
 *
 * // Exclude test tasks from processing
 * validateAndFixCmd({
 *   fix: true,
 *   dryRun: false,
 *   excludePattern: '*.test'
 * });
 * ```
 */
export function validateAndFixCmd(options: ValidateAndFixOptions): void {
  const logger = options.logger ?? getLogger();
  const renderer = new ValidationResultRenderer(logger);
  const commandOptions: {
    dryRun: boolean;
    exclude?: string;
    fix: boolean;
    format?: 'json' | 'csv';
  } = {
    dryRun: options.dryRun,
    fix: options.fix,
  };
  if (typeof options.excludePattern === 'string' && options.excludePattern.length > 0) {
    commandOptions.exclude = options.excludePattern;
  }
  if (options.format) commandOptions.format = options.format;

  new ValidateAndFixCommand(logger, renderer).execute(commandOptions);
}
