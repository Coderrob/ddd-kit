import pino from 'pino';
import { ILogger } from '../types';

/**
 * Pino-based implementation of the ILogger interface.
 */
export class PinoLogger implements ILogger {
  private logger: pino.Logger;

  /**
   * Creates a new PinoLogger instance.
   * @param logger - Optional Pino logger instance. If not provided, creates a new one.
   * @param isCli - Whether this logger is being used in CLI mode (affects formatting).
   */
  constructor(
    logger?: pino.Logger,
    private isCli: boolean = false,
  ) {
    // Ensure isCli is used to avoid linting warnings
    this.isCli = isCli;
    this.logger = logger ?? this.createDefaultLogger();
  }

  /**
   * Creates a default logger with appropriate configuration based on usage context.
   * @returns A configured Pino logger instance.
   */
  private createDefaultLogger(): pino.Logger {
    const baseConfig = {
      level: process.env.LOG_LEVEL || (this.isCli ? 'warn' : 'info'),
    };

    if (this.isCli) {
      // For CLI usage, use pretty printing and only show warnings/errors by default
      return pino({
        ...baseConfig,
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss',
            ignore: 'pid,hostname',
            messageFormat: '{msg}',
          },
        },
      });
    } else {
      // For programmatic usage, use JSON format
      return pino(baseConfig);
    }
  }

  /**
   * Logs an info message.
   * @param message - The message to log.
   * @param meta - Optional metadata to include with the log entry.
   */
  info(message: string, meta: Record<string, unknown> = {}): void {
    this.logger.info(meta, message);
  }

  /**
   * Logs a warning message.
   * @param message - The message to log.
   * @param meta - Optional metadata to include with the log entry.
   */
  warn(message: string, meta: Record<string, unknown> = {}): void {
    this.logger.warn(meta, message);
  }

  /**
   * Logs an error message.
   * @param message - The message to log.
   * @param meta - Optional metadata to include with the log entry.
   */
  error(message: string, meta: Record<string, unknown> = {}): void {
    this.logger.error(meta, message);
  }

  /**
   * Logs a debug message.
   * @param message - The message to log.
   * @param meta - Optional metadata to include with the log entry.
   */
  debug(message: string, meta: Record<string, unknown> = {}): void {
    this.logger.debug(meta, message);
  }

  /**
   * Creates a child logger with additional bindings.
   * @param bindings - The bindings to add to the child logger.
   * @returns A new PinoLogger instance with the additional bindings.
   */
  child(bindings: Record<string, unknown>): PinoLogger {
    return new PinoLogger(this.logger.child(bindings), this.isCli);
  }
}
