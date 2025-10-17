import { isNullOrUndefined } from '../../core/helpers/type.helper';

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

export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';

  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(message);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class UidStatusError extends DomainError {
  readonly code = 'UID_STATUS_ERROR';

  constructor(uid: string, status: string) {
    super(`UID '${uid}' has invalid status: ${status}`);
    Object.setPrototypeOf(this, UidStatusError.prototype);
  }
}

export class UidResolutionError extends DomainError {
  readonly code = 'UID_RESOLUTION_ERROR';

  constructor(uid: string, reason?: string) {
    let message = `Failed to resolve UID '${uid}'`;
    if (!isNullOrUndefined(reason) && reason.trim().length > 0) {
      message += `: ${reason}`;
    }
    super(message);
    Object.setPrototypeOf(this, UidResolutionError.prototype);
  }
}
