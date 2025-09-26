import type { IUIdSupersedeUseCase } from '../interfaces/IUIdSupersedeUseCase';
import type { IResolver } from '../interfaces/IResolver';

export class UidSupersedeService implements IUIdSupersedeUseCase {
  constructor(private readonly resolver: IResolver) {}

  execute(oldUid: string, newUid: string): Promise<void> {
    this.resolver.updateAlias(oldUid, newUid);
    // Note: This is in-memory only; for persistence, write back to aliases.json.
    return Promise.resolve();
  }
}
