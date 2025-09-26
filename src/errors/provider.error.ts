import { DomainError } from './domain.error';

export class ProviderError extends DomainError {
  readonly code = 'PROVIDER_ERROR';

  constructor(provider: string, operation: string, reason?: string) {
    super(`Provider '${provider}' failed ${operation}${reason != null ? `: ${reason}` : ''}`);
    Object.setPrototypeOf(this, ProviderError.prototype);
  }
}
