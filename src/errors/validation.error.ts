import { DomainError } from './domain.error';

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
