import { IResolvedUid } from './IResolvedUid';

/**
 * Repository interface for UID resolution and content retrieval.
 */
export interface IUidRepository {
  resolve(uid: string): Promise<IResolvedUid>;
  getRequires(uid: string): Promise<string[]>;
  getAliases(): Promise<Record<string, string>>;
}
