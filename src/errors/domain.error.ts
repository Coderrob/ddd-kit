/**
 * Domain-specific error types for the DDD-Kit system.
 * Following clean architecture principles with domain-specific exceptions.
 */

export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}
