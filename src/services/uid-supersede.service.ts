import type { IUIdSupersedeUseCase } from '../types/audit';
import type { IResolver } from '../types/repository';

export class UidSupersedeService implements IUIdSupersedeUseCase {
  constructor(private readonly resolver: IResolver) {}

  execute(oldUid: string, newUid: string): Promise<void> {
    this.resolver.updateAlias(oldUid, newUid);
    // Note: This is in-memory only; for persistence, write back to aliases.json.
    return Promise.resolve();
  }
}
