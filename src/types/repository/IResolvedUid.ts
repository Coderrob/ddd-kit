import { UidStatus } from '../audit/UidStatus';

/**
 * Domain entities and value objects.
 */
export interface IResolvedUid {
  uid: string;
  content: string;
  status: UidStatus;
  contentHash: string;
  section?: string;
}
