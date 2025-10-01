import chalk from 'chalk';

import { IConsolePresenter } from '../../../types/commands';
import { AddTaskOutput } from '../postprocessing/add-task.postprocessor';

/**
 * Console presenter for the AddTaskCommand.
 *
 * Presents the result of adding a task to the console with appropriate
 * formatting and colors.
 */
export class AddTaskPresenter implements IConsolePresenter {
  /**
   * Presents the command output to the console.
   *
   * @param output - The processed output from the command
   */
  async present(output: AddTaskOutput): Promise<void> {
    if (output.success) {
      await this.presentSuccess(output.message);
    } else {
      await this.presentError(new Error(output.message));
    }
  }

  /**
   * Presents a success message.
   *
   * @param message - The success message to display
   */
  async presentSuccess(message: string): Promise<void> {
    await new Promise<void>((resolve) => {
      console.log(chalk.green('✓'), message);
      resolve();
    });
  }

  /**
   * Presents an error message.
   *
   * @param error - The error to display
   */
  async presentError(error: Error): Promise<void> {
    await new Promise<void>((resolve) => {
      console.error(chalk.red('✗'), error.message);
      resolve();
    });
  }

  /**
   * Presents an informational message.
   *
   * @param message - The info message to display
   */
  async presentInfo(message: string): Promise<void> {
    await new Promise<void>((resolve) => {
      console.log(chalk.blue('ℹ'), message);
      resolve();
    });
  }
}
