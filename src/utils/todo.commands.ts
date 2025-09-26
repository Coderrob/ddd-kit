import { AddTaskCommand } from '../commands/add-task.command';
import { CompleteTaskCommand } from '../commands/complete-task.command';
import { ListTasksCommand } from '../commands/list-tasks.command';
import { ShowTaskCommand } from '../commands/show-task.command';
import { ValidateAndFixCommand } from '../commands/validate-and-fix.command';
import { ValidateTasksCommand } from '../commands/validate-tasks.command';
import { ILogger } from '../interfaces/ILogger';

import { getLogger } from './logger';

/**
 * Command options interface for common command parameters.
 */
interface CommandOptions {
  logger?: ILogger;
}

/**
 * Modern compatibility function for listing tasks.
 */
export function listTasksCmd(options: CommandOptions = {}): void {
  const logger = options.logger ?? getLogger();
  new ListTasksCommand(logger).execute();
}

/**
 * Modern compatibility function for showing a task.
 */
export function showTaskCmd(id: string, options: CommandOptions = {}): void {
  const logger = options.logger ?? getLogger();
  new ShowTaskCommand(logger).execute({ id });
}

/**
 * Modern compatibility function for completing a task.
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
 */
export function addTaskCmd(file: string, options: CommandOptions = {}): void {
  const logger = options.logger ?? getLogger();
  new AddTaskCommand(logger).execute({ file });
}

/**
 * Modern compatibility function for validating tasks.
 */
export function validateTasksCmd(options: CommandOptions = {}): void {
  const logger = options.logger ?? getLogger();
  new ValidateTasksCommand(logger).execute();
}

/**
 * Options for the validateAndFixCmd function.
 */
interface ValidateAndFixOptions extends CommandOptions {
  fix: boolean;
  dryRun: boolean;
  format?: 'json' | 'csv';
  excludePattern?: string;
}

/**
 * Modern compatibility function for validating and fixing tasks.
 */
export function validateAndFixCmd(options: ValidateAndFixOptions): void {
  const logger = options.logger ?? getLogger();
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

  new ValidateAndFixCommand(logger).execute(commandOptions);
}
