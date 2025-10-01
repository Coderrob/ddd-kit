/**
 * Domain-specific error types for the DDD-Kit system.
 * Following clean architecture principles with domain-specific exceptions.
 * Enhanced with observability and diagnostic capabilities.
 */

export abstract class DomainError extends Error {
  abstract readonly code: string;
  public readonly timestamp: string;
  public readonly correlationId: string | undefined;

  constructor(
    message: string,
    public readonly details?: Record<string, unknown>,
    correlationId?: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date().toISOString();
    this.correlationId = correlationId;
    Object.setPrototypeOf(this, DomainError.prototype);
  }

  /**
   * Gets structured error information for logging and observability.
   */
  toLogContext(): Record<string, unknown> {
    return {
      errorCode: this.code,
      errorMessage: this.message,
      errorName: this.name,
      errorTimestamp: this.timestamp,
      errorCorrelationId: this.correlationId,
      errorDetails: this.details,
      errorStack: this.stack,
    };
  }

  /**
   * Gets error metrics information.
   */
  toMetrics(): Record<string, string | number> {
    return {
      error_code: this.code,
      error_type: this.name,
      timestamp: this.timestamp,
    };
  }
}
