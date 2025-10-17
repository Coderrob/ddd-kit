import type { IUIdSupersedeUseCase } from '../types/audit';
import type { IResolver } from '../types/repository';

export class UidSupersedeService implements IUIdSupersedeUseCase {
  /**
   * Creates a new UidSupersedeService instance.
   * @param resolver - The resolver instance for managing UID aliases
   */
  constructor(private readonly resolver: IResolver) {}

  /**
   * Executes the UID supersede operation by updating the alias mapping.
   * @param oldUid - The old UID to be superseded
   * @param newUid - The new UID to replace the old one
   * @returns Promise that resolves when the operation is complete
   */
  execute(oldUid: string, newUid: string): Promise<void> {
    this.resolver.updateAlias(oldUid, newUid);
    // Note: This is in-memory only; for persistence, write back to aliases.json.
    return Promise.resolve();
  }
}
