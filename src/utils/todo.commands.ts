import { AddTaskCommand } from '../commands/add-task.command';
import { CompleteTaskCommand } from '../commands/complete-task.command';
import { ListTasksCommand } from '../commands/list-tasks.command';
import { ShowTaskCommand } from '../commands/show-task.command';
import { ValidateAndFixCommand } from '../commands/validate-and-fix.command';
import { ValidateTasksCommand } from '../commands/validate-tasks.command';
import { OutputFormat } from '../interfaces/OutputFormat';

/**
 * Compatibility function for listing tasks.
 * Calls the new ListTasksCommand class internally.
 */
export function listTasksCmd(): void {
  new ListTasksCommand().execute();
}

/**
 * Compatibility function for showing a task.
 * Calls the new ShowTaskCommand class internally.
 * @param id - The ID of the task to show.
 */
export function showTaskCmd(id: string): void {
  new ShowTaskCommand().execute({ id });
}

/**
 * Compatibility function for completing a task.
 * Calls the new CompleteTaskCommand class internally.
 * @param id - The ID of the task to complete.
 * @param opts - Options for the completion including message and dry run flag.
 */
export function completeTaskCmd(id: string, opts: { message?: string; dryRun?: boolean }): void {
  new CompleteTaskCommand(id, opts).execute({ id, opts });
}

/**
 * Compatibility function for adding a task from a file.
 * Calls the new AddTaskCommand class internally.
 * @param file - The path to the file containing the task to add.
 */
export function addTaskCmd(file: string): void {
  new AddTaskCommand(file).execute({ file });
}

/**
 * Compatibility function for validating tasks.
 * Calls the new ValidateTasksCommand class internally.
 */
export function validateTasksCmd(): void {
  new ValidateTasksCommand().execute();
}

/**
 * Compatibility function for validating and fixing tasks.
 * Calls the new ValidateAndFixCommand class internally.
 * @param fix - Whether to apply fixes automatically.
 * @param dryRun - Whether to perform a dry run without making changes.
 * @param summary - Optional summary format configuration.
 * @param excludePattern - Optional pattern to exclude tasks from validation.
 */
export function validateAndFixCmd(
  fix: boolean,
  dryRun: boolean,
  summary?: { format?: OutputFormat },
  excludePattern?: string,
): void {
  const commandOptions: ConstructorParameters<typeof ValidateAndFixCommand>[0] = {
    dryRun,
    fix,
  };
  if (excludePattern != null) {
    commandOptions.exclude = excludePattern;
  }
  if (summary != null) {
    commandOptions.summary = summary;
  }

  const executeOptions: Parameters<ValidateAndFixCommand['execute']>[0] = {
    dryRun,
    fix,
  };
  if (excludePattern != null) {
    executeOptions.exclude = excludePattern;
  }
  if (summary != null) {
    executeOptions.summary = summary;
  }

  new ValidateAndFixCommand(commandOptions).execute(executeOptions);
}
