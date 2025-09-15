import { AddTaskCommand } from './add-task.command';
import { CompleteTaskCommand } from './complete-task.command';
import { ListTasksCommand } from './list-tasks.command';
import { ShowTaskCommand } from './show-task.command';
import { ValidateAndFixCommand } from './validate-and-fix.command';
import { ValidateTasksCommand } from './validate-tasks.command';

/**
 * Compatibility function for listing tasks.
 * Calls the new ListTasksCommand class internally.
 */
export async function listTasksCmd(): Promise<void> {
  return new ListTasksCommand().execute();
}

/**
 * Compatibility function for showing a task.
 * Calls the new ShowTaskCommand class internally.
 * @param id - The ID of the task to show.
 */
export async function showTaskCmd(id: string): Promise<void> {
  return new ShowTaskCommand().execute({ id });
}

/**
 * Compatibility function for completing a task.
 * Calls the new CompleteTaskCommand class internally.
 * @param id - The ID of the task to complete.
 * @param opts - Options for the completion including message and dry run flag.
 */
export async function completeTaskCmd(
  id: string,
  opts: { message?: string; dryRun?: boolean },
): Promise<void> {
  return new CompleteTaskCommand(id, opts).execute({ id, opts });
}

/**
 * Compatibility function for adding a task from a file.
 * Calls the new AddTaskCommand class internally.
 * @param file - The path to the file containing the task to add.
 */
export async function addTaskCmd(file: string): Promise<void> {
  return new AddTaskCommand(file).execute({ file });
}

/**
 * Compatibility function for validating tasks.
 * Calls the new ValidateTasksCommand class internally.
 */
export async function validateTasksCmd(): Promise<void> {
  return new ValidateTasksCommand().execute();
}

/**
 * Compatibility function for validating and fixing tasks.
 * Calls the new ValidateAndFixCommand class internally.
 * @param fix - Whether to apply fixes automatically.
 * @param dryRun - Whether to perform a dry run without making changes.
 * @param summary - Optional summary format configuration.
 * @param excludePattern - Optional pattern to exclude tasks from validation.
 */
export async function validateAndFixCmd(
  fix: boolean,
  dryRun: boolean,
  summary?: { format?: 'json' | 'csv' },
  excludePattern?: string,
): Promise<void> {
  return new ValidateAndFixCommand({ fix, dryRun, summary, exclude: excludePattern }).execute({
    fix,
    dryRun,
    summary,
    exclude: excludePattern,
  });
}
