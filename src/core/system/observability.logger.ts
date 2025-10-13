import { randomUUID } from 'crypto';

import pino from 'pino';

import { IObservabilityLogger } from '../../types/observability';
import { formatJson } from '../parsers/json.parser';

/**
 * Enhanced Pino-based logger with comprehensive observability features.
 * Provides metrics, tracing, health checks, and business event logging.
 */
export class ObservabilityLogger implements IObservabilityLogger {
  private readonly logger: pino.Logger;
  private readonly metrics: Map<string, number> = new Map();
  private readonly timers: Map<string, Date> = new Map();

  constructor(
    logger?: pino.Logger,
    private readonly isCli: boolean = false,
  ) {
    this.logger = logger ?? this.createDefaultLogger();
  }

  private createDefaultLogger(): pino.Logger {
    const baseConfig = {
      level: process.env['LOG_LEVEL'] ?? (this.isCli ? 'warn' : 'info'),
      base: {
        pid: process.pid,
        hostname: process.env['HOSTNAME'] ?? 'unknown',
        service: 'ddd-kit',
        version: process.env['npm_package_version'] ?? '1.0.0',
        environment: process.env['NODE_ENV'] ?? 'development',
      },
    };

    if (this.isCli) {
      return pino({
        ...baseConfig,
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'pid,hostname,service,version,environment',
            messageFormat: '{msg}',
            translateTime: 'SYS:HH:MM:ss',
          },
        },
      });
    }

    return pino(baseConfig);
  }

  // Basic logging methods
  info(message: string, meta: Record<string, unknown> = {}): void {
    this.logger.info({ ...meta, logType: 'info' }, message);
  }

  warn(message: string, meta: Record<string, unknown> = {}): void {
    this.logger.warn({ ...meta, logType: 'warning' }, message);
  }

  error(message: string, meta: Record<string, unknown> = {}): void {
    this.logger.error(
      {
        ...meta,
        logType: 'error',
        timestamp: new Date().toISOString(),
        stack: meta['error'] instanceof Error ? (meta['error'] as Error).stack : null,
      },
      message,
    );
  }

  debug(message: string, meta: Record<string, unknown> = {}): void {
    this.logger.debug({ ...meta, logType: 'debug' }, message);
  }

  child(bindings: Record<string, unknown>): IObservabilityLogger {
    return new ObservabilityLogger(this.logger.child(bindings), this.isCli);
  }

  // Enhanced observability methods
  metric(name: string, value: number, labels: Record<string, string> = {}, unit?: string): void {
    this.logger.info(
      {
        logType: 'metric',
        metricName: name,
        metricValue: value,
        metricLabels: labels,
        metricUnit: unit,
        timestamp: new Date().toISOString(),
      },
      `Metric: ${name}=${value}${unit ?? ''}`,
    );

    // Store for potential aggregation
    this.metrics.set(`${name}_${formatJson(labels)}`, value);
  }

  counter(name: string, labels: Record<string, string> = {}, increment: number = 1): void {
    const key = `${name}_${formatJson(labels)}`;
    const currentValue = this.metrics.get(key) ?? 0;
    const newValue = currentValue + increment;
    this.metrics.set(key, newValue);

    this.logger.info(
      {
        logType: 'counter',
        counterName: name,
        counterValue: newValue,
        counterIncrement: increment,
        counterLabels: labels,
        timestamp: new Date().toISOString(),
      },
      `Counter: ${name} incremented by ${increment} to ${newValue}`,
    );
  }

  timing(name: string, duration: number, labels: Record<string, string> = {}): void {
    this.logger.info(
      {
        logType: 'timing',
        timerName: name,
        duration: duration,
        durationUnit: 'ms',
        timerLabels: labels,
        timestamp: new Date().toISOString(),
      },
      `Timing: ${name} took ${duration}ms`,
    );
  }

  startTimer(name: string, labels: Record<string, string> = {}): () => void {
    const startTime = new Date();
    const timerKey = `${name}_${JSON.stringify(labels)}_${randomUUID()}`;
    this.timers.set(timerKey, startTime);

    return () => {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      this.timers.delete(timerKey);
      this.timing(name, duration, labels);
    };
  }

  span(
    operationName: string,
    startTime: Date,
    endTime: Date,
    tags: Record<string, unknown> = {},
  ): void {
    const duration = endTime.getTime() - startTime.getTime();

    this.logger.info(
      {
        logType: 'span',
        operationName,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration,
        durationUnit: 'ms',
        tags,
      },
      `Span: ${operationName} completed in ${duration}ms`,
    );
  }

  health(
    component: string,
    status: 'healthy' | 'unhealthy' | 'degraded',
    responseTime?: number,
    details: Record<string, unknown> = {},
  ): void {
    const level = status === 'healthy' ? 'info' : status === 'degraded' ? 'warn' : 'error';

    const logMethod = this.logger[level as keyof typeof this.logger] as (
      obj: Record<string, unknown>,
      msg: string,
    ) => void;
    logMethod.call(
      this.logger,
      {
        logType: 'health_check',
        component,
        healthStatus: status,
        responseTime,
        responseTimeUnit: responseTime != null ? 'ms' : null,
        healthDetails: details,
        timestamp: new Date().toISOString(),
      },
      `Health Check: ${component} is ${status}${responseTime != null ? ` (${responseTime}ms)` : ''}`,
    );
  }

  event(
    eventName: string,
    properties: Record<string, unknown>,
    userId?: string,
    sessionId?: string,
  ): void {
    this.logger.info(
      {
        logType: 'business_event',
        eventName,
        eventProperties: properties,
        userId,
        sessionId,
        timestamp: new Date().toISOString(),
      },
      `Event: ${eventName}`,
    );
  }

  createCorrelationId(): string {
    return randomUUID();
  }

  withCorrelation(
    correlationId: string,
    operationName?: string,
    additionalContext: Record<string, unknown> = {},
  ): IObservabilityLogger {
    return new ObservabilityLogger(
      this.logger.child({
        correlationId,
        operationName,
        ...additionalContext,
      }),
      this.isCli,
    );
  }

  async flush(): Promise<void> {
    // Clear metrics and timers
    this.metrics.clear();
    this.timers.clear();
    // Flush underlying logger if available
    if ('flush' in this.logger && typeof this.logger.flush === 'function') {
      try {
        const flushResult = (this.logger.flush as () => unknown)();
        if (flushResult != null && typeof flushResult === 'object' && 'then' in flushResult) {
          await (flushResult as Promise<void>);
        }
      } catch {
        // Ignore flush errors
      }
    }
  }
}
