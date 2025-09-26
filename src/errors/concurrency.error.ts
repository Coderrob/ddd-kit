import { DomainError } from './domain.error';

export class ConcurrencyError extends DomainError {
  readonly code = 'CONCURRENCY_ERROR';

  constructor(resource: string) {
    super(`Concurrent access conflict for resource: ${resource}`);
    Object.setPrototypeOf(this, ConcurrencyError.prototype);
  }
}
