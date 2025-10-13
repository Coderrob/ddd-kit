import { ILogger } from '../../types/observability';

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
    globalLogger = PinoLogger.createDefaultLogger({ isCli });
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
