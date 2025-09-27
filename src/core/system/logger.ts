import pino from 'pino';

import { ILogger } from '../../types/ILogger';

import { PinoLogger } from './pino.logger';

let globalLogger: ILogger | undefined;

/**
 * Gets the global logger instance, creating one if it doesn't exist.
 *
 * This function provides a singleton logger instance that can be used throughout
 * the application. It automatically detects if the application is running in CLI
 * mode and configures the logger appropriately.
 *
 * @returns The global logger instance configured for the current execution environment
 *
 * @example
 * ```typescript
 * const logger = getLogger();
 * logger.info('Application started');
 * logger.error('Something went wrong', { error: 'details' });
 * ```
 */
export function getLogger(): ILogger {
  if (!globalLogger) {
    const isCli =
      process.argv[1]?.endsWith('cli.js') === true ||
      process.argv[1]?.endsWith('cli.ts') === true ||
      process.env['NODE_ENV'] === 'cli' ||
      !process.stdout.isTTY;
    globalLogger = new PinoLogger(void 0, isCli);
  }
  return globalLogger as ILogger;
}

/**
 * Sets the global logger instance.
 *
 * Allows overriding the default global logger with a custom implementation.
 * This is useful for testing or when you need specific logging behavior.
 * The new logger will be used by all subsequent calls to getLogger().
 *
 * @param logger - The logger instance to set as the new global logger
 *
 * @example
 * ```typescript
 * const mockLogger = createMockLogger();
 * setLogger(mockLogger);
 *
 * // Now all getLogger() calls return the mock logger
 * const logger = getLogger(); // Returns mockLogger
 * ```
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
 *
 * @example
 * ```typescript
 * // Create a JSON logger for production
 * const prodLogger = createPinoLogger({ level: 'warn' }, false);
 *
 * // Create a pretty-printed CLI logger
 * const cliLogger = createPinoLogger({ level: 'debug' }, true);
 * ```
 */
export function createPinoLogger(opts?: pino.LoggerOptions, isCli?: boolean): ILogger {
  if (isCli === true) {
    const logger = pino({
      ...opts,
      transport: {
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          messageFormat: '{msg}',
          translateTime: 'SYS:HH:MM:ss',
        },
        target: 'pino-pretty',
      },
    });
    return new PinoLogger(logger, true);
  }

  const logger = pino(opts ?? { level: process.env['LOG_LEVEL'] ?? 'info' });
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
 *
 * @example
 * ```typescript
 * const cliLogger = createCliLogger();
 * cliLogger.info('Starting command execution...');
 * cliLogger.warn('This is a warning message');
 * ```
 */
export function createCliLogger(): ILogger {
  return createPinoLogger({ level: process.env['LOG_LEVEL'] ?? 'warn' }, true);
}
