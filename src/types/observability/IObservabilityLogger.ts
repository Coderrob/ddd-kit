import { ILogger } from './ILogger';

/**
 * Enhanced observability logger interface that extends basic logging
 * with metrics, tracing, and structured diagnostic capabilities.
 *
 * This interface provides comprehensive observability features for:
 * - Performance monitoring
 * - Distributed tracing
 * - Custom metrics
 * - Health checks
 * - Error correlation
 */
export interface IObservabilityLogger extends ILogger {
  /**
   * Records a custom metric value.
   *
   * @param name - Metric name following naming conventions (e.g., 'task.processing.duration_ms')
   * @param value - Numeric value of the metric
   * @param labels - Optional labels for metric dimensions
   * @param unit - Optional unit of measurement (ms, bytes, count, etc.)
   */
  metric(name: string, value: number, labels?: Record<string, string>, unit?: string): void;

  /**
   * Increments a counter metric.
   *
   * @param name - Counter name
   * @param labels - Optional labels for counter dimensions
   * @param increment - Amount to increment (default: 1)
   */
  counter(name: string, labels?: Record<string, string>, increment?: number): void;

  /**
   * Records timing information for operations.
   *
   * @param name - Timer name
   * @param duration - Duration in milliseconds
   * @param labels - Optional labels for timing dimensions
   */
  timing(name: string, duration: number, labels?: Record<string, string>): void;

  /**
   * Starts a timer and returns a function to end it.
   *
   * @param name - Timer name
   * @param labels - Optional labels for timing dimensions
   * @returns Function that when called, records the elapsed time
   */
  startTimer(name: string, labels?: Record<string, string>): () => void;

  /**
   * Records an operation span for distributed tracing.
   *
   * @param operationName - Name of the operation being traced
   * @param startTime - Start time of the operation
   * @param endTime - End time of the operation
   * @param tags - Optional tags for the span
   * @param traceId - Optional trace ID for correlation
   * @param spanId - Optional span ID
   * @param parentSpanId - Optional parent span ID for nested operations
   */
  span(
    operationName: string,
    startTime: Date,
    endTime: Date,
    tags?: Record<string, unknown>,
    traceId?: string,
    spanId?: string,
    parentSpanId?: string,
  ): void;

  /**
   * Records a health check result.
   *
   * @param component - Component being checked (e.g., 'database', 'github-api')
   * @param status - Health status ('healthy', 'unhealthy', 'degraded')
   * @param responseTime - Optional response time in milliseconds
   * @param details - Optional additional health check details
   */
  health(
    component: string,
    status: 'healthy' | 'unhealthy' | 'degraded',
    responseTime?: number,
    details?: Record<string, unknown>,
  ): void;

  /**
   * Records a business event for analytics and auditing.
   *
   * @param eventName - Name of the business event
   * @param properties - Event properties and context
   * @param userId - Optional user identifier
   * @param sessionId - Optional session identifier
   */
  event(
    eventName: string,
    properties: Record<string, unknown>,
    userId?: string,
    sessionId?: string,
  ): void;

  /**
   * Creates a correlation ID for request/operation tracking.
   *
   * @returns A unique correlation ID
   */
  createCorrelationId(): string;

  /**
   * Creates a child logger with correlation context.
   *
   * @param correlationId - Correlation ID to bind to child logger
   * @param operationName - Optional operation name for context
   * @param additionalContext - Additional context to bind
   * @returns Child logger with correlation context
   */
  withCorrelation(
    correlationId: string,
    operationName?: string,
    additionalContext?: Record<string, unknown>,
  ): IObservabilityLogger;

  /**
   * Flushes any pending logs, metrics, or traces.
   * Should be called before application shutdown.
   *
   * @returns Promise that resolves when flushing is complete
   */
  flush(): Promise<void>;
}
