import chalk from 'chalk';
import { addTaskFromFile } from '../core';
import { getLogger } from '../lib/logger';
import { ICommand } from '../types';

/**
 * Command for adding a new task from a file to the TODO.md.
 */
export class AddTaskCommand implements ICommand {
  name = 'todo:add';
  description = 'Add task from file';

  /**
   * Creates a new AddTaskCommand instance.
   * @param file - Optional file path containing the task to add. Can also be provided in execute args.
   */
  constructor(private file?: string) {} // eslint-disable-line no-unused-vars

  /**
   * Executes the add task command.
   * Reads a task from a file and adds it to the TODO.md file.
   * @param args - Optional arguments containing the file path.
   */
  async execute(args?: { file?: string }): Promise<void> {
    const file = args?.file ?? this.file;
    try {
      const log = getLogger();
      const added = addTaskFromFile(String(file), log);
      if (added) {
        console.log(chalk.green(`Task added to TODO.md from ${file}`));
      } else {
        console.error(chalk.red(`Failed to add task from ${file}`));
        process.exitCode = 1;
      }
    } catch (e: unknown) {
      let msg = String(e);
      if (typeof e === 'object' && e !== null && 'message' in e) {
        const obj = e as { message?: unknown };
        if (typeof obj.message === 'string') msg = obj.message;
      }
      console.error(chalk.red('Error adding task:'), msg || e);
      process.exitCode = 2;
    }
  }
}
