import * as path from 'path';

import { ICommandPreprocessor } from '../../../types/commands';
import { AddTaskArgs } from '../../../types/tasks';
import { IFileManager } from '../../../types/core';

/**
 * Context created by the AddTaskPreprocessor.
 */
export interface AddTaskContext {
  /** Absolute path to the file */
  filePath: string;
  /** Raw content of the file */
  rawContent: string;
  /** Parsed YAML frontmatter data */
  taskData: Record<string, unknown>;
}

/**
 * Preprocessor for the AddTaskCommand.
 *
 * Reads and parses the task file, extracting the YAML frontmatter
 * and preparing the context for task addition.
 */
export class AddTaskPreprocessor implements ICommandPreprocessor<AddTaskArgs, AddTaskContext> {
  constructor(private readonly fileManager: IFileManager) {}
  /**
   * Preprocesses the command arguments into execution context.
   *
   * @param args - The command arguments
   * @returns Promise resolving to context containing file path, raw content, and parsed data
   */
  preprocess(args: AddTaskArgs): Promise<AddTaskContext> {
    const filePath = path.resolve(args.file);
    const rawContent = this.fileManager.readFileSync(filePath);

    // For now, we'll pass the raw content and let the executor handle parsing
    // In a more sophisticated implementation, we could parse YAML here
    const taskData: Record<string, unknown> = {
      // Placeholder - actual parsing would happen here or in executor
      content: rawContent,
      filePath,
    };

    return Promise.resolve({
      filePath,
      rawContent,
      taskData,
    });
  }
}
