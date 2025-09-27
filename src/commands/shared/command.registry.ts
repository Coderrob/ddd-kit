import { ICommand } from '../../types/ICommand';

/**
 * Registry for managing CLI commands.
 */
export class CommandRegistry {
  private readonly commands: Map<string, ICommand> = new Map();

  /**
   * Registers a command in the registry.
   * @param command - The command to register.
   */
  register(command: ICommand): void {
    this.commands.set(command.name, command);
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
