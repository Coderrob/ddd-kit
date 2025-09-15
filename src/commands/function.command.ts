import { ICommand } from '../types';

/**
 * Implementation of ICommand that executes a function.
 */
export class FunctionCommand implements ICommand {
  /**
   * Creates a new FunctionCommand instance.
   * @param name - The name of the command.
   * @param description - A description of what the command does.
   * @param fn - The function to execute when the command is run.
   */
  constructor(
    public name: string, // eslint-disable-line no-unused-vars
    public description: string, // eslint-disable-line no-unused-vars
    private fn: (args?: unknown) => Promise<void> | void, // eslint-disable-line no-unused-vars
  ) {}

  /**
   * Executes the command function.
   * @param args - Optional arguments to pass to the function.
   * @returns A Promise that resolves when the function completes, or void if synchronous.
   */
  execute(args?: unknown): Promise<void> | void {
    return this.fn(args);
  }
}
