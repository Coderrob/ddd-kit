import { ICommandPostprocessor } from '../../../types/commands';

/**
 * Output from the AddTaskPostprocessor.
 */
export interface AddTaskOutput {
  /** Whether the task was added successfully */
  success: boolean;
  /** User-friendly message */
  message: string;
  /** File path that was processed */
  filePath: string;
}

/**
 * Postprocessor for the AddTaskCommand.
 *
 * Transforms the boolean execution result into a user-friendly output
 * with appropriate messaging.
 */
export class AddTaskPostprocessor implements ICommandPostprocessor<boolean, AddTaskOutput> {
  /**
   * Postprocesses the execution result into command output.
   *
   * @param result - The boolean result from task addition
   * @returns Promise resolving to formatted output
   */
  postprocess(result: boolean): Promise<AddTaskOutput> {
    // Note: In a real implementation, we'd need the file path from context
    // For now, we'll use a placeholder
    const filePath = 'task-file.md'; // This should come from context

    const output: AddTaskOutput = {
      success: result,
      filePath,
      message: result
        ? `Successfully added task from ${filePath}`
        : `Failed to add task from ${filePath}`,
    };

    return Promise.resolve(output);
  }
}
