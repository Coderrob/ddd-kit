import { ILogger, IObservabilityLogger } from '../../types/observability';

/**
 * Adapter that provides safe fallback implementations for observability features
 * when only a basic ILogger is available.
 */
export class ObservabilityLoggerAdapter implements IObservabilityLogger {
  constructor(private readonly baseLogger: ILogger) {}

  // Delegate basic logging methods to the base logger
  info(message: string, meta?: Record<string, unknown>): void {
    this.baseLogger.info(message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.baseLogger.warn(message, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.baseLogger.error(message, meta);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.baseLogger.debug(message, meta);
  }

  child(bindings: Record<string, unknown>): IObservabilityLogger {
    return new ObservabilityLoggerAdapter(this.baseLogger.child(bindings));
  }

  // Provide no-op implementations for observability-specific methods
  metric(): void {
    /* no-op */
  }

  counter(): void {
    /* no-op */
  }

  timing(): void {
    /* no-op */
  }

  startTimer(): () => void {
    return () => {
      /* no-op */
    };
  }

  span(): void {
    /* no-op */
  }

  health(): void {
    /* no-op */
  }

  event(): void {
    /* no-op */
  }

  createCorrelationId(): string {
    return `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  withCorrelation(
    correlationId: string,
    operationName: string,
    metadata?: Record<string, unknown>,
  ): IObservabilityLogger {
    const contextLogger = this.baseLogger.child({
      correlationId,
      operationName,
      ...metadata,
    });
    return new ObservabilityLoggerAdapter(contextLogger);
  }

  async flush(): Promise<void> {
    /* no-op */
  }
}
