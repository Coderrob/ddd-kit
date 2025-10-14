import { ConsoleOutputWriter } from '../../core/rendering';
import { ICommand, ILogger, IOutputWriter } from '../../types';

export abstract class BaseCommand implements ICommand {
  abstract name: string;
  abstract description: string;

  constructor(
    protected readonly logger: ILogger,
    protected readonly outputWriter: IOutputWriter = new ConsoleOutputWriter(),
  ) {}

  /**
   * Logs an informational message to both the output writer and the logger.
   * @param message - The message to log.
   */
  protected logInfo(message: string): void {
    this.outputWriter.info(message);
    this.logger.info(message);
  }

  /**
   * Logs a warning message to both the output writer and the logger.
   * @param message - The message to log.
   */
  protected logWarning(message: string): void {
    this.outputWriter.warning(message);
    this.logger.warn(message);
  }

  /**
   * Logs an error message to both the output writer and the logger.
   * @param message - The message to log.
   */
  protected logError(message: string): void {
    this.outputWriter.error(message);
    this.logger.error(message);
  }

  /**
   * Abstract method to execute the command with optional arguments.
   * Must be implemented by subclasses.
   * @param args - Optional arguments for command execution.
   * @returns A promise that resolves when the command execution is complete.
   */
  abstract execute(args?: unknown): Promise<void>;
}
