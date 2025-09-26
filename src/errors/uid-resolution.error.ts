import { DomainError } from './domain.error';

export class UidResolutionError extends DomainError {
  readonly code = 'UID_RESOLUTION_ERROR';

  constructor(uid: string, reason?: string) {
    super(`Failed to resolve UID '${uid}'${reason != null ? `: ${reason}` : ''}`);
    Object.setPrototypeOf(this, UidResolutionError.prototype);
  }
}
