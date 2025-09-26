import { DomainError } from './domain.error';

export class UidStatusError extends DomainError {
  readonly code = 'UID_STATUS_ERROR';

  constructor(uid: string, status: string) {
    super(`UID '${uid}' has invalid status: ${status}`);
    Object.setPrototypeOf(this, UidStatusError.prototype);
  }
}
