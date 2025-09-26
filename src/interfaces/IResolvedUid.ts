/**
 * Domain entities and value objects.
 */
export interface IResolvedUid {
  uid: string;
  content: string;
  status: 'active' | 'deprecated' | 'archived';
  contentHash: string;
  section?: string;
}
