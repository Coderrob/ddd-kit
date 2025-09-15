import { ICommand } from '../types';

/**
 * Registry for managing CLI commands.
 */
export class CommandRegistry {
  private commands: Map<string, ICommand> = new Map();

  /**
   * Registers a command in the registry.
   * @param cmd - The command to register.
   */
  register(cmd: ICommand): void {
    this.commands.set(cmd.name, cmd);
  }

  /**
   * Gets a command by name from the registry.
   * @param name - The name of the command to retrieve.
   * @returns The command if found, undefined otherwise.
   */
  get(name: string): ICommand | undefined {
    return this.commands.get(name);
  }
}
