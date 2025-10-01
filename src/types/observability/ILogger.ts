/**
 * Interface for structured logging throughout the application.
 *
 * Provides a consistent API for logging at different levels with optional
 * metadata. Supports hierarchical logging through child loggers with
 * bound context data.
 *
 * @example
 * ```typescript
 * const logger = getLogger();
 * logger.info('User login', { userId: '123', ip: '192.168.1.1' });
 * logger.error('Database connection failed', { error: errorDetails });
 *
 * // Create a child logger with bound context
 * const requestLogger = logger.child({ requestId: 'req-456' });
 * requestLogger.info('Processing request'); // Automatically includes requestId
 * ```
 */
export interface ILogger {
  /**
   * Logs an informational message.
   *
   * @param message - The log message
   * @param meta - Optional metadata object with additional context
   */
  info(message: string, meta?: Record<string, unknown>): void;

  /**
   * Logs a warning message.
   *
   * @param message - The log message
   * @param meta - Optional metadata object with additional context
   */
  warn(message: string, meta?: Record<string, unknown>): void;

  /**
   * Logs an error message.
   *
   * @param message - The log message
   * @param meta - Optional metadata object with additional context
   */
  error(message: string, meta?: Record<string, unknown>): void;

  /**
   * Logs a debug message.
   *
   * @param message - The log message
   * @param meta - Optional metadata object with additional context
   */
  debug(message: string, meta?: Record<string, unknown>): void;

  /**
   * Creates a child logger with bound metadata.
   *
   * The child logger will automatically include the provided bindings
   * in all log messages, useful for maintaining context across related
   * operations.
   *
   * @param bindings - Metadata to bind to the child logger
   * @returns A new ILogger instance with the bound context
   *
   * @example
   * ```typescript
   * const childLogger = logger.child({ module: 'auth', version: '1.2.3' });
   * childLogger.info('Authentication started'); // Includes module and version
   * ```
   */
  child(bindings: Record<string, unknown>): ILogger;
}
