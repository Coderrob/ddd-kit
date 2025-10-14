import { isNullOrUndefined } from '../core/helpers/type.helper';

import { DomainError } from './domain.error';

export class UidResolutionError extends DomainError {
  readonly code = 'UID_RESOLUTION_ERROR';

  constructor(uid: string, reason?: string) {
    super(`Failed to resolve UID '${uid}'${!isNullOrUndefined(reason) ? `: ${reason}` : ''}`);
    Object.setPrototypeOf(this, UidResolutionError.prototype);
  }
}
