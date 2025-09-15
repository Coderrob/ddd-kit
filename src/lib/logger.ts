import pino from 'pino';

import { PinoLogger } from './pino.logger';
import { ILogger } from '../types';

export type { ILogger } from '../types';

let globalLogger: ILogger | null = null;

/**
 * Gets the global logger instance, creating one if it doesn't exist.
 *
 * This function provides a singleton logger instance that automatically detects
 * whether the application is running in CLI mode or programmatically. In CLI mode,
 * it uses pretty-printed output for better readability. In programmatic mode,
 * it uses structured JSON logging.
 *
 * The logger is lazily initialized on first access and reused for all subsequent calls.
 *
 * @returns The global ILogger instance configured for the current execution context
 */
export function getLogger(): ILogger {
  if (!globalLogger) {
    // Detect if we're running in CLI mode
    const isCli =
      process.argv[1]?.endsWith('cli.js') ||
      process.argv[1]?.endsWith('cli.ts') ||
      process.env.NODE_ENV === 'cli' ||
      !process.stdout.isTTY;
    globalLogger = new PinoLogger(undefined, isCli);
  }
  return globalLogger;
}

/**
 * Sets the global logger instance.
 *
 * Allows overriding the default global logger with a custom implementation.
 * This is useful for testing or when you need specific logging behavior.
 * The new logger will be used by all subsequent calls to getLogger().
 *
 * @param logger - The logger instance to set as the new global logger
 */
export function setLogger(logger: ILogger): void {
  globalLogger = logger;
}

/**
 * Creates a new Pino-based logger instance.
 *
 * Factory function for creating Pino logger instances with optional configuration.
 * Supports both CLI and programmatic usage modes with appropriate output formatting.
 *
 * @param opts - Optional Pino logger configuration options (level, serializers, etc.)
 * @param isCli - Whether to configure for CLI usage with pretty-printed output (true) or JSON output (false)
 * @returns A new ILogger instance using Pino with the specified configuration
 */
export function createPinoLogger(opts?: pino.LoggerOptions, isCli?: boolean): ILogger {
  if (isCli) {
    const logger = pino({
      ...opts,
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
    return new PinoLogger(logger, true);
  }

  const logger = pino(opts ?? { level: process.env.LOG_LEVEL || 'info' });
  return new PinoLogger(logger, false);
}

/**
 * Creates a CLI-optimized logger instance.
 *
 * Factory function that creates a logger specifically configured for command-line
 * interface usage. Uses pretty-printed output with colors and simplified formatting
 * for better readability in terminal environments.
 *
 * The log level can be controlled via the LOG_LEVEL environment variable,
 * defaulting to 'warn' level.
 *
 * @returns A new ILogger instance configured with CLI-appropriate formatting and colors
 */
export function createCliLogger(): ILogger {
  return createPinoLogger({ level: process.env.LOG_LEVEL || 'warn' }, true);
}
